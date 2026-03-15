export interface AnswerInterviewQuestionsPromptParams {
  position: string;
  company: string;
  questions: string;
  tailoredCv: string;
  baseCvText: string;
  lang: string;
  userRole: string;
}

export function buildAnswerInterviewQuestionsPrompts(
  params: AnswerInterviewQuestionsPromptParams,
): { systemMessage: string; prompt: string } {
  const {
    position,
    company,
    questions,
    tailoredCv,
    baseCvText,
    lang,
    userRole,
  } = params;

  const langTx = lang === 'es' ? 'español' : 'inglés';

  const systemMessage = `Eres un entrevistador técnico experto.

IDIOMA de respuesta: ${langTx}

Contexto del candidato (CV base):
${baseCvText.slice(0, 2000)}

CV adaptado a la oferta:
${tailoredCv.slice(0, 3000)}

Tu rol: ${userRole === 'recruiter' ? 'entrevistador de recursos humanos' : 'entrevistador técnico'}

INSTRUCCIONES:
1. Para cada pregunta, proporciona una respuesta concreta basada en la experiencia del candidato
2. Usa el CV adaptado como referencia principal
3. Si no hay experiencia relevante, indica que no aplica pero sugiere cómo podrías responder
4. Las respuestas deben ser de 2-4 oraciones`;

  const prompt = `Empresa: ${company}
Puesto: ${position}

PREGUNTAS DE ENTREVISTA:
${questions}

Proporciona respuestas profesionales en ${langTx}.`;

  return { systemMessage, prompt };
}
