jest.mock('../../providers/registry', () => ({
  getActiveProviders: jest.fn(),
  isExhaustedError: jest.fn(),
}));

jest.mock('../factory', () => ({
  createLLM: jest.fn(),
}));

import { executeWithFallback } from '../executor';
import { getActiveProviders, isExhaustedError } from '../../providers/registry';
import { createLLM } from '../factory';

describe('executor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should throw error if no providers configured', async () => {
    (getActiveProviders as jest.Mock).mockReturnValue([]);

    await expect(executeWithFallback({ prompt: 'test' })).rejects.toThrow(
      'No AI providers configured'
    );
  });

  it('should execute with first available provider', async () => {
    const mockProvider = {
      name: 'openai',
      priority: 1,
      envKey: 'OPENAI_API_KEY',
      defaultModel: 'gpt-4o-mini',
      modelEnvKey: 'OPENAI_DEFAULT_MODEL',
      available: () => true,
    };

    (getActiveProviders as jest.Mock).mockReturnValue([mockProvider]);
    (createLLM as jest.Mock).mockResolvedValue({
      invoke: jest.fn().mockResolvedValue({ content: 'test response' }),
    });
    (isExhaustedError as jest.Mock).mockReturnValue(false);

    const result = await executeWithFallback({ prompt: 'test prompt' });

    expect(result.text).toBeDefined();
    expect(result.provider).toBe('openai');
  });

  it('should fallback to next provider on exhaustion', async () => {
    const mockProvider1 = {
      name: 'openai',
      priority: 1,
      envKey: 'OPENAI_API_KEY',
      defaultModel: 'gpt-4o-mini',
      modelEnvKey: 'OPENAI_DEFAULT_MODEL',
      available: () => true,
    };
    const mockProvider2 = {
      name: 'groq',
      priority: 2,
      envKey: 'GROQ_API_KEY',
      defaultModel: 'llama-3.1-70b-versatile',
      modelEnvKey: 'GROQ_DEFAULT_MODEL',
      available: () => true,
    };

    (getActiveProviders as jest.Mock).mockReturnValue([mockProvider1, mockProvider2]);
    (createLLM as jest.Mock)
      .mockRejectedValueOnce(new Error('rate limit'))
      .mockResolvedValueOnce({
        invoke: jest.fn().mockResolvedValue({ content: 'fallback response' }),
      });
    (isExhaustedError as jest.Mock).mockReturnValue(true);

    const result = await executeWithFallback({ prompt: 'test prompt' });

    expect(result.text).toBeDefined();
    expect(result.provider).toBe('groq');
    expect(createLLM).toHaveBeenCalledTimes(2);
  });

  it('should throw non-recoverable errors immediately', async () => {
    const mockProvider = {
      name: 'openai',
      priority: 1,
      envKey: 'OPENAI_API_KEY',
      defaultModel: 'gpt-4o-mini',
      modelEnvKey: 'OPENAI_DEFAULT_MODEL',
      available: () => true,
    };

    (getActiveProviders as jest.Mock).mockReturnValue([mockProvider]);
    (createLLM as jest.Mock).mockRejectedValue(new Error('invalid prompt'));
    (isExhaustedError as jest.Mock).mockReturnValue(false);

    await expect(executeWithFallback({ prompt: 'test' })).rejects.toThrow('invalid prompt');
  });
});
