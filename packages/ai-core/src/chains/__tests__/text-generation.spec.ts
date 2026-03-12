jest.mock('../../llm/executor', () => ({
  executeWithFallback: jest.fn(),
}));

import { generateText } from '../text-generation';
import { executeWithFallback } from '../../llm/executor';

describe('text-generation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should generate text with default options', async () => {
    (executeWithFallback as jest.Mock).mockResolvedValue({
      text: 'Generated text response',
      provider: 'openai',
      model: 'gpt-4o-mini',
    });

    const result = await generateText({ prompt: 'Say hello' });

    expect(result.text).toBe('Generated text response');
    expect(result.model).toBe('gpt-4o-mini');
    expect(executeWithFallback).toHaveBeenCalledWith({
      prompt: 'Say hello',
      systemMessage: 'You are a helpful AI assistant.',
      temperature: undefined,
      maxTokens: 4096,
    });
  });

  it('should use custom system message when provided', async () => {
    (executeWithFallback as jest.Mock).mockResolvedValue({
      text: 'Pirate response',
      provider: 'openai',
      model: 'gpt-4o-mini',
    });

    const result = await generateText({
      prompt: 'Hello',
      systemMessage: 'You are a pirate',
    });

    expect(result.text).toBe('Pirate response');
    expect(executeWithFallback).toHaveBeenCalledWith(
      expect.objectContaining({
        systemMessage: 'You are a pirate',
      })
    );
  });

  it('should pass through custom temperature and maxTokens', async () => {
    (executeWithFallback as jest.Mock).mockResolvedValue({
      text: 'Test',
      provider: 'openai',
      model: 'gpt-4o-mini',
    });

    await generateText({
      prompt: 'Test',
      temperature: 0.5,
      maxTokens: 500,
    });

    expect(executeWithFallback).toHaveBeenCalledWith(
      expect.objectContaining({
        temperature: 0.5,
        maxTokens: 500,
      })
    );
  });
});
