export interface InterviewSimulatorPromptParams {
  position: string;
  company: string;
  jobDescription: string;
  tailoredCv: string;
  baseCvText: string;
  lang: string;
}

export function buildInterviewSimulatorPrompts(
  params: InterviewSimulatorPromptParams,
): { systemMessage: string; prompt: string } {
  const {
    position,
    company,
    jobDescription,
    tailoredCv,
    baseCvText,
    lang,
  } = params;

  const isEs = (lang ?? 'es') === 'es';
  const langLabel = isEs ? 'Spanish' : 'English';

  const systemMessage =
    `You are an expert technical interview coach. Your task is to generate a simulated interview based on the candidate's CV and job offer.

INSTRUCTIONS:
1. Generate 5-7 interview questions (mix of technical and behavioral)
2. Each question must be specific to the ${position} role at ${company}
3. Answers must be based ONLY on the information in the provided CV
4. Answers should highlight relevant achievements from the CV
5. Each answer: 2-4 sentences, professional but natural tone
6. Use first person ("I have experience...", "I've developed...")
7. If the CV has no information for a question, give a generic but professional answer
8. Language for questions and answers: ${langLabel}

JSON FORMAT REQUIRED:
{
  "questions": [
    {
      "question": "Question 1: ...",
      "answer": "Answer 1: ..."
    }
  ]
}

IMPORTANT: Respond ONLY with valid JSON, no additional text.
`;

  const prompt =
    `POSITION: ${position} @ ${company}
    
JOB DESCRIPTION:
${jobDescription}

=== BASE CV ===
${baseCvText.slice(0, 2000)}

=== TAILORED CV ===
${tailoredCv}

Generate the simulated interview in JSON format:`;

  return { systemMessage, prompt };
}
