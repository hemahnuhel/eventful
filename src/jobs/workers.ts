import { Worker } from 'bullmq';
import { redis } from '../config/redis';
import { sendMail } from '../utils/mailer';
import { logger } from '../config/logger';
import prisma from '../config/prisma';

const connection = { host: redis.options.host, port: redis.options.port };

export const startWorkers = async () => {
  const emailWorker = new Worker(
    'emails',
    async (job) => {
      const { to, subject, html } = job.data;
      await sendMail({ to, subject, html });
    },
    { connection }
  );

  const reminderWorker = new Worker(
    'reminders',
    async (job) => {
      const { reminderId } = job.data;
      const reminder = await prisma.reminder.findUnique({
        where: { id: reminderId },
        include: { event: true, user: true },
      });
      if (!reminder || reminder.sent) return;

      await sendMail({
        to: reminder.user.email,
        subject: `Reminder: ${reminder.event.title} is coming up!`,
        html: `<p>Hi ${reminder.user.firstName}, just a reminder that <strong>${reminder.event.title}</strong> starts at ${reminder.event.startsAt}.</p>`,
      });

      await prisma.reminder.update({ where: { id: reminderId }, data: { sent: true } });
    },
    { connection }
  );

  emailWorker.on('failed', (job, err) => logger.error(`Email job failed: ${job?.id}`, { err }));
  reminderWorker.on('failed', (job, err) => logger.error(`Reminder job failed: ${job?.id}`, { err }));

  logger.info('BullMQ workers started');
};
