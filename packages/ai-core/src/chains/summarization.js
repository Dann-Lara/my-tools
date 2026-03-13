"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.summarizeText = summarizeText;
const executor_1 = require("../llm/executor");
async function summarizeText(options) {
    const { text, maxLength = 200, language = 'Spanish' } = options;
    const result = await (0, executor_1.executeWithFallback)({
        systemMessage: `You are an expert summarizer. Summarize text concisely in ${language} in under ${maxLength} words.`,
        prompt: `Text to summarize:\n\n${text}`,
        temperature: 0.3,
        maxTokens: 512,
    });
    return result.text;
}
//# sourceMappingURL=summarization.js.map