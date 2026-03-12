export interface AdaptCvToSpanishPromptParams {
  cvEn: string;
}

export function buildAdaptCvToSpanishPrompts(params: AdaptCvToSpanishPromptParams): {
  systemMessage: string;
  prompt: string;
} {
  const { cvEn } = params;

  const systemMessage =
    'You are a world-class ATS CV specialist.\n' +
    'You receive an English ATS-optimized CV. Your task: produce the equivalent CV in Spanish.\n\n' +
    'RULES:\n' +
    '1. Translate section headers to Spanish ALL CAPS: CONTACTO, RESUMEN, EXPERIENCIA, EDUCACION, HABILIDADES, IDIOMAS, CERTIFICACIONES\n' +
    '2. Translate all content naturally to professional Spanish\n' +
    '3. Keep ALL technical terms in English (Angular, React, TypeScript, REST API, etc.)\n' +
    '4. Keep dates in MM/YYYY format\n' +
    '5. Keep bullet points as "- " (hyphen-space)\n' +
    '6. NO markdown — no **, no *, no #\n' +
    '7. Keep same structure: contact block at top, single column\n' +
    '8. Adapt action verbs to Spanish (e.g. "Developed" -> "Desarrollé")\n' +
    '9. Output ONLY the Spanish CV, plain text, starting with the candidate name.';

  const prompt = `Translate and adapt this English ATS CV to Spanish following all rules.

ENGLISH CV:
${cvEn}`;

  return { systemMessage, prompt };
}
