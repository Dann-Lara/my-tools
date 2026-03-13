# F031: Sistema de Permisos por Módulo con Jerarquía de Usuarios

> Estado: APPROVED
> Fecha de creación: 2026-03-12
> Última actualización: 2026-03-13

---

## Contexto

| Campo | Descripción |
|-------|-------------|
| **Módulo** | users, permissions, auth |
| **Usuarios** | superadmin → admin → client |
| **Problema** | Sistema de permisos hardcoded, sin jerarquía admin-client, sin verificación en endpoints |
| **Prioridad** | CRITICAL |

---

## Problemas Identificados

| # | Problema | Severidad | Ubicación |
|---|----------|-----------|-----------|
| 1 | `MODULE_KEYS` hardcoded (`checklist`, `applications`) | HIGH | `user.entity.ts:18` |
| 2 | Error 403 al agregar permiso `ai` | HIGH | `users.service.ts:91-93` |
| 3 | Endpoints no verifican permisos de módulo | CRITICAL | Controllers |
| 4 | Sin relación admin-client en BD | HIGH | `user.entity.ts` |
| 5 | Admins ven todos los usuarios (deberían ver solo sus clientes) | HIGH | `users.service.ts:48-53` |
| 6 | Frontend: superadmin no puede filtrar por admin | MEDIUM | `admin/users/page.tsx` |

---

## Solución Implementada

### BD - Entity

- Columna `adminId` (UUID, nullable) - relación jerárquica
- Columna `allowedModules` (VARCHAR[], array) - permisos como array dinámico
- Relaciones ManyToOne/OneToMany para jerarquía admin → clients

### MODULE_KEYS Dinámico

```typescript
export const MODULE_KEYS = ['checklist', 'applications', 'ai'] as const;
export const DEFAULT_ALLOWED_MODULES: ModuleKey[] = ['checklist', 'applications', 'ai'];
```

### Backend - Permission Guard

- `PermissionGuard` - verifica permisos por endpoint
- Decorador `@RequireModulePermission('checklist')` etc.
- Lógica:
  - `superadmin`: ✅ Siempre acceso total
  - `admin`: ✅ Siempre acceso total
  - `client`: Verifica `allowedModules.includes(moduleKey)`

### Backend - Controllers

- `checklists.controller.ts` - `@RequireModulePermission('checklist')`
- `applications.controller.ts` - `@RequireModulePermission('applications')`
- `ai.controller.ts` - `@RequireModulePermission('ai')`

### Frontend

- Filtros por admin en vista usuarios
- Select de admin al crear usuario (superadmin)
- Permisos como array de strings

### Migración BD

```sql
ALTER TABLE "users" ADD COLUMN "adminId" UUID;
ALTER TABLE "users" ADD COLUMN "allowedModules" VARCHAR[] DEFAULT ARRAY['checklist', 'applications', 'ai'];
```

---

## Acceptance Criteria

| ID | Criterio | Estado |
|----|----------|--------|
| AC01 | BD: users tiene columna `adminId` y `allowedModules` | ✅ |
| AC02 | Backend: `MODULE_KEYS` incluye `ai` | ✅ |
| AC03 | Backend: PermissionGuard verifica permisos por endpoint | ✅ |
| AC04 | Backend: Endpoints checklists, applications, AI verifican permisos | ✅ |
| AC05 | Backend: Admin solo ve/gestiona sus clientes | ✅ |
| AC06 | Backend: Superadmin ve todos los usuarios | ✅ |
| AC07 | Frontend: Filtros en vista usuarios según rol | ✅ |
| AC08 | Frontend: Modal crear usuario incluye select admin (superadmin) | ✅ |
| AC09 | Tests pasan | ✅ |
| AC10 | No regresiones en funcionalidad existente | ✅ |

---

## Archivos Modificados

### Backend

- `modules/users/user.entity.ts`
- `modules/users/dto/create-user.dto.ts`
- `modules/users/users.service.ts`
- `modules/users/users.controller.ts`
- `modules/users/users.service.spec.ts`
- `modules/auth/guards/permission.guard.ts` (NUEVO)
- `modules/auth/decorators/module-permission.decorator.ts` (NUEVO)
- `modules/auth/auth.module.ts`
- `modules/checklists/checklists.controller.ts`
- `modules/applications/applications.controller.ts`
- `modules/ai/ai.controller.ts`
- `database/migrations/1700000000000-AddAdminIdAndAllowedModules.ts` (NUEVO)

### Frontend

- `app/admin/users/page.tsx`
- `app/admin/users/[id]/page.tsx`
- `app/admin/page.tsx`
- `components/users/constants.ts`
- `hooks/useUsers.ts`
- `lib/i18n/common.ts`
- `lib/i18n/dashboard.ts`

---

## Historial de Cambios

| Fecha | Versión | Cambio | Autor |
|-------|---------|--------|-------|
| 2026-03-12 | 1.0.0 | Creación inicial | — |
| 2026-03-13 | 1.0.1 | Implementación completa + tests | — |
