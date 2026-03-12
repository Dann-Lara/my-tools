import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { AiGenerator } from '../AiGenerator';

global.fetch = jest.fn();

describe('AiGenerator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the form elements', () => {
    render(<AiGenerator />);
    expect(screen.getByPlaceholderText(/Escribe tu prompt aquí/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Generar/i })).toBeInTheDocument();
  });

  it('shows result after successful generation', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ result: 'AI generated text', model: 'gpt-4o-mini' }),
    });

    const user = userEvent.setup();
    render(<AiGenerator />);

    await user.type(screen.getByPlaceholderText(/Escribe tu prompt aquí/i), 'Hello AI');
    await user.click(screen.getByRole('button', { name: /Generar/i }));

    await waitFor(() => {
      expect(screen.getByText('AI generated text')).toBeInTheDocument();
    });
  });

  it('shows error on failed request', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false, status: 500 });
    const user = userEvent.setup();
    render(<AiGenerator />);
    await user.type(screen.getByPlaceholderText(/Escribe tu prompt aquí/i), 'Test');
    await user.click(screen.getByRole('button', { name: /Generar/i }));
    await waitFor(() => {
      expect(screen.getByText(/HTTP 500/i)).toBeInTheDocument();
    });
  });
});
