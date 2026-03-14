# F034: Dashboard - Permisos y Actualización de Datos

> Estado: APPROVED (v2.0)
> Fecha de creación: 2026-03-13
> Última actualización: 2026-03-13

---

## Contexto

| Campo | Descripción |
|-------|-------------|
| **Módulo** | frontend, dashboard |
| **Problema** | Dashboard no se actualiza al crear datos; métricas visibles para usuarios sin permisos |
| **Prioridad** | HIGH |

---

## Regla de Permisos (CORREGIDA v2.0)

**"No se ve lo que no tiene permiso"**

| Rol | Acceso a módulos |
|-----|-----------------|
| **superadmin** | Ve todos los módulos (acceso total). Asigna permisos a admins. |
| **admin** | Solo módulos que el superadmin le permitió. Gestiona sus clientes. |
| **client** | Solo módulos que el admin le permitió. |

### Jerarquía de Permisos

```
superadmin
    ├── Asigna módulos a admin (checklist, applications, ai)
    │
    └── admin (con permisos asignados)
            ├── Asigna módulos a sus clientes
            └── client (con permisos asignados)
```

**Nota**: Un admin sin permisos de un módulo (ej: `applications`) NO verá:
- El módulo en el sidebar
- Métricas relacionadas en el dashboard
- Acceso al endpoint del módulo

---

## Solución Implementada

### 1. Unificación de Funciones de Permisos

```typescript
// permissions-context.tsx - Lógica correcta de permisos
function hasPermission(key: string): boolean {
  const currentRole = user?.role;
  
  // Superadmin siempre tiene acceso total
  if (currentRole === 'superadmin') {
    return true;
  }
  
  // Admin y Client dependen de sus permisos del backend
  const result = ready && permissions[key] === true;
  return result;
}
```

**Cambio clave**: 
- Superadmin: Acceso total sin verificar permisos
- Admin: Depende de `allowedModules` que el superadmin le asignó
- Client: Depende de `allowedModules` que el admin le asignó

El backend retorna los permisos correctos para cada rol:
- Superadmin: `{ checklist: true, applications: true, ai: true }` (hardcoded)
- Admin (solo checklist): `{ checklist: true, applications: false, ai: false }`
- Client (solo ai): `{ checklist: false, applications: false, ai: true }`

### 2. Actualización del Dashboard

```typescript
// checklists/new/page.tsx
const saved = await checklistsApi.confirm(params, tasks);
router.refresh(); // Fuerza recarga de datos
setTimeout(() => router.push(`/checklists/${saved.id}`), 1600);
```

### 3. Uso de hasPermission() en Dashboards

**admin/page.tsx** - Todas las secciones usan `hasPermission()`:
```typescript
{hasPermission('checklist') && (
  // StatsCard de checklists
)}
{hasPermission('applications') && (
  // StatsCard de aplicaciones
)}
{hasPermission('ai') && (
  // AI Tools
)}
```

**client/page.tsx**:
```typescript
{hasPermission('checklist') && (
  // Checklist shortcut
)}
{hasPermission('ai') && (
  // AI Tools
)}
```

### 4. PermissionGate Actualizado

```typescript
// PermissionGate.tsx
const { hasPermission, ready } = usePermissions();
if (!ready) return <Spinner />;
if (!hasPermission(module)) return <LockScreen />;
```

### 5. Sidebar Filtrado por Permisos

```typescript
// Sidebar.tsx - CanAccess logic
function canAccess(item: NavItem): boolean {
  if (item.adminOnly && !isAdmin) return false;
  if (isSuperAdmin) return true;  // Superadmin ve todo
  if (!permsReady) {
    return !item.permission;  // Wait for permissions
  }
  if (item.permission) {
    const allowed = permissions[item.permission] === true;
    return allowed;
  }
  return true;
}
```

---

## Comportamiento Esperado

| Rol | Dashboard muestra |
|-----|-------------------|
| superadmin | Todas las métricas (checklist, applications, AI) |
| admin (todos los módulos) | Todas las métricas |
| admin (solo checklist) | Solo métricas de checklist |
| client (todos los módulos) | Todas las métricas |
| client (solo ai) | Solo AI Tools |

---

## Acceptance Criteria

| ID | Criterio | Estado |
|----|----------|--------|
| AC01 | Unificada función de permisos a solo `hasPermission()` | ✅ |
| AC02 | Dashboard usa `hasPermission()` para todas las secciones | ✅ |
| AC03 | `router.refresh()` llamado después de crear checklist | ✅ |
| AC04 | Superadmin ve todos los módulos | ✅ |
| AC05 | Admin/client ven solo módulos permitidos | ✅ |
| AC06 | Tests pasan | ✅ |

---

## Archivos Modificados

### Frontend

- `lib/permissions-context.tsx` - Unificado a `hasPermission()`
- `app/admin/page.tsx` - Reemplazado `can()` con `hasPermission()`
- `app/client/page.tsx` - Verificado uso de `hasPermission()`
- `app/checklists/new/page.tsx` - Agregado `router.refresh()`
- `components/ui/PermissionGate.tsx` - Actualizado a `hasPermission()`

---

## Historial de Cambios

| Fecha | Versión | Cambio | Autor |
|-------|---------|--------|-------|
| 2026-03-13 | 1.0.0 | Creación inicial | — |
| 2026-03-13 | 2.0.0 | Corregida lógica de permisos: admin también depende de allowedModules | — |
