# F034: Dashboard - Permisos y Actualización de Datos

> Estado: APPROVED
> Fecha de creación: 2026-03-13

---

## Contexto

| Campo | Descripción |
|-------|-------------|
| **Módulo** | frontend, dashboard |
| **Problema** | Dashboard no se actualiza al crear datos; métricas visibles para usuarios sin permisos |
| **Prioridad** | HIGH |

---

## Problemas Identificados

| # | Problema | Severidad | Ubicación |
|---|----------|-----------|-----------|
| 1 | Dashboard no se actualiza después de crear checklist/application | HIGH | `checklists/new/page.tsx` |
| 2 | Métricas visibles para usuarios sin permisos de módulo | HIGH | `admin/page.tsx`, `client/page.tsx` |
| 3 | Inconsistencia entre `can()` y `hasPermission()` | MEDIUM | `permissions-context.tsx` |

---

## Regla de Permisos

**"No se ve lo que no tiene permiso"**

| Rol | Acceso a módulos |
|-----|-----------------|
| **superadmin** | Ve todos los módulos (backend retorna todos como `true`) |
| **admin** | Solo módulos que el superadmin le permitió |
| **client** | Solo módulos que el admin le permitió |

---

## Solución Implementada

### 1. Unificación de Funciones de Permisos

```typescript
// permissions-context.tsx - ANTES (inconsistente)
function can(key: string): boolean {
  if (userRole === 'superadmin' || userRole === 'admin') return true; // Siempre true
  return ready && permissions[key] === true;
}

function hasPermission(key: string): boolean {
  return ready && permissions[key] === true;
}

// DESPUÉS (unificado)
function hasPermission(key: string): boolean {
  if (!ready) return false;
  return permissions[key] === true;
}
```

**Cambio clave**: El backend ya retorna los permisos correctos para cada rol:
- Superadmin: `{ checklist: true, applications: true, ai: true }`
- Admin con permisos: `{ checklist: true, applications: false, ai: true }`
- Client con permisos: `{ checklist: true, applications: false, ai: false }`

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
