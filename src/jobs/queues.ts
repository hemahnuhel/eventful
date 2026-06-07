import { Queue } from 'bullmq';
import { redis } from '../config/redis';

const connection = { host: redis.options.host, port: redis.options.port };

export const reminderQueue = new Queue('reminders', { connection });
export const emailQueue = new Queue('emails', { connection });
