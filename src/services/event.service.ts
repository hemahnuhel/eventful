import prisma from '../config/prisma';
import { getCache, setCache, deleteCache, deleteCacheByPattern } from '../utils/cache';
import { getPagination, buildMeta } from '../utils/paginate';
import { AppError } from '../middlewares/errorHandler';
import { CACHE_TTL } from '../config/redis';

const CACHE_KEY = {
  event: (id: string) => `event:${id}`,
  list: (page: number, limit: number) => `events:list:${page}:${limit}`,
};

export const eventService = {
  async create(creatorId: string, data: any) {
    const event = await prisma.event.create({ data: { ...data, creatorId } });
    await deleteCacheByPattern('events:list:*');
    return event;
  },

  async findAll(page = 1, limit = 10) {
    const key = CACHE_KEY.list(page, limit);
    const cached = await getCache(key);
    if (cached) return cached;

    const { take, skip } = getPagination(page, limit);
    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where: { isPublished: true },
        skip, take,
        orderBy: { startsAt: 'asc' },
        include: { creator: { select: { id: true, firstName: true, lastName: true } } },
      }),
      prisma.event.count({ where: { isPublished: true } }),
    ]);

    const result = { events, meta: buildMeta(total, page, limit) };
    await setCache(key, result, CACHE_TTL.MEDIUM);
    return result;
  },

  async findOne(id: string) {
    const key = CACHE_KEY.event(id);
    const cached = await getCache(key);
    if (cached) return cached;

    const event = await prisma.event.findUnique({
      where: { id },
      include: { creator: { select: { id: true, firstName: true, lastName: true } } },
    });
    if (!event) throw new AppError(404, 'Event not found');

    await setCache(key, event, CACHE_TTL.MEDIUM);
    return event;
  },

  async update(id: string, creatorId: string, data: any) {
    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) throw new AppError(404, 'Event not found');
    if (event.creatorId !== creatorId) throw new AppError(403, 'Forbidden');

    const updated = await prisma.event.update({ where: { id }, data });
    await deleteCache(CACHE_KEY.event(id));
    await deleteCacheByPattern('events:list:*');
    return updated;
  },

  async getCreatorEvents(creatorId: string, page = 1, limit = 10) {
    const { take, skip } = getPagination(page, limit);
    const [events, total] = await Promise.all([
      prisma.event.findMany({ where: { creatorId }, skip, take, orderBy: { createdAt: 'desc' } }),
      prisma.event.count({ where: { creatorId } }),
    ]);
    return { events, meta: buildMeta(total, page, limit) };
  },
};
