declare const logger: import("winston").Logger;
export declare const requestLogger: (req: any, res: any, next: any) => void;
export declare const logError: (error: Error, context?: string) => void;
export declare const logApiResponse: (method: string, url: string, statusCode: number, responseTime: number) => void;
export default logger;
//# sourceMappingURL=logger.d.ts.map