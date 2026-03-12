# FEATURES.md — Índice de Features

> Este documento es el índice central de todas las specs del proyecto.
> Cada feature tiene su propia especificación en `specs/features/`.

---

## Cómo usar este índice

1. **Nueva feature**: Crear spec en `specs/features/FXXX-nombre.md`
2. **Desarrollo**: Marcar estado en este índice
3. **Completado**: Verificar que docs del módulo estén actualizadas

---

## Estados

| Estado             | Descripción               |
| ------------------ | ------------------------- |
| `DRAFT`            | En creación               |
| `PENDING_APPROVAL` | Esperando revisión        |
| `APPROVED`         | Aprobada y lista          |
| `IN_PROGRESS`      | En desarrollo             |
| `VALIDATING`       | Validando implementación  |
| `COMPLETED`        | Implementada y verificada |
| `ARCHIVED`         | Obsoleta                  |

---

## Features Existentes

> Las features below were implemented before SDD was adopted.
> They are documented in the module READMEs for reference.

| ID   | Feature                  | Módulo       | Estado    | Spec | README                                            |
| ---- | ------------------------ | ------------ | --------- | ---- | ------------------------------------------------- |
| F001 | Autenticación JWT        | auth         | COMPLETED | —    | `apps/backend/src/modules/auth/README.md`         |
| F002 | Gestión de Usuarios      | users        | COMPLETED | —    | `apps/backend/src/modules/users/README.md`        |
| F003 | Checklists con IA        | checklists   | COMPLETED | —    | `apps/backend/src/modules/checklists/README.md`   |
| F004 | Postulaciones Laborales  | applications | COMPLETED | —    | `apps/backend/src/modules/applications/README.md` |
| F005 | Endpoints AI             | ai           | COMPLETED | —    | `apps/backend/src/modules/ai/README.md`           |
| F006 | Webhooks n8n             | webhooks     | COMPLETED | —    | `apps/backend/src/modules/webhooks/README.md`     |
| F007 | Motor IA Multi-proveedor | ai-core      | COMPLETED | —    | `packages/ai-core/README.md`                      |
| F008 | Tipos Compartidos        | shared       | COMPLETED | —    | `packages/shared/README.md`                       |
| F009 | Workflows n8n            | n8n          | COMPLETED | —    | `n8n-workflows/README.md`                         |

---

## Features Planeadas (Backlog)

| ID   | Feature                            | Módulo       | Estado           | Prioridad |
| ---- | ---------------------------------- | ------------ | ---------------- | --------- |
| F010 | Gestor de Gastos                   | expenses     | DRAFT            | Alta      |
| F011 | Ahorro/Inversiones                 | savings      | DRAFT            | Alta      |
| F012 | Iniciar sesión como X (superadmin) | users        | PENDING_APPROVAL | Media     |
| F013 | Optimización Applications          | applications | COMPLETED        | Alta      |
| F014 | Optimización Checklists            | checklists   | COMPLETED        | Alta      |
| F015 | Optimización Applications (Fase2) | applications | COMPLETED        | Alta      |
| F016 | Consolidar Componentes Duplicados | frontend    | COMPLETED | Alta      |
| F017 | Optimizar Frontend Checklists     | checklists   | PENDING_APPROVAL | Alta      |
| F018 | Optimizar Frontend Applications   | applications | PENDING_APPROVAL | Alta      |
| F019 | Agregar Tests Frontend            | frontend    | PENDING_APPROVAL | Alta      |

---

## Para nuevos features

1. Crear archivo: `specs/features/F0XX-nombre.md`
2. Usar template: `specs/features/template.md`
3. Agregar entrada a esta tabla
4. Following workflow Spec-Anchored (ver `specs/SPEC.md`)

---

## Links a Módulos

| Módulo       | Documentación                                     |
| ------------ | ------------------------------------------------- |
| Auth         | `apps/backend/src/modules/auth/README.md`         |
| Users        | `apps/backend/src/modules/users/README.md`        |
| Checklists   | `apps/backend/src/modules/checklists/README.md`   |
| Applications | `apps/backend/src/modules/applications/README.md` |
| AI           | `apps/backend/src/modules/ai/README.md`           |
| Webhooks     | `apps/backend/src/modules/webhooks/README.md`     |
| ai-core      | `packages/ai-core/README.md`                      |
| shared       | `packages/shared/README.md`                       |
| n8n          | `n8n-workflows/README.md`                         |

---

## Referencias

- `specs/SPEC.md` — Constitución del proyecto
- `docs/AGENTS.md` — Reglas de desarrollo
- `PROJECT.md` — Contexto general
