# Users Module — Backend

> Módulo de gestión de usuarios del proyecto My Tools.
> Este documento debe actualizarse cada vez que se agregue/modifique funcionalidad de usuarios.

---

## 1. Propósito

Gestionar usuarios del sistema, incluyendo:

- Perfiles de usuario (nombre, email, telegramChatId)
- Gestión de roles (superadmin, admin, client)
- Permisos por módulo

---

## 2. Estructura de Archivos

```
src/modules/users/
├── users.controller.ts     # Endpoints REST
├── users.service.ts       # Lógica de negocio
├── users.module.ts        # Configuración del módulo
├── entities/
│   └── user.entity.ts     # Entidad UserEntity
└── dto/
    └── create-user.dto.ts # DTOs de creación
```

---

## 3. Entidades

### UserEntity

```typescript
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
  role!: UserRole; // 'superadmin' | 'admin' | 'client'

  @Column({ default: true })
  isActive!: boolean;

  @Column({ nullable: true })
  telegramChatId?: string;

  @Column({ type: 'jsonb', nullable: true })
  permissions?: Partial<PermissionsMap>;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
```

### Tipos de Roles

| Rol            | Descripción                                    |
| -------------- | ---------------------------------------------- |
| **superadmin** | Control total. Gestiona admins. Acceso a todo. |
| **admin**      | Gestiona clientes. Ve lista de usuarios.       |
| **client**     | Usuario final. Acceso solo a sus herramientas. |

### Sistema de Permisos

```typescript
export const MODULE_KEYS = ['checklist', 'applications'] as const;
export type ModuleKey = (typeof MODULE_KEYS)[number];

export const DEFAULT_PERMISSIONS: PermissionsMap = {
  checklist: true,
  applications: true,
};
```

Los permisos permiten activar/desactivar módulos por usuario. Los superadmin y admin siempre tienen acceso a todos los módulos.

---

## 4. Endpoints API

| Método | Path                   | Auth       | Descripción                        |
| ------ | ---------------------- | ---------- | ---------------------------------- |
| GET    | `/v1/users/me`         | JWT        | Obtener perfil del usuario actual  |
| PATCH  | `/v1/users/me`         | JWT        | Actualizar nombre o telegramChatId |
| GET    | `/v1/users`            | admin+     | Listar todos los usuarios          |
| PATCH  | `/v1/users/:id/active` | superadmin | Activar/desactivar usuario         |

---

## 5. Funcionalidades

### Perfil de Usuario

- El usuario puede ver su propio perfil
- El usuario puede actualizar su nombre y telegramChatId

### Gestión de Usuarios (Admin/Superadmin)

- Listar todos los usuarios
- Activar/desactivar usuarios
- Los admins solo ven usuarios con rol `client`
- Los superadmin ven todos los usuarios

### Integración con Telegram

- Los usuarios pueden vincular su cuenta de Telegram
- Almacena `telegramChatId` para notificaciones

---

## 6. Variables de Entorno

No hay variables de entorno específicas de este módulo.

---

## 7. Consideraciones de Seguridad

- La contraseña nunca se retorna en las respuestas (solo se almacena el hash)
- El hash de contraseña se excluye con `@Column({ select: false })`
- Solo superadmin puede activar/desactivar usuarios

---

## 8. Historial de Cambios

| Fecha      | Versión | Cambios             |
| ---------- | ------- | ------------------- |
| 2026-03-11 | 1.0.0   | Creación del módulo |

---

## 9. Referencias

- `apps/backend/src/modules/users/entities/user.entity.ts`
- `apps/backend/src/modules/users/users.service.ts`
- `apps/backend/src/modules/users/users.controller.ts`
- `PROJECT.md` — Contexto general del proyecto
- `AGENTS.md` — Reglas de desarrollo
- `specs/FEATURES.md` — Índice de features
- `specs/SPEC.md` — Constitución SDD
