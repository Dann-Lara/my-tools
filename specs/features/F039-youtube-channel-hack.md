# F039: YouTube Channel Hack

> Estado: IN_PROGRESS
> Fecha de creación: 2026-03-16
> Última actualización: 2026-03-16

---

## Contexto

| Campo           | Descripción                          |
| --------------- | ------------------------------------ |
| **Módulo**      | youtube                              |
| **Usuario**     | client, admin, superadmin            |
| **Problema**    | El usuario necesita automatizar el trabajo estratégico para hacer crecer un canal de YouTube monetizable |
| **Solicitante** | Dann                                 |
| **Prioridad**   | Alta                                 |

---

## spec (Qué y Por Qué)

### User Stories

- Como **creador de contenido**, quiero que el módulo me genere ideas de contenido, scripts, SEO y prompts de IA automáticamente para no perder tiempo en investigación.
- Como **usuario**, quiero gestionar múltiples canales de YouTube desde una sola plataforma para mantener orden.
- Como **superadmin**, quiero controlar qué usuarios pueden ver el módulo de YouTube para restringir acceso según el plan del usuario.
- Como **creador**, quiero una guía de monetización para asegurarme de activar correctamente los anuncios en YouTube.

### Acceptance Criteria

- [ ] **AC01**: Dashboard de nichos con scores de oportunidad (V1)
- [ ] **AC02**: Crear canal anclado a un nicho con generación automática de 10 ideas (V2-V3)
- [ ] **AC03**: Generar script completo de una idea on-demand (V4)
- [ ] **AC04**: Generar 5 prompts de IA por idea (uno por plataforma) (V5)
- [ ] **AC05**: SEO sheet editable para cada idea (V6)
- [ ] **AC06**: Guía de monetización con checklist (V7)
- [ ] **AC07**: Control de visibilidad del módulo por superadmin
- [ ] **AC08**: Integración con @ai-lab/ai-core para toda generación de texto
- [ ] **AC09**: Fallback a generación por IA cuando no hay API de TubeBuddy

### Funcionalidad Esperada

El módulo automatiza el 80% del trabajo estratégico para hacer crecer un canal de YouTube:
- Selección de nicho con scores de oportunidad
- Generación automática de ideas de contenido
- Scripts completos on-demand
- SEO completo (título, descripción, tags, hashtags)
- Prompts para plataformas de video IA (Sora, Runway, Kling, Midjourney, Pika)
- Guía de configuración de monetización

### Edge Cases

| ID   | Descripción  | Comportamiento Esperado |
| ---- | ------------ | ----------------------- |
| EC01 | TubeBuddy API no configurada | Usar generateNichesWithAI() como fallback |
| EC02 | Todos los providers de IA fallan | Mostrar error 503 con retry |
| EC03 | Usuario sin acceso al módulo (superadmin) | Retornar 403 Forbidden |
| EC04 | Script ya generado anteriormente | Servir desde BD sin regenerar |

---

## plan (Cómo)

### Stack

| Tecnología | Uso            | Versión |
| ---------- | -------------- | ------- |
| Next.js    | Frontend       | 14.x    |
| React      | UI             | 18.x    |
| NestJS     | Backend API    | 10.x    |
| TypeORM    | ORM            | 0.3.x   |
| ai-core    | IA             | —       |

### Arquitectura

#### Entidades

```typescript
// entities/niche.entity.ts
@Entity('youtube_niches')
export class NicheEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;
  
  @Column()
  name!: string;
  
  @Column({ unique: true })
  slug!: string;
  
  @Column({ nullable: true })
  description!: string;
  
  @Column({ type: 'enum', enum: ['low', 'medium', 'high', 'very_high'] })
  searchVolume!: string;
  
  @Column({ type: 'enum', enum: ['low', 'medium', 'high'] })
  competition!: string;
  
  @Column({ type: 'int' })
  opportunityScore!: number;
  
  @Column({ type: 'enum', enum: ['rising', 'stable', 'declining'] })
  trend!: string;
  
  @Column({ type: 'int', nullable: true })
  trendPercent!: number;
  
  @Column('simple-array', { nullable: true })
  topKeywords!: string[];
  
  @Column({ nullable: true })
  suggestedAudience!: string;
  
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  estimatedCPM!: number;
  
  @Column({ default: 'ai' })
  source!: string;
  
  @CreateDateColumn()
  createdAt!: Date;
  
  @UpdateDateColumn()
  updatedAt!: Date;
}

// entities/channel.entity.ts
@Entity('youtube_channels')
export class ChannelEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;
  
  @Column()
  userId!: string;
  
  @Column()
  nicheId!: string;
  
  @Column()
  name!: string;
  
  @Column({ unique: true })
  slug!: string;
  
  @Column({ nullable: true })
  description!: string;
  
  @Column({ nullable: true })
  targetAudience!: string;
  
  @Column({ nullable: true })
  channelGoal!: string;
  
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  ctr!: number;
  
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  avgRetention!: number;
  
  @Column({ type: 'int', nullable: true })
  subscriberCount!: number;
  
  @Column({ type: 'bigint', nullable: true })
  totalViews!: number;
  
  @Column({ type: 'enum', enum: ['setup', 'active', 'paused', 'monetized'], default: 'setup' })
  status!: string;
  
  @Column({ default: false })
  monetizationSetupCompleted!: boolean;
  
  @CreateDateColumn()
  createdAt!: Date;
  
  @UpdateDateColumn()
  updatedAt!: Date;
}

// entities/content-idea.entity.ts
@Entity('youtube_content_ideas')
export class ContentIdeaEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;
  
  @Column()
  channelId!: string;
  
  @Column()
  title!: string;
  
  @Column({ type: 'text', nullable: true })
  hook!: string;
  
  @Column({ type: 'text', nullable: true })
  script!: string;
  
  @Column({ nullable: true })
  angle!: string;
  
  @Column({ type: 'enum', enum: ['tutorial', 'story', 'list', 'comparison', 'reaction', 'shorts_only'] })
  format!: string;
  
  @Column({ nullable: true })
  seoTitle!: string;
  
  @Column({ type: 'text', nullable: true })
  seoDescription!: string;
  
  @Column('simple-array', { nullable: true })
  tags!: string[];
  
  @Column('simple-array', { nullable: true })
  hashtags!: string[];
  
  @Column({ type: 'enum', enum: ['high', 'medium', 'low'] })
  successProbability!: string;
  
  @Column({ nullable: true })
  successReason!: string;
  
  @Column({ type: 'text', nullable: true })
  shortAngle!: string;
  
  @Column({ type: 'text', nullable: true })
  shortScript!: string;
  
  @Column({ type: 'enum', enum: ['idea', 'scripted', 'filmed', 'published', 'analyzed'], default: 'idea' })
  status!: string;
  
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  publishedCtr!: number;
  
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  publishedRetention!: number;
  
  @Column({ type: 'bigint', nullable: true })
  publishedViews!: number;
  
  @Column({ type: 'int' })
  position!: number;
  
  @CreateDateColumn()
  createdAt!: Date;
  
  @UpdateDateColumn()
  updatedAt!: Date;
}

// entities/ai-video-prompt.entity.ts
@Entity('youtube_ai_prompts')
export class AIVideoPromptEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;
  
  @Column()
  ideaId!: string;
  
  @Column({ type: 'enum', enum: ['sora', 'runway', 'kling', 'midjourney', 'pika'] })
  platform!: string;
  
  @Column({ type: 'enum', enum: ['video', 'thumbnail', 'short'] })
  promptType!: string;
  
  @Column({ type: 'text' })
  promptText!: string;
  
  @Column({ type: 'int' })
  generationBatch!: number;
  
  @CreateDateColumn()
  createdAt!: Date;
}

// entities/monetization-setup.entity.ts
@Entity('youtube_monetization_setup')
export class MonetizationSetupEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;
  
  @Column()
  channelId!: string;
  
  @Column({ type: 'jsonb', default: [] })
  steps!: MonetizationStep[];
  
  @Column({ nullable: true })
  completedAt!: Date;
  
  @CreateDateColumn()
  createdAt!: Date;
  
  @UpdateDateColumn()
  updatedAt!: Date;
}

export interface MonetizationStep {
  id: string;
  category: 'ypp' | 'ads_config' | 'content_policy' | 'seo' | 'affiliate' | 'owned_product';
  title: string;
  description: string;
  actionUrl: string | null;
  completed: boolean;
  completedAt: Date | null;
  priority: 'critical' | 'high' | 'medium';
}

// entities/module-visibility.entity.ts (para control de superadmin)
@Entity('module_visibility')
export class ModuleVisibilityEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;
  
  @Column({ unique: true })
  moduleName!: string;
  
  @Column({ default: true })
  isEnabled!: boolean;
  
  @Column('simple-array', { nullable: true })
  allowedRoles!: string[];
  
  @Column('simple-array', { nullable: true })
  allowedUsers!: string[];
  
  @CreateDateColumn()
  createdAt!: Date;
  
  @UpdateDateColumn()
  updatedAt!: Date;
}
```

#### Endpoints API

| Método | Path | Auth | Descripción |
| ------ | ---- | ---- | ----------- |
| GET | `/v1/youtube/niches` | JWT | Obtener nichos con scores |
| GET | `/v1/youtube/channels` | JWT | Listar canales del usuario |
| POST | `/v1/youtube/channels` | JWT | Crear canal (dispara generación async) |
| GET | `/v1/youtube/channels/:id` | JWT | Obtener canal con ideas |
| POST | `/v1/youtube/channels/:id/ideas/regenerate` | JWT | Regenerar ideas |
| POST | `/v1/youtube/ideas/:id/script` | JWT | Generar script |
| POST | `/v1/youtube/ideas/:id/prompts` | JWT | Generar 5 prompts IA |
| PATCH | `/v1/youtube/ideas/:id/seo` | JWT | Actualizar SEO |
| PATCH | `/v1/youtube/ideas/:id/metrics` | JWT | Actualizar métricas |
| PATCH | `/v1/youtube/ideas/:id/status` | JWT | Cambiar status |
| GET | `/v1/youtube/channels/:id/monetization` | JWT | Obtener setup |
| PATCH | `/v1/youtube/channels/:id/monetization/steps/:stepId` | JWT | Completar paso |
| GET | `/v1/admin/modules` | JWT (superadmin) | Listar visibilidad |
| PATCH | `/v1/admin/modules/:name` | JWT (superadmin) | Actualizar visibilidad |

#### Componentes UI

| Componente | Ubicación | Descripción |
| ---------- | ---------- | ----------- |
| NicheCard | `components/youtube/NicheCard.tsx` | Card de nicho con score |
| ChannelRow | `components/youtube/ChannelRow.tsx` | Fila de canal en lista |
| IdeaRow | `components/youtube/IdeaRow.tsx` | Fila de idea en lista |
| PromptCard | `components/youtube/PromptCard.tsx` | Card de prompt IA |
| SeoSheet | `components/youtube/SeoSheet.tsx` | Sheet de SEO editable |
| MonetizationChecklist | `components/youtube/MonetizationChecklist.tsx` | Checklist de monetización |
| YPPCalculator | `components/youtube/YPPCalculator.tsx` | Calculadora de tiempo YPP |
| CreateChannelModal | `components/youtube/CreateChannelModal.tsx` | Modal de creación |

### Constraints

| Constraint | Límite |
| ----------- | ----- |
| Performance | < 200ms p95 para endpoints |
| Rate Limit | 100 requests/min por usuario |
| Seguridad | JWT + validación de roles + ModuleVisibility |
| IA Fallback | retry automático entre 5 proveedores |

---

## Tasks

### Phase 1: Backend

- [ ] **T01**: Crear entidades (Niche, Channel, ContentIdea, AIVideoPrompt, MonetizationSetup, ModuleVisibility)
- [ ] **T02**: Crear DTOs (CreateChannelDto, UpdateIdeaDto, UpdateMetricsDto, UpdateVisibilityDto)
- [ ] **T03**: Implementar YoutubeService
- [ ] **T04**: Implementar YoutubeController
- [ ] **T05**: Implementar ModuleVisibilityService
- [ ] **T06**: Crear YoutubeAccessGuard
- [ ] **T07**: Registrar YoutubeModule en app.module.ts
- [ ] **T08**: Agregar tests unitarios

### Phase 2: Frontend

- [ ] **T09**: Crear pages (V1-V7)
- [ ] **T10**: Crear componentes UI
- [ ] **T11**: Crear lib/youtube/ai.ts (wrapper de ai-core)
- [ ] **T12**: Crear API routes
- [ ] **T13**: Agregar internacionalización

### Phase 3: Integración

- [ ] **T14**: Integrar con ai-core
- [ ] **T15**: Testing E2E

### Phase 4: Validación

- [ ] **T16**: Verificar acceptance criteria
- [ ] **T17**: Actualizar documentación

---

## Notas de Implementación

> El módulo usa `@ai-lab/ai-core` para toda generación de texto:
> - `generateText()` - función principal
> - `isExhaustedError()` - para manejar errores de providers
> - Fallback automático entre proveedores (Gemini → Groq → OpenAI → DeepSeek → Anthropic)
>
> Los system prompts están en español. Si se necesita inglés, parametrizar en `lib/youtube/ai.ts`.

---

## Historial de Cambios

| Fecha      | Versión | Cambio           | Autor |
| ---------- | ------- | ---------------- | ----- |
| 2026-03-16 | 1.0.0   | Creación inicial | Dann |

---

## Referencias

- Spec completa: proporcionada por el usuario
- ai-core: `packages/ai-core/src/index.ts`
- AGENTS.md: reglas de desarrollo
