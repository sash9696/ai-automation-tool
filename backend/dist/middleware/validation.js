"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = exports.validateSchedulePost = exports.validateGeneratePost = void 0;
const joi_1 = __importDefault(require("joi"));
const errorHandler_1 = require("./errorHandler");
const generatePostSchema = joi_1.default.object({
    topic: joi_1.default.string().valid('fullstack', 'dsa', 'interview', 'placement').required(),
    tone: joi_1.default.string().valid('professional', 'casual', 'motivational').optional(),
    includeHashtags: joi_1.default.boolean().optional(),
    includeCTA: joi_1.default.boolean().optional(),
});
const schedulePostSchema = joi_1.default.object({
    postId: joi_1.default.string().required(),
    scheduledTime: joi_1.default.date().greater('now').required(),
});
const validateGeneratePost = (req, _res, next) => {
    const { error } = generatePostSchema.validate(req.body);
    if (error) {
        return next((0, errorHandler_1.createError)(error.details[0]?.message || 'Validation error', 400));
    }
    next();
};
exports.validateGeneratePost = validateGeneratePost;
const validateSchedulePost = (req, _res, next) => {
    const { error } = schedulePostSchema.validate(req.body);
    if (error) {
        return next((0, errorHandler_1.createError)(error.details[0]?.message || 'Validation error', 400));
    }
    next();
};
exports.validateSchedulePost = validateSchedulePost;
const validate = (schema) => {
    return (req, _res, next) => {
        const { error } = schema.validate(req.body);
        if (error) {
            return next((0, errorHandler_1.createError)(error.details[0]?.message || 'Validation error', 400));
        }
        next();
    };
};
exports.validate = validate;
//# sourceMappingURL=validation.js.map