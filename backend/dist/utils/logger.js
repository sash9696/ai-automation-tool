"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logApiResponse = exports.logError = exports.requestLogger = void 0;
const winston_1 = require("winston");
const { combine, timestamp, printf, colorize } = winston_1.format;
const logFormat = printf(({ level, message, timestamp, ...metadata }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(metadata).length > 0) {
        msg += ` ${JSON.stringify(metadata)}`;
    }
    return msg;
});
const logger = (0, winston_1.createLogger)({
    level: process.env['LOG_LEVEL'] || 'info',
    format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), logFormat),
    transports: [
        new winston_1.transports.Console({
            format: combine(colorize(), timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), logFormat)
        }),
        new winston_1.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            maxsize: 5242880,
            maxFiles: 5,
        }),
        new winston_1.transports.File({
            filename: 'logs/combined.log',
            maxsize: 5242880,
            maxFiles: 5,
        }),
    ],
});
const requestLogger = (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.info('HTTP Request', {
            method: req.method,
            url: req.url,
            status: res.statusCode,
            duration: `${duration}ms`,
            userAgent: req.get('User-Agent'),
            ip: req.ip,
        });
    });
    next();
};
exports.requestLogger = requestLogger;
const logError = (error, context) => {
    logger.error('Application Error', {
        message: error.message,
        stack: error.stack,
        context,
    });
};
exports.logError = logError;
const logApiResponse = (method, url, statusCode, responseTime) => {
    logger.info('API Response', {
        method,
        url,
        statusCode,
        responseTime: `${responseTime}ms`,
    });
};
exports.logApiResponse = logApiResponse;
exports.default = logger;
//# sourceMappingURL=logger.js.map