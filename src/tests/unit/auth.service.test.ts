import { authService } from '../../services/auth.service';
import prisma from '../../config/prisma';
import * as hash from '../../utils/hash';

jest.mock('../../config/prisma', () => ({
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
}));

jest.mock('../../utils/hash');

describe('authService', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('register', () => {
    it('throws 409 if email already exists', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: '1' });

      await expect(
        authService.register({
          email: 'test@test.com',
          password: 'pass1234',
          firstName: 'Test',
          lastName: 'User',
          role: 'EVENTEE',
        })
      ).rejects.toMatchObject({ statusCode: 409 });
    });

    it('creates user and returns token', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (hash.hashPassword as jest.Mock).mockResolvedValue('hashed');
      (prisma.user.create as jest.Mock).mockResolvedValue({
        id: 'uuid-1', email: 'test@test.com', firstName: 'Test', lastName: 'User', role: 'EVENTEE',
      });

      const result = await authService.register({
        email: 'test@test.com', password: 'pass1234',
        firstName: 'Test', lastName: 'User', role: 'EVENTEE',
      });

      expect(result).toHaveProperty('token');
      expect(result.user.email).toBe('test@test.com');
    });
  });

  describe('login', () => {
    it('throws 401 on wrong credentials', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(
        authService.login({ email: 'x@x.com', password: 'wrong' })
      ).rejects.toMatchObject({ statusCode: 401 });
    });
  });
});
