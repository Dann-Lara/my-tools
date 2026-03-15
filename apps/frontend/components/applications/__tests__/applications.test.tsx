import { isCVComplete, EMPTY_CV, BaseCV } from '../types';

jest.mock('../../../lib/i18n-context', () => ({
  useI18n: () => ({
    t: {
      applications: {
        statusPending: 'Pending',
        statusInProcess: 'In Process',
        statusAccepted: 'Accepted',
        statusRejected: 'Rejected',
        deleteApp: 'Delete',
        deleteConfirm: 'Confirm?',
        deleteYes: 'Yes',
        deleteNo: 'No',
        baseCvTextareaLabel: 'Copia y pega tu CV aquí',
        baseCvTextareaPlaceholder: 'Juan Pérez\nemail@email.com',
        evaluateCv: 'Evaluar mi CV',
        evaluating: 'Evaluando...',
        scoreLabel: 'Score',
        cvEvalApprovedBadge: 'Aprobado',
        cvEvalNeedMore: 'Necesita mejoras',
        suggestionsLabel: 'Sugerencias',
        saveBaseCv: 'Guardar CV Base',
        saving: 'Guardando...',
      },
    },
    locale: 'es',
  }),
}));

jest.mock('../', () => ({
  getHeaders: () => ({ 'Content-Type': 'application/json' }),
}));

global.fetch = jest.fn();

const mockApp = {
  id: 'app-1',
  position: 'Frontend Developer',
  company: 'Tech Corp',
  status: 'pending' as const,
  appliedAt: '2024-01-15',
  cvGenerated: 'CV text content',
  cvGeneratedLang: 'es',
  appliedFrom: 'LinkedIn',
  interviewQuestions: '',
  interviewAnswers: '',
};

describe('Applications Components', () => {
  describe('isCVComplete', () => {
    it('should return false for empty CV', () => {
      expect(isCVComplete(EMPTY_CV)).toBe(false);
    });

    it('should return false for CV with less than 50 characters', () => {
      const cv: BaseCV = { cvText: 'Short text' };
      expect(isCVComplete(cv)).toBe(false);
    });

    it('should return true for CV with 50 or more characters', () => {
      const cv: BaseCV = { cvText: 'A'.repeat(50) };
      expect(isCVComplete(cv)).toBe(true);
    });

    it('should return false for null cvText', () => {
      const cv = { cvText: null } as unknown as BaseCV;
      expect(isCVComplete(cv)).toBe(false);
    });

    it('should return false for undefined cvText', () => {
      const cv = { cvText: undefined } as unknown as BaseCV;
      expect(isCVComplete(cv)).toBe(false);
    });
  });

  describe('AppCard', () => {
    it('should have test placeholder', () => {
      expect(true).toBe(true);
    });
  });

  describe('NewApplicationForm', () => {
    it('should have test placeholder', () => {
      expect(true).toBe(true);
    });
  });
});
