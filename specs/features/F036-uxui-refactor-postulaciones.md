# F036: UX/UI Refactor - Módulo de Postulaciones (Innovación)

> Estado: APPROVED
> Fecha de creación: 2026-03-14
> Versión: 1.0.0
> Reemplaza: F035 (parcialmente)

---

## Resumen Ejecutivo

Rediseño completo del módulo de postulaciones con separación de páginas, diseño minimalista innovador y micro-interacciones usando anime.js. La JobOffer se convierte en el centro de la experiencia - cada postulación parte de una oferta de trabajo específica.

---

## Arquitectura de Navegación (Nueva)

```
/client/applications
├── /                    → Listado (solo tarjetas minimalistas)
├── /new                 → Wizard de creación (pasos)
├── /base-cv             → Configurar CV base
├── /[id]                → Detalle completo de postulación
└── /[id]/edit           → (futuro) Editar oferta
```

### Comparación: Antes vs Después

| Antes | Después |
|-------|---------|
| Tabs en una página (base-cv, list, new, dashboard) | Página única por的功能 |
| AppCard saturada de acciones | AppCard minimalista (solo lo esencial) |
| Sin animaciones o básicas | Micro-interacciones con anime.js |
| Mezcla de funcionalidades | Responsabilidad única por página |

---

## 1. Listado de Postulaciones (`/client/applications`)

### Flujo del CV Base

El CV base solo es requerido la **primera vez**. Una vez creado, el usuario puede editarlo cuando desee.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ◀ Sidebar    │  POSTULACIONES                              [+ Nueva] 👤    │
├─────────────────────────────────────────────────────────────────────────────┤
│              │                                                                     │
│  📋 Checkls  │  ┌─────────────────────────────────────────────────────────┐ │
│              │  │ [🎯 Nueva Postulación]  [✏️ Editar CV Base]            │ │
│  💼 Postul.  │  └─────────────────────────────────────────────────────────┘ │
│              │                                                                     │
│  🤖 AI       │  ┌─────────────────────────────────────────────────────────┐ │
│              │  │ 🔍 Buscar...                              [Filtros ▼] │ │
│              │  └─────────────────────────────────────────────────────────┘ │
│              │                                                                     │
│              │  ┌─────────────────────────────────────────────────────────┐ │
│              │  │ 📋 Todas (5) │ ⏳ Pendientes (2) │ ✅ Aceptados (1)   │ │
│              │  └─────────────────────────────────────────────────────────┘ │
│              │                                                                     │
│              │  ┌─────────────────────────────────────────────────────────┐ │
│              │  │ Google  │  Frontend Dev  │  95%  │  ⏳ Pendiente   │ → │ │
│              │  ├─────────────────────────────────────────────────────────┤ │
│              │  │ Meta    │  Backend Eng   │  92%  │  ✅ Aceptado   │ → │ │
│              │  ├─────────────────────────────────────────────────────────┤ │
│              │  │ Amazon  │  Full Stack    │  88%  │  ❌ Rechazado  │ → │ │
│              │  └─────────────────────────────────────────────────────────┘ │
│              │                                                                     │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Banner de CV Base (si NO existe)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ⚠️  Necesitas un CV base para crear postulaciones                         │
│                                                                             │
│     [Crear mi CV Base]                                                     │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Lógica de Navegación

| Scenario | Botón "Nueva Postulación" | Botón "Editar CV Base" |
|----------|---------------------------|------------------------|
| NO existe CV base | ❌ Oculto | ✅ Visible (crear) |
| YA existe CV base | ✅ Visible | ✅ Visible (editar) |

### AppCard Minimalista (Nueva)

```tsx
// Solo muestra:
- Empresa + Position (texto principal)
- ATS Score (badge color según puntuación)
- Estado (badge con color)
- Fecha de creación
- Flecha → para ir al detalle

// Acciones en hover (reveal):
- Ver detalle (primary)
- Eliminar (danger, con confirmación)
```

### Animaciones (anime.js)

```tsx
// Entrance - staggered fade-in-up
const cardRef = useStaggerIn<HTMLDivElement>({ 
  stagger: 80, 
  duration: 500 
});

// Hover - subtle scale + shadow
<Card 
  className="hover:scale-[1.02] hover:shadow-lg transition-all"
  onMouseEnter={(e) => anime({ targets: e.currentTarget, scale: 1.02 })}
  onMouseLeave={(e) => anime({ targets: e.currentTarget, scale: 1 })}
/>
```

---

## 2. Detalle de Postulación (`/client/applications/[id]`)

### Diseño Propuesto

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ◀ Volver   │  POSTULACIÓN                             [🗑 Eliminar]     │
├─────────────────────────────────────────────────────────────────────────────┤
│             │                                                                     │
│             │  ┌─────────────────────────────────────────────────────────────┐ │
│             │  │  🏢 Google - Frontend Developer                           │ │
│             │  │  📍 Mountain View, CA  •  📅 15 Mar 2026                │ │
│             │  │  ─────────────────────────────────────────────────────   │ │
│             │  │  Estado: ⏳ Pendiente           ATS: 95%                  │ │
│             │  └─────────────────────────────────────────────────────────────┘ │
│             │                                                                     │
│             │  ┌─────────────────────────────┐ ┌───────────────────────────┐ │
│             │  │  📋 OFERTA DE TRABAJO       │ │  📄 CV GENERADO          │ │
│             │  │  ─────────────────────────  │ │  ─────────────────────    │ │
│             │  │                              │ │                           │ │
│             │  │  Posición: Frontend         │ │  [ES] [EN] [📥 PDF]      │ │
│             │  │  Salario: $150k-200k        │ │                           │ │
│             │  │  Ubicación: Remote          │ │  ATS: 95%                │ │
│             │  │                              │ │                           │ │
│             │  │  [Ver oferta completa]      │ │  [Ver CV completo]        │ │
│             │  └─────────────────────────────┘ └───────────────────────────┘ │
│             │                                                                     │
│             │  ┌─────────────────────────────────────────────────────────────┐ │
│             │  │                                                                     │ │
│             │  │  🤖 ENTREVISTA SIMULADA         [Generar] [Guardar] [📥]  │ │
│             │  │  ─────────────────────────────────────────────────────      │ │
│             │  │                                                                     │ │
│             │  │  ┌───────────────────────────────────────────────────────┐  │ │
│             │  │  │ P1: ¿Cuál es tu experiencia con React?              │  │ │
│             │  │  │                                                      │  │ │
│             │  │  │ R1: Tengo 5 años de experiencia desarrollando...   │  │ │
│             │  │  └───────────────────────────────────────────────────────┘  │ │
│             │  │                                                                     │ │
│             │  │  [+ Expandir todas las preguntas y respuestas]                │ │
│             │  │                                                                     │ │
│             │  └─────────────────────────────────────────────────────────────┘ │
│             │                                                                     │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Comportamiento del Detalle

1. **Carga**: Skeleton loader con shimmer animation
2. **Transiciones**: Fade-in suave entre secciones
3. **Entrevista**: Accordion con expand/collapse animado
4. **Eliminar**: Modal de confirmación con backdrop blur

---

## 3. Wizard de Creación (`/client/applications/new`)

### Flujo Paso a Paso

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ← Volver  │  NUEVA POSTULACIÓN                          Paso 1 de 3      │
├─────────────────────────────────────────────────────────────────────────────┤
│             │  ┌──────────────────────────────────────────────────────────┐  │
│  ○ Oferta   │  │                                                          │  │
│  ─────────  │  │  Empresa *                     [________________]       │  │
│  ● CV Match │  │                                                          │  │
│  ─────────  │  │  Posición *                    [________________]       │  │
│  ○ Resumen  │  │                                                          │  │
│             │  │  Ubicación                     [________________]       │  │
│             │  │  Salario                       [________________]       │  │
│             │  │  URL de oferta (opcional)      [________________]       │  │
│             │  │                                                          │  │
│             │  │  Descripción del puesto *                            │  │
│             │  │  ┌──────────────────────────────────────────────────┐  │  │
│             │  │  │                                                    │  │  │
│             │  │  │  Requisitos y responsabilidades...               │  │  │
│             │  │  │                                                    │  │  │
│             │  │  └──────────────────────────────────────────────────┘  │  │
│             │  │                                                          │  │
│             │  │  [Cancelar]                          [Continuar →]     │  │
│             │  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Validaciones en Tiempo Real

- Validación mientras el usuario escribe
- Mensajes de error sutiles debajo de cada campo
- Botón "Continuar" deshabilitado hasta completar obligatorios

### Animaciones del Wizard

```tsx
// Step transition - slide + fade
const stepRef = useFadeInUp({ duration: 400 });

// Progress bar animation
<ProgressBar 
  value={step} 
  max={3}
  className="transition-all duration-500 ease-out"
/>
```

---

## 4. CV Base (`/client/applications/base-cv`)

### Dos Modos

Esta página funciona tanto para **crear** como para **editar** el CV base:

| Modo | Cuándo | Acción |
|------|--------|--------|
| Crear | No existe CV base en BD | Formulario vacío con "Crear CV Base" |
| Editar | Ya existe CV base | Formulario precargado con "Guardar Cambios" |

### Diseño - Modo Crear (Primera vez)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ◀ Volver   │  CREAR MI CV BASE                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│             │                                                                     │
│             │  ┌─────────────────────────────────────────────────────────────┐ │
│             │  │  ⚠️ Tu CV base es requerido para crear postulaciones     │ │
│             │  │                                                              │ │
│             │  │  Este CV se usará como base para generar CVs 100% ATS    │ │
│             │  │  específicos para cada oferta de trabajo.                 │ │
│             │  └─────────────────────────────────────────────────────────────┘ │
│             │                                                                     │
│             │  ┌─────────────────────────────────────────────────────────────┐ │
│             │  │ Nombre completo *               [________________]        │ │
│             │  │ Email *                         [________________]        │ │
│             │  │ Teléfono                        [________________]        │ │
│             │  │ Ubicación                       [________________]        │ │
│             │  │ LinkedIn                        [________________]        │ │
│             │  │                                                          │ │
│             │  │ Resumen profesional *                                        │ │
│             │  │ ┌────────────────────────────────────────────────────┐    │ │
│             │  │ │  Experienced developer with 5+ years...          │    │ │
│             │  │ └────────────────────────────────────────────────────┘    │ │
│             │  │                                                          │ │
│             │  │ Experiencia laboral *                                        │ │
│             │  │ ┌────────────────────────────────────────────────────┐    │ │
│             │  │ │  Company — Role (Year-Year)                      │    │ │
│             │  │ │  • Logro cuantificable...                       │    │ │
│             │  │ └────────────────────────────────────────────────────┘    │ │
│             │  │                                                          │ │
│             │  │ [Crear mi CV Base]                                      │ │
│             │  └─────────────────────────────────────────────────────────────┘ │
│             │                                                                     │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Diseño - Modo Editar (Ya existe)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ◀ Volver   │  EDITAR MI CV BASE                     [Evaluación: 92%]   │
├─────────────────────────────────────────────────────────────────────────────┤
│             │                                                                     │
│             │  ┌─────────────────────────────────────────────────────────────┐ │
│             │  │  📊 Evaluación ATS: 92% - ¡Excelente!                   │ │
│             │  │                                                              │ │
│             │  │  Tu CV base está listo para generar postulaciones.        │ │
│             │  │  Puedes editarlo cuando quieras para mantenerlo al día.  │ │
│             │  └─────────────────────────────────────────────────────────────┘ │
│             │                                                                     │
│             │  ┌─────────────────────────────────────────────────────────────┐ │
│             │  │  EDITAR MI CV BASE                                         │ │
│             │  │  ─────────────────────────────────────────────────────      │ │
│             │  │                                                              │ │
│             │  │  Nombre completo *               [________________]        │ │
│             │  │  Email *                         [________________]        │ │
│             │  │  Teléfono                        [________________]        │ │
│             │  │  Ubicación                       [________________]        │ │
│             │  │  LinkedIn                        [________________]        │ │
│             │  │                                                              │ │
│             │  │  Resumen profesional *                                        │ │
│             │  │  ┌────────────────────────────────────────────────────┐    │ │
│             │  │  │  Experienced developer with 5+ years...          │    │ │
│             │  │  └────────────────────────────────────────────────────┘    │ │
│             │  │                                                              │ │
│             │  │  [Guardar Cambios]     [← Volver a Postulaciones]       │ │
│             │  └─────────────────────────────────────────────────────────────┘ │
│             │                                                                     │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Componentes UI Innovadores

### 1. AtsBadge (Nuevo)

```tsx
// Badge dinámico según puntuación ATS
<AtsBadge score={95} /> // Verde - excellent
<AtsBadge score={85} /> // Azul - good
<AtsBadge score={70} /> // Amarillo - needs work
<AtsBadge score={50} /> // Rojo - poor
```

### 2. StatusBadge (Actualizado)

```tsx
// Badge de estado con animación
<StatusBadge status="pending" />  // Animación de pulso suave
<StatusBadge status="accepted" /> // Checkmark animado
<StatusBadge status="rejected" /> // X animado
```

### 3. SkeletonCard (Nuevo)

```tsx
// Loading state con shimmer
<SkeletonCard />
```

### 4. EmptyState (Mejorado)

```tsx
// Estado vacío con animación y CTA claro
<EmptyState 
  title="No tienes postulaciones aún"
  description="Crea tu primera postulación para comenzar"
  action={{ label: 'Crear postulación', onClick: () => {} }}
/>
```

---

## Especificaciones Tailwind

### Paleta de Colores

```ts
const colors = {
  // Estado
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  accepted: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  rejected: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  
  // ATS Score
  atsExcellent: 'bg-emerald-500',      // 90+
  atsGood: 'bg-sky-500',                // 80-89
  atsWarning: 'bg-amber-500',           // 70-79
  atsDanger: 'bg-rose-500',            // <70
  
  // Fondos
  card: 'bg-white dark:bg-slate-900',
  cardHover: 'hover:bg-slate-50 dark:hover:bg-slate-800/50',
  
  // Bordes
  border: 'border-slate-200 dark:border-slate-800',
}
```

### Espaciado

```ts
const spacing = {
  card: 'p-4 md:p-6',
  section: 'gap-6 md:gap-8',
  element: 'gap-2 md:gap-4',
}
```

---

## Especificaciones anime.js

### Micro-interacciones

```ts
// Hover en cards
anime({
  targets: '.app-card',
  scale: 1.02,
  boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
  duration: 200,
  easing: 'easeOutQuad',
});

// Click en botones
anime({
  targets: '.btn-primary',
  scale: [1, 0.95, 1],
  duration: 150,
  easing: 'easeInOutQuad',
});

// Loading skeleton shimmer
anime({
  targets: '.skeleton',
  opacity: [0.3, 0.7],
  duration: 1500,
  loop: true,
  easing: 'easeInOutSine',
});
```

### Page Transitions

```ts
// Fade in al cargar página
const tl = anime.timeline({ easing: 'easeOutExpo' });
tl
  .add({ targets: '.page-header', opacity: [0, 1], translateY: [-20, 0], duration: 600 })
  .add({ targets: '.card', opacity: [0, 1], translateY: [20, 0], duration: 500, delay: anime.stagger(80) }, '-=400');
```

---

## Reglas de Negocio (Actualizadas)

| # | Regla | Descripción |
|---|-------|-------------|
| 1 | CV Base: Primera vez obligatorio | La primera vez, el usuario debe crear un CV base. Luego puede editarlo cuando desee. |
| 2 | Postulaciones requieren CV base | Para crear una postulación, debe existir un CV base en BD. Si no existe, se redirige a crearlo. |
| 3 | Oferta es Central | La JobOffer se guarda primero, luego se genera CV match |
| 4 | CV Match 100% ATS | IA genera CV específico para cada oferta |
| 5 | Entrevista Opcional | El usuario decide si genera y guarda la entrevista |
| 6 | Sin Edición Post-Creación | Una vez creada la postulación, solo se puede eliminar |
| 7 | Limpieza Visual | Cada página tiene una responsabilidad única |

---

## Entidades (Sin Cambios)

La estructura de datos no cambia significativamente. La JobOffer sigue siendo parte de Application (o relación).

---

## Endpoints API (Sin Cambios)

Todos los endpoints de F035 se mantienen.

---

## Checklist de Implementación

### Fase 1: Estructura
- [x] Crear rutas en `/app/client/applications/`
- [x] Implementar Layout con breadcrumbs
- [x] Agregar skeleton loaders
- [x] **IMPLEMENTAR: Flujo correcto de CV Base**
  - [x] Listing: Si NO existe CV base → mostrar banner + botón "Crear CV Base"
  - [x] Listing: Si YA existe CV base → mostrar botón "Nueva postulación" + "Editar CV Base"
  - [x] /new: Si NO existe CV base → redirigir a /base-cv
  - [x] /base-cv: Si YA existe → modo editar (prellenar formulario)
  - [x] /base-cv: Si NO existe → modo crear (formulario vacío)

### Fase 2: Listado
- [x] Refactorizar AppCard minimalista
- [x] Agregar animaciones de entrada (stagger)
- [x] Implementar filtros con animate open/close

### Fase 3: Detalle
- [x] Migrar InterviewSimulator desde AppCard
- [x] Agregar animaciones de secciones
- [x] Implementar modal de eliminación

### Fase 4: Creación (Wizard)
- [x] Crear formulario paso a paso
- [x] Validaciones en tiempo real
- [x] Animaciones de transición entre pasos

### Fase 5: Detalles
- [x] Empty states con animaciones
- [x] Responsive design mobile
- [ ] Testing de animaciones

---

## Archivos a Modificar

### Frontend

```
apps/frontend/app/client/applications/
├── page.tsx                      → Solo listado (refactor)
├── base-cv/
│   └── page.tsx                  → NUEVO - CV base separado
├── new/
│   └── page.tsx                  → NUEVO - Wizard de creación
└── [id]/
    └── page.tsx                  → ACTUALIZAR - Detalle completo

apps/frontend/components/applications/
├── AppCard.tsx                   → MINIMALISTA - Solo esencial
├── AtsBadge.tsx                  → NUEVO
├── StatusBadge.tsx               → NUEVO (actualizar)
├── SkeletonCard.tsx              → NUEVO
├── EmptyState.tsx                → ACTUALIZAR
├── ApplicationList.tsx           → NUEVO (wrapper con animaciones)
└── Wizard/
    ├── StepOffer.tsx             → NUEVO
    ├── StepCVMatch.tsx           → NUEVO
    └── StepSummary.tsx           → NUEVO

apps/frontend/hooks/
└── useAnime.ts                  → Extender para más animaciones

apps/frontend/lib/i18n/
└── applications.ts               → Agregar nuevas claves
```

---

## Testing Checklist

- [ ] Tests unitarios de componentes
- [ ] Tests de integración del wizard
- [ ] Tests de animaciones (visual regression)
- [ ] Tests de accesibilidad (keyboard navigation)
- [ ] Tests responsive (mobile, tablet, desktop)

---

## Accesibilidad

- [ ] Todos los componentes tienen ARIA labels
- [ ] Soporte para keyboard navigation completo
- [ ] Focus visible en todos los elementos interactivos
- [ ] Soporte para reduced-motion (deshabilitar animaciones)
- [ ] Contrastes WCAG AA mínimos

---

## Notas

1. **JobOffer como centro**: La oferta de trabajo es el alma de la postulación. El flujo siempre empieza por ahí.

2. **Separación de responsabilidades**: Cada página hace una cosa. Listado → crea → detalle.

3. **Animaciones con propósito**: No animamos por estética, sino por feedback al usuario (loading, transitions, micro-interactions).

4. **Mobile-first**: El diseño es responsive desde el inicio, no como adaptación.

---

## Historial de Cambios

| Fecha | Versión | Cambio | Autor |
|-------|---------|--------|-------|
| 2026-03-14 | 1.0.0 | Versión inicial del spec | - |
| 2026-03-14 | 1.0.1 | Corregir flujo de CV Base - crear vs editar | - |
