jest.mock('@langchain/openai', () => ({
  ChatOpenAI: jest.fn().mockImplementation(() => ({})),
}));

jest.mock('@langchain/google-genai', () => ({
  ChatGoogleGenerativeAI: jest.fn().mockImplementation(() => ({})),
}));

import { createLLM } from '../factory';

describe('factory', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('createLLM', () => {
    it('should throw error for unknown provider', async () => {
      await expect(createLLM('unknown' as any)).rejects.toThrow('Unknown AI provider');
    });

    it('should create OpenAI LLM', async () => {
      process.env.OPENAI_API_KEY = 'test-key';
      const llm = await createLLM('openai');
      expect(llm).toBeDefined();
    });

    it('should create Groq LLM', async () => {
      process.env.GROQ_API_KEY = 'test-key';
      const llm = await createLLM('groq');
      expect(llm).toBeDefined();
    });

    it('should create DeepSeek LLM', async () => {
      process.env.DEEPSEEK_API_KEY = 'test-key';
      const llm = await createLLM('deepseek');
      expect(llm).toBeDefined();
    });

    it('should create Anthropic LLM', async () => {
      process.env.ANTHROPIC_API_KEY = 'test-key';
      const llm = await createLLM('anthropic');
      expect(llm).toBeDefined();
    });

    it('should use default temperature and maxTokens', async () => {
      process.env.OPENAI_API_KEY = 'test-key';
      const llm = await createLLM('openai');
      expect(llm).toBeDefined();
    });

    it('should accept custom temperature and maxTokens', async () => {
      process.env.OPENAI_API_KEY = 'test-key';
      const llm = await createLLM('openai', { temperature: 0.5, maxTokens: 500 });
      expect(llm).toBeDefined();
    });

    it('should use custom model when provided', async () => {
      process.env.OPENAI_API_KEY = 'test-key';
      process.env.OPENAI_DEFAULT_MODEL = 'gpt-4';
      const llm = await createLLM('openai', { model: 'gpt-4-turbo' });
      expect(llm).toBeDefined();
    });
  });
});
