import type { GeneratePostRequest } from '../types';
export declare const generateAIPost: (request: GeneratePostRequest) => Promise<string>;
export declare const analyzePostPerformance: (content: string) => Promise<{
    viralScore: number;
    suggestions: string[];
}>;
//# sourceMappingURL=aiService.d.ts.map