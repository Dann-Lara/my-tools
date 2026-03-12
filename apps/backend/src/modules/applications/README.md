# Applications Module — Backend

> Módulo de postulaciones laborales del proyecto My Tools.
> Este documento debe actualizarse cada vez que se agregue/modifique funcionalidad de aplicaciones.

---

## 1. Propósito

Gestionar el seguimiento de postulaciones laborales con asistencia de IA:

- Base CV del usuario (información personal, experiencia, educación, skills)
- Evaluación de CV con IA (score ATS)
- Generación de CVs híbridos (base CV + oferta de trabajo)
- Generación de respuestas a preguntas de entrevista
- Seguimiento de estado de postulaciones

---

## 2. Estructura de Archivos

```
src/modules/applications/
├── applications.controller.ts   # Endpoints REST
├── applications.service.ts      # Lógica de negocio
├── applications.module.ts       # Configuración del módulo
├── applications.utils.ts        # Funciones utilitarias (esc, extractJson, withRetry, cleanCvText)
├── applications.service.spec.ts # Tests unitarios
├── prompts/                     # Prompts de IA (extraídos para mantenibilidad)
│   ├── index.ts
│   ├── generateCv.prompts.ts
│   ├── adaptCvToSpanish.prompts.ts
│   ├── answerInterviewQuestions.prompts.ts
│   ├── extractCvFromText.prompts.ts
│   ├── evaluateBaseCV.prompts.ts
│   └── generateFeedback.prompts.ts
├── entities/
│   └── application.entity.ts    # BaseCvEntity, ApplicationEntity
└── dto/
    └── application.dto.ts        # DTOs de validación
```

---

## 3. Entidades

### BaseCvEntity

Un CV base por usuario que contiene toda su información profesional.

```typescript
@Entity('base_cvs')
export class BaseCvEntity {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'user_id' }) userId!: string;

  // Contacto
  @Column({ length: 150, default: '' }) fullName!: string;
  @Column({ length: 150, default: '' }) email!: string;
  @Column({ length: 50, default: '' }) phone!: string;
  @Column({ length: 150, default: '' }) location!: string;
  @Column({ length: 250, default: '' }) linkedIn!: string;

  // Contenido
  @Column({ type: 'text', default: '' }) summary!: string;
  @Column({ type: 'text', default: '' }) experience!: string;
  @Column({ type: 'text', default: '' }) education!: string;
  @Column({ type: 'text', default: '' }) skills!: string;
  @Column({ length: 250, default: '' }) languages!: string;
  @Column({ type: 'text', default: '' }) certifications!: string;

  @CreateDateColumn() createdAt!: Date;
  @UpdateDateColumn() updatedAt!: Date;
}
```

### ApplicationEntity

Una postulación por oferta de trabajo.

```typescript
@Entity('applications')
export class ApplicationEntity {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'user_id' }) userId!: string;

  // Datos de la postulación
  @Column({ length: 200 }) company!: string;
  @Column({ length: 200 }) position!: string;
  @Column({ type: 'text' }) jobOffer!: string;

  @Column({ type: 'varchar', default: 'pending' }) status!: ApplicationStatus;

  // CVs generados
  @Column({ type: 'int', nullable: true }) atsScore?: number;
  @Column({ type: 'text', nullable: true }) cvGenerated?: string;
  @Column({ type: 'text', nullable: true }) cvGeneratedEs?: string;
  @Column({ type: 'text', nullable: true }) cvGeneratedEn?: string;
  @Column({ default: false }) cvGeneratedFlag!: boolean;

  // Entrevista
  @Column({ length: 200, nullable: true }) appliedFrom?: string;
  @Column({ type: 'text', nullable: true }) interviewQuestions?: string;
  @Column({ type: 'text', nullable: true }) interviewAnswers?: string;

  @CreateDateColumn() appliedAt!: Date;
  @UpdateDateColumn() updatedAt!: Date;
}
```

### Tipos

```typescript
export type ApplicationStatus = 'pending' | 'in_process' | 'accepted' | 'rejected';
```

---

## 4. Endpoints API

| Método | Path                                | Auth | Descripción                      |
| ------ | ----------------------------------- | ---- | -------------------------------- |
| GET    | `/v1/applications/base-cv`          | JWT  | Obtener Base CV del usuario      |
| PUT    | `/v1/applications/base-cv`          | JWT  | Crear/actualizar Base CV         |
| POST   | `/v1/applications/generate-cv`      | JWT  | Generar CV híbrido (ES + EN)     |
| POST   | `/v1/applications/extract-cv`       | JWT  | Extraer datos de CV PDF con IA   |
| POST   | `/v1/applications/base-cv/evaluate` | JWT  | Evaluar Base CV (score ATS)      |
| POST   | `/v1/applications/feedback`         | JWT  | Generar feedback de coaching     |
| GET    | `/v1/applications`                  | JWT  | Listar postulaciones del usuario |
| GET    | `/v1/applications/:id`              | JWT  | Obtener una postulación          |
| POST   | `/v1/applications`                  | JWT  | Crear nueva postulación          |
| PATCH  | `/v1/applications/:id`              | JWT  | Actualizar status/CV/Q&A         |
| DELETE | `/v1/applications/:id`              | JWT  | Eliminar postulación             |
| POST   | `/v1/applications/:id/interview-qa` | JWT  | Generar respuestas a preguntas   |
| POST   | `/v1/applications/:id/translate-cv` | JWT  | Traducir CV guardado a español   |

---

## 5. Flujos de Usuario

### Flujo de Base CV

1. Usuario completa formulario de Base CV
2. Usuario evalúa el CV con IA (`POST /base-cv/evaluate`)
3. IA retorna score (0-100) y feedback por campo
4. **Score >= 85**: Guardado habilitado
5. Usuario guarda Base CV

### Flujo de Generación de CV

1. Usuario crea postulación con oferta de trabajo
2. Usuario solicita generación de CV híbrido
3. IA combina Base CV + oferta de trabajo
4. Retorna CV en ES y EN
5. Usuario revisa/edita antes de guardar

### Flujo de Entrevista

1. Usuario pega preguntas de entrevista
2. Solicita generación de respuestas
3. IA genera respuestas usando el CV personalizado
4. Usuario revisa/edita respuestas
5. Se guarda en la aplicación

---

## 6. Evaluación de CV

### Rúbrica de Evaluación

8 campos evaluados (cada uno 0-100):

- contact (nombre, email, teléfono, ubicación)
- linkedIn
- summary (resumen profesional)
- experience (experiencia laboral)
- education (educación)
- skills (habilidades)
- languages (idiomas)
- certifications (certificaciones)

### Score Total

- **Score >= 85**: CV aprobado, guardado habilitado
- **Score 60-84**: Requiere mejoras
- **Score < 60**: Necesita mejoras significativas

### Feedback por Campo

- `""` (vacío): Campo aprobado
- Hint corto (< 60 chars): Advertencia
- Hint largo (>= 60 chars): Error

### Re-evaluación

Al re-evaluar, se pasan los campos aprobados previamente (`approvedFields`) para que la IA solo evalúe los campos pendientes.

---

## 7. Integración con IA

- **Evaluación de CV**: Score + feedback por campo
- **Generación de CV híbrido**: Combina Base CV + oferta de trabajo
- **Extracción de CV PDF**: Parsea texto de PDF a estructura
- **Respuestas de entrevista**: Genera respuestas personalizadas

Ver: `packages/ai-core/README.md`

---

## 8. CV ATS

Los CVs generados siguen reglas ATS:

- Solo texto plano (sin tablas, columnas, gráficos)
- Encabezados en MAYÚSCULAS
- Fechas en formato MM/YYYY
- Bullets como `- ` (guión-espacio)
- Densidad de keywords de la oferta
- Orden de lectura izquierda-derecha

---

## 9. Variables de Entorno

No hay variables de entorno específicas de este módulo. Usa las de AI.

---

## 10. Historial de Cambios

| Fecha      | Versión | Cambios                                                                |
| ---------- | ------- | ---------------------------------------------------------------------- |
| 2026-03-11 | 1.0.1   | Optimización: eliminar función duplicada, extraer utils, agregar tests |
| 2026-03-11 | 1.0.0   | Creación del módulo                                                    |

---

## 11. Referencias

- `apps/backend/src/modules/applications/entities/application.entity.ts`
- `apps/backend/src/modules/applications/applications.service.ts`
- `apps/backend/src/modules/applications/applications.controller.ts`
- `packages/ai-core/README.md`
- `PROJECT.md` — Contexto general del proyecto
- `docs/AGENTS.md` — Reglas de desarrollo
- `specs/FEATURES.md` — Índice de features
- `specs/SPEC.md` — Constitución SDD
