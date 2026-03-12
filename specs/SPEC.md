# SPEC.md — My Tools Constitution

> Este documento establece las reglas fundamentales no negociables del proyecto.
> Toda especificación debe adherirse a estas reglas.

---

## 1. Tech Stack (No Negociable)

| Capa           | Tecnología      | Versión         |
| -------------- | --------------- | --------------- |
| Runtime        | Node.js         | >= 20.0.0       |
| Backend        | NestJS          | 10.x            |
| ORM            | TypeORM         | 0.3.x           |
| Database       | PostgreSQL      | 16              |
| Cache          | Redis           | 7               |
| Frontend       | Next.js         | 14 (App Router) |
| UI             | React           | 18.x            |
| Styling        | Tailwind CSS    | 3.x             |
| IA             | ai-core package | —               |
| Automatización | n8n             | —               |
| Monorepo       | Turborepo       | 2.x             |

---

## 2. Patrones Arquitectónicos

### API

- Versionado obligatorio: `/v1/`
- Prefijo en todos los endpoints
- Documentación Swagger en `/api`

### Autenticación

- JWT para usuarios
- Webhook secret para integraciones (n8n)
- Estrategia: `JwtOrWebhookSecretGuard` para endpoints compartidos

### Base de Datos

- Entidades con `@CreateDateColumn()` y `@UpdateDateColumn()`
- Foreign keys con nombres explícitos: `@Column({ name: 'checklist_id' })`
- Booleanos por defecto `false`: `@Column({ default: false })`

### Frontend

- Componentes <= 250 líneas (hard limit)
- Páginas <= 300 líneas (hard limit)
- Todos los textos via sistema i18n
- Soporte dark/light mode obligatorio

---

## 3. Reglas de Specs

### Estructura de Specs

- Ubicación: `specs/features/FXXX-nombre.md`
- Máximo 300 líneas por spec
- Una spec por feature/module

### Contenido Obligatorio

```markdown
# FXXX: Nombre del Feature

## Contexto

- Módulo: [checklists | applications | users | auth | ai | webhooks]
- Usuario: [client | admin | superadmin]
- Problema: [qué problema resuelve]

## spec

### User Stories

- Como [usuario], quiero [acción] para [beneficio]

### Acceptance Criteria

- [ ] Criterio 1
- [ ] Criterio 2

### Edge Cases

- [EC01] Descripción del caso borde

## plan

### Stack

- Tecnologías utilizadas

### Arquitectura

- Entidades nuevas/modificadas
- Endpoints API
- Componentes UI

### Constraints

- Performance, seguridad, compatibilidad

## Tasks

- [ ] Task 1 (asignar a archivo/modulo)
- [ ] Task 2
```

### Estados de Spec

| Estado             | Descripción                        |
| ------------------ | ---------------------------------- |
| `DRAFT`            | En creación                        |
| `PENDING_APPROVAL` | Esperando revisión de stakeholders |
| `APPROVED`         | Aprobada, lista para implementar   |
| `IN_PROGRESS`      | En desarrollo                      |
| `VALIDATING`       | Validando contra implementación    |
| `COMPLETED`        | Implementada y validada            |
| `ARCHIVED`         | Obsoleta                           |

---

## 4. Workflow Spec-Anchored

```
1. Crear SPEC en DRAFT
       ↓
2. Review por stakeholders
       ↓
3. Cambiar a APPROVED (requerido)
       ↓
4. Desglose en Tasks (por módulo/archivo)
       ↓
5. Implementación
       ↓
6. Validación: spec == implementación
       ↓
7. COMPLETED → Actualizar docs del módulo
```

### Reglas de Validación

- **Cada task** debe poder completarse en máximo 2 horas
- **No modificar spec** sin approval de stakeholders
- **Si cambia el scope**: nueva spec o enmienda
- **Validación final**: verificar todos los acceptance criteria

---

## 5. Reglas de Documentación

### READMEs de Módulos

Cada módulo debe tener `README.md` con:

- Propósito del módulo
- Entidades
- Endpoints API
- Variables de entorno
- Link a specs relacionadas (`specs/FEATURES.md`)

### Actualización de Docs

Al completar una spec:

1. Actualizar `specs/FEATURES.md` con estado
2. Actualizar README del módulo si hay cambios
3. Verificar que AGENTS.md esté actualizado

---

## 6. Constraints Globales

### Performance

- API response < 200ms p95
- Frontend LCP < 2.5s
- Lighthouse score > 80

### Seguridad

- No secrets en código
- JWT con refresh token
- Rate limiting en endpoints críticos
- Headers de seguridad (Helmet)

### Compatibilidad

- Navegadores modernos (Chrome, Firefox, Safari, Edge)
- Node.js >= 20
- PostgreSQL 16

---

## 7. No Negociables

1. **No romper funcionalidad existente** — si hay duda, preguntar
2. **No hardcodear secrets** — usar environment variables
3. **No usar `any` en TypeScript** — tipos estrictos
4. **No commitear `.env`** — solo `.env.example`
5. **No писать código sin spec approved**

---

## 8. Referencias

| Documento           | Propósito                     |
| ------------------- | ----------------------------- |
| `PROJECT.md`        | Contexto general del proyecto |
| `docs/AGENTS.md`    | Reglas de desarrollo          |
| `specs/FEATURES.md` | Índice de features            |
| Module READMEs      | Documentación específica      |

---

_Este documento es la fuente de verdad. Cualquier código debe adherirse a estas reglas._
