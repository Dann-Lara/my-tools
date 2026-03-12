# F017: Optimizar Frontend Checklists

> Estado: PENDING_APPROVAL
> Fecha de creación: 2026-03-12
> Última actualización: 2026-03-12

---

## Contexto

| Campo           | Descripción                                      |
| --------------- | ------------------------------------------------ |
| **Módulo**      | checklists (frontend)                            |
| **Usuario**     | developer (frontend)                             |
| **Problema**    | Páginas con muchas líneas y lógica mezclada      |
| **Solicitante** | Technical Debt                                  |
| **Prioridad**   | Alta                                            |

> **Nota**: F014 optimizó el backend y extrajo componentes. Esta spec optimiza el frontend.

---

## spec (Qué y Por Qué)

### Problemas Identificados

| #   | Problema                    | Severidad | Ubicación                       |
| --- | -------------------------- | --------- | -------------------------------- |
| 1   | [id]/page.tsx tiene 391 líneas | CRITICAL | `checklists/[id]/page.tsx`      |
| 2   | new/page.tsx tiene 217 líneas | HIGH     | `checklists/new/page.tsx`       |
| 3   | STATUS_STYLES duplicado     | MEDIUM    | `checklists/[id]/page.tsx`      |
| 4   | Lógica de estado mezclada  | MEDIUM    | ambas páginas                   |

### User Stories

- Como **desarrollador**, quiero páginas pequeñas y enfocadas
- Como **desarrollador**, quiero lógica de UI separada de la página

### Acceptance Criteria

- [ ] **AC01**: `checklists/[id]/page.tsx` < 250 líneas
- [ ] **AC02**: `checklists/new/page.tsx` < 200 líneas
- [ ] **AC03**: STATUS_STYLES en componente o constants
- [ ] **AC04**: Usa Spinner desde `components/ui/`
- [ ] **AC05**: Todas las funcionalidades funcionan igual

---

## plan (Cómo)

### Arquitectura Propuesta

```
checklists/[id]/page.tsx        (~200 líneas - solo layout y estado principal)
├── Extraer: ChecklistDetailContainer (hook o componente)
└── Extraer: STATUS_STYLES a constants o componente header

checklists/new/page.tsx        (~150 líneas - solo layout y estado principal)
├── Extraer: NewChecklistContainer (hook o componente)
└── Extraer: WizardSteps a componente
```

### Tasks

#### Para [id]/page.tsx

- [ ] **T01**: Crear hook `useChecklistDetail(id)` para lógica
- [ ] **T02**: Extraer STATUS_STYLES a constante o componente
- [ ] **T03**: Usar Spinner de `components/ui/`
- [ ] **T04**: Reducir página a layout + estado principal

#### Para new/page.tsx

- [ ] **T05**: Crear hook `useNewChecklist()` para lógica
- [ ] **T06**: Usar Spinner de `components/ui/`
- [ ] **T07**: Reducir página a layout + estado principal

---

## Referencias

- Constitución: `specs/SPEC.md`
- Componentes existentes: `apps/frontend/components/checklists/`
- F014: Optimización Checklists backend

---

## Historial de Cambios

| Fecha      | Versión | Cambio          | Autor |
| ---------- | ------- | --------------- | ----- |
| 2026-03-12 | 1.0.0   | Creación inicial | —     |

---
