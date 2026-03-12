# Checklists Module — Backend

> Módulo de checklists del proyecto My Tools.
> Este documento debe actualizarse cada vez que se agregue/modifique funcionalidad de checklists.

---

## 1. Propósito

Gestionar checklists de tareas asistidos por IA para ayudar al usuario a cumplir objetivos pequeños/hábitos. Incluye:

- Creación de checklists con IA
- Seguimiento de tareas diarias
- Recordatorios via Telegram (n8n)
- Feedback semanal con IA

---

## 2. Estructura de Archivos

```
src/modules/checklists/
├── checklists.controller.ts   # Endpoints REST
├── checklists.service.ts     # Lógica de negocio
├── checklists.module.ts      # Configuración del módulo
├── entities/
│   ├── checklist.entity.ts   # ChecklistEntity, ChecklistItemEntity, ChecklistFeedbackEntity
└── dto/
    └── checklist.dto.ts      # DTOs de validación
```

---

## 3. Entidades

### ChecklistEntity

```typescript
@Entity('checklists')
export class ChecklistEntity {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'user_id' }) userId!: string;
  @Column({ length: 100 }) title!: string;
  @Column({ type: 'text' }) objective!: string;
  @Column({ length: 50, nullable: true }) category?: string;
  @Column({ type: 'date' }) startDate!: string;
  @Column({ type: 'date' }) endDate!: string;
  @Column({ type: 'varchar', default: 'medium' }) difficulty!: Difficulty;
  @Column({ type: 'int' }) dailyTimeAvailable!: number;
  @Column({ type: 'jsonb', nullable: true }) reminderPreferences?: ReminderPreferences;
  @Column({ default: false }) isRecurring!: boolean;
  @Column({ type: 'varchar', nullable: true }) recurrencePattern?: RecurrencePattern;
  @Column({ length: 200, nullable: true }) goalMetric?: string;
  @Column({ type: 'varchar', default: 'mixed' }) style!: TaskStyle;
  @Column({ type: 'varchar', default: 'active' }) status!: ChecklistStatus;
  @Column({ length: 50, nullable: true }) telegramChatId?: string;
  @Column({ length: 5, default: 'es' }) language!: string;

  @OneToMany(() => ChecklistItemEntity, (item) => item.checklist)
  items!: ChecklistItemEntity[];

  @OneToMany(() => ChecklistFeedbackEntity, (f) => f.checklist)
  feedbacks!: ChecklistFeedbackEntity[];
}
```

### ChecklistItemEntity

```typescript
@Entity('checklist_items')
export class ChecklistItemEntity {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'checklist_id' }) checklistId!: string;
  @Column({ type: 'int', default: 0 }) order!: number;
  @Column({ type: 'text' }) description!: string;
  @Column({ type: 'varchar', default: 'daily' }) frequency!: TaskFrequency;
  @Column({ type: 'int', nullable: true }) customFrequencyDays?: number;
  @Column({ type: 'int', default: 15 }) estimatedDuration!: number;
  @Column({ length: 200 }) hack!: string;
  @Column({ type: 'varchar', default: 'pending' }) status!: TaskStatus;
  @Column({ type: 'timestamp', nullable: true }) completedAt?: Date;
  @Column({ type: 'timestamp', nullable: true }) dueDate?: Date;
  @Column({ default: false }) reminderSent!: boolean;
}
```

### ChecklistFeedbackEntity

```typescript
@Entity('checklist_feedbacks')
export class ChecklistFeedbackEntity {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'checklist_id' }) checklistId!: string;
  @Column({ type: 'text' }) feedbackText!: string;
  @Column({ type: 'timestamp', default: () => 'NOW()' }) generatedAt!: Date;
  @Column({ type: 'int', nullable: true }) weekNumber?: number;
}
```

### Tipos

```typescript
export type Difficulty = 'low' | 'medium' | 'high';
export type TaskStyle = 'micro-habits' | 'concrete-tasks' | 'mixed';
export type ChecklistStatus = 'active' | 'paused' | 'completed';
export type RecurrencePattern = 'daily' | 'weekly' | 'monthly';
export type TaskFrequency = 'once' | 'daily' | 'weekly' | 'custom';
export type TaskStatus = 'pending' | 'completed' | 'skipped';

export interface ReminderPreferences {
  time: string; // "HH:MM"
  days: string[]; // ["monday","wednesday","friday"]
  frequency: 'daily' | 'weekly' | 'custom';
}
```

---

## 4. Endpoints API

| Método | Path                               | Auth           | Descripción                       |
| ------ | ---------------------------------- | -------------- | --------------------------------- |
| POST   | `/v1/checklists/generate-draft`    | JWT            | Generar draft de checklist con IA |
| POST   | `/v1/checklists/regenerate-draft`  | JWT            | Regenerar con feedback            |
| POST   | `/v1/checklists/confirm`           | JWT            | Guardar checklist confirmado      |
| GET    | `/v1/checklists`                   | JWT            | Listar checklists del usuario     |
| GET    | `/v1/checklists/:id`               | JWT            | Obtener checklist con items       |
| PATCH  | `/v1/checklists/:id`               | JWT            | Actualizar status/título          |
| DELETE | `/v1/checklists/:id`               | JWT            | Eliminar checklist                |
| PATCH  | `/v1/checklists/:id/items/:itemId` | JWT            | Completar/postponer/skip          |
| GET    | `/v1/checklists/:id/progress`      | JWT            | Datos de progreso                 |
| POST   | `/v1/checklists/:id/feedback`      | JWT            | Generar feedback semanal          |
| GET    | `/v1/checklists/reminders/due`     | webhook-secret | Tareas pendientes para n8n        |

---

## 5. Flujos de Usuario

### Crear Checklist (5 pasos)

1. **Questionnaire**: Usuario responde preguntas sobre su objetivo
2. **AI Generation**: IA genera draft de checklist
3. **Editor**: Usuario revisa/edita el draft
4. **Confirm**: Usuario confirma y guarda
5. **Done**: Checklist activo

### Actualizar Tarea

```typescript
// Completar tarea
PATCH /v1/checklists/:id/items/:itemId
{ "status": "completed" }

// Postponer tarea
PATCH /v1/checklists/:id/items/:itemId
{ "status": "pending", "dueDate": "2026-03-15" }

// Saltar tarea
PATCH /v1/checklists/:id/items/:itemId
{ "status": "skipped" }
```

### Recordatorios (n8n)

El endpoint `/v1/checklists/reminders/due` es llamado por n8n para obtener las tareas que deben recordarse hoy.

---

## 6. Integración con IA

- **Generación de checklist**: Usa `ai-core` para generar tareas basadas en el objetivo del usuario
- **Regeneración**: Permite regenerate con feedback del usuario
- **Feedback semanal**: Genera coaching feedback basado en el progreso

Ver: `packages/ai-core/README.md`

---

## 7. Integración con n8n

- **Recordatorios**: n8n consulta `/v1/checklists/reminders/due` y envía recordatorios por Telegram
- **Feedback semanal**: Workflow automatizado que genera feedback con IA

Ver: `n8n-workflows/README.md`

---

## 8. Variables de Entorno

No hay variables de entorno específicas de este módulo. Usa las de AI y n8n.

---

## 9. Historial de Cambios

| Fecha      | Versión | Cambios             |
| ---------- | ------- | ------------------- |
| 2026-03-11 | 1.0.0   | Creación del módulo |

---

## 10. Referencias

- `apps/backend/src/modules/checklists/entities/checklist.entity.ts`
- `apps/backend/src/modules/checklists/checklists.service.ts`
- `apps/backend/src/modules/checklists/checklists.controller.ts`
- `packages/ai-core/README.md`
- `n8n-workflows/README.md`
- `PROJECT.md` — Contexto general del proyecto
- `docs/AGENTS.md` — Reglas de desarrollo
- `specs/FEATURES.md` — Índice de features
- `specs/SPEC.md` — Constitución SDD
