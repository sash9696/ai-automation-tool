import { Request, Response, NextFunction } from 'express';
export declare const generatePost: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getAllPosts: (_req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getPostById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const updatePost: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const deletePost: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const schedulePost: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const publishPost: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getPostAnalytics: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=postsController.d.ts.map