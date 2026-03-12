# AI Module — Backend

> Módulo de endpoints de IA del proyecto My Tools.
> Este documento debe actualizarse cada vez que se agregue/modifique funcionalidad de IA.

---

## 1. Propósito

Proporcionar endpoints REST para usar el motor de IA (`ai-core`) de forma centralizada:

- Generación de texto
- Resumen de texto
- Estado de proveedores

---

## 2. Estructura de Archivos

```
src/modules/ai/
├── ai.controller.ts     # Endpoints REST
├── ai.service.ts       # Lógica de negocio
├── ai.module.ts        # Configuración del módulo
├── ai.service.spec.ts  # Tests unitarios
└── dto/
    ├── generate.dto.ts     # DTO para generación
    ├── summarize.dto.ts    # DTO para resumen
    └── provider-status.dto.ts  # DTO para estado de proveedores
```

---

## 3. Endpoints API

| Método | Path               | Auth | Descripción                |
| ------ | ------------------ | ---- | -------------------------- |
| POST   | `/v1/ai/generate`  | JWT  | Generar texto con IA       |
| POST   | `/v1/ai/summarize` | JWT  | Resumir texto con IA       |
| GET    | `/v1/ai/providers` | JWT  | Listar proveedores activos |

---

## 4. DTOs

### GenerateDto

```typescript
export class GenerateDto {
  @IsString()
  @IsNotEmpty()
  prompt!: string;

  @IsString()
  @IsOptional()
  systemMessage?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(2)
  temperature?: number;
}
```

### SummarizeDto

```typescript
export class SummarizeDto {
  @IsString()
  @IsNotEmpty()
  text!: string;

  @IsString()
  @IsOptional()
  @Length(2, 2)
  lang?: string; // 'es' | 'en'
}
```

---

## 5. Funcionamiento

### Generación de Texto

1. Usuario envía prompt + opciones
2. `ai-service` usa `ai-core` para generar texto
3. Retorna texto generado

### Resumen

1. Usuario envía texto + idioma
2. `ai-core` resume el texto
3. Retorna resumen

### Proveedores

Retorna lista de proveedores configurados y su estado.

---

## 6. Rate Limiting

Los endpoints de AI tienen rate limiting configurado:

- `/v1/ai/generate`: 10 requests / 60 segundos
- `/v1/ai/summarize`: 20 requests / 60 segundos

---

## 7. Integración con ai-core

Este módulo usa el paquete `ai-core` para toda la lógica de IA.

Ver: `packages/ai-core/README.md`

---

## 8. Variables de Entorno

| Variable               | Descripción                                                               |
| ---------------------- | ------------------------------------------------------------------------- |
| `AI_PROVIDER_PRIORITY` | Orden de proveedores (default: gemini, groq, openai, deepseek, anthropic) |
| `GEMINI_API_KEY`       | API key de Google Gemini                                                  |
| `GROQ_API_KEY`         | API key de Groq                                                           |
| `OPENAI_API_KEY`       | API key de OpenAI                                                         |
| `DEEPSEEK_API_KEY`     | API key de DeepSeek                                                       |
| `ANTHROPIC_API_KEY`    | API key de Anthropic                                                      |

---

## 9. Historial de Cambios

| Fecha      | Versión | Cambios             |
| ---------- | ------- | ------------------- |
| 2026-03-11 | 1.0.0   | Creación del módulo |

---

## 10. Referencias

- `apps/backend/src/modules/ai/ai.service.ts`
- `apps/backend/src/modules/ai/ai.controller.ts`
- `packages/ai-core/README.md`
- `PROJECT.md` — Contexto general del proyecto
- `docs/AGENTS.md` — Reglas de desarrollo
- `specs/FEATURES.md` — Índice de features
- `specs/SPEC.md` — Constitución SDD
