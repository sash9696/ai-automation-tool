import Joi from 'joi';

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

// Premium validation schemas
const premiumRequestSchema = Joi.object({
  domains: Joi.array().items(
    Joi.string().valid('technology', 'frontend', 'ai')
  ).min(1).max(3).optional().default(['technology', 'frontend', 'ai']),
  template: Joi.string().valid('viral', 'story', 'educational', 'controversy', 'listicle').optional(),
  count: Joi.number().integer().min(1).max(10).optional().default(7),
  scheduleTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional().default('09:00')
});

const scheduleBatchSchema = Joi.object({
  posts: Joi.array().items(
    Joi.object({
      title: Joi.string().required(),
      topic: Joi.string().required(),
      viralScore: Joi.number().min(0).max(100).required(),
      formattedContent: Joi.string().required(),
      template: Joi.string().required(),
      hashtags: Joi.array().items(Joi.string()).required(),
      resources: Joi.array().items(
        Joi.object({
          name: Joi.string().required(),
          url: Joi.string().uri().required()
        })
      ).required(),
      aiInsights: Joi.string().optional(),
      content: Joi.string().optional(),
      postId: Joi.string().optional(),
      status: Joi.string().optional(),
      createdAt: Joi.date().optional(),
      updatedAt: Joi.date().optional()
    }).unknown(true) // Allow additional fields
  ).min(1).max(7).required(),
  scheduleTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional().default('09:00'),
  timezone: Joi.string().optional().default('UTC')
});

// Validation middleware
export const validateGeneratePost = (req, res, next) => {
  const { error } = generatePostSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({ 
      success: false,
      error: 'Validation error', 
      message: error.details[0].message 
    });
  }
  
  next();
};

export const validateSchedulePost = (req, res, next) => {
  const { error } = schedulePostSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({ 
      success: false,
      error: 'Validation error', 
      message: error.details[0].message 
    });
  }
  
  next();
};

export const validatePremiumRequest = (req, res, next) => {
  const { error } = premiumRequestSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({ 
      success: false,
      error: 'Premium validation error', 
      message: error.details[0].message 
    });
  }
  
  next();
};

export const validateScheduleBatch = (req, res, next) => {
  const { error } = scheduleBatchSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({ 
      success: false,
      error: 'Batch scheduling validation error', 
      message: error.details[0].message 
    });
  }
  
  next();
};

// Generic validation middleware
export const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({ 
        success: false,
        error: 'Validation error', 
        message: error.details[0].message 
      });
    }
    
    next();
  };
}; 