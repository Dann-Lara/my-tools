import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export type UserRole = 'superadmin' | 'admin' | 'client';

/**
 * Module permission keys.
 * Add a new key here when a new module is created.
 * 
 * superadmin: tiene acceso a todos los módulos automáticamente
 * admin/client: acceso según allowedModules
 */
export const MODULE_KEYS = ['checklist', 'applications', 'ai', 'youtube'] as const;
export type ModuleKey = typeof MODULE_KEYS[number];

/**
 * Módulos permitidos para usuarios no-superadmin.
 * Array de strings - cada string es una key de módulo.
 * Si está vacío o null, no tiene acceso a ningún módulo.
 */
export const DEFAULT_ALLOWED_MODULES: ModuleKey[] = ['checklist', 'applications', 'ai', 'youtube'];

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  name!: string;

  @Column({ select: false })
  passwordHash!: string;

  @Column({ type: 'varchar', default: 'client' })
  role!: UserRole;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ nullable: true, type: 'varchar' })
  telegramChatId?: string;

  /**
   * Relación jerárquica: el admin que creó este usuario.
   * Solo aplica para clientes (clients).
   * Un admin puede tener múltiples clientes.
   */
  @Column({ nullable: true, type: 'uuid' })
  adminId?: string | null;

  @ManyToOne(() => UserEntity, { nullable: true })
  @JoinColumn({ name: 'adminId' })
  admin?: UserEntity;

  @OneToMany(() => UserEntity, (user) => user.admin)
  clients?: UserEntity[];

  /**
   * Módulos permitidos para este usuario.
   * - superadmin: tiene acceso a todos los módulos automáticamente (este campo se ignora)
   - admin: tiene acceso a todos los módulos automáticamente (este campo se ignora)
   - client: este campo define qué módulos puede acceder
   * 
   * Ejemplo: ['checklist', 'applications', 'ai']
   * Si está vacío o null, el cliente no tiene acceso a ningún módulo.
   */
  @Column({ type: 'varchar', array: true, default: ['checklist', 'applications', 'ai'] })
  allowedModules!: string[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
