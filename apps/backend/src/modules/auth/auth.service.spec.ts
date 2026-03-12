import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, ForbiddenException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  compare: jest.fn().mockResolvedValue(true),
}));

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    name: 'Test User',
    passwordHash: 'hashedpassword',
    role: 'client',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const bcrypt = {
      compare: jest.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mock-jwt-token'),
            verify: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
  });

  describe('validateUser', () => {
    it('should return user if credentials are valid', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser as any);

      const result = await service.validateUser('test@example.com', 'password123');

      expect(result).toEqual(mockUser);
      expect(usersService.findByEmail).toHaveBeenCalledWith('test@example.com');
    });

    it('should return null if user not found', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      const result = await service.validateUser('notfound@example.com', 'password');

      expect(result).toBeNull();
    });

    it('should return null if user is inactive', async () => {
      usersService.findByEmail.mockResolvedValue({ ...mockUser, isActive: false } as any);

      const result = await service.validateUser('test@example.com', 'password');

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return auth tokens', () => {
      const result = service.login(mockUser as any);

      expect(result.accessToken).toBe('mock-jwt-token');
      expect(result.refreshToken).toBe('mock-jwt-token');
      expect(result.expiresIn).toBe(7 * 24 * 60 * 60);
      expect(result.user).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        role: mockUser.role,
      });
    });
  });

  describe('refreshToken', () => {
    it('should return new tokens if refresh token is valid', async () => {
      jwtService.verify.mockReturnValue({ sub: 'user-1', email: 'test@example.com', role: 'client' });
      usersService.findOne.mockResolvedValue(mockUser as any);

      const result = await service.refreshToken('valid-refresh-token');

      expect(result.accessToken).toBe('mock-jwt-token');
      expect(usersService.findOne).toHaveBeenCalledWith('user-1');
    });

    it('should throw UnauthorizedException if user not found', async () => {
      jwtService.verify.mockReturnValue({ sub: 'user-1', email: 'test@example.com', role: 'client' });
      usersService.findOne.mockResolvedValue(null as any);

      await expect(service.refreshToken('valid-token')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if user is inactive', async () => {
      jwtService.verify.mockReturnValue({ sub: 'user-1', email: 'test@example.com', role: 'client' });
      usersService.findOne.mockResolvedValue({ ...mockUser, isActive: false } as any);

      await expect(service.refreshToken('valid-token')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('validateCanCreateRole', () => {
    it('should allow superadmin to create any role', () => {
      expect(() => service.validateCanCreateRole('superadmin', 'admin')).not.toThrow();
      expect(() => service.validateCanCreateRole('superadmin', 'client')).not.toThrow();
    });

    it('should allow admin to create client', () => {
      expect(() => service.validateCanCreateRole('admin', 'client')).not.toThrow();
    });

    it('should forbid admin from creating admin', () => {
      expect(() => service.validateCanCreateRole('admin', 'admin')).toThrow(ForbiddenException);
    });

    it('should forbid admin from creating superadmin', () => {
      expect(() => service.validateCanCreateRole('admin', 'superadmin')).toThrow(ForbiddenException);
    });

    it('should forbid client from creating any user', () => {
      expect(() => service.validateCanCreateRole('client', 'client')).toThrow(ForbiddenException);
    });
  });
});
