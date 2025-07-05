import { Request, Response, NextFunction } from 'express';
export interface AppError extends Error {
    statusCode?: number;
    code?: string;
    isOperational?: boolean;
}
export declare const errorHandler: (error: AppError, req: Request, res: Response, _next: NextFunction) => void;
export declare const createError: (message: string, statusCode?: number, code?: string) => AppError;
//# sourceMappingURL=errorHandler.d.ts.map