# Shared Package

> Tipos y DTOs compartidos entre backend y frontend.
> Este documento debe actualizarse cada vez que se agregue/modifique tipos compartidos.

---

## 1. Propósito

Proporcionar tipos TypeScript y DTOs compartidos entre:

- Backend (NestJS)
- Frontend (Next.js)
- Otros packages

---

## 2. Estructura de Archivos

```
packages/shared/
├── src/
│   ├── index.ts              # Exports públicos
│   ├── types/
│   │   ├── ai.types.ts       # Tipos relacionados con IA
│   │   ├── user.types.ts     # Tipos de usuario
│   │   └── index.ts
│   ├── dtos/
│   │   └── ai.dto.ts        # DTOs de IA
│   └── constants/
│       └── index.ts         # Constantes compartidas
├── package.json
└── tsconfig.json
```

---

## 3. Exports

### Tipos

```typescript
// Tipos de IA
export * from './types/ai.types';

// Tipos de usuario
export * from './types/user.types';

// DTOs
export * from './dtos/ai.dto';

// Constantes
export * from './constants/index';
```

---

## 4. Contenido

### ai.types.ts

- Tipos para respuestas de generación
- Tipos para configuración de providers

### user.types.ts

- Tipos de roles de usuario
- Tipos de permisos

### ai.dto.ts

- DTOs para endpoints de AI
- Interfaces para requests/responses

### constants/index.ts

- Constantes compartidas (strings, números, etc.)

---

## 5. Uso

### En Backend

```typescript
import { GenerateTextOptions } from '@ai-lab/shared';

@Controller()
export class MyController {
  @Post()
  generate(@Body() dto: GenerateTextOptions) { ... }
}
```

### En Frontend

```typescript
import { BaseCV } from '@ai-lab/shared';

const cv: BaseCV = { ... };
```

---

## 6. Reglas de Uso

1. **Agregar tipos aquí, no en apps**: Cualquier tipo compartido entre backend y frontend debe vivir en `shared`
2. **No duplicar entidades**: Si una entidad existe en backend, exportar el tipo desde aquí
3. **Mantener sincronizado**: Al agregar un campo en backend, actualizar el tipo en shared

---

## 7. Variables de Entorno

No hay variables de entorno específicas de este paquete.

---

## 8. Historial de Cambios

| Fecha      | Versión | Cambios              |
| ---------- | ------- | -------------------- |
| 2026-03-11 | 1.0.0   | Creación del paquete |

---

## 9. Referencias

- `packages/shared/src/index.ts`
- `packages/shared/src/types/`
- `packages/shared/src/dtos/`
- `PROJECT.md` — Contexto general del proyecto
- `AGENTS.md` — Reglas de desarrollo
- `specs/FEATURES.md` — Índice de features
- `specs/SPEC.md` — Constitución SDD
