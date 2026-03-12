# Commit & PR Workflow

> Rules for AI agents and developers working on this codebase.

---

## Branch Naming

```
feature/F015-optimizar-backend
bugfix/F015-fix-error
```

Format: `<type>/<FXXX>-<short-description>`

| Type | Use Case |
|------|----------|
| `feature/` | New features (from specs) |
| `bugfix/` | Bug fixes |
| `hotfix/` | Urgent production fixes |

---

## Workflow

### 1. Create Branch from Master

```bash
git checkout master
git pull origin master
git checkout -b feature/F015-optimizar-backend
```

### 2. Develop & Test Locally

```bash
# Run ALL tests before any commit
npm test

# If tests fail → fix until all pass
```

### 3. Only When Tests Pass → Commit + Push

```bash
# Stage changes
git add .

# Commit (following conventional commits)
git commit -m "feat(backend): F015 - optimize AI prompts"

# Push and set upstream
git push -u origin feature/F015-optimizar-backend
```

### 4. Create PR on GitHub

- **Title**: `[F015] Optimizar Backend`
- **Description**: Link to the spec (`specs/features/F015-...md`)
- **Base branch**: `master`

---

## Rules

| Rule | Description |
|------|-------------|
| ❌ | **NO** commit if tests fail |
| ❌ | **NO** commit directly to master |
| ✅ | Always create new branch per spec |
| ✅ | Tests must pass locally before push |
| ✅ | Use conventional commit format |

---

## Pre-commit Hook

The pre-commit hook (`npm test`) runs automatically before each commit:

```bash
# .husky/pre-commit
npm test && npx lint-staged
```

If tests fail, the commit is blocked until fixed.

---

## Related Documents

- [AGENTS.md](../AGENTS.md) - Full development rules
- [specs/SPEC.md](../specs/SPEC.md) - Spec constitution
- [specs/FEATURES.md](../specs/FEATURES.md) - Features index
