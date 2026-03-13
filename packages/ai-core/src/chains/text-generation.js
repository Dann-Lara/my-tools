"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateText = generateText;
const executor_1 = require("../llm/executor");
async function generateText(options) {
    const result = await (0, executor_1.executeWithFallback)({
        prompt: options.prompt,
        systemMessage: options.systemMessage ?? 'You are a helpful AI assistant.',
        temperature: options.temperature,
        maxTokens: options.maxTokens ?? 4096,
        model: options.model,
    });
    return {
        text: result.text,
        model: result.model,
        provider: result.provider,
    };
}
//# sourceMappingURL=text-generation.js.map