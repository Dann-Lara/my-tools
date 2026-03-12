# FXXX: Nombre del Feature

> Estado: [DRAFT | PENDING_APPROVAL | APPROVED | IN_PROGRESS | VALIDATING | COMPLETED | ARCHIVED]
> Fecha de creación: YYYY-MM-DD
> Última actualización: YYYY-MM-DD

---

## Contexto

| Campo           | Descripción                          |
| --------------- | ------------------------------------ | ----- | ---------- | ------------ | --- | -------- | -------- | ------- | ------ |
| **Módulo**      | [auth                                | users | checklists | applications | ai  | webhooks | expenses | savings | other] |
| **Usuario**     | [client                              | admin | superadmin | n8n]         |
| **Problema**    | ¿Qué problema resuelve esta feature? |
| **Solicitante** | ¿Quién la solicita?                  |
| **Prioridad**   | [Crítica                             | Alta  | Media      | Baja]        |

---

## spec (Qué y Por Qué)

### User Stories

- Como **[usuario]**, quiero **[acción]** para **[beneficio]**.
- Como **[usuario]**, quiero **[acción]** para **[beneficio]**.

### Acceptance Criteria

- [ ] **AC01**: Criterio de aceptación 1
- [ ] **AC02**: Criterio de aceptación 2
- [ ] **AC03**: Criterio de aceptación 3

### Funcionalidad Esperada

Descripción detallada de lo que debe hacer la feature.

### Edge Cases

| ID   | Descripción  | Comportamiento Esperado |
| ---- | ------------ | ----------------------- |
| EC01 | Caso borde 1 | Qué sucede...           |
| EC02 | Caso borde 2 | Qué sucede...           |

---

## plan (Cómo)

### Stack

| Tecnología | Uso            | Versión |
| ---------- | -------------- | ------- |
| NestJS     | Backend API    | 10.x    |
| Next.js    | Frontend       | 14.x    |
| TypeORM    | ORM            | 0.3.x   |
| ai-core    | IA             | —       |
| n8n        | Automatización | —       |

### Arquitectura

#### Entidades Nuevas/Modificadas

```typescript
// Nueva entidad si aplica
@Entity('nombre_tabla')
export class NuevaEntidad {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // ... campos
}
```

#### Endpoints API

| Método | Path          | Auth | Descripción   |
| ------ | ------------- | ---- | ------------- |
| GET    | `/v1/recurso` | JWT  | Obtener lista |
| POST   | `/v1/recurso` | JWT  | Crear nuevo   |

#### Componentes UI

| Componente | Ubicación                      | Descripción |
| ---------- | ------------------------------ | ----------- |
| Nombre     | `apps/frontend/components/...` | Descripción |

### Constraints

| Constraint  | Límite                    |
| ----------- | ------------------------- |
| Performance | < 200ms p95               |
| Rate Limit  | X requests/min            |
| Seguridad   | JWT + validación de roles |

---

## Tasks

### Phase 1: Backend

- [ ] **T01**: Crear entidad en database
- [ ] **T02**: Crear DTOs de validación
- [ ] **T03**: Implementar service
- [ ] **T04**: Implementar controller
- [ ] **T05**: Agregar tests unitarios

### Phase 2: Frontend

- [ ] **T06**: Crear componentes UI
- [ ] **T07**: Integrar con API
- [ ] **T08**: Agregar internacionalización

### Phase 3: Integración

- [ ] **T09**: Integrar con ai-core (si aplica)
- [ ] **T10**: Configurar n8n (si aplica)

### Phase 4: Validación

- [ ] **T11**: Verificar acceptance criteria
- [ ] **T12**: Testing E2E
- [ ] **T13**: Actualizar documentación

---

## Notas de Implementación

> Notas técnicas adicionales para la implementación.
> Este campo se actualiza durante el desarrollo.

---

## Historial de Cambios

| Fecha      | Versión | Cambio           | Autor |
| ---------- | ------- | ---------------- | ----- |
| YYYY-MM-DD | 1.0.0   | Creación inicial | —     |

---

## Referencias

- Módulo: `apps/backend/src/modules/[modulo]/README.md`
- Specs relacionadas: `specs/FEXXX-*.md`
- Constitución: `specs/SPEC.md`
