# AI Agents Development Rules — My Tools

> Rules for AI coding assistants (Claude, Cursor, Copilot, etc.) working on this codebase.  
> **Read `PROJECT.md` first for project context, then this file.**

---

## 0. Non-negotiable Rules

1. **Never break existing functionality** — if uncertain, ask before deleting or renaming.
2. **Never hardcode secrets** — use `process.env` / `ConfigService`. Zero secrets in code.
3. **Never bypass TypeScript** — no `any`, no `ts-ignore`, no `as unknown as X` chains.
4. **Never commit `.env` files** — only `.env.example` goes in git.
5. **Read before writing** — always read the target file fully before editing.

---

## 1. Project Architecture

```
my-tools/
├── apps/
│   ├── backend/              NestJS API (port 3001)
│   │   └── src/modules/
│   │       ├── auth/         Autenticación (JWT, login, signup)
│   │       ├── users/        Gestión de usuarios y perfiles
│   │       ├── checklists/  Módulo de checklists con IA
│   │       ├── applications/ # Módulo de postulaciones laborales
│   │       ├── ai/           Endpoints AI
│   │       └── webhooks/     Integración con n8n
│   └── frontend/             Next.js 14 App Router (port 3000)
│       ├── app/
│       │   ├── admin/        Panel de admin
│       │   ├── client/       Panel de cliente
│       │   └── checklists/   UI de checklists
│       └── components/
│           └── ui/          Componentes compartidos
├── packages/
│   ├── ai-core/              Motor de IA multi-proveedor
│   └── shared/               Tipos y DTOs compartidos
├── n8n-workflows/            Automatización
├── docs/                    Documentación
└── .agents/                  AI Agent Skills
```

### Context Documentation

**Before working on any module, read its specific README:**

- Backend: `apps/backend/src/modules/[module]/README.md`
- Packages: `packages/[package]/README.md`
- n8n: `n8n-workflows/README.md`

### Backend — NestJS v10, TypeORM, PostgreSQL

- All routes versioned at `/v1/` via `enableVersioning()`
- Auth: JWT (`JwtAuthGuard`) or webhook secret (`JwtOrWebhookSecretGuard`)
- n8n endpoints **always** use `JwtOrWebhookSecretGuard` + `x-webhook-secret` header
- Every new module needs: `entity`, `dto`, `service`, `controller`, `module`

### Frontend — Next.js 14 App Router, TypeScript strict

- All API calls go through `/api/*` (proxied in `next.config.ts`)
- API client lives in `apps/frontend/lib/checklists.ts` — add methods there
- Auth state via `useAuth(roles)` hook — always pass allowed roles array
- Components > 200 lines **must** be split (see §4)

---

## 2. Authentication Model

| Caller        | Header                    | Guard                     |
| ------------- | ------------------------- | ------------------------- |
| Web UI (user) | `Authorization: Bearer …` | `JwtAuthGuard`            |
| n8n workflows | `x-webhook-secret: …`     | `JwtOrWebhookSecretGuard` |
| Both allowed  | either                    | `JwtOrWebhookSecretGuard` |

`JwtOrWebhookSecretGuard` sets `req.webhookAuth = true` when secret matches.  
Controllers check this flag to skip user ownership queries.

---

## 3. n8n Workflow Conventions

- **All HTTP nodes** use credential: `Header Auth account` (id `EfBrBbQ88fwJlS4R`)
- **All Telegram nodes** use credential: `Telegram account` (id `8JyddEiApG6k1J3x`)
- **Variable syntax**: use `$env.BACKEND_PUBLIC_URL` (NOT `$vars.`)
- **Callback data format**: `"action:checklistId:itemId"` — always 3 parts
- After fixing a workflow: verify credentials are not id `"1"` or `"2"` (those are placeholders)

---

## 4. File Size Rules

| File Type       | Soft Limit | Hard Limit | Action                          |
| --------------- | ---------- | ---------- | ------------------------------- |
| Page (`.tsx`)   | 200 lines  | 300 lines  | Extract step/section components |
| Component       | 150 lines  | 250 lines  | Extract sub-components          |
| Service (`.ts`) | 300 lines  | 500 lines  | Split into focused services     |
| Controller      | 100 lines  | 150 lines  | Already at limit                |

**Fragmentation pattern for pages:**

```
app/checklists/new/
  page.tsx                  ← orchestrator only (~150 lines)
components/checklists/new-wizard/
  StepQuestionnaire.tsx
  StepReview.tsx
  StepGenerating.tsx
  StepDone.tsx
  RegenModal.tsx
```

---

## 5. Backend Coding Standards

```typescript
// ✅ DO
async findOne(userId: string, id: string): Promise<ChecklistEntity> {
  const checklist = await this.repo.findOne({
    where: { id, userId },
    relations: ['items'],
  });
  if (!checklist) throw new NotFoundException('Checklist not found');
  return checklist;
}

// ❌ DON'T — no raw SQL, no any, no missing null check
const r = await this.repo.query(`SELECT * FROM checklists WHERE id = '${id}'`);
```

- Use `NotFoundException`, `BadRequestException`, `ForbiddenException` from `@nestjs/common`
- Validate all DTOs with `class-validator` decorators
- Log with `this.logger = new Logger(ClassName.name)` — never `console.log` in production code
- Wrap external API calls (Telegram, AI) in try/catch with `this.logger.warn()`

---

## 6. Frontend Coding Standards

```typescript
// ✅ DO — typed state, named handlers
const [loading, setLoading] = useState(false);
async function handleSave() { ... }

// ❌ DON'T — inline async in JSX
<button onClick={async () => { await save(); }}>

// ✅ DO — void wrapper for async handlers in JSX
<button onClick={() => void handleSave()}>
```

- All async handlers named `handle*` — called from JSX with `() => void handle*()`
- All API calls in `lib/checklists.ts` — never `fetch()` directly in components
- Use `suppressHydrationWarning` only on elements with date/locale-dependent text
- Never use `localStorage` directly — use the `useAuth` / token utilities

---

## 7. TypeORM Entity Rules

- Every entity has `@CreateDateColumn()` and `@UpdateDateColumn()`
- Foreign keys use `@Column({ name: 'checklist_id' })` + `@ManyToOne` with named join
- Boolean flags default to `false`: `@Column({ default: false })` reminderSent!: boolean
- Soft delete preferred over hard delete for user data

---

## 8. Environment Variables

- New vars go in **both** `.env.example` AND `docs/DEPLOYMENT.md`
- Backend accesses via `this.configService.get<string>('VAR_NAME', 'fallback')`
- Frontend accesses via `process.env.NEXT_PUBLIC_*` (public) or API calls (private)
- Never log env values — only log `!!process.env.VAR_NAME` (boolean presence)

---

## 9. Git Conventions

> See also: [Commit Workflow](docs/commit-workflow.md) for branch naming, testing rules, and PR creation.

```
feat(checklists): add send-to-telegram endpoint
fix(n8n): align workflow credentials to correct IDs
refactor(frontend): fragment new-checklist page into wizard steps
docs: add deployment guide for staging/prod
```

- Prefix: `feat`, `fix`, `refactor`, `docs`, `chore`, `test`
- Scope in parentheses: module or file area affected
- Present tense, lowercase, no period at end
- Reference issue number if applicable: `fix(auth): resolve JWT expiry #42`

---

## 10. Module Documentation Rules

When adding a **feature** or **improvement** to any module:

1. **Update the module README** in:
   - Backend: `apps/backend/src/modules/[module]/README.md`
   - Package: `packages/[package]/README.md`
   - n8n: `n8n-workflows/README.md`

2. **Include in the update:**
   - New functionality added
   - New endpoints (method, path, auth, description)
   - New entities or database changes
   - New environment variables
   - AI considerations (if applicable)

3. **Keep the changelog** at the bottom of each module README

---

## 11. Spec-Driven Development (SDD)

This project uses **Spec-Anchored Development** — specs are the primary contract.

### Key Rules

1. **No coding without APPROVED spec** — all features must have an approved spec
2. **Use the template**: `cp specs/features/template.md specs/features/F0XX-name.md`
3. **Never modify spec without stakeholder approval**
4. **If scope changes**: create new spec or amendment

### Workflow

```
1. Create SPEC (DRAFT)
       ↓
2. Stakeholder review → APPROVED (required)
       ↓
3. Break into Tasks (by module/file)
       ↓
4. Implementation
       ↓
5. Validate: spec == implementation
       ↓
6. COMPLETED → Update module docs
```

### For New Features

1. Create spec in `specs/features/F0XX-name.md`
2. Fill following `specs/SPEC.md` constitution
3. Add to `specs/FEATURES.md` index
4. Get stakeholder APPROVAL
5. Implement following tasks

### References

| Document                     | Purpose              |
| ---------------------------- | -------------------- |
| `specs/SPEC.md`              | Project constitution |
| `specs/FEATURES.md`          | Features index       |
| `specs/features/template.md` | Spec template        |

---

## 12. Commit Convention

### Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Allowed Types

| Type         | Description          | When to Use                               |
| ------------ | -------------------- | ----------------------------------------- |
| **feat**     | New feature          | Adding something new                      |
| **fix**      | Bug fix              | Fixing an error                           |
| **docs**     | Documentation        | Changes to docs/README                    |
| **style**    | Formatting           | No code change (lint)                     |
| **refactor** | Refactoring          | Reorganize code without changing behavior |
| **test**     | Tests                | Adding or modifying tests                 |
| **perf**     | Performance          | Performance improvements                  |
| **chore**    | Maintenance          | Maintenance tasks                         |
| **i18n**     | Internationalization | Adding translations                       |

### Allowed Scopes

```
frontend, backend, apps, modules, ai-core, shared, n8n, docker,
ci, deps, config, docs, specs, skills
```

### Examples

```
feat(applications): add CV evaluation endpoint
fix(checklists): handle null reminder preferences
docs(README): update installation steps
i18n(frontend): add French locale messages
refactor(applications): split service into smaller services
perf(database): add index on user email
chore(docker): update postgres to 16.3
fix(auth): handle JWT token expiration
```

### Rules

1. **Use present tense**: "add" not "added"
2. **Lowercase first letter** after the scope
3. **Max 72 characters** in subject line
4. **Body and footer optional** for details or issue refs

---

## 13. Dark / Light Mode Compliance

Every new design or UI component **must** support both color modes:

- Use Tailwind's `dark:` variants for all colors — never hardcode a single-mode color.
- Background: `bg-white dark:bg-slate-900` / `bg-slate-50 dark:bg-slate-950`
- Text: `text-slate-900 dark:text-white` / `text-slate-600 dark:text-slate-300`
- Borders: `border-slate-200 dark:border-slate-800`
- Never use CSS `color`, `background-color`, or inline styles for theme-sensitive values.
- Test visually in both modes before marking a UI task done.

---

## 14. No Emojis in Code

**Never use emoji characters in code** — they cause encoding issues and aren't accessible:

- ✅ **DO**: Use SVG icons or React components (e.g., `<IconDownload />`)
- ✅ **DO**: Use CSS-based indicators (e.g., colored dots, status badges)
- ❌ **DON'T**: Use emoji like 🚀, ✅, 📝, 🔷 in JSX or strings

```typescript
// ✅ DO — use icons
import { IconCheck, IconArrow } from './icons';
<span><IconCheck /> Done</span>

// ❌ DON'T — emoji in code
<span>✅ Done</span>
```

If you need visual indicators, create icon components in `apps/frontend/components/ui/icons/`.

---

## 15. i18n for All User-Facing Text

**Every** string shown to the user must use the i18n system — no hardcoded text in components:

- All labels, messages, errors, placeholders, and button text go through `t.*` keys.
- Add new keys to **both** `checklistES` / `checklistEN` (or the relevant file) at the same time.
- Never leave a fallback like `t.foo ?? 'Texto en español'` — add the key instead.
- Error messages thrown from API calls must be translatable (use `t.common.error` or a specific key).
- Files: `apps/frontend/lib/i18n/*.ts` — one file per domain (`checklist`, `common`, `auth`, etc.).
- After adding keys, verify the EN translation is also filled in (no untranslated EN strings).

Before marking any task done:

1. TypeScript compiles without errors: `cd apps/backend && npx tsc --noEmit`
2. No new `console.log` in committed code
3. New endpoints have `@ApiOperation({ summary: '...' })` for Swagger
4. New components have no inline style blocks (use Tailwind classes)
5. n8n workflow credential IDs match the project standard (`EfBrBbQ88fwJlS4R` / `8JyddEiApG6k1J3x`)
6. Module documentation updated if changes affect a module (see §10)
7. Spec created/updated if new feature (see §10)

---

## 15. Testing Rules

Every feature, fix, or refactor **must** include test code:

1. **New features**: Add tests in `__tests__/` folder alongside the component/service
2. **Bug fixes**: Add regression tests to prevent future breakage
3. **Refactors**: Ensure existing tests still pass

### Test Requirements

- Run tests **before** pushing: `npm run test`
- All tests must pass before creating PR/merge
- Push is blocked until: `npm run test` passes

### Test File Locations

```
apps/frontend/components/[module]/__tests__/
apps/backend/src/modules/[module]/[module].service.spec.ts
```

---

## 16. Development Rule: Spec + Test Before Push

> ⚠️ **This rule is mandatory for all features.**

**Never push directly to master. Always use PR workflow:**

1. ✅ **Create SPEC**: Create or update spec in `specs/features/F0XX-name.md`
2. ✅ **Create Branch**: `git checkout -b feat/F0XX-description` from master
3. ✅ **Implement**: Build the feature following SDD workflow
4. ✅ **Add Tests**: Tests in `__tests__/` or `.spec.ts`
5. ✅ **Run Tests**: `npm run test` must pass
6. ✅ **Run Typecheck**: `npm run type-check` must pass
7. ✅ **Commit & Push**: Push branch and create PR
8. ✅ **Review**: Wait for review, address feedback
9. ✅ **Merge**: Only merge after approval and CI passing

**Quick Reference:**
```bash
# Start new feature
git checkout master
git pull
git checkout -b feat/F038-landing-redesign

# After implementation
git add .
git commit -m "feat: add landing page redesign"
git push -u origin feat/F038-landing-redesign

# Create PR on GitHub
gh pr create --title "feat(frontend): landing page redesign" --body "..."
```

## AI Agent Skills

This project includes specialized skills for AI agents. Use the `skill` tool to load them:

> **Quick config files**: This project also uses `.cursorrules` for Cursor-specific rules.

| Skill | Purpose | When to Use |
|-------|---------|-------------|
| `typeorm` | TypeORM development guidelines | When working with entities, repositories, migrations, or database queries |
| `vercel-react-best-practices` | React/Next.js performance optimization | When writing or refactoring React/Next.js components or pages |
| `tailwindcss` | TailwindCSS utility classes | When styling any component - check here for responsive design patterns |
| `clean-code` | Clean code principles (SOLID, DRY, KISS) | When refactoring code or solving architectural decisions |
| `nestjs-best-practices` | NestJS architecture patterns | When working on backend modules, controllers, services, or guards |
| `docker-security-guide` | Docker container security | When writing Dockerfiles, docker-compose files, or reviewing container security |
| `pdf-ats` | ATS-friendly PDF generation | When working with PDF generation for CVs or resumes |
| `uxui` | UX/UI design principles | When designing new components, pages, or user flows |
| `anime-js` | Animation guidelines | When adding animations or transitions to components |
| `n8n-workflow-patterns` | n8n workflow patterns | When creating n8n automations and workflows |
| `webhook-integration` | Webhook best practices | When implementing webhook endpoints and integrations |
| `supabase-postgres-best-practices` | PostgreSQL optimization | When writing SQL queries, migrations, or database optimizations |

> **Note**: The `skill` tool is available in this environment. To load a skill, use: `skill(name: 'skill-name')`
> 
> **Global skills**: Some skills are installed globally in `~/.agents/skills/` and are available for all agents.
