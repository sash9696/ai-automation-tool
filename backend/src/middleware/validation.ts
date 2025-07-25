import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { createError } from './errorHandler';

export const generatePostSchema = Joi.object({
  topic: Joi.string().valid('fullstack', 'dsa', 'interview', 'placement').optional(),
  includeHashtags: Joi.boolean().optional(),
  includeCTA: Joi.boolean().optional(),
  customPrompt: Joi.string().optional(),
  useCustomPrompt: Joi.boolean().optional(),
  vibe: Joi.string().optional(),
  postType: Joi.string().optional(),
});

const schedulePostSchema = Joi.object({
  postId: Joi.string().required(),
  scheduledTime: Joi.date().greater('now').required(),
});

// Validation middleware
export const validateGeneratePost = (req: Request, _res: Response, next: NextFunction) => {
  const { error } = generatePostSchema.validate(req.body);
  
  if (error) {
    return next(createError(error.details[0]?.message || 'Validation error', 400));
  }
  
  next();
};

export const validateSchedulePost = (req: Request, _res: Response, next: NextFunction) => {
  const { error } = schedulePostSchema.validate(req.body);
  
  if (error) {
    return next(createError(error.details[0]?.message || 'Validation error', 400));
  }
  
  next();
};

// Generic validation middleware
export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      return next(createError(error.details[0]?.message || 'Validation error', 400));
    }
    
    next();
  };
}; 