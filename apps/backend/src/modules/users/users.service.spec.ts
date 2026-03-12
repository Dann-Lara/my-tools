import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserEntity, DEFAULT_PERMISSIONS, MODULE_KEYS } from './user.entity';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
}));

describe('UsersService', () => {
  let service: UsersService;
  let mockRepo: {
    findOneBy: jest.Mock;
    findOne: jest.Mock;
    find: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };

  const mockUser: UserEntity = {
    id: 'user-1',
    email: 'test@example.com',
    name: 'Test User',
    passwordHash: 'hashed_password',
    role: 'client',
    isActive: true,
    permissions: { checklist: true, applications: true },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    mockRepo = {
      findOneBy: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn().mockImplementation((data) => data),
      save: jest.fn().mockImplementation((user) => Promise.resolve({ ...user, id: 'new-user-id' })),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  describe('create', () => {
    it('should create a new user', async () => {
      mockRepo.findOneBy.mockResolvedValue(null);

      const result = await service.create({
        email: 'new@example.com',
        name: 'New User',
        password: 'password123',
      });

      expect(result.email).toBe('new@example.com');
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 12);
    });

    it('should throw ConflictException if email exists', async () => {
      mockRepo.findOneBy.mockResolvedValue(mockUser);

      await expect(
        service.create({
          email: 'test@example.com',
          name: 'Test',
          password: 'password',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw ForbiddenException if non-admin tries to create admin', async () => {
      mockRepo.findOneBy.mockResolvedValue(null);

      await expect(
        service.create(
          {
            email: 'admin@example.com',
            name: 'Admin',
            password: 'password',
            role: 'admin',
          },
          'client',
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow admin to create client', async () => {
      mockRepo.findOneBy.mockResolvedValue(null);

      const result = await service.create(
        {
          email: 'client@example.com',
          name: 'Client',
          password: 'password',
          role: 'client',
        },
        'admin',
      );

      expect(result.role).toBe('client');
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      mockRepo.find.mockResolvedValue([mockUser]);

      const result = await service.findAll();

      expect(result).toHaveLength(1);
      expect(mockRepo.find).toHaveBeenCalledWith({
        select: ['id', 'email', 'name', 'role', 'isActive', 'permissions', 'createdAt'],
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      mockRepo.findOne.mockResolvedValue({ ...mockUser, permissions: { checklist: true } });

      const result = await service.findOne('user-1');

      expect(result.id).toBe('user-1');
    });

    it('should throw NotFoundException if user not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getEffectivePermissions', () => {
    it('should return full permissions for superadmin', () => {
      const superadmin = { ...mockUser, role: 'superadmin', permissions: {} } as UserEntity;

      const result = service.getEffectivePermissions(superadmin);

      expect(result.checklist).toBe(true);
      expect(result.applications).toBe(true);
    });

    it('should return full permissions for admin', () => {
      const admin = { ...mockUser, role: 'admin', permissions: {} } as UserEntity;

      const result = service.getEffectivePermissions(admin);

      expect(result.checklist).toBe(true);
      expect(result.applications).toBe(true);
    });

    it('should return stored permissions for client', () => {
      const client = { ...mockUser, role: 'client', permissions: { checklist: true, applications: false } } as UserEntity;

      const result = service.getEffectivePermissions(client);

      expect(result.checklist).toBe(true);
      expect(result.applications).toBe(false);
    });
  });
});
