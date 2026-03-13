"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBaseAgent = createBaseAgent;
/**
 * Base Agent — provider-agnostic
 * Uses the first available provider that supports tool/function calling.
 * Gemini 1.5+, GPT-4o, Groq Llama-3, DeepSeek-chat all support it.
 */
const agents_1 = require("langchain/agents");
const prompts_1 = require("@langchain/core/prompts");
const registry_1 = require("../providers/registry");
const factory_1 = require("../llm/factory");
async function createBaseAgent(options = {}) {
    const { tools = [], temperature = 0 } = options;
    const providers = (0, registry_1.getActiveProviders)();
    if (providers.length === 0) {
        throw new Error('No AI providers configured for agent.');
    }
    // Try providers in order until one works for agent creation
    let llm = null;
    for (const provider of providers) {
        try {
            llm = await (0, factory_1.createLLM)(provider.name, { temperature });
            break;
        }
        catch {
            continue;
        }
    }
    if (!llm)
        throw new Error('Could not initialize any AI provider for agent.');
    const prompt = prompts_1.ChatPromptTemplate.fromMessages([
        ['system', 'You are a helpful AI assistant with access to tools.'],
        ['human', '{input}'],
        new prompts_1.MessagesPlaceholder('agent_scratchpad'),
    ]);
    // createToolCallingAgent works with any model that supports tool use
    const agent = await (0, agents_1.createToolCallingAgent)({ llm, tools, prompt });
    return new agents_1.AgentExecutor({
        agent,
        tools,
        verbose: process.env['NODE_ENV'] === 'development',
    });
}
//# sourceMappingURL=base-agent.js.map