# F021: Optimizar Módulo Auth

> Estado: APPROVED
> Fecha de creación: 2026-03-12
> Última actualización: 2026-03-12

---

## Contexto

| Campo           | Descripción                                      |
| --------------- | ------------------------------------------------ |
| **Módulo**      | auth                                            |
| **Usuario**     | developer                                       |
| **Problema**    | Spinner duplicado en profile, lógica mezclada    |
| **Solicitante** | Technical Debt                                  |
| **Prioridad**   | Alta                                           |

---

## spec (Qué y Por Qué)

### Problemas Identificados

| #   | Problema                        | Severidad | Ubicación                      |
| --- | ------------------------------ | --------- | ------------------------------ |
| 1   | Spinner duplicado              | HIGH     | `apps/frontend/app/admin/profile/page.tsx` |
| 2   | Lógica de perfil mezclada      | MEDIUM   | Sin hook useProfile            |
| 3   | Sin tests backend              | HIGH     | Sin archivo de tests           |

### User Stories

- Como **desarrollador**, quiero componentes de auth optimizados
- Como **QA**, quiero tests para el módulo auth

### Acceptance Criteria

- [ ] **AC01**: Usa Spinner de `components/ui/` en profile
- [ ] **AC02**: Crea hook `useProfile()` si la lógica lo justifica
- [ ] **AC03**: Agrega tests para `auth.service.ts`
- [ ] **AC04**: Agrega tests para `users.service.ts` (funciones de auth)

---

## plan (Cómo)

### Tareas

- [ ] **T01**: Reemplazar Spinner local por `components/ui/Spinner`
- [ ] **T02**: Revisar si necesita hook useProfile
- [ ] **T03**: Crear tests para auth.service
- [ ] **T04**: Crear tests para funciones de auth en users.service
- [ ] **T05**: Verificar que todo funcione

---

## Referencias

- Constitución: `specs/SPEC.md`
- F016: Consolidar Componentes Duplicados

---

## Historial de Cambios

| Fecha      | Versión | Cambio          | Autor |
| ---------- | ------- | --------------- | ----- |
| 2026-03-12 | 1.0.0   | Creación inicial | —     |
