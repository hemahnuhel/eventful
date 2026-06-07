import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, firstName, lastName, role]
 *             properties:
 *               email: { type: string }
 *               password: { type: string, minLength: 8 }
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               role: { type: string, enum: [CREATOR, EVENTEE] }
 *     responses:
 *       201: { description: User registered }
 *       409: { description: Email already in use }
 */
export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json({ success: true, message: 'Registration successful', data: result });
  } catch (err) {
    next(err);
  }
};

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login
 */
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.login(req.body);
    res.json({ success: true, message: 'Login successful', data: result });
  } catch (err) {
    next(err);
  }
};

export const me = (req: Request, res: Response) => {
  const { passwordHash: _, ...user } = req.user as any;
  res.json({ success: true, data: user });
};
