# Webhooks Module — Backend

> Módulo de integración con n8n y Telegram del proyecto My Tools.
> Este documento debe actualizarse cada vez que se agregue/modifique funcionalidad de webhooks.

---

## 1. Propósito

Gestionar la integración con herramientas externas mediante webhooks:

- Recepción de eventos de n8n
- Recepción de callbacks de Telegram
- Envío de respuestas a Telegram

---

## 2. Estructura de Archivos

```
src/modules/webhooks/
├── webhooks.controller.ts   # Endpoints REST
├── webhooks.service.ts     # Lógica de negocio
└── webhooks.module.ts      # Configuración del módulo
```

---

## 3. Endpoints API

| Método | Path                             | Auth           | Descripción                        |
| ------ | -------------------------------- | -------------- | ---------------------------------- |
| POST   | `/v1/webhooks/n8n`               | webhook-secret | Recibir eventos de n8n             |
| POST   | `/v1/webhooks/telegram-response` | webhook-secret | Recepción de callbacks de Telegram |

---

## 4. Authentication

Ambos endpoints usan `JwtOrWebhookSecretGuard`:

- JWT: `Authorization: Bearer <token>`
- Webhook: `x-webhook-secret: <secret>`

---

## 5. Flujos de Integración

### n8n → Backend

1. n8n dispara un webhook (recordatorio, feedback, etc.)
2. Backend recibe evento en `/v1/webhooks/n8n`
3. Procesa y retorna respuesta

### Telegram → Backend

1. Usuario interactúa con bot de Telegram
2. Telegram envía callback al backend
3. Backend procesa y responde

---

## 6. Integración con n8n

Este módulo recibe eventos de los workflows de n8n:

- **Checklist Reminders**: Recordatorios de tareas
- **Telegram Responses**: Respuestas del bot
- **Weekly Feedback**: Feedback semanal con IA

Ver: `n8n-workflows/README.md`

---

## 7. Telegram Bot

El bot de Telegram permite:

- Recibir recordatorios de tareas
- Completar/postponer tareas desde el chat
- Recibir feedback semanal

### Credenciales

Las credenciales de Telegram se configuran en n8n UI (no en código):

- Token del bot de @BotFather

---

## 8. Variables de Entorno

| Variable             | Descripción                           |
| -------------------- | ------------------------------------- |
| `WEBHOOK_SECRET`     | Secret para verificar webhooks de n8n |
| `BACKEND_PUBLIC_URL` | URL pública del backend (para n8n)    |

---

## 9. Consideraciones de Seguridad

- Todos los endpoints de webhook requieren autenticación (JWT o webhook secret)
- El webhook secret nunca debe estar en código
- Usar `WEBHOOK_SECRET` de variables de entorno

---

## 10. Historial de Cambios

| Fecha      | Versión | Cambios             |
| ---------- | ------- | ------------------- |
| 2026-03-11 | 1.0.0   | Creación del módulo |

---

## 11. Referencias

- `apps/backend/src/modules/webhooks/webhooks.service.ts`
- `apps/backend/src/modules/webhooks/webhooks.controller.ts`
- `n8n-workflows/README.md`
- `PROJECT.md` — Contexto general del proyecto
- `AGENTS.md` — Reglas de desarrollo
- `specs/FEATURES.md` — Índice de features
- `specs/SPEC.md` — Constitución SDD
