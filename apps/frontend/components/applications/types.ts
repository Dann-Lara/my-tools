// ─── Shared types ─────────────────────────────────────────────────────────────
export type AppStatus = 'pending' | 'accepted' | 'rejected' | 'in_process';
export type Tab = 'list' | 'new' | 'base-cv' | 'dashboard';

export interface JobOffer {
  id: string;
  company: string;
  position: string;
  description: string;
  requirements?: string;
  location?: string;
  salary?: string;
  sourceUrl?: string;
  createdAt?: string;
}

export interface BaseCV {
  cvText: string;
  lastEvaluatedAt?: string;
}

export interface CvEvaluationGlobalResult {
  score: number;
  summary: string;
  suggestions: string[];
}

export interface Application {
  id: string;
  company: string;
  position: string;
  appliedAt: string;
  status: AppStatus;
  jobOffer: string;
  jobOfferId?: string;
  atsScore?: number;
  cvGenerated?: string;
  cvGeneratedLang?: string;
  appliedFrom?: string;
  interviewQuestions?: string;
  interviewAnswers?: string;
  interviewGeneratedAt?: string;
  jobOfferData?: JobOffer;
  location?: string;
  salary?: string;
  sourceUrl?: string;
}

export interface CvEvalResult {
  score: number;
  approved: boolean;
  summary: string;
  fieldFeedback: Record<string, string>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
export function getHeaders(): Record<string, string> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('ailab_at') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const EMPTY_CV: BaseCV = {
  cvText: '',
};

export function isCVComplete(cv: BaseCV) {
  return !!(cv?.cvText && cv.cvText.length >= 50);
}
