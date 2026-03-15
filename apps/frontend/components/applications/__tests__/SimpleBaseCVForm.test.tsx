import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SimpleBaseCVForm } from '../SimpleBaseCVForm';

jest.mock('../../../lib/i18n-context', () => ({
  useI18n: () => ({
    t: {
      applications: {
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

jest.mock('../types', () => ({
  getHeaders: () => ({ 'Content-Type': 'application/json' }),
}));

global.fetch = jest.fn();

describe('SimpleBaseCVForm', () => {
  const mockOnSaved = jest.fn();
  const mockT = {
    applications: {
      baseCvTextareaLabel: 'Copia tu CV',
      baseCvTextareaPlaceholder: 'Placeholder text',
      evaluateCv: 'Evaluar mi CV',
      evaluating: 'Evaluando...',
      scoreLabel: 'Score',
      cvEvalApprovedBadge: 'Aprobado',
      cvEvalNeedMore: 'Necesita mejoras',
      suggestionsLabel: 'Sugerencias',
      saveBaseCv: 'Guardar CV Base',
      saving: 'Guardando...',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render textarea and buttons', () => {
    render(
      <SimpleBaseCVForm
        initialCV={{ cvText: '' }}
        onSaved={mockOnSaved}
        t={mockT}
        lang="es"
      />
    );

    expect(screen.getByPlaceholderText(/Placeholder text/i)).toBeInTheDocument();
    expect(screen.getByText('Evaluar mi CV')).toBeInTheDocument();
    expect(screen.getByText('Guardar CV Base')).toBeInTheDocument();
  });

  it('should show character count', () => {
    render(
      <SimpleBaseCVForm
        initialCV={{ cvText: '' }}
        onSaved={mockOnSaved}
        t={mockT}
        lang="es"
      />
    );

    expect(screen.getByText(/0 caracteres/i)).toBeInTheDocument();
  });

  it('should update character count when typing', async () => {
    const user = userEvent.setup();
    render(
      <SimpleBaseCVForm
        initialCV={{ cvText: '' }}
        onSaved={mockOnSaved}
        t={mockT}
        lang="es"
      />
    );

    const textarea = screen.getByPlaceholderText(/Placeholder text/i);
    await user.type(textarea, 'A'.repeat(60));

    expect(screen.getByText(/60 caracteres/i)).toBeInTheDocument();
  });

  it('should call handleEvaluate when button is clicked with enough text', async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ score: 90, summary: 'Good CV', suggestions: [] }),
    });

    render(
      <SimpleBaseCVForm
        initialCV={{ cvText: '' }}
        onSaved={mockOnSaved}
        t={mockT}
        lang="es"
      />
    );

    const textarea = screen.getByPlaceholderText(/Placeholder text/i);
    await user.type(textarea, 'A'.repeat(60));

    const evaluateButton = screen.getByText('Evaluar mi CV');
    await user.click(evaluateButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/applications/base-cv/evaluate-global',
        expect.objectContaining({ method: 'POST' })
      );
    });
  });

  it('should show evaluation result after successful evaluation', async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ score: 90, summary: 'Good CV', suggestions: ['Add more skills'] }),
    });

    render(
      <SimpleBaseCVForm
        initialCV={{ cvText: '' }}
        onSaved={mockOnSaved}
        t={mockT}
        lang="es"
      />
    );

    const textarea = screen.getByPlaceholderText(/Placeholder text/i);
    await user.type(textarea, 'A'.repeat(60));

    const evaluateButton = screen.getByText('Evaluar mi CV');
    await user.click(evaluateButton);

    await waitFor(() => {
      expect(screen.getByText(/Score: 90/)).toBeInTheDocument();
    });
  });

  it('should show approved badge when score >= 85', async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ score: 90, summary: 'Good CV', suggestions: [] }),
    });

    render(
      <SimpleBaseCVForm
        initialCV={{ cvText: '' }}
        onSaved={mockOnSaved}
        t={mockT}
        lang="es"
      />
    );

    const textarea = screen.getByPlaceholderText(/Placeholder text/i);
    await user.type(textarea, 'A'.repeat(60));

    const evaluateButton = screen.getByText('Evaluar mi CV');
    await user.click(evaluateButton);

    await waitFor(() => {
      expect(screen.getByText('Aprobado')).toBeInTheDocument();
    });
  });

  it('should show needs improvement badge when score < 85', async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ score: 70, summary: 'Needs work', suggestions: ['Add experience'] }),
    });

    render(
      <SimpleBaseCVForm
        initialCV={{ cvText: '' }}
        onSaved={mockOnSaved}
        t={mockT}
        lang="es"
      />
    );

    const textarea = screen.getByPlaceholderText(/Placeholder text/i);
    await user.type(textarea, 'A'.repeat(60));

    const evaluateButton = screen.getByText('Evaluar mi CV');
    await user.click(evaluateButton);

    await waitFor(() => {
      expect(screen.getByText(/Necesita mejoras/)).toBeInTheDocument();
    });
  });

  it('should handle fetch error gracefully', async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    render(
      <SimpleBaseCVForm
        initialCV={{ cvText: '' }}
        onSaved={mockOnSaved}
        t={mockT}
        lang="es"
      />
    );

    const textarea = screen.getByPlaceholderText(/Placeholder text/i);
    await user.type(textarea, 'A'.repeat(60));

    const evaluateButton = screen.getByText('Evaluar mi CV');
    await user.click(evaluateButton);

    await waitFor(() => {
      expect(screen.getByText(/Error 500/)).toBeInTheDocument();
    });
  });

  it('should initialize with existing cvText from initialCV', () => {
    const existingCV = 'This is my existing CV text that is longer than fifty characters';
    
    render(
      <SimpleBaseCVForm
        initialCV={{ cvText: existingCV }}
        onSaved={mockOnSaved}
        t={mockT}
        lang="es"
      />
    );

    const textarea = screen.getByPlaceholderText(/Placeholder text/i) as HTMLTextAreaElement;
    expect(textarea.value).toBe(existingCV);
  });
});
