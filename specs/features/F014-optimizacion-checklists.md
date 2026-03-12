# F014: Optimización del Módulo Checklists

> Estado: IN_PROGRESS
> Fecha de creación: 2026-03-11
> Última actualización: 2026-03-11

---

## Contexto

| Campo           | Descripción                                                     |
| --------------- | --------------------------------------------------------------- |
| **Módulo**      | checklists                                                      |
| **Usuario**     | developer (backend/frontend)                                    |
| **Problema**    | El módulo checklists tiene problemas de mantenibilidad y tamaño |
| **Solicitante** | Technical Debt                                                  |
| **Prioridad**   | Alta                                                            |

---

## spec (Qué y Por Qué)

### Problemas Identificados

| #   | Problema                                   | Severidad | Ubicación                  |
| --- | ------------------------------------------ | --------- | -------------------------- |
| 1   | Service muy grande (666 líneas)            | CRITICAL  | `checklists.service.ts`    |
| 2   | Funciones utilitarias mezcladas en service | HIGH      | Líneas 21-203              |
| 3   | Página muy grande (412 líneas)             | HIGH      | `checklists/page.tsx`      |
| 4   | Página [id] grande (391 líneas)            | MEDIUM    | `checklists/[id]/page.tsx` |
| 5   | Sin tests unitarios                        | HIGH      | módulo checklists          |

### User Stories

- Como **desarrollador**, quiero un código limpio y mantenible para poder hacer cambios rápido
- Como **desarrollador**, quiero tests que me den confianza al hacer refactors
- Como **desarrollador**, quiero componentes pequeños y reutilizables

### Acceptance Criteria

- [ ] **AC01**: checklists.service.ts tiene menos de 500 líneas
- [ ] **AC02**: Todas las utilitarias extraídas a `checklists.utils.ts`
- [ ] **AC03**: checklists/page.tsx tiene menos de 300 líneas
- [ ] **AC04**: Componentes extraídos (ChecklistCard, ChecklistStats, EmptyState)
- [ ] **AC05**: Tests unitarios creados
- [ ] **AC06**: Todas las funcionalidades actuales siguen funcionando

### Funcionalidad Esperada

El módulo debe mantener exactamente las mismas funcionalidades:

- CRUD de Checklists
- Generación de checklist con IA
- Regeneración con feedback
- Seguimiento de progreso
- Recordatorios Telegram
- Feedback semanal

### Edge Cases

| ID   | Descripción                                                      | Comportamiento Esperado           |
| ---- | ---------------------------------------------------------------- | --------------------------------- |
| EC01 | Al partir el service, las dependencias circulares deben evitarse | Usar importación cruzada limitada |
| EC02 | Los tests deben cubrir casos happy y error                       | Coverage > 50%                    |

---

## plan (Cómo)

### Stack

| Tecnología | Uso         | Versión |
| ---------- | ----------- | ------- |
| NestJS     | Backend API | 10.x    |
| Next.js    | Frontend    | 14.x    |
| TypeORM    | ORM         | 0.3.x   |
| Jest       | Testing     | 29.x    |

### Arquitectura - Backend

#### Refactorización Propuesta

```
checklists.service.ts (666 líneas)
        ↓
├── checklists.service.ts         (~450 líneas) - Lógica principal
└── checklists.utils.ts            (~200 líneas) - Funciones utilitarias
```

#### Utilitarios a Extraer

```typescript
// checklists.utils.ts
export function esc(text: string): string
export function checkRateLimit(userId: string, maxPerHour?: number): void
export function validateAiResponse(raw: unknown): AiDraft
export function parseAiJson(text: string, logger?: ...): AiDraft
export async function withRetry<T>(fn: ..., retries?: number, baseDelayMs?: number): Promise<T>
export function buildGenerationPrompt(p: CreateChecklistParamsDto): string
export function buildRegenerationPrompt(p: CreateChecklistParamsDto, feedback: string): string
export function buildFeedbackPrompt(data: FeedbackPromptData): { systemMessage: string; prompt: string }
```

### Arquitectura - Frontend

#### Componentes a Crear

```
checklists/page.tsx (412 líneas)
        ↓
├── ChecklistCard.tsx      (~100 líneas) - Card de checklist
├── ChecklistStats.tsx     (~80 líneas)  - Gráficos y stats
├── EmptyState.tsx        (~30 líneas)  - Estado vacío
└── checklists/page.tsx   (~150 líneas) - Componente principal
```

### Constraints

| Constraint    | Límite          |
| ------------- | --------------- |
| Service size  | < 500 líneas    |
| Page size     | < 300 líneas    |
| Test coverage | > 50%           |
| Duplicación   | 0%              |
| Funcionalidad | 100% preservada |

---

## Tasks

### Phase 1: Backend - Extracción Utilitarios

- [ ] **T01**: Crear `checklists.utils.ts` con funciones utilitarias
- [ ] **T02**: Actualizar imports en `checklists.service.ts`
- [ ] **T03**: Verificar que el service funciona correctamente

### Phase 2: Frontend - Partir Componentes

- [ ] **T04**: Crear `ChecklistCard.tsx`
- [ ] **T05**: Crear `ChecklistStats.tsx`
- [ ] **T06**: Crear `EmptyState.tsx`
- [ ] **T07**: Refactorizar `checklists/page.tsx` para usar componentes
- [ ] **T08**: Verificar que la página funciona

### Phase 3: Testing

- [ ] **T09**: Crear tests unitarios para `checklists.service.ts`
- [ ] **T10**: Crear tests para funciones utilitarias

### Phase 4: Validación

- [ ] **T11**: Verificar acceptance criteria
- [ ] **T12**: Testing manual
- [ ] **T13**: Actualizar documentación del módulo

---

## Notas de Implementación

> Basarse en:
>
> - `specs/SPEC.md` - Constitución del proyecto
> - `.agents/skills/nestjs-best-practices` - Patrones NestJS
> - `.agents/skills/vercel-react-best-practices` - Patrones React/Next.js

---

## Historial de Cambios

| Fecha      | Versión | Cambio           | Autor |
| ---------- | ------- | ---------------- | ----- |
| 2026-03-11 | 1.0.0   | Creación inicial | —     |

---

## Referencias

- Módulo: `apps/backend/src/modules/checklists/README.md`
- Constitución: `specs/SPEC.md`
- Skills: `.agents/skills/nestjs-best-practices`, `.agents/skills/vercel-react-best-practices`
