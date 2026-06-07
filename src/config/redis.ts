import Redis from 'ioredis';
import { env } from './env';
import { logger } from './logger';

export const redis = new Redis(env.REDIS_URL);

export const connectRedis = async () => {
  await redis.ping();
  logger.info('Redis connected');
};

export const CACHE_TTL = { SHORT: 60, MEDIUM: 300, LONG: 3600 };
