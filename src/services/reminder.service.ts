import prisma from '../config/prisma';
import { reminderQueue } from '../jobs/queues';
import { AppError } from '../middlewares/errorHandler';
import { ReminderUnit } from '@prisma/client';

export interface CreateReminderDto {
  eventId: string;
  value: number;
  unit: ReminderUnit;
}

const toMilliseconds = (value: number, unit: ReminderUnit): number => {
  const map: Record<ReminderUnit, number> = {
    MINUTES: value * 60 * 1000,
    HOURS:   value * 60 * 60 * 1000,
    DAYS:    value * 24 * 60 * 60 * 1000,
    WEEKS:   value * 7 * 24 * 60 * 60 * 1000,
  };
  return map[unit];
};

export const reminderService = {
  async create(userId: string, dto: CreateReminderDto) {
    const event = await prisma.event.findUnique({ where: { id: dto.eventId } });
    if (!event) throw new AppError(404, 'Event not found');

    const offsetMs = toMilliseconds(dto.value, dto.unit);
    const scheduledFor = new Date(event.startsAt.getTime() - offsetMs);

    if (scheduledFor <= new Date()) {
      throw new AppError(400, 'Reminder time has already passed');
    }

    const reminder = await prisma.reminder.create({
      data: {
        userId,
        eventId: dto.eventId,
        value: dto.value,
        unit: dto.unit,
        scheduledFor,
      },
    });

    const delay = scheduledFor.getTime() - Date.now();
    await reminderQueue.add(
      'send-reminder',
      { reminderId: reminder.id },
      { delay, jobId: reminder.id, removeOnComplete: true }
    );

    return reminder;
  },

  async getUserReminders(userId: string) {
    return prisma.reminder.findMany({
      where: { userId },
      include: { event: { select: { id: true, title: true, startsAt: true } } },
      orderBy: { scheduledFor: 'asc' },
    });
  },

  async delete(id: string, userId: string) {
    const reminder = await prisma.reminder.findUnique({ where: { id } });
    if (!reminder) throw new AppError(404, 'Reminder not found');
    if (reminder.userId !== userId) throw new AppError(403, 'Forbidden');

    const job = await reminderQueue.getJob(id);
    if (job) await job.remove();

    await prisma.reminder.delete({ where: { id } });
  },
};
