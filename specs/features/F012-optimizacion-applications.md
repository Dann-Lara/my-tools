# F012: Optimización del Módulo Applications

> Estado: DRAFT
> Fecha de creación: 2026-03-11
> Última actualización: 2026-03-11

---

## Contexto

| Campo           | Descripción                                                                                     |
| --------------- | ----------------------------------------------------------------------------------------------- |
| **Módulo**      | applications                                                                                    |
| **Usuario**     | developer (backend/frontend)                                                                    |
| **Problema**    | El módulo applications tiene problemas de mantenibilidad y calidad que dificultan el desarrollo |
| **Solicitante** | Technical Debt                                                                                  |
| **Prioridad**   | Alta                                                                                            |

---

## spec (Qué y Por Qué)

### Problemas Identificados

| #   | Problema                             | Severidad | Ubicación                                          |
| --- | ------------------------------------ | --------- | -------------------------------------------------- |
| 1   | Service muy grande (719 líneas)      | CRITICAL  | `applications.service.ts`                          |
| 2   | Función duplicada `adaptCvToSpanish` | CRITICAL  | `applications.service.ts` líneas 329-370 y 374-415 |
| 3   | Sin tests unitarios                  | HIGH      | módulo applications                                |
| 4   | Componente frontend grande           | MEDIUM    | `applications/components/BaseCVForm.tsx`           |

### User Stories

- Como **desarrollador**, quiero un código limpio y mantenible para poder hacer cambios rápido
- Como **desarrollador**, quiero tests que me den confianza al hacer refactors
- Como **desarrollador**, quiero funciones pequeñas y reutilizables para evitar duplicación

### Acceptance Criteria

- [ ] **AC01**: applications.service.ts tiene menos de 500 líneas
- [ ] **AC02**: No existe código duplicado en applications.service.ts
- [ ] **AC03**: Se crean tests unitarios para aplicaciones.service.ts
- [ ] **AC04**: Todas las funcionalidades actuales siguen funcionando

### Funcionalidad Esperada

El módulo debe mantener exactamente las mismas funcionalidades:

- CRUD de Base CV
- CRUD de Applications
- Evaluación de CV
- Generación de CV híbrido
- Respuestas de entrevista

### Edge Cases

| ID   | Descripción                                                      | Comportamiento Esperado           |
| ---- | ---------------------------------------------------------------- | --------------------------------- |
| EC01 | Al partir el service, las dependencias circulares deben evitarse | Usar importación cruzada limitada |
| EC02 | Los tests deben cubrir casos happy y error                       | Coverage > 60%                    |

---

## plan (Cómo)

### Stack

| Tecnología | Uso         | Versión |
| ---------- | ----------- | ------- |
| NestJS     | Backend API | 10.x    |
| TypeORM    | ORM         | 0.3.x   |
| Jest       | Testing     | 29.x    |

### Arquitectura

#### Refactorización Propuesta

```
applications.service.ts (719 líneas)
        ↓
├── applications.service.ts          (~200 líneas) - Lógica principal
├── applications-cv.service.ts       (~150 líneas) - Lógica de CV
├── applications-evaluation.service.ts  (~100 líneas) - Evaluación de CV
└── applications-generator.service.ts (~100 líneas) - Generación de CV
```

#### Entities sin cambios

- BaseCvEntity
- ApplicationEntity

#### Endpoints sin cambios

Todos los endpoints actuales se mantienen.

### Constraints

| Constraint    | Límite          |
| ------------- | --------------- |
| Service size  | < 500 líneas    |
| Duplicación   | 0%              |
| Test coverage | > 60%           |
| Funcionalidad | 100% preservada |

---

## Tasks

### Phase 1: Análisis y Extracción

- [ ] **T01**: Analizar dependencias entre métodos de applications.service.ts
- [ ] **T02**: Extraer lógica de CV a `applications-cv.service.ts`
- [ ] **T03**: Extraer lógica de evaluación a `applications-evaluation.service.ts`
- [ ] **T04**: Extraer lógica de generación a `applications-generator.service.ts`
- [ ] **T05**: Eliminar función duplicada `adaptCvToSpanish`

### Phase 2: Reestructuración

- [ ] **T06**: Actualizar applications.module.ts con nuevos servicios
- [ ] **T07**: Actualizar imports en applications.controller.ts
- [ ] **T08**: Verificar que todos los endpoints funcionan

### Phase 3: Testing

- [ ] **T09**: Crear tests unitarios para applications.service.ts
- [ ] **T10**: Crear tests para servicios extraídos
- [ ] **T11**: Verificar coverage > 60%

### Phase 4: Validación

- [ ] **T12**: Verificar acceptance criteria
- [ ] **T13**: Testing manual de endpoints
- [ ] **T14**: Actualizar documentación del módulo

---

## Notas de Implementación

> Basarse en:
>
> - `specs/SPEC.md` - Constitución del proyecto
> - `.agents/skills/nestjs-best-practices` - Patrones NestJS
> - `.agents/skills/typeorm` - Patrones TypeORM

---

## Historial de Cambios

| Fecha      | Versión | Cambio           | Autor |
| ---------- | ------- | ---------------- | ----- |
| 2026-03-11 | 1.0.0   | Creación inicial | —     |

---

## Referencias

- Módulo: `apps/backend/src/modules/applications/README.md`
- Constitución: `specs/SPEC.md`
- Skills: `.agents/skills/nestjs-best-practices`, `.agents/skills/typeorm`
