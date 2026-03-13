import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';

import {
  UserEntity,
  DEFAULT_ALLOWED_MODULES,
  MODULE_KEYS,
} from './user.entity';
import type { CreateUserDto } from './dto/create-user.dto';
import type { UserRole } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  // ── Create ─────────────────────────────────────────────────────────────────
  async create(dto: CreateUserDto, creatorId?: string, creatorRole?: UserRole): Promise<UserEntity> {
    const existing = await this.userRepo.findOneBy({ email: dto.email.toLowerCase() });
    if (existing) throw new ConflictException('Email already in use');

    const role = dto.role ?? 'client';

    // Validar creación según rol del creador
    if (creatorRole === 'admin' && role !== 'client') {
      throw new ForbiddenException('You can only create client accounts');
    }
    if (creatorRole && creatorRole !== 'superadmin' && creatorRole !== 'admin') {
      throw new ForbiddenException('You cannot create users');
    }

    // Determinar adminId
    let adminId: string | null = null;
    if (creatorRole === 'admin') {
      // Admin crea cliente → asignar su propio ID
      adminId = creatorId ?? null;
    } else if (creatorRole === 'superadmin' && dto.adminId) {
      // Superadmin puede asignar admin específico
      adminId = dto.adminId;
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = this.userRepo.create({
      email: dto.email.toLowerCase(),
      name: dto.name,
      passwordHash,
      role,
      adminId,
      allowedModules: [...DEFAULT_ALLOWED_MODULES],
    });
    return this.userRepo.save(user);
  }

  // ── List (with hierarchical filtering) ─────────────────────────────────────
  async findAll(requestingUser?: { id: string; role: UserRole }): Promise<UserEntity[]> {
    const selectFields = ['id', 'email', 'name', 'role', 'isActive', 'allowedModules', 'adminId', 'createdAt'] as const;

    if (!requestingUser) {
      // Sin contexto de usuario → 返回空
      return [];
    }

    if (requestingUser.role === 'superadmin') {
      // Superadmin ve todos
      return this.userRepo.find({
        select: [...selectFields],
        order: { createdAt: 'DESC' },
      });
    }

    if (requestingUser.role === 'admin') {
      // Admin ve solo sus clientes
      return this.userRepo.find({
        where: { adminId: requestingUser.id },
        select: [...selectFields],
        order: { createdAt: 'DESC' },
      });
    }

    // Client no puede ver usuarios
    return [];
  }

  // ── Find one ────────────────────────────────────────────────────────────────
  async findOne(id: string, requestingUser?: { id: string; role: UserRole }): Promise<UserEntity> {
    const selectFields = ['id', 'email', 'name', 'role', 'isActive', 'allowedModules', 'adminId', 'createdAt'] as const;
    
    const user = await this.userRepo.findOne({
      where: { id },
      select: [...selectFields],
    });
    
    if (!user) throw new NotFoundException(`User ${id} not found`);

    // Verificar acceso si hay contexto de usuario
    if (requestingUser) {
      if (requestingUser.role === 'superadmin') {
        // OK - acceso total
      } else if (requestingUser.role === 'admin') {
        // Solo puede ver sus propios clientes
        if (user.adminId !== requestingUser.id) {
          throw new ForbiddenException('You can only view your own clients');
        }
      } else {
        // Client no puede ver otros usuarios
        throw new ForbiddenException('You cannot view other users');
      }
    }

    return user;
  }

  // ── Get allowed modules for a user ─────────────────────────────────────────
  getAllowedModules(user: UserEntity): string[] {
    // superadmin y admin siempre tienen acceso a todos los módulos
    if (user.role === 'superadmin' || user.role === 'admin') {
      return [...MODULE_KEYS];
    }
    // client usa su allowedModules, con fallback a defaults
    return user.allowedModules && user.allowedModules.length > 0 
      ? user.allowedModules 
      : [...DEFAULT_ALLOWED_MODULES];
  }

  // ── Update a single module permission ──────────────────────────────────────
  async setModulePermission(
    targetUserId: string,
    key: string,
    granted: boolean,
    requestingUser?: { id: string; role: UserRole },
  ): Promise<string[]> {
    const targetUser = await this.findOne(targetUserId, requestingUser);

    // Verificar que el usuario puede modificar permisos
    if (requestingUser?.role === 'admin') {
      if (targetUser.adminId !== requestingUser.id) {
        throw new ForbiddenException('You can only manage your own clients');
      }
    }

    // Validar que la key existe en MODULE_KEYS
    if (!(MODULE_KEYS as readonly string[]).includes(key)) {
      throw new ForbiddenException(`Unknown module key: ${key}`);
    }

    const current = this.getAllowedModules(targetUser);
    let updated: string[];

    if (granted) {
      // Agregar si no existe
      updated = current.includes(key) ? current : [...current, key];
    } else {
      // Remover
      updated = current.filter(k => k !== key);
    }

    await this.userRepo.update(targetUserId, { allowedModules: updated });
    return updated;
  }

  // ── Bulk replace modules ───────────────────────────────────────────────────
  async setAllModules(
    targetUserId: string,
    modules: string[],
    requestingUser?: { id: string; role: UserRole },
  ): Promise<string[]> {
    const targetUser = await this.findOne(targetUserId, requestingUser);

    // Verificar que el usuario puede modificar permisos
    if (requestingUser?.role === 'admin') {
      if (targetUser.adminId !== requestingUser.id) {
        throw new ForbiddenException('You can only manage your own clients');
      }
    }

    // Validar que todas las keys existen en MODULE_KEYS
    const invalidKeys = modules.filter(k => !(MODULE_KEYS as readonly string[]).includes(k));
    if (invalidKeys.length > 0) {
      throw new ForbiddenException(`Unknown module keys: ${invalidKeys.join(', ')}`);
    }

    await this.userRepo.update(targetUserId, { allowedModules: modules });
    return modules;
  }

  // ── Find by email ──────────────────────────────────────────────────────────
  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.userRepo.findOne({
      where: { email: email.toLowerCase() },
      select: ['id', 'email', 'name', 'role', 'passwordHash', 'isActive', 'allowedModules', 'adminId'],
    });
  }

  // ── Find admins (for superadmin to assign) ─────────────────────────────────
  async findAdmins(): Promise<Pick<UserEntity, 'id' | 'name' | 'email'>[]> {
    return this.userRepo.find({
      where: { role: 'admin' as UserRole },
      select: ['id', 'name', 'email'],
      order: { name: 'ASC' },
    });
  }

  // ── Profile update ─────────────────────────────────────────────────────────
  async updateProfile(id: string, dto: { name?: string; telegramChatId?: string }): Promise<UserEntity> {
    await this.userRepo.update(id, dto);
    return this.findOne(id);
  }

  // ── Active toggle ──────────────────────────────────────────────────────────
  async setActive(id: string, isActive: boolean, requestingUser?: { id: string; role: UserRole }): Promise<UserEntity> {
    const targetUser = await this.findOne(id);

    // Verificar acceso
    if (requestingUser?.role === 'admin') {
      if (targetUser.adminId !== requestingUser.id) {
        throw new ForbiddenException('You can only manage your own clients');
      }
    }
    if (requestingUser?.role === 'client') {
      throw new ForbiddenException('You cannot deactivate users');
    }

    await this.userRepo.update(id, { isActive });
    return this.findOne(id, requestingUser);
  }

  // ── Telegram list ──────────────────────────────────────────────────────────
  async findAllWithTelegram(): Promise<UserEntity[]> {
    return this.userRepo.find({
      where: { role: 'superadmin' as UserRole },
      select: ['id', 'email', 'name', 'role', 'telegramChatId'],
    });
  }

  // ── Seed superadmin, admin, and client ──────────────────────────────────────
  async ensureSuperAdmin(): Promise<void> {
    const superadminEmail = (process.env['SUPERADMIN_EMAIL'] ?? 'superadmin@mytools.dev').toLowerCase();
    const superadminPassword = process.env['SUPERADMIN_PASSWORD'] ?? 'SuperAdmin123!';
    
    const existingSuperadmin = await this.userRepo.findOneBy({ role: 'superadmin' as UserRole });
    if (!existingSuperadmin) {
      const passwordHash = await bcrypt.hash(superadminPassword, 12);
      await this.userRepo.save(
        this.userRepo.create({
          email: superadminEmail,
          name: 'Super Admin',
          passwordHash,
          role: 'superadmin' as UserRole,
          allowedModules: [...MODULE_KEYS],
        }),
      );
    }

    const adminEmail = 'admin@mytools.dev';
    const existingAdmin = await this.userRepo.findOneBy({ email: adminEmail });
    if (!existingAdmin) {
      const passwordHash = await bcrypt.hash('Admin123!', 12);
      await this.userRepo.save(
        this.userRepo.create({
          email: adminEmail,
          name: 'Admin',
          passwordHash,
          role: 'admin' as UserRole,
          allowedModules: [...MODULE_KEYS],
        }),
      );
    }

    const clientEmail = 'client@mytools.dev';
    const existingClient = await this.userRepo.findOneBy({ email: clientEmail });
    if (!existingClient) {
      const admin = await this.userRepo.findOneBy({ role: 'admin' as UserRole });
      const passwordHash = await bcrypt.hash('Client123!', 12);
      await this.userRepo.save(
        this.userRepo.create({
          email: clientEmail,
          name: 'Client',
          passwordHash,
          role: 'client' as UserRole,
          allowedModules: [...DEFAULT_ALLOWED_MODULES],
          adminId: admin?.id ?? null,
        }),
      );
    }
  }
}
