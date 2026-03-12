export interface EvaluateBaseCVPromptParams {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedIn: string;
  summary: string;
  experience: string;
  education: string;
  skills: string;
  languages: string;
  certifications: string;
  lang: string;
  approvedFields: string[];
}

const WEIGHTS: Record<string, number> = {
  contact: 10,
  linkedIn: 5,
  summary: 20,
  experience: 30,
  skills: 15,
  education: 10,
  languages: 5,
  certifications: 5,
};

const RUBRIC: Record<string, string> = {
  contact: 'contact:10 - fullName+email+phone+location all present',
  linkedIn: 'linkedIn:5 - valid linkedin.com URL present',
  summary: 'summary:20 - min 3 sentences, has job title+years+value prop',
  experience:
    'experience:30 - min 2 roles each with company+title+YYYY-YYYY+2 quantified achievements',
  skills: 'skills:15 - min 6 technical skills listed',
  education: 'education:10 - institution+degree+year present',
  languages: 'languages:5 - at least one entry with proficiency level',
  certifications: 'certifications:5 - at least one entry with name and year',
};

export function buildEvaluateBaseCVPrompts(params: EvaluateBaseCVPromptParams): {
  systemMessage: string;
  prompt: string;
} {
  const {
    fullName,
    email,
    phone,
    location,
    linkedIn,
    summary,
    experience,
    education,
    skills,
    languages,
    certifications,
    lang,
    approvedFields,
  } = params;

  const langTx = lang === 'es' ? 'Spanish' : 'English';
  const ALL_FIELDS = Object.keys(WEIGHTS);
  const pendingFields = ALL_FIELDS.filter((k) => !approvedFields.includes(k));
  const lockedScore = approvedFields.reduce((sum, k) => sum + (WEIGHTS[k] ?? 0), 0);

  const ffTemplate: Record<string, string> = {};
  ALL_FIELDS.forEach((k) => {
    ffTemplate[k] = '';
  });

  const cvLines: string[] = [
    'NAME: ' +
      fullName +
      ' | EMAIL: ' +
      email +
      ' | PHONE: ' +
      (phone ?? '') +
      ' | LOC: ' +
      (location ?? '') +
      ' | LI: ' +
      (linkedIn ?? ''),
  ];
  if (pendingFields.includes('summary')) cvLines.push('SUMMARY: ' + (summary ?? '').slice(0, 600));
  if (pendingFields.includes('experience'))
    cvLines.push('EXPERIENCE: ' + (experience ?? '').slice(0, 1200));
  if (pendingFields.includes('education'))
    cvLines.push('EDUCATION: ' + (education ?? '').slice(0, 400));
  if (pendingFields.includes('skills')) cvLines.push('SKILLS: ' + (skills ?? '').slice(0, 300));
  if (pendingFields.includes('languages'))
    cvLines.push('LANGUAGES: ' + (languages ?? '').slice(0, 200));
  if (pendingFields.includes('certifications'))
    cvLines.push('CERTS: ' + (certifications ?? '').slice(0, 300));

  const rubricLines = pendingFields
    .map((k) => RUBRIC[k])
    .filter(Boolean)
    .join('\n');

  const approvedNote =
    approvedFields.length > 0
      ? 'FROZEN fields (already approved - keep full pts, feedback MUST be ""): ' +
        approvedFields.join(', ') +
        '\n\n'
      : '';

  const systemMessage =
    'You are a strict ATS CV scorer. Reply ONLY with raw JSON - zero markdown.\n' +
    'Language for all feedback text: ' +
    langTx +
    '\n\n' +
    approvedNote +
    'RUBRIC for PENDING fields:\n' +
    rubricLines +
    '\n\n' +
    'SCORING:\n' +
    '- Pending fields: full pts if ALL criteria met; 0 if none; partial otherwise\n' +
    '- Frozen fields always score full points (already locked in)\n' +
    '- Total = sum of frozen (' +
    lockedScore +
    ' pts locked) + pending field scores\n' +
    '- fieldFeedback for frozen fields MUST be ""\n' +
    '- fieldFeedback for pending: "" if met; else ONE sentence max 10 words in ' +
    langTx +
    '\n' +
    '- summary (output): ONE sentence max 12 words in ' +
    langTx +
    '\n' +
    '- Do NOT invent info\n\n' +
    'OUTPUT (no extra keys):\n' +
    JSON.stringify({ score: 0, approved: false, summary: '', fieldFeedback: ffTemplate });

  const prompt = 'EVALUATE:\n' + cvLines.join('\n');

  return { systemMessage, prompt };
}
