# F020: Optimizar Módulo Users

> Estado: APPROVED
> Fecha de creación: 2026-03-12
> Última actualización: 2026-03-12

---

## Contexto

| Campo           | Descripción                                      |
| --------------- | ------------------------------------------------ |
| **Módulo**      | users                                           |
| **Usuario**     | developer                                       |
| **Problema**    | Páginas frontend con 671 líneas, Spinner duplicado, lógica mezclada |
| **Solicitante** | Technical Debt                                  |
| **Prioridad**   | Alta                                           |

---

## spec (Qué y Por Qué)

### Problemas Identificados

| #   | Problema                        | Severidad | Ubicación                      |
| --- | ------------------------------ | --------- | ------------------------------ |
| 1   | admin/users/page.tsx 373 líneas | HIGH     | `apps/frontend/app/admin/users/page.tsx` |
| 2   | admin/users/[id]/page.tsx 298 líneas | HIGH | `apps/frontend/app/admin/users/[id]/page.tsx` |
| 3   | Spinner duplicado              | MEDIUM   | `apps/frontend/app/admin/users/page.tsx` |
| 4   | Lógica mezclada en páginas     | MEDIUM   | Sin hook useUsers              |
| 5   | Sin tests frontend            | HIGH     | Sin archivo de tests          |

### User Stories

- Como **desarrollador**, quiero páginas de users optimizadas y testeables
- Como **desarrollador**, quiero un hook useUsers para reutilizar lógica

### Acceptance Criteria

- [ ] **AC01**: `admin/users/page.tsx` < 200 líneas
- [ ] **AC02**: `admin/users/[id]/page.tsx` < 200 líneas
- [ ] **AC03**: Usa Spinner de `components/ui/`
- [ ] **AC04**: Crea hook `useUsers()` en `hooks/`
- [ ] **AC05**: Tests para componentes de Users
- [ ] **AC06**: Actualiza imports a nuevos paths

---

## plan (Cómo)

### Tareas

- [ ] **T01**: Crear hook `useUsers()` en `apps/frontend/hooks/useUsers.ts`
- [ ] **T02**: Actualizar `admin/users/page.tsx` para usar Spinner y hook
- [ ] **T03**: Actualizar `admin/users/[id]/page.tsx` para usar Spinner
- [ ] **T04**: Reducir páginas a < 200 líneas
- [ ] **T05**: Crear tests para componentes de Users
- [ ] **T06**: Verificar que todo funcione

---

## Referencias

- Constitución: `specs/SPEC.md`
- F016: Consolidar Componentes Duplicados
- F017-F019: Optimizaciones anteriores

---

## Historial de Cambios

| Fecha      | Versión | Cambio          | Autor |
| ---------- | ------- | --------------- | ----- |
| 2026-03-12 | 1.0.0   | Creación inicial | —     |
