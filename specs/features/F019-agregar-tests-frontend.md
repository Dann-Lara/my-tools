# F019: Agregar Tests Frontend

> Estado: PENDING_APPROVAL
> Fecha de creación: 2026-03-12
> Última actualización: 2026-03-12

---

## Contexto

| Campo           | Descripción                                      |
| --------------- | ------------------------------------------------ |
| **Módulo**      | frontend (checklists + applications)              |
| **Usuario**     | developer (frontend)                             |
| **Problema**    | Sin tests unitarios para componentes             |
| **Solicitante** | Quality Assurance                                |
| **Prioridad**   | Alta                                            |

---

## spec (Qué y Por Qué)

### Problemas Identificados

| #   | Problema                    | Severidad | Ubicación                          |
| --- | -------------------------- | --------- | ---------------------------------- |
| 1   | Sin configuración de tests | CRITICAL  | `apps/frontend/`                   |
| 2   | Sin tests para componentes | HIGH      | `components/checklists/`, `components/applications/` |
| 3   | Coverage muy bajo          | HIGH      | proyecto completo                  |

### User Stories

- Como **desarrollador**, quiero tests que me den confianza al hacer cambios
- Como **QA**, quiero cobertura de tests para componentes clave

### Acceptance Criteria

- [ ] **AC01**: Jest configurado en frontend
- [ ] **AC02**: React Testing Library configurado
- [ ] **AC03**: Tests para componentes de Checklists:
  - [ ] ChecklistCard
  - [ ] ChecklistStats
  - [ ] EmptyState
- [ ] **AC04**: Tests para componentes de Applications:
  - [ ] AppCard
  - [ ] BaseCVForm (básico)
  - [ ] NewApplicationForm (básico)
- [ ] **AC05**: Coverage > 70% en componentes testeados

---

## plan (Cómo)

### Stack de Testing

| Herramienta    | Uso                                    |
| -------------- | -------------------------------------- |
| Jest           | Test runner                            |
| @testing-library/react | Testing de componentes React    |
| @testing-library/jest-dom | Assertions de DOM           |
| jest-fetch-mock | Mock de fetch API                     |

### Archivos de Configuración

```
apps/frontend/
├── jest.config.js           (NUEVO)
├── jest.setup.js            (NUEVO)
├── package.json             (actualizar scripts)
└── components/
    ├── checklists/
    │   ├── __tests__/
    │   │   ├── ChecklistCard.test.tsx
    │   │   ├── ChecklistStats.test.tsx
    │   │   └── EmptyState.test.tsx
    │   └── ...
    └── applications/
        └── __tests__/
            ├── AppCard.test.tsx
            ├── BaseCVForm.test.tsx
            └── NewApplicationForm.test.tsx
```

### Tasks

#### Configuración

- [ ] **T01**: Instalar dependencias de testing
- [ ] **T02**: Crear `jest.config.js`
- [ ] **T03**: Crear `jest.setup.js`
- [ ] **T04**: Actualizar `package.json` con scripts

#### Tests Checklists

- [ ] **T05**: Crear `ChecklistCard.test.tsx`
- [ ] **T06**: Crear `ChecklistStats.test.tsx`
- [ ] **T07**: Crear `EmptyState.test.tsx`

#### Tests Applications

- [ ] **T08**: Crear `AppCard.test.tsx`
- [ ] **T09**: Crear `BaseCVForm.test.tsx`
- [ ] **T10**: Crear `NewApplicationForm.test.tsx`

---

## Referencias

- Constitución: `specs/SPEC.md`
- Ejemplo de test existente: `apps/frontend/components/ai/__tests__/AiGenerator.test.tsx`

---

## Historial de Cambios

| Fecha      | Versión | Cambio          | Autor |
| ---------- | ------- | --------------- | ----- |
| 2026-03-12 | 1.0.0   | Creación inicial | —     |

---
