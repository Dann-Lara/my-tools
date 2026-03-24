# F041: Password Recovery

> Estado: DRAFT
> Fecha de creación: 2026-03-24
> Última actualización: 2026-03-24

---

## Contexto

| Campo           | Descripción                                                                  |
| --------------- | ---------------------------------------------------------------------------- |
| **Módulo**      | auth                                                                         |
| **Usuario**     | client, admin                                                                |
| **Problema**    | Usuarios que olvidan su contraseña no pueden recuperar acceso a sus cuentas  |
| **Solicitante** | Product Owner                                                                |
| **Prioridad**   | Alta                                                                         |
| **Depende de**  | F040 (Google OAuth) - puede funcionar independientemente pero complementario |

---

## spec (Qué y Por Qué)

### User Stories

- Como **usuario que olvida su contraseña**, quiero poder recuperarla via email para seguir usando la plataforma.
- Como **usuario con cuenta Google vinculada**, quiero poder restablecer mi contraseña para acceder sin Google.
- Como **desarrollador**, quiero un flujo de recuperación seguro que prevenga ataques de enumeración de emails.

### Acceptance Criteria

- [ ] **AC01**: Enlace "¿Olvidaste tu contraseña?" visible en `/login`
- [ ] **AC02**: Página de solicitud de recuperación con campo email
- [ ] **AC03**: Envío de email con enlace único de recuperación (token)
- [ ] **AC04**: Enlace expira después de 1 hora
- [ ] **AC05**: Enlace de un solo uso (se invalida después de usar)
- [ ] **AC06**: Nueva contraseña guardada con hash bcrypt
- [ ] **AC07**: Confirmación visual de contraseña cambiada
- [ ] **AC08**: Rate limiting: máximo 3 solicitudes por email por hora
- [ ] **AC09**: No revelar si el email existe o no (previene enumeración)
- [ ] **AC10**: Tests para el flujo de recuperación
- [ ] **AC11**: i18n para todos los textos (ES/EN)

### Funcionalidad Esperada

#### Flujo de Recuperación

```
1. Usuario clickea "¿Olvidaste tu contraseña?" en /login
2. Se muestra formulario con campo email
3. Usuario ingresa email y clickea "Enviar enlace"
4. Backend:
   - Verifica si existe usuario con ese email (sin revelar si existe o no)
   - Si existe Y tiene password: genera token único (UUID + timestamp)
   - Guarda token en tabla password_reset_tokens
   - Envía email con enlace: /reset-password?token=xxx
   - Si no existe usuario o no tiene password: muestra mensaje genérico
5. Email recibido por el usuario:
   - Contains: "Restablecer contraseña" + enlace
   - Enlace válido por 1 hora
6. Usuario clickea enlace:
   - Backend verifica token: existe, no expirado, no usado
   - Muestra formulario de nueva contraseña
7. Usuario ingresa nueva contraseña (mínimo 8 caracteres)
8. Backend:
   - Hash password con bcrypt
   - Actualiza password del usuario
   - Invalida token
   - Muestra confirmación
9. Usuario puede hacer login con nueva contraseña
```

### Edge Cases

| ID   | Descripción                                   | Comportamiento Esperado                                            |
| ---- | --------------------------------------------- | ------------------------------------------------------------------ |
| EC01 | Email no existe en sistema                    | Mostrar mensaje genérico "Si el email existe, recibirás un enlace" |
| EC02 | Usuario con solo cuenta Google (sin password) | Mostrar mensaje genérico, no enviar email                          |
| EC03 | Token ya usado                                | Mostrar error "Enlace inválido o expirado"                         |
| EC04 | Token expirado (> 1 hora)                     | Mostrar error "Enlace expirado, solicita otro"                     |
| EC05 | Misma IP solicita many reset emails           | Rate limit: 3 por hora por IP                                      |
| EC06 | Mismo email solicita many reset emails        | Rate limit: 3 por hora por email                                   |
| EC07 | Password nueva es igual a la anterior         | Permitir (no validar historial)                                    |
| EC08 | Password nueva muy débil (< 8 chars)          | Validación: mínimo 8 caracteres                                    |

---

## plan (Cómo)

### Stack

| Tecnología          | Uso             | Versión |
| ------------------- | --------------- | ------- |
| NestJS              | Backend API     | 10.x    |
| Next.js             | Frontend        | 14.x    |
| Resend / Nodemailer | Envío de emails | —       |
| TypeORM             | ORM             | 0.3.x   |

### Servicios de Email Soportados

| Servicio | Configuración           | Notas                    |
| -------- | ----------------------- | ------------------------ |
| Resend   | API key                 | Recomendado, fácil setup |
| SMTP     | Host, port, credentials | Genérico                 |
| Mock     | Para desarrollo         | Logs en consola          |

### Arquitectura

#### Nueva Entidad

**`password-reset-token.entity.ts`**:

```typescript
@Entity('password_reset_tokens')
export class PasswordResetTokenEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id' })
  userId!: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;

  @Column({ type: 'varchar', unique: true })
  token!: string;

  @Column({ type: 'timestamp' })
  expiresAt!: Date;

  @Column({ default: false })
  used!: boolean;

  @CreateDateColumn()
  createdAt!: Date;
}
```

#### Endpoints Backend

| Método | Path                       | Auth | Descripción                     |
| ------ | -------------------------- | ---- | ------------------------------- |
| POST   | `/v1/auth/forgot-password` | None | Solicita enlace de recuperación |
| POST   | `/v1/auth/reset-password`  | None | Restablece contraseña con token |

#### Endpoints Frontend

| Método | Path                        | Descripción                      |
| ------ | --------------------------- | -------------------------------- |
| GET    | `/forgot-password`          | Formulario de solicitud de email |
| GET    | `/reset-password?token=xxx` | Formulario de nueva contraseña   |

### Variables de Entorno

```env
# Backend (.env.example)
EMAIL_PROVIDER=resend  # resend | smtp | mock
RESEND_API_KEY=re_xxx
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=user
SMTP_PASS=pass
EMAIL_FROM=noreply@mytools.dev
PASSWORD_RESET_EXPIRY_HOURS=1

# Frontend
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Flujo de Email

```
Solicitud de recuperación:

/forgot-password → POST /v1/auth/forgot-password →
  → Busca usuario → Genera token → Guarda en DB →
  → Envía email via Resend/SMTP →
  → Email contains: /reset-password?token=xxx
```

---

## Tasks

### Phase 1: Backend

- [ ] **T01**: Crear entidad `PasswordResetTokenEntity`
- [ ] **T02**: Crear DTOs: `ForgotPasswordDto`, `ResetPasswordDto`
- [ ] **T03**: Implementar `AuthService.forgotPassword()`
- [ ] **T04**: Implementar `AuthService.resetPassword()`
- [ ] **T05**: Crear servicio de email (`EmailService`)
- [ ] **T06**: Agregar endpoints en `auth.controller.ts`
- [ ] **T07**: Implementar rate limiting para forgot-password
- [ ] **T08**: Tests para forgot/reset password

### Phase 2: Frontend

- [ ] **T09**: Crear `/app/forgot-password/page.tsx`
- [ ] **T10**: Crear `/app/reset-password/page.tsx`
- [ ] **T11**: Modificar `/login/page.tsx` con enlace "¿Olvidaste tu contraseña?"
- [ ] **T12**: Agregar i18n keys para recuperación de contraseña

### Phase 3: Email

- [ ] **T13**: Configurar servicio de email (Resend recomendado)
- [ ] **T14**: Template de email HTML para recuperación
- [ ] **T15**: Testing de envío de emails

### Phase 4: Validación

- [ ] **T16**: Testing manual del flujo completo
- [ ] **T17**: Verificar edge cases y rate limiting
- [ ] **T18**: Actualizar README del módulo auth
- [ ] **T19**: Agregar a FEATURES.md

---

## Notas de Implementación

### Template de Email

```html
<!-- recovery-email.html -->
<h1>Restablecer contraseña</h1>
<p>Hola {{name}},</p>
<p>Recibimos una solicitud para restablecer tu contraseña.</p>
<p>Click en el siguiente enlace para crear una nueva contraseña:</p>
<a href="{{resetLink}}">Restablecer contraseña</a>
<p>Este enlace expira en 1 hora.</p>
<p>Si no solicitaste este cambio, ignora este email.</p>
```

### Rate Limiting

```typescript
// Por email: 3 solicitudes por hora
// Por IP: 10 solicitudes por hora
// Usar ThrottlerModule de NestJS
```

### Seguridad

1. **Token**: UUID v4 (96 bits de entropía)
2. **Expiry**: 1 hora desde creación
3. **One-time**: Se marca como `used` después de cambiar password
4. **No enumeración**: Siempre mostrar mensaje genérico "Si el email existe, recibirás un correo"
5. **HTTPS**: Requerido en producción para proteger tokens en tránsito

### Estructura de Archivos

```
apps/backend/src/modules/auth/
├── auth.controller.ts              # + forgot-password, reset-password
├── auth.service.ts                 # + forgotPassword, resetPassword
├── entities/
│   └── password-reset-token.entity.ts  # NUEVO
├── dto/
│   ├── forgot-password.dto.ts     # NUEVO
│   └── reset-password.dto.ts      # NUEVO
└── email/
    ├── email.service.ts           # NUEVO
    └── templates/
        └── recovery-email.hbs    # NUEVO (Handlebars template)

apps/frontend/
├── app/forgot-password/
│   └── page.tsx                  # NUEVO
├── app/reset-password/
│   └── page.tsx                 # NUEVO
├── app/login/page.tsx            # + enlace "¿Olvidaste tu contraseña?"
└── lib/i18n/
    └── auth.ts                   # + recovery keys
```

### Testing Strategy

```typescript
describe('Password Recovery', () => {
  it('sends email for existing user with password', async () => { ... });
  it('does not reveal if email exists', async () => { ... });
  it('does not send for Google-only accounts', async () => { ... });
  it('resets password with valid token', async () => { ... });
  it('rejects expired token', async () => { ... });
  it('rejects used token', async () => { ... });
  it('rate limits by email', async () => { ... });
});
```

---

## Dependencias

| Dependencia            | Versión | Notas                          |
| ---------------------- | ------- | ------------------------------ |
| nodemailer             | ^6.9.0  | Para SMTP                      |
| @nestjs-modules/mailer | ^2.0.0  | Wrapper NestJS para nodemailer |
| handlebars             | ^4.7.0  | Templates de email             |

Opcional (para Resend):
| Dependencia | Versión | Notas |
| ----------------- | -------- | ------------------------ |
| resend | ^3.0.0 | SDK de Resend |

---

## Historial de Cambios

| Fecha      | Versión | Cambio           | Autor |
| ---------- | ------- | ---------------- | ----- |
| 2026-03-24 | 1.0.0   | Creación inicial | —     |

---

## Referencias

- Módulo: `apps/backend/src/modules/auth/README.md`
- Specs relacionadas:
  - `specs/F040-google-oauth.md` (autenticación Google)
  - `specs/F021-optimizar-modulo-auth.md`
- Constitución: `specs/SPEC.md`
- NestJS Mailer: https://nestjs-modules.mailtrap.io/
- Resend: https://resend.com/
