# F016: Consolidar Componentes Duplicados del Frontend

> Estado: PENDING_APPROVAL
> Fecha de creación: 2026-03-12
> Última actualización: 2026-03-12

---

## Contexto

| Campo           | Descripción                                                   |
| --------------- | ------------------------------------------------------------- |
| **Módulo**      | frontend (checklists + applications)                         |
| **Usuario**     | developer (frontend)                                         |
| **Problema**    | Componentes duplicidos (Spinner, Toast) en múltiples páginas |
| **Solicitante** | Technical Debt                                                |
| **Prioridad**   | Alta                                                          |

---

## spec (Qué y Por Qué)

### Problemas Identificados

| #   | Problema                              | Severidad | Ubicación                                            |
| --- | ------------------------------------ | --------- | ---------------------------------------------------- |
| 1   | Spinner definido 3+ veces             | HIGH      | `checklists/[id]/page.tsx`, `checklists/new/page.tsx`, otros |
| 2   | Toast definido en applications       | HIGH      | `admin/applications/page.tsx`                        |
| 3   | Components en _components (privado)   | MEDIUM    | `admin/applications/_components/`                    |
| 4   | Sin carpeta components/applications   | MEDIUM    | `apps/frontend/components/`                          |

### User Stories

- Como **desarrollador**, quiero componentes compartidos para evitar duplicación
- Como **desarrollador**, quiero una estructura de componentes consistente

### Acceptance Criteria

- [ ] **AC01**: Spinner es un componente reutilizable en `components/ui/`
- [ ] **AC02**: Toast es un componente reutilizable en `components/ui/`
- [ ] **AC03**: Componentes de applications movidos a `components/applications/`
- [ ] **AC04**: Todos los imports actualizados
- [ ] **AC05**: Funcionalidad preservada

---

## plan (Cómo)

### Arquitectura Propuesta

```
apps/frontend/components/
├── ui/
│   ├── Spinner.tsx          (NUEVO - componente compartido)
│   └── Toast.tsx            (NUEVO - componente compartido)
└── applications/
    ├── index.ts             (NUEVO - exports)
    ├── AppCard.tsx          (MOVIDO desde _components)
    ├── BaseCVForm.tsx       (MOVIDO desde _components)
    ├── NewApplicationForm.tsx (MOVIDO desde _components)
    ├── AiFeedbackPanel.tsx   (MOVIDO desde _components)
    ├── PdfCVUploader.tsx     (MOVIDO desde _components)
    ├── icons.tsx             (MOVIDO desde _components)
    └── types.ts              (MOVIDO desde _components)
```

### Tasks

- [ ] **T01**: Crear `components/ui/Spinner.tsx`
- [ ] **T02**: Crear `components/ui/Toast.tsx`
- [ ] **T03**: Crear `components/applications/` y mover componentes
- [ ] **T04**: Actualizar imports en páginas afectadas
- [ ] **T05**: Eliminar `_components/` antiguo

---

## Referencias

- Constitución: `specs/SPEC.md`
- Frontend actual: `apps/frontend/app/`

---

## Historial de Cambios

| Fecha      | Versión | Cambio          | Autor |
| ---------- | ------- | --------------- | ----- |
| 2026-03-12 | 1.0.0   | Creación inicial | —     |

---
