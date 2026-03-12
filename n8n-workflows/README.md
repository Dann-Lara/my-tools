# n8n Workflows

> Workflows de automatización del proyecto My Tools.
> Este documento debe actualizarse cada vez que se agregue/modifique un workflow.

---

## 1. Propósito

Gestionar automatizaciones mediante n8n:

- Recordatorios de tareas
- Bot de Telegram interactivo
- Feedback semanal con IA

---

## 2. Estructura de Archivos

```
n8n-workflows/
├── README.md               # Este archivo
├── SETUP.md                # Guía de configuración
├── 01-checklist-reminders.json   # Recordatorios de tareas
├── 02-telegram-responses.json    # Respuestas de Telegram
└── 03-weekly-feedback.json       # Feedback semanal
```

---

## 3. Workflows

### 01 — Checklist Reminders

| Propiedad     | Valor                                                           |
| ------------- | --------------------------------------------------------------- |
| Trigger       | Cada hora                                                       |
| Función       | Consultar tareas pendientes y enviar recordatorios por Telegram |
| Auto-activado | ✅ Sí                                                           |

**Flujo**:

1. n8n scheduler cada hora
2. GET `/v1/checklists/reminders/due` (con webhook secret)
3. Por cada tarea con `telegramChatId`:
   - Enviar mensaje con botones (completar, postergar)
4. Marcar `reminderSent = true`

### 02 — Telegram Responses

| Propiedad     | Valor                                  |
| ------------- | -------------------------------------- |
| Trigger       | Webhook de Telegram                    |
| Función       | Procesar respuestas de botones del bot |
| Auto-activado | ⚠️ No (requiere credenciales)          |

**Flujo**:

1. Usuario presiona botón en Telegram
2. Telegram envía callback a n8n
3. n8n parsea callback (`complete:itemId` o `postpone:itemId`)
4. POST `/v1/webhooks/telegram-response` al backend
5. Backend actualiza estado de la tarea
6. n8n responde al usuario con confirmación

### 03 — Weekly Feedback

| Propiedad     | Valor                                    |
| ------------- | ---------------------------------------- |
| Trigger       | Domingo 20:00                            |
| Función       | Generar y enviar feedback semanal con IA |
| Auto-activado | ✅ Sí                                    |

**Flujo**:

1. n8n scheduler (Domingo 20:00)
2. GET `/v1/checklists` (activos)
3. Por cada checklist con `telegramChatId`:
   - POST `/v1/checklists/:id/feedback` → IA genera coaching
   - Enviar feedback por Telegram

---

## 4. Credenciales

### Credenciales requeridas

| Nombre                     | Tipo             | Cómo obtenerlo                        |
| -------------------------- | ---------------- | ------------------------------------- |
| **Backend Webhook Secret** | HTTP Header Auth | Variable `N8N_WEBHOOK_SECRET` en .env |
| **Telegram Bot**           | Telegram API     | @BotFather en Telegram                |

### IDs de credenciales en el proyecto

> **Nota**: Los archivos JSON usan IDs de ejemplo. En producción, verificar que las credenciales en n8n coincidan.

- Header Auth ID: `EfBrBbQ88fwJlS4R`
- Telegram ID: `8JyddEiApG6k1J3x`

---

## 5. Configuración

### Variables de entorno

```env
# n8n
N8N_BASE_URL=http://localhost:5678
N8N_WEBHOOK_SECRET=tu-secreto-seguro
N8N_API_KEY=n8n_api_xxxxxxxx

# Telegram
TELEGRAM_BOT_TOKEN=1234567890:AABBcc...
TELEGRAM_BOT_USERNAME=TuBotUsername

# Backend
BACKEND_PUBLIC_URL=http://localhost:3001
```

### Sincronización

```bash
npm run n8n:sync  # Sube/actualiza workflows a n8n
```

El script:

1. Lee todos los `.json` en `n8n-workflows/`
2. Los ordena alfabéticamente
3. Los crea o actualiza en n8n
4. Activa automáticamente los no-webhook

---

## 6. Integración con Backend

Los workflows usan endpoints específicos:

| Endpoint                              | Auth           | Descripción              |
| ------------------------------------- | -------------- | ------------------------ |
| GET `/v1/checklists/reminders/due`    | webhook-secret | Tareas pendientes        |
| POST `/v1/webhooks/telegram-response` | webhook-secret | Respuestas de Telegram   |
| POST `/v1/checklists/:id/feedback`    | JWT            | Generar feedback semanal |

---

## 7. Consideraciones de Seguridad

- Todos los endpoints protegidos con webhook secret
- Token de Telegram nunca en código
- N8N_WEBHOOK_SECRET debe ser seguro

---

## 8. Agregar nuevo workflow

1. Crear workflow en n8n UI
2. Exportar como JSON en `n8n-workflows/`
3. Ejecutar `npm run n8n:sync`
4. Actualizar este README

---

## 9. Historial de Cambios

| Fecha      | Versión | Cambios                |
| ---------- | ------- | ---------------------- |
| 2026-03-11 | 1.0.0   | Creación del documento |

---

## 10. Referencias

- `n8n-workflows/SETUP.md` — Guía de configuración detallada
- `apps/backend/src/modules/webhooks/README.md`
- `apps/backend/src/modules/checklists/README.md`
- `PROJECT.md` — Contexto general del proyecto
- `docs/AGENTS.md` — Reglas de desarrollo
- `specs/FEATURES.md` — Índice de features
- `specs/SPEC.md` — Constitución SDD
