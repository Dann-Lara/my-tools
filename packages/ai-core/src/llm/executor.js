"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeWithFallback = executeWithFallback;
/**
 * AI Executor — Provider Fallback Chain
 * ──────────────────────────────────────
 * Tries each configured provider in priority order.
 * Falls through to the next provider automatically on:
 *   - Quota/rate limit exceeded
 *   - Invalid API key / billing issue
 *   - Service unavailable (5xx)
 *
 * Does NOT fall through on:
 *   - Prompt validation errors
 *   - Content policy violations
 *   - Malformed request (4xx except 401/403/429)
 *
 * Usage:
 *   const { text, provider, model } = await executeWithFallback({ prompt });
 */
const output_parsers_1 = require("@langchain/core/output_parsers");
const messages_1 = require("@langchain/core/messages");
const registry_1 = require("../providers/registry");
const factory_1 = require("./factory");
// ── Logger (uses process.env to avoid NestJS dependency in this package) ────
function log(level, msg) {
    const ts = new Date().toISOString();
    const prefix = `[AI-Core][${level.toUpperCase()}] ${ts}`;
    if (level === 'error')
        console.error(prefix, msg);
    else if (level === 'warn')
        console.warn(prefix, msg);
    else
        console.log(prefix, msg);
}
async function executeWithFallback(options) {
    const { prompt, systemMessage = 'You are a helpful AI assistant.', temperature, maxTokens, model, } = options;
    const providers = (0, registry_1.getActiveProviders)();
    if (providers.length === 0) {
        throw new Error('No AI providers configured. Set at least one of: GEMINI_API_KEY, OPENAI_API_KEY, GROQ_API_KEY, DEEPSEEK_API_KEY, ANTHROPIC_API_KEY');
    }
    const errors = [];
    for (const providerConfig of providers) {
        const providerModel = model ?? process.env[providerConfig.modelEnvKey] ?? providerConfig.defaultModel;
        try {
            log('info', `Trying provider: ${providerConfig.name} (${providerModel})`);
            const llm = await (0, factory_1.createLLM)(providerConfig.name, { temperature, maxTokens, model: providerModel });
            const messages = [
                new messages_1.SystemMessage(systemMessage),
                new messages_1.HumanMessage(prompt),
            ];
            const outputParser = new output_parsers_1.StringOutputParser();
            const result = await llm.invoke(messages);
            const text = await outputParser.invoke(result);
            log('info', `Success: ${providerConfig.name} (${providerModel})`);
            // Debug: log a preview of what the model returned (helps diagnose JSON parse issues)
            const preview = text.length > 300 ? `${text.slice(0, 300)}...[+${text.length - 300}]` : text;
            log('info', `Response preview: ${preview}`);
            return { text, provider: providerConfig.name, model: providerModel };
        }
        catch (err) {
            const errMsg = err instanceof Error ? err.message : String(err);
            errors.push(`${providerConfig.name}: ${errMsg}`);
            if ((0, registry_1.isExhaustedError)(err)) {
                log('warn', `Provider ${providerConfig.name} exhausted/unavailable (${errMsg}), trying next...`);
                continue; // → try next provider
            }
            // Non-recoverable error (bad prompt, content policy, etc.) — don't try other providers
            log('error', `Provider ${providerConfig.name} failed with non-recoverable error: ${errMsg}`);
            throw err;
        }
    }
    // All providers failed
    const summary = errors.join(' | ');
    log('error', `All AI providers failed: ${summary}`);
    throw new Error(`All AI providers failed. Errors: ${summary}`);
}
//# sourceMappingURL=executor.js.map