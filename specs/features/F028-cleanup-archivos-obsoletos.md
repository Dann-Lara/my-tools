# F028: Cleanup Archivos Obsoletos

> Estado: APPROVED
> Fecha de creación: 2026-03-12
> Última actualización: 2026-03-12

---

## Contexto

| Campo           | Descripción                                      |
| --------------- | ------------------------------------------------ |
| **Módulo**      | Repositorio general                              |
| **Usuario**     | developer                                       |
| **Problema**    | Archivos duplicados y obsoletos en el repo     |
| **Solicitante** | Mantenimiento                                   |
| **Prioridad**   | Alta                                           |

---

## spec (Qué y Por Qué)

### Archivos Eliminados

| #   | Archivo                       | Razón                      |
| --- | ---------------------------- | -------------------------- |
| 1   | `nul` (root)                | Archivo espurio de Windows |
| 2   | `admin/applications/_components/` | Duplicado de `components/applications/` |
| 3   | `F026-tests-auth.md`         | Duplicado (ya implementado en F021) |

### User Stories

- Como **mantenedor**, quiero un repo limpio sin archivos obsoletos
- Como **desarrollador**, quiero una estructura clara sin duplicados

### Acceptance Criteria

- [x] **AC01**: Eliminar archivo `nul` del root
- [x] **AC02**: Eliminar `_components` duplicado en admin/applications
- [x] **AC03**: Eliminar spec F026 duplicada
- [x] **AC04**: Tests pasan sin regressions

---

## Referencias

- Constitución: `specs/SPEC.md`

---

## Historial de Cambios

| Fecha      | Versión | Cambio          | Autor |
| ---------- | ------- | --------------- | ----- |
| 2026-03-12 | 1.0.0   | Creación inicial | —     |
