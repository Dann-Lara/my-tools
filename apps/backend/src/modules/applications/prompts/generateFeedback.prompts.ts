export interface GenerateFeedbackPromptParams {
  total: number;
  accepted: number;
  rejected: number;
  pending: number;
  acceptRate: number;
  avgAts: number;
  companies: string;
}

export function buildGenerateFeedbackPrompts(params: GenerateFeedbackPromptParams): {
  systemMessage: string;
  prompt: string;
} {
  const { total, accepted, rejected, pending, acceptRate, avgAts, companies } = params;

  const systemMessage =
    'You are an expert career coach specializing in tech job searches.\n' +
    'Give concise, actionable feedback in Spanish.\n' +
    'Plain text only - no markdown, no bullet points. Max 200 words.';

  const prompt =
    'Analyze this job search data and give 3-5 specific actionable recommendations:\n\n' +
    'Total applications: ' +
    total +
    '\n' +
    'Accepted: ' +
    accepted +
    ' (' +
    acceptRate +
    '% success rate)\n' +
    'Rejected: ' +
    rejected +
    '\n' +
    'In process/pending: ' +
    pending +
    '\n' +
    'Average ATS score: ' +
    avgAts +
    '%\n' +
    'Companies applied to: ' +
    companies +
    '\n\n' +
    'Provide warm, specific, data-driven feedback in Spanish.';

  return { systemMessage, prompt };
}
