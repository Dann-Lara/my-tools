"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLLM = createLLM;
async function createLLM(provider, options = {}) {
    const { temperature = 0.7, maxTokens = 1024 } = options;
    switch (provider) {
        case 'gemini': {
            const { ChatGoogleGenerativeAI } = await Promise.resolve().then(() => __importStar(require('@langchain/google-genai')));
            const model = options.model ?? process.env['GEMINI_DEFAULT_MODEL'] ?? 'gemini-2.0-flash';
            return new ChatGoogleGenerativeAI({
                apiKey: process.env['GEMINI_API_KEY'],
                model,
                temperature,
                maxOutputTokens: maxTokens,
            });
        }
        case 'openai': {
            const { ChatOpenAI } = await Promise.resolve().then(() => __importStar(require('@langchain/openai')));
            const model = options.model ?? process.env['OPENAI_DEFAULT_MODEL'] ?? 'gpt-4o-mini';
            return new ChatOpenAI({
                apiKey: process.env['OPENAI_API_KEY'],
                modelName: model,
                temperature,
                maxTokens,
            });
        }
        case 'groq': {
            // Groq is OpenAI-compatible — use ChatOpenAI with custom baseURL
            const { ChatOpenAI } = await Promise.resolve().then(() => __importStar(require('@langchain/openai')));
            const model = options.model ?? process.env['GROQ_DEFAULT_MODEL'] ?? 'llama-3.1-70b-versatile';
            return new ChatOpenAI({
                apiKey: process.env['GROQ_API_KEY'],
                modelName: model,
                temperature,
                maxTokens,
                configuration: {
                    baseURL: 'https://api.groq.com/openai/v1',
                },
            });
        }
        case 'deepseek': {
            // DeepSeek is also OpenAI-compatible
            const { ChatOpenAI } = await Promise.resolve().then(() => __importStar(require('@langchain/openai')));
            const model = options.model ?? process.env['DEEPSEEK_DEFAULT_MODEL'] ?? 'deepseek-chat';
            return new ChatOpenAI({
                apiKey: process.env['DEEPSEEK_API_KEY'],
                modelName: model,
                temperature,
                maxTokens,
                configuration: {
                    baseURL: 'https://api.deepseek.com/v1',
                },
            });
        }
        case 'anthropic': {
            // Anthropic via OpenAI-compatible layer (or native @langchain/anthropic)
            // Using OpenAI-compat to avoid extra dep; swap to @langchain/anthropic if preferred
            const { ChatOpenAI } = await Promise.resolve().then(() => __importStar(require('@langchain/openai')));
            const model = options.model ?? process.env['ANTHROPIC_DEFAULT_MODEL'] ?? 'claude-3-haiku-20240307';
            return new ChatOpenAI({
                apiKey: process.env['ANTHROPIC_API_KEY'],
                modelName: model,
                temperature,
                maxTokens,
                configuration: {
                    baseURL: 'https://api.anthropic.com/v1',
                    defaultHeaders: { 'anthropic-version': '2023-06-01' },
                },
            });
        }
        default:
            throw new Error(`Unknown AI provider: ${String(provider)}`);
    }
}
//# sourceMappingURL=factory.js.map