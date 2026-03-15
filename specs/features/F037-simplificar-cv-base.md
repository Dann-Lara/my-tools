# F037: Simplificar CV Base - Texto Plano

> Estado: APPROVED
> Fecha de creación: 2026-03-14
> Versión: 1.0.0

---

## Resumen Ejecutivo

Simplificar el CV Base de múltiples campos a un único textarea donde el usuario copia y pega su CV. La evaluación de IA ahora es global (score 0-100) con sugerencias limitadas, en lugar de evaluación por campo.

---

## Cambios Principales

| Aspecto | Antes | Después |
|---------|-------|---------|
| UI | Múltiples campos (fullName, email, etc.) | Un textarea |
| PDF Upload | PdfCVUploader para extraer datos | **ELIMINADO** |
| Evaluación | Por campo (fieldFeedback por campo) | Global (score + sugerencias) |
| Guardado | Permite score >= 60 | **Solo >= 85%** |
| Sugerencias | Ilimitadas | Máximo 3-5 globales |
| DB | Campos separados | Un solo campo `cvText` |

---

## Arquitectura de Navegación

```
/client/applications
├── /base-cv → Textarea único + evaluación global
```

---

## UI - Formulario Simplificado

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ◀ Volver   │  MI CV BASE                                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│             │                                                                     │
│             │  ┌─────────────────────────────────────────────────────────────┐ │
│             │  │ COPIA Y PEGA TU CV AQUÍ                                    │ │
│             │  │                                                             │ │
│             │  │ ┌───────────────────────────────────────────────────────┐  │ │
│             │  │ │ Juan Pérez                                             │  │ │
│             │  │ │ Email: juan@email.com                                  │  │ │
│             │  │ │ Telefono: +52 555 123 4567                            │  │ │
│             │  │ │ LinkedIn: linkedin.com/in/juanperez                   │  │ │
│             │  │ │                                                          │  │ │
│             │  │ │ RESUMEN                                                 │  │ │
│             │  │ │ Desarrollador con 5 años de experiencia...             │  │ │
│             │  │ │                                                          │  │ │
│             │  │ │ EXPERIENCIA                                             │  │ │
│             │  │ │ Tech Corp - Senior Dev (2020-Actual)                 │  │ │
│             │  │ │ • Lideré equipo de 5 desarrolladores                  │  │ │
│             │  │ │ • Implementé CI/CD reduciendo deployment 80%           │  │ │
│             │  │ │                                                          │  │ │
│             │  │ │ HABILIDADES                                              │  │ │
│             │  │ │ JavaScript, React, Node.js, TypeScript, AWS            │  │ │
│             │  │ └───────────────────────────────────────────────────────┘  │ │
│             │  └─────────────────────────────────────────────────────────────┘ │
│             │                                                                     │
│             │  [Evaluar mi CV]                                                 │
│             │                                                                     │
│             │  ┌─────────────────────────────────────────────────────────────┐ │
│             │  │ SCORE: 78/100                                             │ │
│             │  │ ████████████████░░░░░░░░░░░░░░░░░░░░░░                    │ │
│             │  │                                                          │ │
│             │  │ ❌ Tu CV necesita mejoras para alcanzar el 85%           │ │
│             │  │                                                          │ │
│             │  │ Sugerencias:                                              │ │
│             │  │ 1. Agrega logros cuantificables en tu experiencia        │ │
│             │  │ 2. Incluye certificaciones relevantes                    │ │
│             │  │ 3. Añade nivel de idiomas con certificaciones           │ │
│             │  └─────────────────────────────────────────────────────────────┘ │
│             │                                                                     │
│             │  [Guardar CV Base]  (habilitado solo si score >= 85%)         │
│             │                                                                     │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Estados de la UI

1. **Sin evaluar**: Textarea + botón "Evaluar mi CV"
2. **Evaluando**: Spinner + "Evaluando tu CV..."
3. **Evaluado (score < 85%)**: Score + sugerencias + botón deshabilitado
4. **Evaluado (score >= 85%)**: Score + botón habilitado

---

## Evaluación IA - Nuevo Flujo

### Prompt de Evaluación Global

El nuevo prompt `evaluateCvGlobal.prompts.ts`:

```
INPUT: Texto completo del CV (texto plano)

OUTPUT (JSON):
{
  "score": number (0-100),
  "summary": "Resumen en 1 oración del nivel del CV",
  "suggestions": [
    "Sugerencia 1 (máx 15 palabras)",
    "Sugerencia 2 (máx 15 palabras)",
    "Sugerencia 3 (máx 15 palabras)"
  ]
}
```

### Reglas de Evaluación

- **Score >= 85**: Permite guardar
- **Score < 85**: Muestra sugerencias, guardar deshabilitado
- **Máximo 3 sugerencias** - evitar lista infinita
- **Sugerencias accionables** - específicas y realizables

---

## API - Endpoints

### POST /api/v1/applications/evaluate-cv-global

Evalúa el CV globalmente.

**Request:**
```json
{
  "cvText": "texto completo del CV...",
  "lang": "es" | "en"
}
```

**Response:**
```json
{
  "score": 78,
  "summary": "CV de Desarrollador Junior con experiencia básica",
  "suggestions": [
    "Agrega logros cuantificables en experiencia",
    "Incluye certificaciones relevantes",
    "Añade nivel de idiomas"
  ]
}
```

### POST /api/v1/applications/base-cv

Guarda el CV base.

**Request:**
```json
{
  "cvText": "texto completo del CV..."
}
```

### GET /api/v1/applications/base-cv

Obtiene el CV base.

**Response:**
```json
{
  "cvText": "texto completo del CV...",
  "lastEvaluatedAt": "2026-03-14T..."
}
```

---

## Entity - Cambios

### BaseCvEntity

```typescript
@Entity('base_cvs')
export class BaseCvEntity {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'user_id' }) userId!: string;
  
  // ANTES (múltiples campos):
  // fullName, email, phone, location, linkedIn, summary, 
  // experience, education, skills, languages, certifications
  
  // NUEVO (texto plano):
  @Column({ type: 'text' }) cvText!: string;
  @Column({ type: 'timestamp', nullable: true }) lastEvaluatedAt?: Date;
}
```

---

## Generador de CV - Uso del CV Base

### Modificación al Prompt

El prompt `generateCv.prompts.ts` ahora recibe el CV base como texto plano y extrae lo necesario:

**Input:**
```typescript
{
  baseCvText: string,  // Texto completo del CV base
  jobOffer: string,
  company: string,
  position: string,
}
```

**El prompt:**
1. Lee el CV base completo
2. Identifica: experiencia, skills, educación del texto
3. Adapta al puesto específico
4. Genera CV taior-made

---

## Componentes a Eliminar

1. `PdfCVUploader.tsx` - Ya no se necesita
2. `extractCvFromText` endpoint - Reemplazado por evaluación global

---

## Tests

- Test para evaluate-cv-global endpoint
- Test para guardar CV base con texto plano
- Test para flujo completo: textarea → evaluar → guardar
- Test para validar score < 85 bloquea guardado

---

## Checklist de Implementación

- [x] Crear evaluateCvGlobal.prompts.ts
- [x] Crear endpoint POST /evaluate-cv-global
- [x] Modificar BaseCvEntity a texto plano
- [x] Crear frontend SimpleBaseCVForm con textarea
- [x] Eliminar PdfCVUploader
- [x] Modificar generateCv.prompts para usar texto plano
- [x] Tests para nuevo flujo
- [x] Actualizar F036 spec

---

## Historial de Cambios

| Fecha | Versión | Cambio | Autor |
|-------|---------|--------|-------|
| 2026-03-14 | 1.0.0 | Versión inicial del spec | - |
