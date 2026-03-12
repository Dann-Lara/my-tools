# F022: Optimizar Módulo AI

> Estado: APPROVED
> Fecha de creación: 2026-03-12
> Última actualización: 2026-03-12

---

## Contexto

| Campo           | Descripción                                      |
| --------------- | ------------------------------------------------ |
| **Módulo**      | ai (backend + frontend)                          |
| **Usuario**     | developer, superadmin                            |
| **Problema**    | AiGenerator y AiSummarizer sin control de permisos |
| **Solicitante** | Security, Technical Debt                        |
| **Prioridad**   | Alta                                           |

---

## spec (Qué y Por Qué)

### Problemas Identificados

| #   | Problema                        | Severidad | Ubicación                      |
| --- | ------------------------------ | --------- | ------------------------------ |
| 1   | AiGenerator accesible sin PermissionGate | CRITICAL | `apps/frontend/components/ai/AiGenerator.tsx` |
| 2   | AiSummarizer accesible sin PermissionGate | CRITICAL | `apps/frontend/components/ai/AiSummarizer.tsx` |
| 3   | STATUS_COLOR duplicado en admin/page | MEDIUM | `apps/frontend/app/admin/page.tsx` |
| 4   | Spinner inline en admin dashboard | MEDIUM | `apps/frontend/app/admin/page.tsx:81` |

### User Stories

- Como **superadmin**, quiero controlar qué usuarios pueden usar el generador de IA
- Como **desarrollador**, quiero componentes AI con control de permisos

### Acceptance Criteria

- [ ] **AC01**: AiGenerator usa PermissionGate para module="ai"
- [ ] **AC02**: AiSummarizer usa PermissionGate para module="ai"
- [ ] **AC03**: Extraer STATUS_COLOR a `components/checklists/constants.ts` o `components/ui/`
- [ ] **AC04**: Reemplazar Spinner inline por `components/ui/Spinner`
- [ ] **AC05**: Agregar module "ai" a permissions system
- [ ] **AC06**: Tests para componentes AI

---

## plan (Cómo)

### Tareas

- [ ] **T01**: Agregar "ai" a PermissionGate en permissions-context
- [ ] **T02**: Envolver AiGenerator con PermissionGate
- [ ] **T03**: Envolver AiSummarizer con PermissionGate
- [ ] **T04**: Extraer STATUS_COLOR a constants
- [ ] **T05**: Reemplazar Spinner inline con componente compartido
- [ ] **T06**: Crear tests para AiGenerator y AiSummarizer

---

## Referencias

- Constitución: `specs/SPEC.md`
- F016: Consolidar Componentes Duplicados
- Permisos: `apps/frontend/lib/permissions-context.tsx`

---

## Historial de Cambios

| Fecha      | Versión | Cambio          | Autor |
| ---------- | ------- | --------------- | ----- |
| 2026-03-12 | 1.0.0   | Creación inicial | —     |
