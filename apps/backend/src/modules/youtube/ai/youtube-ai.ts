import { generateText } from '@ai-lab/ai-core';

export interface NicheSuggestion {
  name: string;
  slug: string;
  description: string;
  searchVolume: string;
  competition: string;
  opportunityScore: number;
  trend: string;
  trendPercent?: number;
  topKeywords: string[];
  suggestedAudience: string;
  estimatedCPM: number;
}

export async function generateNichesWithAI(count: number = 20): Promise<NicheSuggestion[]> {
  const systemMessage = `Eres un experto en marketing de YouTube. Tu tarea es sugerir nichos de YouTube con alto potencial de monetización.`;

  const prompt = `Genera ${count} nichos de YouTube en español con las siguientes propiedades para cada nicho:
- name: Nombre del nicho
- slug: URL-friendly version del nombre
- description: Descripción breve del nicho (1-2 oraciones)
- searchVolume: "low", "medium", "high" o "very_high"
- competition: "low", "medium" o "high"
- opportunityScore: Número 0-100 basado en searchVolume + competition + trends
- trend: "rising", "stable" o "declining"
- trendPercent: Porcentaje de crecimiento (ej: 25)
- topKeywords: Array de 5-10 keywords relevantes
- suggestedAudience: Descripción de la audiencia objetivo
- estimatedCPM: Estimación de CPM en USD (ej: 2.5)

Devuelve solo un JSON array de objetos.`;

  const { text } = await generateText({
    prompt,
    systemMessage,
    temperature: 0.7,
  });

  try {
    const cleaned = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('[generateNichesWithAI] Failed to parse AI response:', err);
    return [];
  }
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
  count: number = 10,
): Promise<ContentIdeaSuggestion[]> {
  const systemMessage = `Eres un experto en estrategia de contenido de YouTube. Tu tarea es generar ideas de video吸引观众的Content.`;

  const prompt = `Genera ${count} ideas de video para un canal de YouTube sobre "${niche}" llamado "${channelName}" dirigido a "${targetAudience}".

Para cada idea proporciona:
- title: Título atractivo y clickbait (sin falsear)
- hook: Primeras 15-30 segundos del video (el gancho)
- angle: Ángulo único para diferenciarse de otros videos del mismo tema
- format: "tutorial", "story", "list", "comparison", "reaction" o "shorts_only"
- successProbability: "high", "medium" o "low" - sé honesto
- successReason: Por qué esta idea tiene potencial
- shortAngle: Ángulo para un Short (60 segundos)
- shortScript: Script breve para el Short

Devuelve solo un JSON array de objetos.`;

  const { text } = await generateText({
    prompt,
    systemMessage,
    temperature: 0.8,
  });

  try {
    const cleaned = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('[generateContentIdeasWithAI] Failed to parse AI response:', err);
    return [];
  }
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
  const systemMessage = `Eres un experto escribiendo scripts para YouTube. Tu tarea es generar un script completo y optimizado para SEO.`;

  const prompt = `Genera un script completo para un video de YouTube con:
- Título: ${ideaTitle}
- Hook: ${ideaHook}
- Ángulo: ${ideaAngle}
- Formato: ${format}
- Audiencia: ${targetAudience}

El script debe incluir:
- script: Script completo del video (1500-3000 palabras)
- timestamps: Array de timestamps con { time: "0:00", description: "..." }
- seoTitle: Título optimizado para SEO (máx 60 caracteres)
- seoDescription: Descripción optimizada para SEO (máx 160 caracteres)
- tags: Array de 10-15 tags relevantes
- hashtags: Array de 5-10 hashtags

Devuelve solo un JSON object.`;

  const { text } = await generateText({
    prompt,
    systemMessage,
    temperature: 0.7,
  });

  try {
    const cleaned = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    return parsed;
  } catch (err) {
    console.error('[generateScriptWithAI] Failed to parse AI response:', err);
    return {
      script: '',
      timestamps: [],
      seoTitle: ideaTitle,
      seoDescription: '',
      tags: [],
      hashtags: [],
    };
  }
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
  const systemMessage = `Eres un experto en generación de video con IA. Tu tarea es crear prompts para herramientas de video IA.`;

  const prompt = `Genera 5 prompts de IA (uno para cada plataforma) para un video de YouTube:
- Título: ${title}
- Resumen del script: ${script.substring(0, 500)}...
- Formato: ${format}

Plataformas: Sora, Runway, Kling, Midjourney, Pika

Para cada plataforma proporciona:
- platform: Nombre de la plataforma
- prompt: Prompt detallado para generar el video/imagen
- tips: Consejos para obtener mejores resultados

Devuelve solo un JSON array de objetos.`;

  const { text } = await generateText({
    prompt,
    systemMessage,
    temperature: 0.7,
  });

  try {
    const cleaned = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('[generateAIPromptsWithAI] Failed to parse AI response:', err);
    return [];
  }
}
