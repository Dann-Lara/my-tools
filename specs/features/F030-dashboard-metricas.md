# F030: Dashboard con Métricas

> Estado: APPROVED
> Fecha de creación: 2026-03-12
> Última actualización: 2026-03-12

---

## Contexto

| Campo           | Descripción                                      |
| --------------- | ------------------------------------------------ |
| **Módulo**      | dashboard (frontend)                             |
| **Usuario**     | admin, superadmin                                |
| **Problema**    | Dashboard sin stats de módulos, AI incrustado   |
| **Solicitante** | UX, Mantenimiento                               |
| **Prioridad**   | Alta                                           |

---

## spec (Qué y Por Qué)

### Problemas Identificados

| #   | Problema                        | Severidad | Ubicación                      |
| --- | ------------------------------ | --------- | ------------------------------ |
| 1   | Sin stats de applications      | HIGH      | `admin/page.tsx`               |
| 2   | AI tools en dashboard          | MEDIUM    | Ahora en ruta separada (F029)  |
| 3   | Falta acceso rápido a módulos  | MEDIUM    | Solo enlaces parciales          |

### User Stories

- Como **admin**, quiero ver métricas de checklists y applications en el dashboard
- Como **admin**, quiero acceso rápido a todos los módulos

### Acceptance Criteria

- [x] **AC01**: Mostrar stats de checklists (total, activos, tareas completadas)
- [x] **AC02**: Mostrar stats de applications (total, pendientes, aceptados, rechazados)
- [x] **AC03**: Agregar accesos directos a AI (ruta /admin/ai)
- [x] **AC04**: Agregar accesos directos a /admin/applications
- [x] **AC05**: Organizar dashboard con tabs (Resumen / Sistema)
- [x] **AC06**: Tests pasan

---

## Referencias

- Constitución: `specs/SPEC.md`
- F029: Módulos AI separados

---

## Historial de Cambios

| Fecha      | Versión | Cambio          | Autor |
| ---------- | ------- | --------------- | ----- |
| 2026-03-12 | 1.0.0   | Creación inicial | —     |
