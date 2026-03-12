export interface ExtractCvFromTextPromptParams {
  pdfText: string;
  lang: string;
}

export function buildExtractCvFromTextPrompts(params: ExtractCvFromTextPromptParams): {
  systemMessage: string;
  prompt: string;
} {
  const { pdfText, lang } = params;

  const truncated = pdfText.length > 8000 ? pdfText.slice(0, 8000) + '\n...[truncated]' : pdfText;

  const systemMessage =
    'You are a CV data extractor AND ATS quality evaluator. Do both tasks in one pass.\n\n' +
    'TASK 1 — EXTRACT all CV data from the raw PDF text into these fields:\n' +
    '  fullName, email, phone, location, linkedIn, summary, experience, education, skills, languages, certifications\n' +
    'Extraction rules:\n' +
    '- experience: for EACH role: Company | Job Title | MM/YYYY–MM/YYYY, then bullets with achievements. Preserve ALL roles.\n' +
    '- skills: comma-separated list\n' +
    '- languages: e.g. Spanish (native), English (C1)\n' +
    '- certifications: name — issuer — year\n' +
    '- All values must be plain strings\n\n' +
    'TASK 2 — EVALUATE each field for ATS quality and set a one-sentence hint if incomplete (max 12 words), or empty string "" if ok:\n' +
    '  fieldFeedback keys: summary, experience, skills, education, contact, languages, certifications, linkedIn\n' +
    '  contact = fullName + email + phone + location combined\n\n' +
    'Write all fieldFeedback values in ' +
    (lang === 'en' ? 'English' : 'Spanish') +
    '.\n' +
    'Return ONLY raw JSON — no markdown, no backticks:\n' +
    '{ "fullName":"","email":"","phone":"","location":"","linkedIn":"","summary":"","experience":"","education":"","skills":"","languages":"","certifications":"", ' +
    '"fieldFeedback":{"summary":"","experience":"","skills":"","education":"","contact":"","languages":"","certifications":"","linkedIn":""} }';

  const prompt = 'Extract and evaluate this CV PDF text:\n\n' + truncated;

  return { systemMessage, prompt };
}
