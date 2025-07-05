import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
export declare const validateGeneratePost: (req: Request, _res: Response, next: NextFunction) => void;
export declare const validateSchedulePost: (req: Request, _res: Response, next: NextFunction) => void;
export declare const validate: (schema: Joi.ObjectSchema) => (req: Request, _res: Response, next: NextFunction) => void;
//# sourceMappingURL=validation.d.ts.map