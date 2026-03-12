import { TooManyRequestsException } from '@nestjs/common';
import { withRetry } from '@ai-lab/shared';
import type { CreateChecklistParamsDto, RegenerateDraftDto } from './dto/checklist.dto';

// ── Escape LangChain template variables in user-supplied strings ──────────────
// LangChain ChatPromptTemplate treats {word} as a template variable and throws
// "Missing value for input variable" if the braces don't match a known variable.
// Escape { } from user-provided data before interpolating into prompts.
export function esc(text: string): string {
  return (text ?? '').replace(/\{/g, '(').replace(/\}/g, ')');
}

// ── Simple in-memory rate limiter per user (resets on restart) ──────────────
const generationCounts = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(userId: string, maxPerHour = 10): void {
  const now = Date.now();
  const entry = generationCounts.get(userId);
  if (!entry || entry.resetAt < now) {
    generationCounts.set(userId, { count: 1, resetAt: now + 3_600_000 });
    return;
  }
  if (entry.count >= maxPerHour) {
    throw new TooManyRequestsException('AI generation limit reached. Try again later.');
  }
  entry.count++;
}

// ── AI response schema validation ───────────────────────────────────────────
export interface AiItem {
  description: string;
  frequency: string;
  estimatedDuration: number;
  hack: string;
  customFrequencyDays?: number;
}

export interface AiDraft {
  items: AiItem[];
  rationale?: string;
}

export function validateAiResponse(raw: unknown): AiDraft {
  if (!raw || typeof raw !== 'object') throw new Error('Not an object');
  const obj = raw as Record<string, unknown>;
  if (!Array.isArray(obj['items']) || obj['items'].length === 0)
    throw new Error('Missing or empty items array');

  const validFreqs = new Set(['once', 'daily', 'weekly', 'custom']);
  for (const item of obj['items'] as unknown[]) {
    const i = item as Record<string, unknown>;
    if (typeof i['description'] !== 'string' || !i['description'])
      throw new Error('Item missing description');
    if (typeof i['frequency'] !== 'string' || !validFreqs.has(i['frequency'] as string))
      throw new Error(`Invalid frequency: ${String(i['frequency'])}`);
    if (typeof i['estimatedDuration'] !== 'number' || (i['estimatedDuration'] as number) < 1)
      throw new Error('Invalid estimatedDuration');
    if (typeof i['hack'] !== 'string' || !i['hack']) throw new Error('Item missing hack');
  }
  return obj as unknown as AiDraft;
}

// ── Parse AI JSON — robust parser handles Gemini/LLM quirks ─────────────────
export function parseAiJson(
  text: string,
  logger?: { warn: (m: string) => void; debug: (m: string) => void },
): AiDraft {
  // Log full raw AI response — critical for debugging truncation / format issues
  if (logger) {
    logger.debug(`AI raw response (${text.length} chars, maxTokens=4000):\n${text}`);
  } else {
    console.log(`[AI-Debug] Raw (${text.length} chars):\n${text}`);
  }

  // Strip markdown fences: ```json...``` or ```...```
  const cleaned = text
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .trim();

  const objStart = cleaned.indexOf('{');
  const arrStart = cleaned.indexOf('[');

  if (objStart === -1 && arrStart === -1) {
    const msg = `No JSON structure in AI response. Full text: ${text}`;
    if (logger) logger.warn(msg);
    else console.warn('[AI-Debug]', msg);
    throw new Error('No JSON object found in AI response');
  }

  let jsonStr: string;

  // If object comes before array (or no array), use object directly
  if (objStart !== -1 && (arrStart === -1 || objStart < arrStart)) {
    const end = cleaned.lastIndexOf('}');
    if (end === -1) throw new Error('Malformed JSON: missing closing }');
    jsonStr = cleaned.slice(objStart, end + 1);
  } else {
    // AI returned a bare array — wrap it into the expected shape
    const warnMsg = 'AI returned bare array — wrapping as {"items":[...]}';
    if (logger) logger.warn(warnMsg);
    else console.warn('[AI-Debug]', warnMsg);
    const end = cleaned.lastIndexOf(']');
    if (end === -1) throw new Error('Malformed JSON: missing closing ]');
    jsonStr = `{"items":${cleaned.slice(arrStart, end + 1)}}`;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonStr);
  } catch (e) {
    const msg = `JSON.parse failed on: ${jsonStr.slice(0, 400)}`;
    if (logger) logger.warn(msg);
    else console.warn('[AI-Debug]', msg);
    throw new Error(`JSON parse error: ${e instanceof Error ? e.message : String(e)}`);
  }

  return validateAiResponse(parsed);
}

// ── Build prompts ────────────────────────────────────────────────────────────
export function buildGenerationPrompt(p: CreateChecklistParamsDto): string {
  const lang = p.language ?? 'es';
  return `Productivity expert. Output ONLY valid JSON — start with { end with } — no markdown, no text outside JSON.

Input:
- title: ${esc(p.title)}
- objective: ${esc(p.objective)}
${p.category ? `- category: ${esc(p.category ?? '')}` : ''}
- period: ${p.startDate} to ${p.endDate}
- difficulty: ${p.difficulty}
- daily_minutes: ${p.dailyTimeAvailable}
${p.goalMetric ? `- goal: ${esc(p.goalMetric ?? '')}` : ''}
- style: ${p.style}
- language: ${lang}

Rules:
1. Generate 5-10 tasks (keep descriptions SHORT: max 80 chars each, in ${lang})
2. hack: max 80 chars in ${lang}
3. Sum of daily task durations <= ${p.dailyTimeAvailable} min
4. frequency must be one of: "once","daily","weekly","custom"
5. rationale: max 100 chars in ${lang}

Required JSON schema (no extra fields, no comments):
{"items":[{"description":"string","frequency":"daily","estimatedDuration":15,"hack":"string"}],"rationale":"string"}`;
}

export function buildRegenerationPrompt(p: CreateChecklistParamsDto, feedback: string): string {
  return `${buildGenerationPrompt(p)}

User feedback: "${esc(feedback)}"

Apply feedback. Output ONLY the revised JSON — same schema, no extra text.`;
}

export interface FeedbackPromptData {
  title: string;
  objective: string;
  startDate: string;
  endDate: string;
  completedLastWeek: number;
  totalTasks: number;
  trend: string;
  upcomingTasks: string[];
  language: string;
}

export function buildFeedbackPrompt(data: FeedbackPromptData): {
  systemMessage: string;
  prompt: string;
} {
  const lang =
    data.language === 'es' ? 'Spanish' : data.language === 'en' ? 'English' : data.language;
  const upcoming = data.upcomingTasks.length > 0 ? data.upcomingTasks.join(', ') : 'none';
  return {
    systemMessage:
      `You are a concise motivational productivity coach. Always respond in ${lang}. ` +
      'Output plain text only — no markdown, no bullet points, no lists. Max 150 words.',
    prompt:
      `Checklist: "${data.title}"\n` +
      `Goal: ${esc(data.objective)}\n` +
      `Period: ${data.startDate} → ${data.endDate}\n` +
      `Completed this week: ${data.completedLastWeek} of ${data.totalTasks} tasks. Trend: ${data.trend}.\n` +
      `Next up: ${upcoming}\n\n` +
      `Write a warm, specific, encouraging weekly feedback. Acknowledge progress, name the trend, ` +
      `and give one concrete tip for the coming week. Plain text, ${lang} only.`,
  };
}
