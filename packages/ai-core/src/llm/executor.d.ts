import { type ProviderName } from '../providers/registry';
import { type LLMOptions } from './factory';
export interface ExecuteOptions extends LLMOptions {
    prompt: string;
    systemMessage?: string;
}
export interface ExecuteResult {
    text: string;
    provider: ProviderName;
    model: string;
}
export declare function executeWithFallback(options: ExecuteOptions): Promise<ExecuteResult>;
//# sourceMappingURL=executor.d.ts.map