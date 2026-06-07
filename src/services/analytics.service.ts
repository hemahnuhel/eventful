import prisma from '../config/prisma';
import { getCache, setCache } from '../utils/cache';
import { CACHE_TTL } from '../config/redis';

export const analyticsService = {
  async getCreatorOverview(creatorId: string) {
    const key = `analytics:creator:${creatorId}`;
    const cached = await getCache(key);
    if (cached) return cached;

    const events = await prisma.event.findMany({ where: { creatorId }, select: { id: true } });
    const eventIds = events.map((e) => e.id);

    const [totalTickets, totalRevenue, scannedTickets] = await Promise.all([
      prisma.ticket.count({ where: { eventId: { in: eventIds }, status: 'PAID' } }),
      prisma.ticket.aggregate({
        where: { eventId: { in: eventIds }, status: 'PAID' },
        _sum: { amountPaid: true },
      }),
      prisma.ticket.count({
        where: { eventId: { in: eventIds }, status: 'PAID', scannedAt: { not: null } },
      }),
    ]);

    const result = {
      totalEvents: events.length,
      totalTickets,
      totalRevenue: totalRevenue._sum.amountPaid ?? 0,
      scannedTickets,
    };

    await setCache(key, result, CACHE_TTL.MEDIUM);
    return result;
  },

  async getEventStats(eventId: string, creatorId: string) {
    const event = await prisma.event.findFirst({ where: { id: eventId, creatorId } });
    if (!event) return null;

    const [sold, scanned, revenue] = await Promise.all([
      prisma.ticket.count({ where: { eventId, status: 'PAID' } }),
      prisma.ticket.count({ where: { eventId, status: 'PAID', scannedAt: { not: null } } }),
      prisma.ticket.aggregate({
        where: { eventId, status: 'PAID' },
        _sum: { amountPaid: true },
      }),
    ]);

    return {
      capacity: event.capacity,
      sold, scanned,
      available: event.capacity - sold,
      revenue: revenue._sum.amountPaid ?? 0,
    };
  },
};
