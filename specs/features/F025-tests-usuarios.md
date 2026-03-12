# F025: Agregar Tests para Módulo Users

> Estado: APPROVED
> Fecha de creación: 2026-03-12
> Última actualización: 2026-03-12

---

## Contexto

| Campo           | Descripción                                      |
| --------------- | ------------------------------------------------ |
| **Módulo**      | users (backend + frontend)                      |
| **Usuario**     | QA, developer                                   |
| **Problema**    | Sin tests para el módulo users                 |
| **Solicitante** | Quality Assurance                               |
| **Prioridad**   | Alta                                           |

---

## spec (Qué y Por Qué)

### Problemas Identificados

| #   | Problema                        | Severidad | Ubicación                      |
| --- | ------------------------------ | --------- | ------------------------------ |
| 1   | Sin tests backend para users  | CRITICAL  | `apps/backend/src/modules/users/` |
| 2   | Sin tests frontend para users | CRITICAL  | `apps/frontend/components/`    |

### User Stories

- Como **QA**, quiero tests que me den confianza al hacer cambios
- Como **desarrollador**, quiero tests que documenten el comportamiento esperado

### Acceptance Criteria (Backend)

- [ ] **AC01**: Tests para users.service.ts
- [ ] **AC02**: Tests para create-user.dto.ts validation
- [ ] **AC03**: Tests para update-user.dto.ts validation

### Acceptance Criteria (Frontend)

- [ ] **AC04**: Tests para componentes de Users
- [ ] **AC05**: Coverage > 70%

---

## plan (Cómo)

### Tareas Backend

- [ ] **T01**: Crear users.service.spec.ts
- [ ] **T02**: Testear métodos: findAll, findOne, create, update, remove
- [ ] **T03**: Testear validación de DTOs

### Tareas Frontend

- [ ] **T04**: Crear tests para UserCard component si existe
- [ ] **T05**: Crear tests para UserList component si existe

---

## Referencias

- Constitución: `specs/SPEC.md`
- Test ejemplo: `apps/backend/src/modules/checklists/checklists.service.spec.ts`

---

## Historial de Cambios

| Fecha      | Versión | Cambio          | Autor |
| ---------- | ------- | --------------- | ----- |
| 2026-03-12 | 1.0.0   | Creación inicial | —     |
