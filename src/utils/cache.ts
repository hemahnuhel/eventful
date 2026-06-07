import { redis } from '../config/redis';

export const getCache = async <T>(key: string): Promise<T | null> => {
  const data = await redis.get(key);
  return data ? (JSON.parse(data) as T) : null;
};

export const setCache = async (key: string, value: unknown, ttl: number) => {
  await redis.set(key, JSON.stringify(value), 'EX', ttl);
};

export const deleteCache = async (...keys: string[]) => {
  if (keys.length) await redis.del(...keys);
};

export const deleteCacheByPattern = async (pattern: string) => {
  const keys = await redis.keys(pattern);
  if (keys.length) await redis.del(...keys);
};
