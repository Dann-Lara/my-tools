export interface EvaluateCvGlobalParams {
  cvText: string;
  lang: string;
}

export function buildEvaluateCvGlobalPrompts(params: EvaluateCvGlobalParams): {
  systemMessage: string;
  prompt: string;
} {
  const { cvText, lang } = params;

  const langLabel = lang === 'es' ? 'español' : 'inglés';
  const truncated = cvText.length > 6000 ? cvText.slice(0, 6000) + '\n...[truncated]' : cvText;

  const systemMessage =
    `Eres un evaluador experto de CVs para ATS (Applicant Tracking Systems).\n\n` +
    `Tu tarea es evaluar el CV de forma GLOBAL y dar sugerencias prácticas de mejora.\n\n` +
    `IDIOMA para sugerencias: ${langLabel}\n\n` +
    `REGLAS:\n` +
    `1. Score 0-100 basado en:\n` +
    `   - Información de contacto completa (nombre, email, teléfono)\n` +
    `   - Resumen profesional claro\n` +
    `   - Experiencia con logros cuantificables\n` +
    `   - Habilidades técnicas relevantes\n` +
    `   - Educación y certificaciones\n` +
    `2. Las sugerencias deben ser ACCIONABLES y SPECÍFICAS\n` +
    `3. Máximo 3 sugerencias - las más importantes\n` +
    `4. Cada sugerencia máximo 15 palabras\n` +
    `5. NO repitas información - sé conciso\n\n` +
    `OUTPUT (solo JSON, sin markdown):\n` +
    `{\n` +
    `  "score": 0-100,\n` +
    `  "summary": "una oración sobre el nivel del CV",\n` +
    `  "suggestions": ["sugerencia 1", "sugerencia 2", "sugerencia 3"]\n` +
    `}`;

  const prompt = `EVALUA ESTE CV:\n\n${truncated}`;

  return { systemMessage, prompt };
}
