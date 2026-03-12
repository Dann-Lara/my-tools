jest.mock('../../llm/executor', () => ({
  executeWithFallback: jest.fn(),
}));

import { summarizeText } from '../summarization';
import { executeWithFallback } from '../../llm/executor';

describe('summarization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should summarize text with default options', async () => {
    (executeWithFallback as jest.Mock).mockResolvedValue({ text: 'Summary', provider: 'openai', model: 'gpt-4o-mini' });

    const result = await summarizeText({ text: 'Long text to summarize' });

    expect(result).toBe('Summary');
    expect(executeWithFallback).toHaveBeenCalledWith({
      systemMessage: 'You are an expert summarizer. Summarize text concisely in Spanish in under 200 words.',
      prompt: 'Text to summarize:\n\nLong text to summarize',
      temperature: 0.3,
      maxTokens: 512,
    });
  });

  it('should use custom maxLength', async () => {
    (executeWithFallback as jest.Mock).mockResolvedValue({ text: 'Short summary', provider: 'openai', model: 'gpt-4o-mini' });

    const result = await summarizeText({ text: 'Long text', maxLength: 50 });

    expect(result).toBe('Short summary');
    expect(executeWithFallback).toHaveBeenCalledWith(
      expect.objectContaining({
        systemMessage: expect.stringContaining('under 50 words'),
      })
    );
  });

  it('should use custom language', async () => {
    (executeWithFallback as jest.Mock).mockResolvedValue({ text: 'English summary', provider: 'openai', model: 'gpt-4o-mini' });

    const result = await summarizeText({ text: 'Long text', language: 'English' });

    expect(result).toBe('English summary');
    expect(executeWithFallback).toHaveBeenCalledWith(
      expect.objectContaining({
        systemMessage: expect.stringContaining('in English'),
      })
    );
  });
});
