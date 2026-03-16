# F038: Landing Page Redesign

> Estado: APPROVED
> Fecha de creación: 2026-03-15
> Última actualización: 2026-03-15

---

## Contexto

| Campo           | Descripción                          |
| --------------- | ------------------------------------ |
| **Módulo**      | frontend                             |
| **Usuario**     | Visitante público, developers, recruiters |
| **Problema**    | La landing actual no sirve como portafolio técnico ni persuade para usar las herramientas |
| **Solicitante** | Dann                                |
| **Prioridad**   | Alta                                 |

---

## spec (Qué y Por Qué)

### User Stories

- Como **visitante**, quiero ver una landing visualmente impressive para entender las capacidades del monorepo
- Como **developer/recruiter**, quiero ver la arquitectura y stack tecnológico para evaluar el proyecto como portafolio
- Como **potencial usuario**, quiero ver métricas reales para confiar en la estabilidad del sistema

### Acceptance Criteria

- [x] **AC01**: Landing muestra animación SVG en hero con nodos conectados (User → Frontend → Backend → DB)
- [x] **AC02**: Sección de Arquitectura con diagrama del flujo de datos (diseño simplificado)
- [x] **AC03**: Sección SDD mostrando el proceso Spec-Driven Development
- [x] **AC04**: Sección de métricas en tiempo real (usuarios, checklists, aplicaciones)
- [x] **AC05**: Sección n8n con workflows automatizados
- [x] **AC06**: Animaciones reducidas - solo en hero (prefers-reduced-motion soportado)
- [x] **AC07**: Link a GitHub en el hero
- [x] **AC08**: Dark mode soportado en todas las secciones
- [x] **AC09**: i18n completo (ES/EN)
- [x] **AC10**: Todas las secciones alineadas a la izquierda
- [x] **AC11**: Anchos consistentes: max-w-[1400px]
- [x] **AC12**: Stack con cards de partners (logos + nombre + descripción)
- [x] **AC13**: 6 Features con implementaciones reales del repo
- [x] **AC14**: No hay errores de hidratación

### Funcionalidad Esperada

La landing debe funcionar como:
1. **Portafolio técnico** - Demuestra arquitectura, stack, metodologías
2. **Herramienta persuasiva** - Motiva a usar las herramientas
3. **Demo técnica** - Muestra habilidades con animejs

### Edge Cases

| ID   | Descripción  | Comportamiento Esperado |
| ---- | ------------ | ----------------------- |
| EC01 | API de métricas no responde | Mostrar valores fallback hardcoded |
| EC02 | Usuario tiene reduced-motion | Deshabilitar animaciones, mostrar estático |
| EC03 | Dark mode cambia durante scroll | Transición suave sin parpadeo |

---

## plan (Cómo)

### Stack

| Tecnología | Uso            | Versión |
| ---------- | -------------- | ------- |
| Next.js    | Frontend       | 14.x    |
| animejs    | Animaciones    | 3.x     |
| TailwindCSS | Estilos       | 3.x     |

### Arquitectura

#### Backend - Nuevo Endpoint

| Método | Path              | Auth | Descripción   |
| ------ | ----------------- | ---- | ------------- |
| GET    | `/v1/landing/metrics` | Public | Métricas para landing |

#### Frontend - Nuevos Componentes

| Componente | Ubicación | Descripción |
| ---------- | ---------- | ----------- |
| LandingMetrics | `components/ui/LandingMetrics.tsx` | Métricas con count-up animation |
| ArchitectureDiagram | `components/ui/ArchitectureDiagram.tsx` | SVG animado del flujo |
| SddFlow | `components/ui/SddFlow.tsx` | Proceso SDD visual |
| N8nShowcase | `components/ui/N8nShowcase.tsx` | Cards de workflows |

#### API Routes

| Path | Descripción |
| ---- |------------- |
| `/api/landing/metrics` | Proxy al backend |

### Constraints

| Constraint  | Límite |
| ----------- | ----- |
| Performance | < 100ms para métricas (cache 5min) |
| Animaciones | Solo transform/scale (GPU) |
| Accesibilidad | prefers-reduced-motion soportado |

---

## Tasks

### Phase 1: Backend

- [x] **T01**: Crear endpoint `/v1/landing/metrics`
- [x] **T02**: Crear módulo LandingModule

### Phase 2: Frontend

- [x] **T03**: Crear LandingMetrics component
- [x] **T04**: Crear ArchitectureDiagram component
- [x] **T05**: Crear SddFlow component
- [x] **T06**: Crear N8nShowcase component
- [x] **T07**: Integrar en page.tsx con animaciones
- [x] **T08**: Agregar i18n keys

### Phase 3: Validación

- [x] **T09**: Verificar acceptance criteria
- [x] **T10**: Tests para componentes
- [x] **T11**: type-check pasa

### Phase 4: Fixes & Improvements

- [x] **T12**: Fix hydration errors - remove span wrappers around SVGs
- [x] **T13**: Align all sections to left (remove text-center)
- [x] **T14**: Simplify animations - remove anime.js from Architecture, SddFlow, N8nShowcase
- [x] **T15**: Update Stack with card design + logos (partners style)
- [x] **T16**: Update Features with 6 real implementations from repo
- [x] **T17**: Increase hero and metrics widths

---

## Notas de Implementación

> La landing incluye:
> - Hero animation con nodos SVG conectados
> - Arquitectura con cards horizontales (diseño simplificado sin animación)
> - SDD con pasos secuenciales (diseño simplificado sin animación)
> - Stack con cards de partners (logos + nombre + descripción)
> - 6 Features con implementaciones reales del repo:
>   - AI Checklists
>   - CV Builder
>   - Interview Simulator
>   - Robust Auth
>   - Telegram Bot
>   - n8n Workflows
> - Métricas reales desde PostgreSQL
> - n8n showcase con workflows (diseño simplificado sin animación)
> - API docs ejemplo
> - Todas las secciones alineadas a la izquierda
> - Anchos consistentes: max-w-[1400px]

---

## Historial de Cambios

| Fecha      | Versión | Cambio           | Autor |
| ---------- | ------- | ---------------- | ----- |
| 2026-03-15 | 1.0.0   | Creación inicial | Dann |
| 2026-03-15 | 1.1.0   | Fix hydration, align left, simplify animations | Dann |

---

## Referencias

- Specs relacionadas: F036, F037 (Applications)
- Constitución: `specs/SPEC.md`
- AGENTS.md para reglas de desarrollo
