import { generateText } from '@ai-lab/ai-core';
import { withRetry } from '@ai-lab/shared';

export interface NicheSuggestion {
  name: string;
  slug: string;
  description: string;
  searchVolume: string;
  competition: string;
  opportunityScore: number;
  trend: string;
  topKeywords: string[];
  suggestedAudience: string;
  estimatedCPM: number;
  suggestedChannelName: string;
}

function extractJson<T>(text: string): T | null {
  let s = text
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .trim();

  try {
    return JSON.parse(s) as T;
  } catch {
    // continue
  }

  // Find { ... } or [ ... ] - whichever comes first
  const objStart = s.indexOf('{');
  const arrStart = s.indexOf('[');

  if (objStart === -1 && arrStart === -1) return null;

  // Use whichever comes first
  if (objStart !== -1 && (arrStart === -1 || objStart < arrStart)) {
    let depth = 0, end = -1;
    for (let i = objStart; i < s.length; i++) {
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
        return JSON.parse(s.slice(objStart, end + 1)) as T;
      } catch {
        // continue
      }
    }
  } else if (arrStart !== -1) {
    // Handle array
    let depth = 0, end = -1;
    for (let i = arrStart; i < s.length; i++) {
      if (s[i] === '[') depth++;
      else if (s[i] === ']') {
        if (--depth === 0) {
          end = i;
          break;
        }
      }
    }
    if (end !== -1) {
      try {
        return JSON.parse(s.slice(arrStart, end + 1)) as T;
      } catch {
        // continue
      }
    }
  }

  return null;
}

export async function generateNichesWithAI(count: number = 6): Promise<NicheSuggestion[]> {
  const today = new Date().toISOString().split('T')[0];
  const systemMessage = `YouTube marketing expert. Always respond in Spanish.`;
  const prompt = `YouTube expert. Output ONLY valid JSON — start with [ end with ] — no markdown, no text outside JSON.

Date: ${today}
Generate ${count} YouTube niches in Spanish with high monetisation potential:
- name: Nombre del nicho
- slug: URL-friendly version
- description: Max 80 caracteres
- searchVolume: "low" | "medium" | "high"
- competition: "low" | "medium" | "high"
- opportunityScore: 0-100
- trend: "rising" | "stable" | "declining"
- topKeywords: 3 keywords
- suggestedAudience: Max 40 caracteres
- estimatedCPM: Decimal
- suggestedChannelName: Proposed channel name (max 50 chars)

JSON array: [{"name":"...","slug":"...","description":"...","searchVolume":"...","competition":"...","opportunityScore":0,"trend":"...","topKeywords":["..."],"suggestedAudience":"...","estimatedCPM":0.0,"suggestedChannelName":"..."}]`;

  return withRetry(
    async () => {
      const { text } = await generateText({
        prompt,
        systemMessage,
        temperature: 0.7,
        maxTokens: 3500,
      });
      console.log('[generateNichesWithAI] Raw:', text.slice(0, 200));
      const parsed = extractJson<NicheSuggestion[]>(text);
      if (!parsed || !Array.isArray(parsed)) {
        console.warn('[generateNichesWithAI] Invalid response, retrying...');
        throw new Error('Invalid AI response');
      }
      return parsed;
    },
    2,
    2000,
  );
}

export interface ContentIdeaSuggestion {
  title: string;
  hook: string;
  angle: string;
  format: 'tutorial' | 'story' | 'list' | 'comparison' | 'reaction' | 'shorts_only';
  successProbability: 'high' | 'medium' | 'low';
  successReason: string;
  shortAngle: string;
  shortScript: string;
}

export async function generateContentIdeasWithAI(
  channelName: string,
  niche: string,
  targetAudience: string,
  count: number = 5,
): Promise<ContentIdeaSuggestion[]> {
  const systemMessage = `YouTube content strategy expert. Always respond in Spanish.`;
  const prompt = `YouTube expert. Output ONLY valid JSON — start with [ end with ] — no markdown, no text outside JSON.

Generate ${count} video ideas for channel "${channelName}" about "${niche}" for "${targetAudience}":
- title: Attractive title
- hook: First 15-30 seconds
- angle: Unique angle
- format: "tutorial" | "story" | "list" | "comparison" | "reaction" | "shorts_only"
- successProbability: "high" | "medium" | "low"
- successReason: Why it has potential
- shortAngle: Angle for 60s short
- shortScript: Brief script for short

JSON array: [{"title":"...","hook":"...","angle":"...","format":"...","successProbability":"...","successReason":"...","shortAngle":"...","shortScript":"..."}]`;

  return withRetry(
    async () => {
      const { text } = await generateText({
        prompt,
        systemMessage,
        temperature: 0.7,
        maxTokens: 5000,
      });
      const parsed = extractJson<ContentIdeaSuggestion[]>(text);
      if (!parsed || !Array.isArray(parsed)) {
        throw new Error('Invalid AI response');
      }
      return parsed;
    },
    2,
    2000,
  );
}

export interface ScriptGeneration {
  script: string;
  timestamps: Array<{ time: string; description: string }>;
  seoTitle: string;
  seoDescription: string;
  tags: string[];
  hashtags: string[];
}

export async function generateScriptWithAI(
  ideaTitle: string,
  ideaHook: string,
  ideaAngle: string,
  format: string,
  targetAudience: string,
): Promise<ScriptGeneration> {
  const systemMessage = `YouTube script writer expert. Always respond in Spanish.`;
  const prompt = `YouTube expert. Output ONLY valid JSON — start with { end with } — no markdown, no text outside JSON.

Generate script for video:
- title: ${ideaTitle}
- hook: ${ideaHook}
- angle: ${ideaAngle}
- format: ${format}
- audience: ${targetAudience}

Required fields:
- script: 1500-3000 words
- timestamps: [{"time":"0:00","description":"..."}]
- seoTitle: Max 60 caracteres
- seoDescription: Max 160 caracteres
- tags: 10 tags
- hashtags: 5 hashtags

JSON: {"script":"...","timestamps":[],"seoTitle":"...","seoDescription":"...","tags":["..."],"hashtags":["..."]}`;

  return withRetry(
    async () => {
      const { text } = await generateText({
        prompt,
        systemMessage,
        temperature: 0.7,
        maxTokens: 8000,
      });
      const parsed = extractJson<ScriptGeneration>(text);
      if (!parsed) {
        throw new Error('Invalid AI response');
      }
      return parsed;
    },
    2,
    2000,
  );
}

export interface AIPrompt {
  platform: string;
  prompt: string;
  tips: string;
}

export async function generateAIPromptsWithAI(
  title: string,
  script: string,
  format: string,
): Promise<AIPrompt[]> {
  const systemMessage = `AI video generation expert. Always respond in Spanish.`;
  const prompt = `YouTube expert. Output ONLY valid JSON — start with [ end with ] — no markdown, no text outside JSON.

Generate 5 AI prompts for video: title="${title}", format="${format}", summary="${script.slice(0, 500)}"

Platforms: Sora, Runway, Kling, Midjourney, Pika
Each: platform, prompt, tips

JSON array: [{"platform":"...","prompt":"...","tips":"..."}]`;

  return withRetry(
    async () => {
      const { text } = await generateText({
        prompt,
        systemMessage,
        temperature: 0.7,
        maxTokens: 4000,
      });
      const parsed = extractJson<AIPrompt[]>(text);
      if (!parsed || !Array.isArray(parsed)) {
        throw new Error('Invalid AI response');
      }
      return parsed;
    },
    2,
    2000,
  );
}
