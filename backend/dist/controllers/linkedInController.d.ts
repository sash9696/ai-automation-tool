import { Request, Response, NextFunction } from 'express';
export declare const getAuthUrl: (_req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const handleCallback: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getStatus: (_req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const disconnect: (_req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const postToLinkedIn: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=linkedInController.d.ts.map