import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserEntity, DEFAULT_ALLOWED_MODULES, MODULE_KEYS } from './user.entity';
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
    allowedModules: ['checklist', 'applications', 'ai', 'youtube'],
    adminId: null,
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

      const result = await service.create(
        {
          email: 'new@example.com',
          name: 'New User',
          password: 'password123',
        },
        undefined,
        undefined,
      );

      expect(result.email).toBe('new@example.com');
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 12);
    });

    it('should throw ConflictException if email exists', async () => {
      mockRepo.findOneBy.mockResolvedValue(mockUser);

      await expect(
        service.create(
          {
            email: 'test@example.com',
            name: 'Test',
            password: 'password',
          },
          undefined,
          undefined,
        ),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw ForbiddenException if non-admin/superadmin tries to create user', async () => {
      mockRepo.findOneBy.mockResolvedValue(null);

      await expect(
        service.create(
          {
            email: 'admin@example.com',
            name: 'Admin',
            password: 'password',
            role: 'admin',
          },
          'user-1',
          'client',
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow admin to create client with adminId', async () => {
      mockRepo.findOneBy.mockResolvedValue(null);

      const result = await service.create(
        {
          email: 'client@example.com',
          name: 'Client',
          password: 'password',
          role: 'client',
        },
        'admin-1',
        'admin',
      );

      expect(result.role).toBe('client');
      expect(result.adminId).toBe('admin-1');
    });

    it('should allow superadmin to create admin without adminId', async () => {
      mockRepo.findOneBy.mockResolvedValue(null);

      const result = await service.create(
        {
          email: 'newadmin@example.com',
          name: 'New Admin',
          password: 'password',
          role: 'admin',
        },
        undefined,
        'superadmin',
      );

      expect(result.role).toBe('admin');
      expect(result.adminId).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all users for superadmin', async () => {
      mockRepo.find.mockResolvedValue([mockUser]);

      const result = await service.findAll({ id: 'superadmin-1', role: 'superadmin' });

      expect(result).toHaveLength(1);
    });

    it('should return only own clients for admin', async () => {
      mockRepo.find.mockResolvedValue([mockUser]);

      const result = await service.findAll({ id: 'admin-1', role: 'admin' });

      expect(mockRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { adminId: 'admin-1' },
        }),
      );
    });

    it('should return empty array for client', async () => {
      const result = await service.findAll({ id: 'client-1', role: 'client' });

      expect(result).toHaveLength(0);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      mockRepo.findOne.mockResolvedValue(mockUser);

      const result = await service.findOne('user-1');

      expect(result.id).toBe('user-1');
    });

    it('should throw NotFoundException if user not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getAllowedModules', () => {
    it('should return all modules for superadmin', () => {
      const superadmin = { ...mockUser, role: 'superadmin' } as UserEntity;

      const result = service.getAllowedModules(superadmin);

      expect(result).toEqual(['checklist', 'applications', 'ai', 'youtube']);
    });

    it('should return all modules for admin', () => {
      const admin = { ...mockUser, role: 'admin' } as UserEntity;

      const result = service.getAllowedModules(admin);

      expect(result).toEqual(['checklist', 'applications', 'ai', 'youtube']);
    });

    it('should return stored allowedModules for client', () => {
      const client = { ...mockUser, role: 'client', allowedModules: ['checklist'] } as UserEntity;

      const result = service.getAllowedModules(client);

      expect(result).toEqual(['checklist']);
    });

    it('should return defaults if allowedModules is empty for client', () => {
      const client = { ...mockUser, role: 'client', allowedModules: [] } as UserEntity;

      const result = service.getAllowedModules(client);

      expect(result).toEqual(DEFAULT_ALLOWED_MODULES);
    });
  });
});
