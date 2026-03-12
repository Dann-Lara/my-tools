# F023: Optimizar Paquete ai-core

> Estado: APPROVED
> Fecha de creación: 2026-03-12
> Última actualización: 2026-03-12

---

## Contexto

| Campo           | Descripción                                      |
| --------------- | ------------------------------------------------ |
| **Módulo**      | ai-core (packages/ai-core)                       |
| **Usuario**     | developer                                       |
| **Problema**    | Solo 1 test, funciones sin coverage             |
| **Solicitante** | Quality Assurance                               |
| **Prioridad**   | Alta                                           |

---

## spec (Qué y Por Qué)

### Problemas Identificados

| #   | Problema                        | Severidad | Ubicación                      |
| --- | ------------------------------ | --------- | ------------------------------ |
| 1   | Solo 1 test para todo el paquete | CRITICAL | `packages/ai-core/src/chains/__tests__/` |
| 2   | Sin tests para summarization   | HIGH      | `packages/ai-core/src/chains/summarization.ts` |
| 3   | Sin tests para registry        | HIGH      | `packages/ai-core/src/providers/registry.ts` |
| 4   | Sin tests para factory         | HIGH      | `packages/ai-core/src/llm/factory.ts` |
| 5   | Sin tests para executor        | HIGH      | `packages/ai-core/src/llm/executor.ts` |

### User Stories

- Como **QA**, quiero coverage en ai-core para confiar en cambios
- Como **desarrollador**, quiero tests que documenten el comportamiento esperado

### Acceptance Criteria

- [ ] **AC01**: Tests para summarization.ts
- [ ] **AC02**: Tests para registry.ts (provider registration)
- [ ] **AC03**: Tests para factory.ts (LLM factory)
- [ ] **AC04**: Tests para executor.ts (LLM execution)
- [ ] **AC05**: Coverage > 70% en el paquete

---

## plan (Cómo)

### Tareas

- [ ] **T01**: Crear test para summarization.ts
- [ ] **T02**: Crear test para registry.ts
- [ ] **T03**: Crear test para factory.ts
- [ ] **T04**: Crear test para executor.ts
- [ ] **T05**: Ejecutar coverage y verificar > 70%
- [ ] **T06**: Documentar mocks necesarios

---

## Referencias

- Constitución: `specs/SPEC.md`
- Test existente: `packages/ai-core/src/chains/__tests__/text-generation.spec.ts`

---

## Historial de Cambios

| Fecha      | Versión | Cambio          | Autor |
| ---------- | ------- | --------------- | ----- |
| 2026-03-12 | 1.0.0   | Creación inicial | —     |
