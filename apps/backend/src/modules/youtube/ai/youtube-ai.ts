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

  const start = s.indexOf('{');
  if (start === -1) return null;
  let depth = 0, end = -1;
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
      // continue
    }
  }

  const last = s.lastIndexOf('}');
  if (last > start) {
    try {
      return JSON.parse(s.slice(start, last + 1)) as T;
    } catch {
      // fall through
    }
  }
  return null;
}

export async function generateNichesWithAI(count: number = 5): Promise<NicheSuggestion[]> {
  const systemMessage = `Eres experto en marketing de YouTube. Sugiere nichos con alto potencial de monetización.`;
  const prompt = `Genera ${count} nichos YouTube en español. JSON array.
Cada nicho: name, slug, description(60car), searchVolume(low/medium/high), competition(low/medium/high), opportunityScore(0-100), trend(rising/stable/declining), topKeywords(3), suggestedAudience(40car), estimatedCPM(decimal).`;

  return withRetry(
    async () => {
      const { text } = await generateText({
        prompt,
        systemMessage,
        temperature: 0.7,
        maxTokens: 3500,
      });
      console.log('[generateNichesWithAI] Raw:', text.slice(0, 300));
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
  const systemMessage = `Eres experto en estrategia de contenido de YouTube.`;
  const prompt = `Genera ${count} ideas de video para canal "${channelName}" sobre "${niche}" para "${targetAudience}".
Cada idea: title, hook, angle, format(tutorial/story/list/comparison/reaction/shorts_only), successProbability(high/medium/low), successReason, shortAngle, shortScript. JSON array.`;

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
  const systemMessage = `Eres experto en scripts para YouTube optimizados para SEO.`;
  const prompt = `Genera script para video: título="${ideaTitle}", hook="${ideaHook}", ángulo="${ideaAngle}", formato="${format}", audiencia="${targetAudience}".
Debe incluir: script(1500-3000 palabras), timestamps({time,description}), seoTitle(60car), seoDescription(160car), tags(10), hashtags(5). JSON object.`;

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
  const systemMessage = `Eres experto en generación de video con IA.`;
  const prompt = `Genera 5 prompts de IA para video: título="${title}", formato="${format}", resumen="${script.slice(0, 500)}".
Plataformas: Sora, Runway, Kling, Midjourney, Pika. Cada una: platform, prompt, tips. JSON array.`;

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
