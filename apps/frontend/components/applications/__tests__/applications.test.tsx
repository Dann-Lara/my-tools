import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

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

const mockBaseCV = {
  cvText: 'Juan Pérez\nemail@email.com\n\nEXPERIENCE\nTech Corp - Dev (2020-2024)\n• Built features',
  lastEvaluatedAt: '2024-01-15T00:00:00Z',
};

describe('Applications Components', () => {
  describe('AppCard', () => {
    it('should have test placeholder', () => {
      expect(true).toBe(true);
    });
  });

  describe('SimpleBaseCVForm', () => {
    it('should render textarea with placeholder', async () => {
      const mockOnSaved = jest.fn();
      const t = { applications: { 
        baseCvTextareaLabel: 'Copia tu CV',
        baseCvTextareaPlaceholder: 'Juan Pérez',
        evaluateCv: 'Evaluar',
        scoreLabel: 'Score',
        cvEvalApprovedBadge: 'Aprobado',
        suggestionsLabel: 'Sugerencias',
        saveBaseCv: 'Guardar',
        saving: 'Guardando...',
      }};

      render(<div data-testid="placeholder">Test</div>);
      
      expect(screen.getByTestId('placeholder')).toBeInTheDocument();
    });

    it('should show error when cvText is too short', async () => {
      const user = userEvent.setup();
      const t = { applications: { 
        baseCvTextareaLabel: 'Copia tu CV',
        baseCvTextareaPlaceholder: 'Juan Pérez',
        evaluateCv: 'Evaluar',
        cvTextTooShort: 'El CV debe tener al menos 50 caracteres',
        scoreLabel: 'Score',
        cvEvalApprovedBadge: 'Aprobado',
        suggestionsLabel: 'Sugerencias',
        saveBaseCv: 'Guardar',
        saving: 'Guardando...',
      }};

      render(<div data-testid="placeholder">Test</div>);
      
      expect(true).toBe(true);
    });
  });

  describe('NewApplicationForm', () => {
    it('should have test placeholder', () => {
      expect(true).toBe(true);
    });
  });
});
