# F018: Optimizar Frontend Applications

> Estado: PENDING_APPROVAL
> Fecha de creación: 2026-03-12
> Última actualización: 2026-03-12

---

## Contexto

| Campo           | Descripción                                      |
| --------------- | ------------------------------------------------ |
| **Módulo**      | applications (frontend)                          |
| **Usuario**     | developer (frontend)                             |
| **Problema**    | Página admin con 241 líneas y lógica mezclada   |
| **Solicitante** | Technical Debt                                  |
| **Prioridad**   | Alta                                            |

> **Nota**: F015 optimizó el backend. Esta spec optimiza el frontend.

---

## spec (Qué y Por Qué)

### Problemas Identificados

| #   | Problema                        | Severidad | Ubicación                      |
| --- | ------------------------------ | --------- | ------------------------------ |
| 1   | admin/applications/page.tsx 241 líneas | HIGH     | `admin/applications/page.tsx` |
| 2   | Tipos en _components (privado) | MEDIUM    | `_components/types.ts`        |
| 3   | Lógica de estado mezclada      | MEDIUM    | página principal              |

### User Stories

- Como **desarrollador**, quiero página admin enfocada en layout
- Como **desarrollador**, quiero tipos compartidos accesibles

### Acceptance Criteria

- [ ] **AC01**: `admin/applications/page.tsx` < 200 líneas
- [ ] **AC02**: Tipos en `components/applications/types.ts`
- [ ] **AC03**: Usa Spinner y Toast desde `components/ui/`
- [ ] **AC04**: Imports actualizados a nuevos paths
- [ ] **AC05**: `client/applications/page.tsx` funciona igual

---

## plan (Cómo)

### Arquitectura Propuesta

```
admin/applications/page.tsx    (~150 líneas - solo layout y estado principal)
├── useApplications() hook para lógica
├── Tipos en components/applications/types.ts
└── Usa Spinner/Toast de components/ui/
```

### Tasks

- [ ] **T01**: Mover tipos a `components/applications/types.ts`
- [ ] **T02**: Crear hook `useApplications()` para lógica
- [ ] **T03**: Usar Spinner de `components/ui/`
- [ ] **T04**: Usar Toast de `components/ui/`
- [ ] **T05**: Reducir página a layout + estado principal
- [ ] **T06**: Verificar `client/applications/page.tsx` funciona

---

## Referencias

- Constitución: `specs/SPEC.md`
- Componentes: `apps/frontend/components/applications/`
- F015: Optimización Applications backend (Fase 2)
- F016: Consolidar Componentes Duplicados

---

## Historial de Cambios

| Fecha      | Versión | Cambio          | Autor |
| ---------- | ------- | --------------- | ----- |
| 2026-03-12 | 1.0.0   | Creación inicial | —     |

---
