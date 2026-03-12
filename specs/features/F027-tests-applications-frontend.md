# F027: Agregar Tests para Applications Frontend

> Estado: APPROVED
> Fecha de creación: 2026-03-12
> Última actualización: 2026-03-12

---

## Contexto

| Campo           | Descripción                                      |
| --------------- | ------------------------------------------------ |
| **Módulo**      | applications (frontend)                          |
| **Usuario**     | QA, developer                                   |
| **Problema**    | Sin tests para componentes de applications     |
| **Solicitante** | Quality Assurance                               |
| **Prioridad**   | Alta                                           |

---

## spec (Qué y Por Qué)

### Problemas Identificados

| #   | Problema                        | Severidad | Ubicación                      |
| --- | ------------------------------ | --------- | ------------------------------ |
| 1   | Sin tests para AppCard         | CRITICAL  | `apps/frontend/components/applications/` |
| 2   | Sin tests para BaseCVForm      | HIGH      | `apps/frontend/components/applications/` |
| 3   | Sin tests para NewApplicationForm | HIGH    | `apps/frontend/components/applications/` |

### User Stories

- Como **QA**, quiero tests para componentes de postulaciones
- Como **desarrollador**, quiero tests que documenten el comportamiento esperado

### Acceptance Criteria

- [ ] **AC01**: Tests para AppCard.tsx
- [ ] **AC02**: Tests básicos para BaseCVForm.tsx
- [ ] **AC03**: Tests básicos para NewApplicationForm.tsx
- [ ] **AC04**: Coverage > 70% en componentes testeados

---

## plan (Cómo)

### Tareas

- [ ] **T01**: Crear AppCard.test.tsx
- [ ] **T02**: Testear renderizado de tarjeta
- [ ] **T03**: Testear cambio de estado
- [ ] **T04**: Testear eliminación
- [ ] **T05**: Crear tests básicos para BaseCVForm
- [ ] **T06**: Crear tests básicos para NewApplicationForm

---

## Referencias

- Constitución: `specs/SPEC.md`
- Tests ejemplo: `apps/frontend/components/checklists/__tests__/`

---

## Historial de Cambios

| Fecha      | Versión | Cambio          | Autor |
| ---------- | ------- | --------------- | ----- |
| 2026-03-12 | 1.0.0   | Creación inicial | —     |
