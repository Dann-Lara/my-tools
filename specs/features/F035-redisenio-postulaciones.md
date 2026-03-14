# F035: Rediseño del Módulo de Postulaciones

> Estado: DRAFT
> Fecha de creación: 2026-03-14
> Última actualización: 2026-03-14

---

## Contexto

| Campo         | Descripción                                                                     |
| ------------- | ------------------------------------------------------------------------------- |
| **Módulo**    | applications (postulaciones laborales)                                          |
| **Problema**  | UX/UI desactualizado, falta guardar ofertas de trabajo, sin entrevista simulada |
| **Prioridad** | HIGH                                                                            |

---

## Flujo de Usuario (Nuevo)

```
┌─────────────────────────────────────────────────────────────────┐
│                        USUARIO                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. CV BASE (obligatorio)                                       │
│     ┌─────────────────────────────────────┐                     │
│     │  Verificar CV base con evaluación   │                     │
│     │  >85% ATS                           │                     │
│     │  [CV Base] ──(no)──> Crear/Subir   │                     │
│     │       │                             │                     │
│     │      (sí)                           │                     │
│     │       ↓                             │                     │
│     │  2. LISTADO POSTULACIONES           │                     │
│     └─────────────────────────────────────┘                     │
│                                                                  │
│     ┌─────────────────────────────────────┐                     │
│     │  [+ Nueva Postulación]              │                     │
│     │  ─────────────────────────────────  │                     │
│     │  | Empresa | Posición | Estado | ⚡ |                     │
│     │  | Google  | Frontend  | Pend.  | • |                     │
│     │  | Meta    | Backend   | Env.   | • |                     │
│     └─────────────────────────────────────┘                     │
│                                                                  │
│  3. CREAR POSTULACIÓN                                           │
│     ┌─────────────────────────────────────┐                     │
│     │  [Cargar Oferta de Trabajo]         │                     │
│     │  ┌───────────────────────────────┐  │                     │
│     │  │ Empresa: [________]           │  │                     │
│     │  │ Posición: [________]          │  │                     │
│     │  │ Descripción: [            ]   │  │                     │
│     │  │               [            ]   │  │                     │
│     │  │               [            ]   │  │                     │
│     │  └───────────────────────────────┘  │                     │
│     │                                      │                     │
│     │  [Generar CV Match] ──▶ IA genera  │                     │
│     │                                      │                     │
│     │  ┌───────────────────────────────┐  │                     │
│     │  │ PREVIEW CV                    │  │                     │
│     │  │ [Descargar PDF] [ES] [EN]    │  │                     │
│     │  └───────────────────────────────┘  │                     │
│     │                                      │                     │
│     │  [Guardar Postulación]              │                     │
│     └─────────────────────────────────────┘                     │
│                                                                  │
│  4. DETALLE POSTULACIÓN                                         │
│     ┌─────────────────────────────────────┐                     │
│     │  Google - Frontend Developer         │                     │
│     │  Estado: Pendiente    Fecha: ...    │                     │
│     │  ─────────────────────────────────   │                     │
│     │                                      │                     │
│     │  [Oferta de Trabajo]                │                     │
│     │  [CV Generado]                      │                     │
│     │                                      │                     │
│     │  ┌───────────────────────────────┐  │                     │
│     │  │ ENTREVISTA SIMULADA          │  │                     │
│     │  │ Q1: ¿Cuál es tu experiencia  │  │                     │
│     │  │    con React?                 │  │                     │
│     │  │ A1: Tengo 5 años de exp...   │  │                     │
│     │  │ ─────────────────────────────  │  │                     │
│     │  │ Q2: Explícame un hook...      │  │                     │
│     │  │ A2: useCallback se usa...     │  │                     │
│     │  │ ─────────────────────────────  │  │                     │
│     │  │ [Guardar] [Regenerar]         │  │                     │
│     │  └───────────────────────────────┘  │                     │
│     │                                      │                     │
│     │  [Eliminar Postulación]            │                     │
│     └─────────────────────────────────────┘                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Reglas de Negocio

| #   | Regla                | Descripción                                                   |
| --- | -------------------- | ------------------------------------------------------------- |
| 1   | CV Base Obligatorio  | No se puede crear postulación sin CV base aprobado (>85% ATS) |
| 2   | Guardar Oferta       | La oferta de trabajo se debe guardar completa en BD           |
| 3   | CV Match             | IA genera CV adaptado 100% ATS para la oferta                 |
| 4   | PDF ATS              | El PDF debe seguir mejores prácticas ATS (márgenes, formato)  |
| 5   | Entrevista Simulada  | Se genera con 5-7 preguntas y respuestas                      |
| 6   | Guardar Entrevista   | El usuario decide si guarda o no la entrevista                |
| 7   | Regenerar Entrevista | Se puede regenerar la entrevista en cualquier momento         |
| 8   | Sin Editar           | Una postulación no se puede editar después de creada          |

---

## Diseño de Pantallas (ASCII)

### 1. Listado de Postulaciones (Desktop)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ◀ Sidebar    │  POSTULACIONES                         [+ Nueva] 👤 User  │
├─────────────────────────────────────────────────────────────────────────────┤
│               │                                                                  │
│  📋 Checklists│  ┌──────────────────────────────────────────────────────────┐│
│               │  │ Búsqueda: [🔍Buscar por empresa, posición...]           ││
│  💼 Postulac. │  └──────────────────────────────────────────────────────────┘│
│               │                                                                  │
│  🤖 AI Tools  │  ┌──────────────────────────────────────────────────────────┐│
│               │  │ 📋 Todas (5)  │ ⏳ Pendientes (2) │ ✅ Aceptados (1)     ││
│               │  │ ❌ Rechazados (2)                                        ││
│               │  └──────────────────────────────────────────────────────────┘│
│               │                                                                  │
│               │  ┌─────────────────────────────────────────────────────────┐ │
│               │  │ Empresa      │ Posición      │ ATS │ Estado   │ Acciones │ │
│               │  ├─────────────────────────────────────────────────────────┤ │
│               │  │ 🏢 Google    │ Frontend Dev │ 95% │ ⏳ Pen.  │ 👁 🗑   │ │
│               │  │ 🏢 Meta      │ Backend Eng  │ 92% │ ✅ Acept.│ 👁 🗑   │ │
│               │  │ 🏢 Amazon    │ Full Stack  │ 88% │ ❌ Rech. │ 👁 🗑   │ │
│               │  └─────────────────────────────────────────────────────────┘ │
│               │                                                                  │
│               │  ┌─────────────────────────────────────────────────────────┐ │
│               │  │ VACIO: No tienes postulaciones aún                     │ │
│               │  │ [+ Crear tu primera postulación]                        │ │
│               │  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2. Crear Postulación (Desktop)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ◀ Sidebar    │  NUEVA POSTULACIÓN                              ← Volver   │
├─────────────────────────────────────────────────────────────────────────────┤
│               │                                                                  │
│  📋 Checklists│  ┌──────────────────────────────────────────────────────────┐│
│               │  │                                                          ││
│  💼 Postulac. │  │  PASO 1: Oferta de Trabajo                              ││
│               │  │  ─────────────────────────────────────────────────────   ││
│  🤖 AI Tools  │  │                                                          ││
│               │  │  Empresa *        [________________________]            ││
│               │  │  Posición *       [________________________]            ││
│               │  │  Ubicación        [________________________]            ││
│               │  │  Salario          [________________________]            ││
│               │  │  URL (opcional)  [________________________]            ││
│               │  │                                                          ││
│               │  │  Descripción del Puesto *                              ││
│               │  │  ┌──────────────────────────────────────────────────┐  ││
│               │  │  │ Requisitos y responsabilidades del puesto...      │  ││
│               │  │  │                                                   │  ││
│               │  │  │                                                   │  ││
│               │  │  └──────────────────────────────────────────────────┘  ││
│               │  │                                                          ││
│               │  │  [Cancelar]                          [Continuar →]    ││
│               │  │                                                          ││
│               │  └──────────────────────────────────────────────────────────┘│
│               │                                                                  │
│               │  ┌──────────────────────────────────────────────────────────┐│
│               │  │                                                          ││
│               │  │  PASO 2: CV Match (generado por IA)                    ││
│               │  │  ─────────────────────────────────────────────────────   ││
│               │  │                                                          ││
│               │  │  📊 Puntuación ATS: 95%                                 ││
│               │  │                                                          ││
│               │  │  ┌─────────────────────────────────────────────────────┐ ││
│               │  │  │ JOHN DOE                                           │ ││
│               │  │  │ Senior Frontend Developer                          │ ││
│               │  │  │ john@email.com | (555) 123-4567 | NYC             │ ││
│               │  │  │ linkedin.com/in/johndoe                           │ ││
│               │  │  │                                                    │ ││
│               │  │  │ SUMMARY                                            │ ││
│               │  │  │ Experienced developer with 5+ years...           │ ││
│               │  │  │                                                    │ ││
│               │  │  │ SKILLS                                            │ ││
│               │  │  │ React, TypeScript, Node.js, AWS...               │ ││
│               │  │  └─────────────────────────────────────────────────────┘ ││
│               │  │                                                          ││
│               │  │  [ES] [EN] [Descargar PDF]                             ││
│               │  │                                                          ││
│               │  │  [Cancelar]                         [Guardar Postul.]  ││
│               │  │                                                          ││
│               │  └──────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3. Detalle Postulación (Desktop)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ◀ Sidebar    │  POSTULACIÓN                                ← Volver        │
├─────────────────────────────────────────────────────────────────────────────┤
│               │                                                                  │
│  📋 Checklists│  ┌──────────────────────────────────────────────────────────┐│
│               │  │  🏢 Google - Frontend Developer                         ││
│  💼 Postulac. │  │  📍 Mountain View, CA | 📅 15 Mar 2026                ││
│               │  │  ─────────────────────────────────────────────────────   ││
│  🤖 AI Tools  │  │  Estado: ⏳ Pendiente    ATS: 95%                       ││
│               │  │                                                          ││
│               │  │  [Eliminar Postulación]                                  ││
│               │  └──────────────────────────────────────────────────────────┘│
│               │                                                                  │
│               │  ┌─────────────────────────┐ ┌─────────────────────────────┐  │
│               │  │  OFERTA DE TRABAJO      │ │  CV GENERADO              │  │
│               │  │  ────────────────────    │ │  ─────────────────────    │  │
│               │  │  [Ver oferta completa]  │ │  [Ver CV] [Descargar PDF]│  │
│               │  │                         │ │                           │  │
│               │  │  Posición: Frontend     │ │  ATS: 95%                │  │
│               │  │  Salario: $150k-200k    │ │  [ES] [EN]               │  │
│               │  │                         │ │                           │  │
│               │  └─────────────────────────┘ └─────────────────────────────┘  │
│               │                                                                  │
│               │  ┌──────────────────────────────────────────────────────────┐│
│               │  │                                                          ││
│               │  │  🤖 ENTREVISTA SIMULADA          [Guardar] [Regenerar] ││
│               │  │  ─────────────────────────────────────────────────────   ││
│               │  │                                                          ││
│               │  │  ┌────────────────────────────────────────────────────┐  ││
│               │  │  │ P1: ¿Cuál es tu experiencia con React?            │  ││
│               │  │  │                                                      │  ││
│               │  │  │ R1: Tengo 5 años de experiencia desarrollando...   │  ││
│               │  │  │                                                      │  ││
│               │  │  ├────────────────────────────────────────────────────┤  ││
│               │  │  │ P2: ¿Cómo manejas el estado en aplicaciones...    │  ││
│               │  │  │                                                      │  ││
│               │  │  │ R2: Utilizo diferentes herramientas según...       │  ││
│               │  │  │                                                      │  ││
│               │  │  ├────────────────────────────────────────────────────┤  ││
│               │  │  │ P3: Explícame useEffect y cuándo usarlo           │  ││
│               │  │  │                                                      │  ││
│               │  │  │ R3: useEffect es un hook que se usa para...        │  ││
│               │  │  │                                                      │  ││
│               │  │  └────────────────────────────────────────────────────┘  ││
│               │  │                                                          ││
│               │  │  [Descargar Entrevista]                                 ││
│               │  │                                                          ││
│               │  └──────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## mobile - Listado

```
┌─────────────────────┐
│ Postulaciones   [+] │
├─────────────────────┤
│ 🔍Buscar...         │
├─────────────────────┤
│ [Todas][Pen][Acep] │
├─────────────────────┤
│ ┌─────────────────┐ │
│ │ 🏢 Google       │ │
│ │ Frontend Dev    │ │
│ │ ⏳ Pendiente    │ │
│ │ ATS: 95%   👁 🗑│ │
│ └─────────────────┘ │
│ ┌─────────────────┐ │
│ │ 🏢 Meta         │ │
│ │ Backend Eng     │ │
│ │ ✅ Aceptado     │ │
│ │ ATS: 92%   👁 🗑│ │
│ └─────────────────┘ │
└─────────────────────┘
```

---

## Entidades de Base de Datos

### JobOffer (NUEVA)

```typescript
interface JobOffer {
  id: string;
  userId: string;
  company: string;
  position: string;
  description: string; // Descripción completa del puesto
  requirements?: string; // Requisitos específicos
  location?: string;
  salary?: string;
  sourceUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Application (ACTUALIZAR)

```typescript
interface Application {
  id: string;
  userId: string;
  jobOfferId: string; // NUEVO: Relación a JobOffer

  // Campos existentes
  company: string;
  position: string;
  jobOffer: string; // DEPRECATED: Migrar a JobOffer
  atsScore: number;
  generatedCvTextEn: string;
  generatedCvTextEs: string;
  status: 'pending' | 'accepted' | 'rejected';
  appliedFrom?: string;

  // Campos nuevos
  interviewQuestions?: InterviewQuestion[]; // NUEVO
  interviewAnswers?: string[]; // NUEVO
  interviewGeneratedAt?: Date; // NUEVO

  createdAt: Date;
  updatedAt: Date;
}

interface InterviewQuestion {
  question: string;
  answer: string;
}
```

---

## Endpoints API

### Endpoints Existentes (mantener)

| Método | Endpoint                           | Descripción          |
| ------ | ---------------------------------- | -------------------- |
| GET    | /api/applications                  | Listar postulaciones |
| POST   | /api/applications                  | Crear postulación    |
| GET    | /api/applications/:id              | Ver detalle          |
| PATCH  | /api/applications/:id              | Actualizar estado    |
| DELETE | /api/applications/:id              | Eliminar             |
| POST   | /api/applications/generate-cv      | Generar CV match     |
| POST   | /api/applications/base-cv/evaluate | Evaluar CV base      |

### Endpoints Nuevos

| Método | Endpoint                              | Descripción                 |
| ------ | ------------------------------------- | --------------------------- |
| POST   | /api/applications/interview-simulator | Generar entrevista simulada |
| POST   | /api/applications/job-offers          | Guardar oferta de trabajo   |

---

## Componentes Frontend (Nuevos/Actualizados)

### Nuevos

| Componente               | Propósito                                |
| ------------------------ | ---------------------------------------- |
| `JobOfferForm.tsx`       | Formulario para cargar oferta de trabajo |
| `CvMatchPreview.tsx`     | Preview del CV generado con PDF          |
| `InterviewSimulator.tsx` | Mostrar/guardar/regenerar entrevista     |
| `ApplicationList.tsx`    | Listado con filtros                      |
| `ApplicationCard.tsx`    | Card para mobile                         |
| `AtsBadge.tsx`           | Badge de puntuación ATS                  |

### Actualizar

| Componente               | Cambio                                 |
| ------------------------ | -------------------------------------- |
| `NewApplicationForm.tsx` | Integrar JobOfferForm + CvMatchPreview |
| `AppCard.tsx`            | Agregar botón de entrevista simulada   |
| PDF generation           | Mejorar márgenes para ATS              |

---

## UX/UI Requisitos

### Modo Claro/Oscuro

- Todos los componentes deben soportar `dark:` variants de Tailwind
- Colores: usar `slate-*` para textos, `sky-*` para acentos
- Fondo: `bg-white dark:bg-slate-900`
- Tarjetas: `card` (custom class con dark mode)

### i18n (ES/EN)

Todas las claves necesarias:

```typescript
// ES
applications.title = 'Postulaciones';
applications.new = 'Nueva Postulación';
applications.empty = 'No tienes postulaciones aún';
applications.createFirst = 'Crear tu primera postulación';
applications.company = 'Empresa';
applications.position = 'Posición';
applications.status = 'Estado';
applications.ats = 'ATS';
applications.pending = 'Pendiente';
applications.accepted = 'Aceptado';
applications.rejected = 'Rechazado';
applications.jobOffer = 'Oferta de Trabajo';
applications.cvGenerated = 'CV Generado';
applications.interview = 'Entrevista Simulada';
applications.generateInterview = 'Generar Entrevista';
applications.saveInterview = 'Guardar Entrevista';
applications.regenerateInterview = 'Regenerar Entrevista';
applications.downloadPdf = 'Descargar PDF';
applications.delete = 'Eliminar Postulación';
applications.noCvBase = 'Necesitas un CV base aprobado primero';
applications.cvBaseBelow85 = 'Tu CV base debe tener más de 85% ATS';

// EN
applications.title = 'Applications';
applications.new = 'New Application';
applications.empty = 'No applications yet';
applications.createFirst = 'Create your first application';
```

### Accesibilidad

- ARIA labels en todos los botones
- Focus states visibles
- Navegación por teclado
- Skeleton loaders durante carga

---

## Prompt: Entrevista Simulator

```prompt
Eres un experto en entrevistas de trabajo tecnológicas.

Basándote en la siguiente información:
- CV del candidato: {cvText}
- Oferta de trabajo: {jobDescription}
- Posición: {position}

Genera entre 5 y 7 preguntas de entrevista técnicas y comportamentales específicas para esta posición, seguidas de respuestas sugeridas profesionales.

Formato JSON:
{
  "questions": [
    {
      "question": "Pregunta 1...",
      "answer": "Respuesta 1..."
    }
  ]
}

Requisitos:
- Las preguntas deben ser específicas al puesto
- Las respuestas deben ser concisas (2-3 oraciones)
- Incluye preguntas técnicas y comportamentales
- Las respuestas deben destacar logros relevantes del CV
```

---

## PDF CV - Mejoras ATS

### Requisitos para 100% ATS-Friendly

| Elemento        | Valor                             |
| --------------- | --------------------------------- |
| Márgenes        | 0.5-1 pulgada (1.27-2.54 cm)      |
| Fuentes         | Arial, Helvetica, Times New Roman |
| Tamaño fuente   | 10-12pt cuerpo, 14-16pt nombre    |
| Formato         | Una sola columna                  |
| Saltos          | Saltos de línea, no de página     |
| Imágenes        | NO                                |
| Tablas          | NO                                |
| Headers/Footers | Evitar                            |

### CSS para PDF

```css
.cv-container {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 11pt;
  margin: 0.75in;
  max-width: 8.5in;
}

.cv-name {
  font-size: 16pt;
  font-weight: bold;
}

.cv-section {
  margin-top: 12pt;
}

.cv-section-title {
  font-size: 12pt;
  border-bottom: 1px solid #000;
  padding-bottom: 2pt;
  margin-bottom: 8pt;
}
```

---

## Acceptance Criteria

| ID   | Criterio                                       | Estado |
| ---- | ---------------------------------------------- | ------ |
| AC01 | CV base obligatorio antes de crear postulación | ⬜     |
| AC02 | Listado de postulaciones con filtros           | ⬜     |
| AC03 | Crear postulación con oferta de trabajo        | ⬜     |
| AC04 | Guardar oferta de trabajo en BD                | ⬜     |
| AC05 | Generar CV match con IA                        | ⬜     |
| AC06 | Preview del CV generado                        | ⬜     |
| AC07 | Descargar PDF con márgenes ATS                 | ⬜     |
| AC08 | Ver detalle de postulación                     | ⬜     |
| AC09 | Generar entrevista simulada (5-7 preguntas)    | ⬜     |
| AC10 | Guardar entrevista simulada (opcional)         | ⬜     |
| AC11 | Regenerar entrevista simulada                  | ⬜     |
| AC12 | Eliminar postulación                           | ⬜     |
| AC13 | Soporte modo claro/oscuro                      | ⬜     |
| AC14 | Soporte i18n ES/EN                             | ⬜     |
| AC15 | Tests pasan                                    | ⬜     |

---

## Archivos a Modificar

### Backend

- `modules/applications/entities/application.entity.ts`
- `modules/applications/entities/job-offer.entity.ts` (NUEVO)
- `modules/applications/dto/application.dto.ts`
- `modules/applications/applications.controller.ts`
- `modules/applications/applications.service.ts`
- `modules/applications/prompts/interviewSimulator.prompts.ts` (NUEVO)

### Frontend

- `app/client/applications/page.tsx`
- `app/client/applications/new/page.tsx` (NUEVO o actualizar)
- `app/client/applications/[id]/page.tsx`
- `components/applications/JobOfferForm.tsx` (NUEVO)
- `components/applications/CvMatchPreview.tsx` (NUEVO)
- `components/applications/InterviewSimulator.tsx` (NUEVO)
- `components/applications/ApplicationList.tsx` (NUEVO)
- `components/applications/AppCard.tsx`
- `lib/i18n/applications.ts`

---

## Historial de Cambios

| Fecha      | Versión | Cambio           | Autor |
| ---------- | ------- | ---------------- | ----- |
| 2026-03-14 | 1.0.0   | Creación inicial | —     |
