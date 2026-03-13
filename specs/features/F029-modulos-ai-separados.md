# F029: Crear Módulos AI Separados

> Estado: APPROVED
> Fecha de creación: 2026-03-12
> Última actualización: 2026-03-12

---

## Contexto

| Campo           | Descripción                                      |
| --------------- | ------------------------------------------------ |
| **Módulo**      | ai (frontend)                                    |
| **Usuario**     | developer, superadmin                            |
| **Problema**    | AI tools incrustadas en dashboard sin control de permisos |
| **Solicitante** | UX, Mantenimiento                               |
| **Prioridad**   | Alta                                           |

---

## spec (Qué y Por Qué)

### Problemas Identificados

| #   | Problema                        | Severidad | Ubicación                      |
| --- | ------------------------------ | --------- | ------------------------------ |
| 1   | AI Generator/Summarizer en dashboard | HIGH | `admin/page.tsx` |
| 2   | Sin ruta propia para AI        | HIGH     | No existe `/admin/ai`          |
| 3   | AI no controlado por permisos  | HIGH     | PermissionGate no aplicado     |

### User Stories

- Como **superadmin**, quiero poder controlar quién puede usar las herramientas de AI
- Como **usuario**, quiero acceder a las herramientas de AI desde el sidebar

### Acceptance Criteria

- [x] **AC01**: Crear página `/admin/ai/page.tsx`
- [x] **AC02**: Crear página `/client/ai/page.tsx`
- [x] **AC03**: Agregar item "AI" al sidebar
- [x] **AC04**: AI controlado por PermissionGate (ya implementado en F022)
- [x] **AC05**: Tests pasan

---

## Referencias

- Constitución: `specs/SPEC.md`
- F022: Optimizar Módulo AI

---

## Historial de Cambios

| Fecha      | Versión | Cambio          | Autor |
| ---------- | ------- | --------------- | ----- |
| 2026-03-12 | 1.0.0   | Creación inicial | —     |
