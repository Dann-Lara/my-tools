# My Tools — Personal AI-Assisted Productivity Platform

> **⚠️ IMPORTANTE — Lee esto antes de programar**
> Este archivo es el punto de entrada de contexto para cualquier agente de IA.
> Después de leer esto, consulta los documentos específicos de cada módulo/área.

---

## 1. Visión del Proyecto

**Nombre**: My Tools  
**Propósito**: Plataforma personal de herramientas asistidas por IA para gestionar diferentes aspectos de la vida/productividad del usuario.

**理念 (Filosofía)**:

- Cada herramienta (módulo) es independiente pero compartición autenticación/permisos
- La IA asiste al usuario en todas las herramientas, no reemplaza
- Superadmin controla qué herramientas/funcionalidades puede usar cada usuario

---

## 2. Estructura del Proyecto

```
my-tools/
├── apps/
│   ├── backend/              # NestJS API (puerto 3001)
│   │   └── src/modules/
│   │       ├── auth/        # Autenticación (JWT, login, signup)
│   │       ├── users/       # Gestión de usuarios y perfiles
│   │       ├── checklists/  # Módulo: Checklist de tareas
│   │       ├── applications/ # Módulo: Postulaciones laborales
│   │       ├── ai/          # Endpoints AI (generate, summarize)
│   │       └── webhooks/    # Integración con n8n
│   └── frontend/            # Next.js 14 App Router (puerto 3000)
│       ├── app/
│       │   ├── admin/       # Panel de admin (users, applications, profile)
│       │   ├── client/      # Panel de cliente
│       │   ├── checklists/  # UI de checklists
│       │   └── login/       # Auth pages
│       └── components/
│           ├── ui/          # Componentes compartidos
│           └── checklists/  # Componentes de checklists
├── packages/
│   ├── ai-core/             # Motor de IA (multi-proveedor con fallback)
│   ├── shared/              # Tipos y DTOs compartidos
│   └── eslint-config/       # Configuración de lint
├── n8n-workflows/           # Workflows de automatización
├── docker/                  # Configuraciones Docker
├── docs/                    # Documentación técnica
└── specs/                   # Especificaciones SDD
    ├── SPEC.md              # Constitución del proyecto
    ├── FEATURES.md          # Índice de features
    └── features/            # Especificaciones por feature
```

---

## 3. Módulos del Proyecto

### Módulos Actuales

| Módulo           | Propósito                                                          | Tecnología                  |
| ---------------- | ------------------------------------------------------------------ | --------------------------- |
| **Checklists**   | Asistente para cumplir objetivos/tareas pequeñas con recordatorios | NestJS + Next.js + AI + n8n |
| **Applications** | Seguimiento de postulaciones laborales (CVs, entrevistas)          | NestJS + Next.js + AI       |

### Módulos Planeados (Futuro)

| Módulo                 | Propósito                                   | Estado          |
| ---------------------- | ------------------------------------------- | --------------- |
| **Gestor de Gastos**   | Registro y análisis de gastos personales    | Por desarrollar |
| **Ahorro/Inversiones** | Control de ahorros y cartera de inversiones | Por desarrollar |
| _(más por definir)_    | —                                           | —               |

---

## 4. Modelo de Usuarios y Permisos

### Roles

| Rol            | Descripción                                            |
| -------------- | ------------------------------------------------------ |
| **superadmin** | Control total. Acceso a todo. Gestiona admins.         |
| **admin**      | Gestiona clientes. Ve lista de usuarios.               |
| **client**     | Usuario final. Acceso solo a sus propias herramientas. |

### Permisos

Los permisos se almacenan en la base de datos (`users.permissions` como JSON) y permiten:

- Activar/desactivar módulos por usuario
- Control granular de funcionalidades dentro de cada módulo

### Funcionalidad Futura: "Iniciar sesión como X"

> **Planificado**: El superadmin podrá iniciar sesión como otro usuario (cliente o admin) para:
>
> - Debug de bugs específicos de ese usuario
> - Soporte técnico directo
> - Auditoría de acciones
>
> Esta funcionalidad debe incluir **bitácora** de quién accedió y cuándo.

---

## 5. Autenticación

- **JWT** con access token + refresh token
- Tokens almacenados en localStorage (frontend)
- Integración con **Telegram** para notificaciones

---

## 6. Integraciones

### AI (ia-core)

Múltiples proveedores con **fallback automático**:

- Google Gemini → Groq → OpenAI → DeepSeek → Anthropic

### n8n

Automatización via webhooks:

- Recordatorios de checklists
- Bot de Telegram
- Feedback semanal con IA

---

## 7. Para Agentes IA — Cómo Usar Esta Documentación

### Flujo de trabajo recomendado:

1. **Primero**: Lee `PROJECT.md` (este archivo) para entender el contexto general
2. **Segundo**: Consulta el README específico del área en la que trabajarás:
   - Backend modules: `apps/backend/src/modules/[nombre]/README.md`
   - Packages: `packages/[nombre]/README.md`
   - n8n: `n8n-workflows/README.md`
3. **Tercero**: Revisa `docs/AGENTS.md` para reglas de desarrollo

### Reglas de documentación de módulos:

Cada vez que agregues un **feature** o **improvement** a un módulo:

1. Actualiza el README del módulo con los cambios
2. Incluya: nueva funcionalidad, endpoints, entidades, variables de entorno
3. Mantén el historial de cambios

---

## 8. Spec-Driven Development (SDD)

Este proyecto usa **Spec-Anchored Development** — las especificaciones son el contrato principal.

### Estructura de Specs

```
specs/
├── SPEC.md              # Constitución (reglas no negociables)
├── FEATURES.md          # Índice de features
└── features/
    ├── F001-xxx.md      # Spec de feature
    └── template.md      # Template para nuevas specs
```

### Workflow

```
1. Crear SPEC (DRAFT)
       ↓
2. Review por stakeholders → APPROVED
       ↓
3. Desglose en Tasks (por módulo/archivo)
       ↓
4. Implementación
       ↓
5. Validación: spec == implementación
       ↓
6. COMPLETED → Actualizar docs del módulo
```

### Cómo crear una nueva spec

1. Copiar template: `cp specs/features/template.md specs/features/F0XX-nombre.md`
2. Llenar información siguiendo `SPEC.md`
3. Agregar a `specs/FEATURES.md`
4. Obtener APPROVAL de stakeholders
5. Implementar siguiendo las tasks

### Reglas

- **No codificar sin spec APPROVED**
- **No modificar spec sin approval**
- **Si cambia scope**: nueva spec o enmienda
- **Validar siempre** contra acceptance criteria

### Links

| Documento                    | Propósito          |
| ---------------------------- | ------------------ |
| `specs/SPEC.md`              | Constitución SDD   |
| `specs/FEATURES.md`          | Índice de features |
| `specs/features/template.md` | Template           |

---

## 9. Variables de Entorno Principales

| Variable             | Descripción                        |
| -------------------- | ---------------------------------- |
| `DATABASE_URL`       | PostgreSQL connection string       |
| `REDIS_URL`          | Redis connection string            |
| `JWT_SECRET`         | Secret para firmar tokens JWT      |
| `GEMINI_API_KEY`     | API key de Google Gemini           |
| `GROQ_API_KEY`       | API key de Groq                    |
| `OPENAI_API_KEY`     | API key de OpenAI                  |
| `BACKEND_PUBLIC_URL` | URL pública del backend (para n8n) |

Ver `docs/CONFIGURATION.md` para la lista completa.

---

## 10. Referencias

| Documento               | Propósito                    |
| ----------------------- | ---------------------------- |
| `README.md`             | Guía de inicio rápido        |
| `docs/CONFIGURATION.md` | Configuración completa       |
| `docs/TECHNICAL.md`     | Referencia técnica detallada |
| `docs/AGENTS.md`        | Reglas para agentes IA       |
| `docs/DEPLOYMENT.md`    | Guía de despliegue           |
| `specs/SPEC.md`         | Constitución SDD             |
| `specs/FEATURES.md`     | Índice de features           |

---

## 11. Contributing

Al contribuir:

1. Lee este archivo de contexto
2. Si es una nueva feature: crea spec en `specs/features/`
3. Consulta los READMEs de los módulos relevantes
4. Sigue las reglas de `docs/AGENTS.md`
5. Following workflow SDD (`specs/SPEC.md`)
6. Actualiza la documentación del módulo modificado

---

_Última actualización: 2026-03-11_
