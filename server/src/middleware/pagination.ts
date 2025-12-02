import { Request, Response, NextFunction } from 'express';

export interface PaginationParams {
  limit: number;
  offset: number;
}

declare global {
  namespace Express {
    interface Request {
      pagination?: PaginationParams;
    }
  }
}

export const paginationMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const limit = parseInt(req.query.limit as string, 10) || 10;
  const offset = parseInt(req.query.offset as string, 10) || 0;

  // Validate limits
  const validatedLimit = Math.min(Math.max(1, limit), 100); // Between 1 and 100
  const validatedOffset = Math.max(0, offset); // At least 0

  req.pagination = {
    limit: validatedLimit,
    offset: validatedOffset,
  };

  next();
};
