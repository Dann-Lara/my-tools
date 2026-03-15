# Auth Module — Backend

> Módulo de autenticación del proyecto My Tools.
> Este documento debe actualizarse cada vez que se agregue/modifique funcionalidad de autenticación.

---

## 1. Propósito

Gestionar la autenticación de usuarios mediante JWT (access token + refresh token), login, signup y protección de rutas.

---

## 2. Estructura de Archivos

```
src/modules/auth/
├── auth.controller.ts      # Endpoints REST
├── auth.service.ts        # Lógica de negocio
├── auth.module.ts         # Configuración del módulo
├── strategies/
│   ├── jwt.strategy.ts    # Estrategia JWT para Passport
│   └── local.strategy.ts  # Estrategia local (email + password)
├── guards/
│   ├── jwt-auth.guard.ts           # Protege rutas con JWT
│   ├── jwt-or-webhook.guard.ts     # JWT o webhook secret
│   ├── local-auth.guard.ts         # Login local
│   └── roles.guard.ts              # Verificación de roles
├── decorators/
│   ├── current-user.decorator.ts  # @CurrentUser()
│   └── roles.decorator.ts          # @Roles()
```

---

## 3. Endpoints API

| Método | Path               | Auth    | Descripción                |
| ------ | ------------------ | ------- | -------------------------- |
| POST   | `/v1/auth/login`   | Público | Login con email + password |
| POST   | `/v1/auth/signup`  | Público | Registro de nuevo cliente  |
| POST   | `/v1/auth/refresh` | —       | Refrescar access token     |
| GET    | `/v1/auth/me`      | JWT     | Obtener usuario actual     |

---

## 4. Estrategias de Autenticación

### JWT Strategy

- Valida el token JWT en el header `Authorization: Bearer <token>`
- Extrae `userId`, `email`, `role` del token

### Local Strategy

- Valida credenciales contra la base de datos
- Retorna el usuario si las credenciales son válidas

---

## 5. Guards

| Guard                     | Uso                                             |
| ------------------------- | ----------------------------------------------- |
| `JwtAuthGuard`            | Rutas que requieren JWT (usuarios autenticados) |
| `LocalAuthGuard`          | Endpoint de login                               |
| `JwtOrWebhookSecretGuard` | Rutas accesibles por JWT o webhook secret (n8n) |
| `RolesGuard`              | Verifica que el usuario tenga el rol requerido  |

---

## 6. Decoradores

### @CurrentUser()

Extrae el usuario actual del request:

```typescript
@Get('profile')
getProfile(@CurrentUser() user: JwtUser) {
  return user; // { userId, email, role }
}
```

### @Roles(...roles)

Restringe acceso por rol:

```typescript
@Roles('superadmin', 'admin')
@Controller('users')
export class UsersController { ... }
```

---

## 7. Variables de Entorno

| Variable                 | Descripción                                          |
| ------------------------ | ---------------------------------------------------- |
| `JWT_SECRET`             | Secret para firmar tokens JWT                        |
| `JWT_EXPIRES_IN`         | Tiempo de expiración del access token (default: 15m) |
| `JWT_REFRESH_EXPIRES_IN` | Tiempo de expiración del refresh token (default: 7d) |

---

## 8. Flujos de Usuario

### Login

1. Usuario envía `POST /v1/auth/login` con email + password
2. `LocalAuthGuard` valida credenciales
3. `AuthService.login()` genera access + refresh tokens
4. Retorna tokens al cliente

### Refresco de Token

1. Cliente envía `POST /v1/auth/refresh` con refresh token
2. `AuthService.refresh()` valida y genera nuevos tokens
3. Retorna nuevos access + refresh tokens

---

## 9. Historial de Cambios

| Fecha      | Versión | Cambios             |
| ---------- | ------- | ------------------- |
| 2026-03-11 | 1.0.0   | Creación del módulo |

---

## 10. Referencias

- `apps/backend/src/modules/auth/auth.service.ts`
- `apps/backend/src/modules/auth/auth.controller.ts`
- `PROJECT.md` — Contexto general del proyecto
- `AGENTS.md` — Reglas de desarrollo
- `specs/FEATURES.md` — Índice de features
- `specs/SPEC.md` — Constitución SDD
