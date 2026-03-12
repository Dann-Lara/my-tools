# F015: Optimización Completa Applications (Fase 2)

> Estado: APPROVED
> Fecha de creación: 2026-03-11
> Última actualización: 2026-03-11

---

## Contexto

| Campo           | Descripción                                     |
| --------------- | ----------------------------------------------- |
| **Módulo**      | applications                                    |
| **Usuario**     | developer (backend)                             |
| **Problema**    | Prompts AI inline masivos + withRetry duplicado |
| **Solicitante** | Technical Debt                                  |
| **Prioridad**   | Alta                                            |

> **Nota**: Esta es la Fase 2 de optimización. La Fase 1 (F012) eliminó función duplicada y extrajo utils básicas.

---

## spec (Qué y Por Qué)

### Problemas Identificados

| #   | Problema                                        | Severidad | Ubicación                                       |
| --- | ----------------------------------------------- | --------- | ----------------------------------------------- |
| 1   | Prompts AI inline masivos (50+ líneas cada uno) | CRITICAL  | `applications.service.ts`                       |
| 2   | withRetry duplicado                             | HIGH      | `applications.utils.ts` y `checklists.utils.ts` |
| 3   | Service > 500 líneas                            | HIGH      | `applications.service.ts` (769 líneas)          |

### User Stories

- Como **desarrollador**, quiero prompts separados del código para poder editarlos fácilmente
- Como **desarrollador**, quiero una sola implementación de withRetry para mantener DRY

### Acceptance Criteria

- [ ] **AC01**: applications.service.ts < 500 líneas
- [ ] **AC02**: Prompts extraídos a archivos separados
- [ ] **AC03**: withRetry en un solo lugar (no duplicado)
- [ ] **AC04**: Todas las funcionalidades funcionan igual

---

## plan (Cómo)

### Stack

| Tecnología | Uso         |
| ---------- | ----------- |
| NestJS     | Backend API |
| TypeORM    | ORM         |

### Arquitectura Propuesta

```
applications/
├── applications.service.ts        (~400 líneas)
├── applications.utils.ts          (esc, extractJson, cleanCvText)
├── applications.prompts/
│   ├── cv-prompts.ts        (~150 líneas) - generateCv, adaptCvToSpanish
│   ├── interview-prompts.ts (~80 líneas)  - answerInterviewQuestions
│   ├── extract-prompts.ts   (~60 líneas)  - extractCvFromText
│   ├── evaluate-prompts.ts  (~80 líneas)  - evaluateBaseCV
│   └── feedback-prompts.ts  (~40 líneas)  - generateFeedback
```

### Consolidación withRetry

Mover a `packages/shared/src/utils/retry.ts`:

- Eliminar de `applications.utils.ts`
- Eliminar de `checklists.utils.ts`
- Importar desde `@ai-lab/shared`

---

## Tasks

### Phase 1: Prompts

- [ ] **T01**: Crear `applications/prompts/cv-prompts.ts`
- [ ] **T02**: Crear `applications/prompts/interview-prompts.ts`
- [ ] **T03**: Crear `applications/prompts/extract-prompts.ts`
- [ ] **T04**: Crear `applications/prompts/evaluate-prompts.ts`
- [ ] **T05**: Crear `applications/prompts/feedback-prompts.ts`

### Phase 2: Consolidación withRetry

- [ ] **T06**: Crear `packages/shared/src/utils/retry.ts`
- [ ] **T07**: Actualizar `applications.utils.ts` para importar
- [ ] **T08**: Actualizar `checklists.utils.ts` para importar

### Phase 3: Refactorización

- [ ] **T09**: Refactorizar `applications.service.ts` para usar prompts
- [ ] **T10**: Verificar funcionamiento

### Phase 4: Validación

- [ ] **T11**: Tests pasan
- [ ] **T12**: Verificar acceptance criteria

---

## Notas de Implementación

> Basarse en:
>
> - `specs/SPEC.md` - Constitución del proyecto
> - `.agents/skills/nestjs-best-practices` - Patrones NestJS

---

## Historial de Cambios

| Fecha      | Versión | Cambio           | Autor |
| ---------- | ------- | ---------------- | ----- |
| 2026-03-11 | 1.0.0   | Creación inicial | —     |

---

## Referencias

- Módulo: `apps/backend/src/modules/applications/README.md`
- Constitución: `specs/SPEC.md`
- Utils: `applications/utils.ts`
