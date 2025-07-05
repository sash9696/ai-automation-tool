import { Request, Response, NextFunction } from 'express';
import { logError } from '../utils/logger';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  isOperational?: boolean;
}

export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  // Log error
  logError(error, `Error Handler - ${req.method} ${req.url}`);

  // Don't leak error details in production
  const errorResponse = {
    success: false,
    error: message,
    ...(process.env['NODE_ENV'] === 'development' && {
      stack: error.stack,
      code: error.code,
    }),
  };

  res.status(statusCode).json(errorResponse);
};

export const createError = (message: string, statusCode: number = 500, code?: string): AppError => {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  if (code) error.code = code;
  error.isOperational = true;
  return error;
}; 