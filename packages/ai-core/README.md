# AI Core Package

> Motor de IA con múltiples proveedores y fallback automático.
> Este documento debe actualizarse cada vez que se agregue/modifique funcionalidad del motor de IA.

---

## 1. Propósito

Proporcionar una abstracción unificada para usar múltiples proveedores de IA con:

- **Fallback automático**: Si un proveedor falla, se prueba el siguiente
- **Múltiples proveedores**: Gemini, Groq, OpenAI, DeepSeek, Anthropic
- **Retry con backoff exponencial**: Reintentos automáticos

---

## 2. Estructura de Archivos

```
packages/ai-core/
├── src/
│   ├── index.ts                    # Exports públicos
│   ├── chains/
│   │   ├── text-generation.ts      # Generación de texto
│   │   ├── summarization.ts        # Resumen de texto
│   │   └── __tests__/
│   │       └── text-generation.spec.ts
│   ├── agents/
│   │   └── base-agent.ts           # Agente base
│   ├── prompts/
│   │   └── templates.ts            # Plantillas de prompts
│   ├── providers/
│   │   └── registry.ts             # Registro de proveedores
│   └── llm/
│       ├── factory.ts              # Factory de LLM
│       ├── executor.ts             # Ejecutor con fallback
│       └── openai.ts               # Adaptador OpenAI
├── package.json
├── tsconfig.json
└── jest.config.js
```

---

## 3. Proveedores Soportados

| Proveedor         | Modelo por defecto      | Gratis | Variables de entorno |
| ----------------- | ----------------------- | ------ | -------------------- |
| **Google Gemini** | gemini-2.0-flash        | ✅     | `GEMINI_API_KEY`     |
| **Groq**          | llama-3.3-70b-versatile | ✅     | `GROQ_API_KEY`       |
| **OpenAI**        | gpt-4o-mini             | ❌     | `OPENAI_API_KEY`     |
| **DeepSeek**      | deepseek-chat           | ✅     | `DEEPSEEK_API_KEY`   |
| **Anthropic**     | claude-3-haiku          | ❌     | `ANTHROPIC_API_KEY`  |

### Orden de Fallback (default)

```
Google Gemini → Groq → OpenAI → DeepSeek → Anthropic → Error
```

### Personalizar Orden

```bash
AI_PROVIDER_PRIORITY=openai,gemini,groq,deepseek,anthropic
```

---

## 4. Funciones Principales

### generateText

Genera texto a partir de un prompt.

```typescript
import { generateText } from '@ai-lab/ai-core';

const result = await generateText({
  prompt: 'Escribe un resumen profesional',
  systemMessage: 'Eres un asistente de carrera profesional',
  temperature: 0.7,
});

console.log(result.text);
```

### summarizeText

Resume texto en el idioma especificado.

```typescript
import { summarizeText } from '@ai-lab/ai-core';

const result = await summarizeText({
  text: 'Texto largo a resumir...',
  lang: 'es',
});

console.log(result.summary);
```

### executeWithFallback

Ejecuta una función con fallback automático.

```typescript
import { executeWithFallback } from '@ai-lab/ai-core';

const result = await executeWithFallback(async (llm) => llm.invoke('prompt'), {
  retries: 2,
  timeout: 30000,
});
```

---

## 5. Opciones

### GenerateTextOptions

```typescript
interface GenerateTextOptions {
  prompt: string;
  systemMessage?: string;
  temperature?: number; // 0-2, default: 0.7
  maxTokens?: number;
  model?: string;
}
```

### LLMOptions

```typescript
interface LLMOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  timeout?: number;
  apiKey?: string;
}
```

### ExecuteOptions

```typescript
interface ExecuteOptions {
  retries?: number; // default: 2
  timeout?: number; // ms, default: 30000
  onRetry?: (error: Error, attempt: number) => void;
}
```

---

## 6. Manejo de Errores

### Errores de Proveedor

- **Quota Exhausted**: Se intenta el siguiente proveedor
- **Rate Limit**: Retry con backoff
- **API Error**: Se intenta el siguiente proveedor
- **Timeout**: Retry

### Verificar Error de Quota

```typescript
import { isExhaustedError } from '@ai-lab/ai-core';

try {
  await generateText({...});
} catch (error) {
  if (isExhaustedError(error)) {
    // Todos los proveedores fallaron
  }
}
```

---

## 7. Patrones de Prompt

### No usar JSON embedding para texto largo

Los CVs y contenido largo se pasan usando delimitadores:

```typescript
const prompt = `
===ES===
${cvEnEspanol}
===

===EN===
${cvEnIngles}
===

Genera un CV híbrido...
`;
```

### Escapar llaves

Las llaves en contenido de usuario se escapan para evitar inyección en templates:

```typescript
// Convierte { y } a ( y )
esc(userContent);
```

### Campos aprobados

En re-evaluaciones, pasar los campos ya aprobados:

```typescript
const prompt = `
approvedFields: ${approvedFields.join(', ')}
evalúa solo los campos restantes...
`;
```

---

## 8. Variables de Entorno

| Variable               | Descripción                            |
| ---------------------- | -------------------------------------- |
| `AI_PROVIDER_PRIORITY` | Orden de proveedores (comma-separated) |
| `GEMINI_API_KEY`       | API key de Google Gemini               |
| `GROQ_API_KEY`         | API key de Groq                        |
| `OPENAI_API_KEY`       | API key de OpenAI                      |
| `DEEPSEEK_API_KEY`     | API key de DeepSeek                    |
| `ANTHROPIC_API_KEY`    | API key de Anthropic                   |

---

## 9. Testing

El paquete incluye tests unitarios:

```bash
cd packages/ai-core
npm test
```

---

## 10. Historial de Cambios

| Fecha      | Versión | Cambios              |
| ---------- | ------- | -------------------- |
| 2026-03-11 | 1.0.0   | Creación del paquete |

---

## 11. Referencias

- `packages/ai-core/src/index.ts`
- `packages/ai-core/src/chains/text-generation.ts`
- `packages/ai-core/src/llm/executor.ts`
- `PROJECT.md` — Contexto general del proyecto
- `AGENTS.md` — Reglas de desarrollo
- `specs/FEATURES.md` — Índice de features
- `specs/SPEC.md` — Constitución SDD
