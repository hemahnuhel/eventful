import { Role } from '@prisma/client';
import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';

export const authorize = (...roles: Role[]) =>
  (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    next();
  };
