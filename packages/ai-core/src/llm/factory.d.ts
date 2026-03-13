/**
 * LLM Factory
 * ────────────
 * Creates the appropriate LangChain chat model for each provider.
 * Returns a BaseChatModel — all providers share the same interface.
 */
import type { BaseChatModel } from '@langchain/core/language_models/chat_models';
import type { ProviderName } from '../providers/registry';
export interface LLMOptions {
    temperature?: number;
    maxTokens?: number;
    model?: string;
}
export declare function createLLM(provider: ProviderName, options?: LLMOptions): Promise<BaseChatModel>;
//# sourceMappingURL=factory.d.ts.map