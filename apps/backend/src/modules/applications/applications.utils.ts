// ─────────────────────────────────────────────────────────────────────────────
// Utility functions for Applications module
// ─────────────────────────────────────────────────────────────────────────────

// LangChain treats {word} inside prompts as template variables and throws
// "Missing value for input variable" when it finds any curly brace pair.
// Escape every { and } in user-supplied content before sending to generateText.
export function esc(text: string): string {
  return (text ?? '').replace(/\{/g, '(').replace(/\}/g, ')');
}

// ── Robust JSON extractor ────────────────────────────────────────────────────
export function extractJson<T>(text: string): T | null {
  // Strip all markdown fences (Gemini loves wrapping in ```json ... ```)
  let s = text
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .trim();

  // Direct parse (clean response)
  try {
    return JSON.parse(s) as T;
  } catch {
    /* continue */
  }

  // Locate outermost { ... } by balanced brace scan
  const start = s.indexOf('{');
  if (start === -1) return null;
  let depth = 0,
    end = -1;
  for (let i = start; i < s.length; i++) {
    if (s[i] === '{') depth++;
    else if (s[i] === '}') {
      if (--depth === 0) {
        end = i;
        break;
      }
    }
  }
  if (end !== -1) {
    try {
      return JSON.parse(s.slice(start, end + 1)) as T;
    } catch {
      /* continue */
    }
  }

  // Last resort: first { to last }
  const last = s.lastIndexOf('}');
  if (last > start) {
    try {
      return JSON.parse(s.slice(start, last + 1)) as T;
    } catch {
      /* fall through */
    }
  }
  return null;
}

// ── Retry with exponential backoff ────────────────────────────────────────────
export async function withRetry<T>(fn: () => Promise<T>, retries = 2, baseMs = 2000): Promise<T> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise((r) => setTimeout(r, baseMs * Math.pow(2, attempt)));
    }
  }
  throw new Error('unreachable');
}

// ── Clean CV text ────────────────────────────────────────────────────────────
export function cleanCvText(raw: string): string {
  return raw
    .replace(/```[a-z]*\n?/gi, '')
    .replace(/```/g, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/^#{1,4}\s+/gm, '')
    .trim();
}
