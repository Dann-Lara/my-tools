export interface AnswerInterviewQuestionsPromptParams {
  position: string;
  company: string;
  questions: string;
  tailoredCv: string;
  skills: string;
  languages: string;
  certifications: string;
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
    skills,
    languages,
    certifications,
    lang,
    userRole,
  } = params;

  const isEs = (lang ?? 'es') === 'es';
  const langTx = isEs ? 'Spanish' : 'English';

  const cvContext =
    '=== TAILORED CV for ' +
    position +
    ' @ ' +
    company +
    ' ===\n' +
    tailoredCv +
    '\n\n' +
    '=== ADDITIONAL CONTEXT ===\n' +
    'SKILLS (full): ' +
    skills +
    '\n' +
    'LANGUAGES: ' +
    languages +
    '\n' +
    'CERTS: ' +
    certifications;

  const techContext =
    userRole === 'superadmin'
      ? '\n\n=== TECHNICAL REPOSITORY CONTEXT ===\n' +
        'This is an AI-powered job application assistant built on a Next.js 14 + NestJS monorepo (Turborepo).\n' +
        'Tech: TypeScript, PostgreSQL (TypeORM), Redis, LangChain, Google Gemini / OpenAI / Groq (multi-provider fallback).\n' +
        'Architecture: PermissionsProvider (DB-backed per user), JWT auth, modular NestJS services.\n' +
        'Applications module: Base CV (ATS scored >=85 to save), hybrid AI CV generator (ES+EN), PDF export, Q&A assistant.\n' +
        'Candidate is superadmin — may reference system capabilities, AI models used, or technical implementation if relevant to interview questions.'
      : '';

  const systemMessage =
    'You are a professional interview coach and career advisor helping a job applicant answer interview questions.\n' +
    'Answer all questions based STRICTLY on the provided CVs and context.\n\n' +
    'INFERENCE RULES (apply these before answering):\n' +
    '- If the CV shows a senior-level tool or framework, INFER logical derivatives:\n' +
    '  Angular -> knows observables/RxJS, lazy loading, dependency injection, NgRx\n' +
    '  React -> knows hooks, context, code splitting, testing with RTL\n' +
    '  Node.js -> knows async/await, event loop, streams, Express middleware\n' +
    '  TypeScript -> knows generics, decorators, utility types\n' +
    '  AWS -> knows IAM, VPC, EC2/ECS, CloudWatch basics\n' +
    '  Docker -> knows compose, networking, volumes, multi-stage builds\n' +
    '- If the CV shows X years senior experience, infer leadership and mentoring capacity\n' +
    '- NEVER invent specific company names, projects, or numbers not in the CV\n' +
    '- If a question cannot be answered from CV context, give a genuine best-effort answer that fits the profile\n\n' +
    'FORMAT:\n' +
    '- CRITICAL: answer EVERY question — do NOT stop early or truncate\n' +
    '- Answer each question clearly, numbered to match the input\n' +
    '- Each answer: 2-5 sentences, professional but natural tone\n' +
    '- Use first person ("I have..." / "En mi experiencia...")\n' +
    '- If there are many questions, keep each answer concise (3 sentences) so you can complete all of them\n' +
    '- Language: ' +
    langTx +
    '\n\n' +
    'CV CONTEXT:\n' +
    cvContext +
    techContext;

  const prompt =
    'JOB: ' +
    position +
    ' @ ' +
    company +
    '\n\n' +
    'INTERVIEW QUESTIONS:\n' +
    questions +
    '\n\n' +
    'Provide clear, professional answers to each question above.';

  return { systemMessage, prompt };
}
