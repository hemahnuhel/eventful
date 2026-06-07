import { Request } from 'express';
import { User } from '@prisma/client';

// Augment Express namespace so passport's req.user is typed as our User
declare global {
  namespace Express {
    interface User extends Omit<import('@prisma/client').User, ''> {}
  }
}

// Request with authenticated user attached
export interface AuthRequest extends Request {
  user?: User;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
