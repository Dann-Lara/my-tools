# F040: Google OAuth Authentication

> Estado: APPROVED
> Fecha de creación: 2026-03-24
> Última actualización: 2026-03-24

---

## Contexto

| Campo           | Descripción                                                                               |
| --------------- | ----------------------------------------------------------------------------------------- |
| **Módulo**      | auth                                                                                      |
| **Usuario**     | client, admin                                                                             |
| **Problema**    | No existe opción de login con Google, los usuarios deben recordar contraseñas adicionales |
| **Solicitante** | Product Owner                                                                             |
| **Prioridad**   | Alta                                                                                      |

---

## spec (Qué y Por Qué)

### User Stories

- Como **usuario nuevo**, quiero registrarme con Google para no crear otra contraseña.
- Como **usuario existente con password**, quiero vincular mi cuenta de Google para login más rápido.
- Como **usuario Google**, quiero que mi perfil tenga mi avatar de Google.
- Como **desarrollador**, quiero que el flujo Google OAuth sea seguro y compatible con el JWT existente.

### Acceptance Criteria

- [ ] **AC01**: Botón "Continuar con Google" visible en `/login`
- [ ] **AC02**: Click en botón redirige a Google OAuth consent screen
- [ ] **AC03**: Callback crea usuario nuevo si no existe (rol: `client`)
- [ ] **AC04**: Callback autentica usuario existente si el email de Google coincide
- [ ] **AC05**: Retorna JWT en URL como query param `?token=xxx&user=yyy`
- [ ] **AC06**: Usuarios Google no tienen password (pueden vincular después desde profile)
- [ ] **AC07**: Avatar de Google se guarda y muestra en el perfil
- [ ] **AC08**: Usuarios con password pueden vincular/desvincular Google desde profile
- [ ] **AC09**: Tests para el flujo completo Google OAuth
- [ ] **AC10**: i18n para botón "Continuar con Google" (ES/EN)

### Flujo OAuth

```
1. Usuario clickea "Continuar con Google"
2. Frontend redirige a /api/auth/google
3. Backend redirige a Google OAuth (consent screen)
4. Usuario acepta permisos
5. Google redirige a /api/auth/google/callback con code
6. Backend intercambia code por tokens con Google
7. Backend verifica email con Google
8. Backend busca usuario por googleId o email:
   - Si existe: genera JWT (login)
   - Si no existe: crea usuario con googleId (registro, rol: client)
9. Backend redirige a frontend con JWT en URL: /auth/google/callback?token=xxx&user=yyy
10. Frontend guarda JWT y redirige a dashboard
```

### Edge Cases

| ID   | Descripción                                                                | Comportamiento Esperado                  |
| ---- | -------------------------------------------------------------------------- | ---------------------------------------- |
| EC01 | Email Google ya registrado con password                                    | Vincular GoogleId al usuario existente   |
| EC02 | Email Google ya registrado sin password (cuenta Google)                    | Login directo, no crear duplicado        |
| EC03 | Usuario existente sin password intenta vincular Google con email diferente | Solo vincular por googleId, no por email |
| EC04 | Token Google expirado durante callback                                     | Redirigir a /login?error=expired         |
| EC05 | Usuario desactiva cuenta                                                   | Rechazar login, mostrar mensaje          |
| EC06 | Google no verifica email (unverified)                                      | Permitir login, guardar email tal cual   |

---

## plan (Cómo)

### Stack

| Tecnología              | Uso              | Versión |
| ----------------------- | ---------------- | ------- |
| NestJS                  | Backend API      | 10.x    |
| Next.js                 | Frontend         | 14.x    |
| passport-google-oauth20 | OAuth Google     | 4.0.x   |
| @nestjs/passport        | Passport wrapper | 10.x    |
| TypeORM                 | ORM              | 0.3.x   |

### Arquitectura

#### Entidades Modificadas

**`user.entity.ts`** - Agregar campos:

```typescript
@Column({ nullable: true, type: 'varchar', unique: true })
googleId?: string;

@Column({ nullable: true, type: 'varchar' })
googleEmail?: string;

@Column({ nullable: true, type: 'text' })
googleAvatarUrl?: string;
```

#### Endpoints Backend

| Método | Path                       | Auth | Descripción                              |
| ------ | -------------------------- | ---- | ---------------------------------------- |
| GET    | `/v1/auth/google`          | None | Redirige a Google OAuth consent screen   |
| GET    | `/v1/auth/google/callback` | None | Callback de Google, redirige a frontend  |
| POST   | `/v1/auth/google/link`     | JWT  | Vincula cuenta Google a usuario logueado |
| DELETE | `/v1/auth/google/link`     | JWT  | Desvincula cuenta Google                 |

#### Endpoints Frontend (Next.js API Routes)

| Método | Path                        | Descripción                               |
| ------ | --------------------------- | ----------------------------------------- |
| GET    | `/api/auth/google`          | Redirige a backend `/v1/auth/google`      |
| GET    | `/api/auth/google/callback` | Recibe callback, redirige a login con JWT |

### Flujo de Redirección

```
Google OAuth Flow:

/login → /api/auth/google → /v1/auth/google (backend) → Google Consent
                                                                      ↓
Google Callback ← /v1/auth/google/callback (backend) ← Google authorize
    ↓
/api/auth/google/callback (frontend) → /login?token=xxx&user=yyy
    ↓
Frontend guarda token → redirect a /dashboard
```

### Variables de Entorno

```env
# Backend (.env.example)
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxx
GOOGLE_CALLBACK_URL=http://localhost:3001/v1/auth/google/callback
FRONTEND_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# Frontend (.env.example)
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## Tasks

### Phase 1: Backend Setup

- [ ] **T01**: Instalar `passport-google-oauth20` y tipos
- [ ] **T02**: Modificar `user.entity.ts` (agregar googleId, googleEmail, googleAvatarUrl)
- [ ] **T03**: Crear DTO `LinkGoogleAccountDto`
- [ ] **T04**: Crear `GoogleStrategy` en `strategies/google.strategy.ts`
- [ ] **T05**: Agregar métodos en `auth.service.ts`: `googleLogin()`, `linkGoogleAccount()`, `unlinkGoogleAccount()`
- [ ] **T06**: Agregar endpoints en `auth.controller.ts`
- [ ] **T07**: Actualizar `auth.module.ts` con GoogleStrategy
- [ ] **T08**: Tests para auth.service (google OAuth)

### Phase 2: Frontend

- [ ] **T09**: Crear componente `GoogleButton` en `components/ui/`
- [ ] **T10**: Modificar `/login/page.tsx` con botón Google y manejo de token en URL
- [ ] **T11**: Crear `/app/api/auth/google/route.ts` (redirección a backend)
- [ ] **T12**: Crear `/app/api/auth/google/callback/route.ts` (manejo de callback)
- [ ] **T13**: Modificar `/admin/profile/page.tsx` con sección "Cuentas vinculadas"
- [ ] **T14**: Agregar i18n keys para Google Button

### Phase 3: Validación

- [ ] **T15**: Testing manual del flujo completo
- [ ] **T16**: Verificar edge cases
- [ ] **T17**: Actualizar README del módulo auth
- [ ] **T18**: Agregar a FEATURES.md

---

## Notas de Implementación

### Google OAuth Flow (RFC 6749)

```
1. Authorization Request
   GET https://accounts.google.com/o/oauth2/v2/auth?
     client_id=xxx&
     redirect_uri=http://localhost:3001/v1/auth/google/callback&
     response_type=code&
     scope=openid email profile&
     state=random_csrf_token

2. Token Exchange (backend -> Google)
   POST https://oauth2.googleapis.com/token
   {
     code, client_id, client_secret, redirect_uri, grant_type=authorization_code
   }

3. User Info (backend -> Google)
   GET https://www.googleapis.com/oauth2/v3/userinfo
   Authorization: Bearer {access_token}
```

### Estructura de Archivos

```
apps/backend/src/modules/auth/
├── auth.module.ts              # + GoogleStrategy
├── auth.service.ts             # + googleLogin, linkGoogle, unlinkGoogle
├── auth.controller.ts         # + /google, /google/callback, /google/link
├── strategies/
│   ├── google.strategy.ts    # NUEVO
│   ├── jwt.strategy.ts
│   └── local.strategy.ts
└── dto/
    └── link-google.dto.ts     # NUEVO

apps/frontend/
├── components/ui/
│   └── GoogleButton.tsx      # NUEVO
├── app/login/page.tsx         # + botón Google + manejo token URL
├── app/api/auth/google/
│   ├── route.ts              # NUEVO (redirect a backend)
│   └── callback/
│       └── route.ts          # NUEVO (recibe callback, redirige con JWT)
└── lib/i18n/
    └── auth.ts               # + googleButton keys
```

### Testing Strategy

```typescript
describe('Google OAuth', () => {
  it('creates new user on first login', async () => { ... });
  it('logs in existing user by email', async () => { ... });
  it('links google to existing user with password', async () => { ... });
  it('prevents linking google with duplicate email', async () => { ... });
  it('unlinks google account', async () => { ... });
});
```

---

## Historial de Cambios

| Fecha      | Versión | Cambio           | Autor |
| ---------- | ------- | ---------------- | ----- |
| 2026-03-24 | 1.0.0   | Creación inicial | —     |

---

## Referencias

- Módulo: `apps/backend/src/modules/auth/README.md`
- Specs relacionadas:
  - `specs/F041-password-recovery.md` (futura - recuperación de contraseña)
  - `specs/F021-optimizar-modulo-auth.md`
- Constitución: `specs/SPEC.md`
- Google OAuth: https://developers.google.com/identity/protocols/oauth2
