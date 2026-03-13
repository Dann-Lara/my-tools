/**
 * Base Agent — provider-agnostic
 * Uses the first available provider that supports tool/function calling.
 * Gemini 1.5+, GPT-4o, Groq Llama-3, DeepSeek-chat all support it.
 */
import { AgentExecutor } from 'langchain/agents';
import type { Tool } from '@langchain/core/tools';
export interface AgentOptions {
    tools?: Tool[];
    temperature?: number;
}
export declare function createBaseAgent(options?: AgentOptions): Promise<AgentExecutor>;
//# sourceMappingURL=base-agent.d.ts.map