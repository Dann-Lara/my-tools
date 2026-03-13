/**
 * AI Provider Registry
 * ─────────────────────
 * Providers are tried in priority order (lowest number = tried first).
 * If a provider fails with an "exhausted/auth/quota" error, the next is tried automatically.
 * Add new providers by adding an entry here + implementing a factory in /llm/.
 *
 * Environment variables drive which providers are active:
 *   GEMINI_API_KEY        → Google Gemini (gemini-1.5-flash / gemini-1.5-pro)
 *   OPENAI_API_KEY        → OpenAI (gpt-4o-mini / gpt-4o)
 *   GROQ_API_KEY          → Groq (llama-3.1-70b-versatile) — extremely fast, free tier
 *   DEEPSEEK_API_KEY      → DeepSeek (deepseek-chat) — OpenAI-compatible endpoint
 *   ANTHROPIC_API_KEY     → Anthropic Claude (claude-3-haiku)
 *
 * Priority can be overridden via AI_PROVIDER_PRIORITY env var:
 *   AI_PROVIDER_PRIORITY=gemini,groq,openai
 */
export type ProviderName = 'gemini' | 'openai' | 'groq' | 'deepseek' | 'anthropic';
export interface ProviderConfig {
    name: ProviderName;
    priority: number;
    envKey: string;
    defaultModel: string;
    modelEnvKey: string;
    available: () => boolean;
}
/**
 * Returns providers sorted by effective priority.
 * Respects AI_PROVIDER_PRIORITY env var for custom ordering.
 * Only returns providers that have their API key set.
 */
export declare function getActiveProviders(): ProviderConfig[];
/**
 * True if the error indicates the provider is exhausted/unavailable
 * (quota, billing, rate limit, auth) so we should try the next one.
 */
export declare function isExhaustedError(error: unknown): boolean;
//# sourceMappingURL=registry.d.ts.map