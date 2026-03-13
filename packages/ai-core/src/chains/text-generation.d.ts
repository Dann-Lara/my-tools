export interface GenerateTextOptions {
    prompt: string;
    systemMessage?: string;
    temperature?: number;
    maxTokens?: number;
    model?: string;
}
export interface GenerateTextResult {
    text: string;
    model: string;
    provider: string;
}
export declare function generateText(options: GenerateTextOptions): Promise<GenerateTextResult>;
//# sourceMappingURL=text-generation.d.ts.map