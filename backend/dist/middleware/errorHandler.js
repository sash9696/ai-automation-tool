"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createError = exports.errorHandler = void 0;
const logger_1 = require("../utils/logger");
const errorHandler = (error, req, res, _next) => {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';
    (0, logger_1.logError)(error, `Error Handler - ${req.method} ${req.url}`);
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
exports.errorHandler = errorHandler;
const createError = (message, statusCode = 500, code) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    if (code)
        error.code = code;
    error.isOperational = true;
    return error;
};
exports.createError = createError;
//# sourceMappingURL=errorHandler.js.map