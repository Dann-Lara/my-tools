# Contributing Guide / Guía de Contribución

## Setup / Configuración

Follow the [README Quick Start](README.md#quick-start--inicio-rápido).

> **Important / Importante:** Run `npm run docker:up` before `npm run dev` — the backend needs PostgreSQL.

---

## Commit Convention / Convención de Commits

### Formato / Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Tipos permitidos / Allowed Types

| Tipo         | Descripción          | Cuando usar                                  |
| ------------ | -------------------- | -------------------------------------------- |
| **feat**     | Nueva funcionalidad  | Cuando agregas algo nuevo                    |
| **fix**      | Bug fix              | Cuando corriges un error                     |
| **docs**     | Documentación        | Cambios en docs/README                       |
| **style**    | Formateo             | Sin cambio de código (lint)                  |
| **refactor** | Refactorización      | Reorganizar código sin cambiar funcionalidad |
| **test**     | Tests                | Agregar o modificar tests                    |
| **perf**     | Performance          | Mejoras de rendimiento                       |
| **chore**    | Mantenimiento        | Tareas de mantenimiento                      |
| **i18n**     | Internacionalización | Agregar traducciones                         |

### Scopes permitidos / Allowed Scopes

```
frontend, backend, apps, modules, ai-core, shared, n8n, docker,
ci, deps, config, docs, specs, skills
```

### Ejemplos / Examples

```
feat(applications): add CV evaluation endpoint
fix(checklists): handle null reminder preferences
docs(README): update installation steps
i18n(frontend): add French locale messages
refactor(applications): split service into smaller services
perf(database): add index on user email
chore(docker): update postgres to 16.3
fix(auth): handle JWT token expiration
feat(checklists): add AI-generated task suggestions
```

### Reglas / Rules

1. **Usa tiempos verbales en presente**: "add" no "added"
2. **Primera letra en minúscula** después del scope
3. **No exceedas 72 caracteres** en el subject line
4. **Body y footer opcionales** para detalles o refs a issues

---

## Internationalization / Internacionalización

### Adding translations / Agregando traducciones

1. Add keys to `apps/frontend/messages/en.json` AND `es.json`
2. Access in components: `const t = useTranslations('namespace')`
3. For server components: `import { useTranslations } from 'next-intl'`
4. For client components: same import but with `'use client'`

### Adding a new language / Agregar nuevo idioma

```typescript
// apps/frontend/lib/i18n.ts
export const locales = ['en', 'es', 'fr'] as const; // add here

// apps/frontend/messages/fr.json  ← create this file
// apps/frontend/components/ui/LanguageSwitcher.tsx ← add label
```

---

## Theming / Temas

Use CSS utility classes defined in `globals.css`:

- `.card` — white/dark-aware card container
- `.btn-primary` — blue primary button
- `.btn-secondary` — neutral secondary button
- `.input` — dark-aware text input
- `.label` — form label

Always pair light/dark variants:

```tsx
className = 'bg-white dark:bg-slate-900';
className = 'text-slate-900 dark:text-slate-100';
className = 'border-slate-200 dark:border-slate-700';
```

---

## Animations / Animaciones

Use hooks from `apps/frontend/hooks/useAnime.ts`:

- `useFadeInUp(options)` — fade + slide up entrance
- `useStaggerIn(options)` — staggered children entrance

Add new animations in `tailwind.config.ts` under `keyframes` + `animation`.

---

## Adding a Backend Module / Agregar módulo NestJS

```bash
# 1. Create structure
mkdir -p apps/backend/src/modules/my-feature/{dto}

# 2. Create: my-feature.module.ts, my-feature.service.ts, my-feature.controller.ts
# 3. Register in apps/backend/src/app.module.ts
# 4. Add tests: my-feature.service.spec.ts
```

## Adding AI Capabilities / Agregar capacidades IA

Add to `packages/ai-core/src/chains/` or `packages/ai-core/src/agents/`:

```typescript
// packages/ai-core/src/chains/my-chain.ts
export async function myChain(input: string): Promise<string> {
  const llm = getLLM({ temperature: 0.5 });
  // ... LangChain logic
}
```

Export from `packages/ai-core/src/index.ts`.

---

## Branching / Ramas

- `main` — producción
- `develop` — integración
- `feat/<scope>/<description>` — nuevas features
- `fix/<scope>/<description>` — bug fixes
