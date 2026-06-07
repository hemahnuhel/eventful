import { Router } from 'express';
import { createReminder, getMyReminders, deleteReminder } from '../controllers/reminder.controller';
import { authenticate } from '../middlewares/authenticate';
import { validate } from '../middlewares/validate';
import { z } from 'zod';

const router = Router();

const createReminderSchema = z.object({
  eventId: z.string().uuid(),
  value: z.number().int().min(1),
  unit: z.enum(['MINUTES', 'HOURS', 'DAYS', 'WEEKS']),
});

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   - name: Reminders
 *     description: Schedule event reminders (BullMQ-backed)
 */

/**
 * @swagger
 * /reminders:
 *   post:
 *     tags: [Reminders]
 *     summary: Schedule a reminder before an event
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [eventId, value, unit]
 *             properties:
 *               eventId: { type: string, format: uuid }
 *               value: { type: integer, example: 1 }
 *               unit: { type: string, enum: [MINUTES, HOURS, DAYS, WEEKS] }
 *     responses:
 *       201: { description: Reminder scheduled }
 *       400: { description: Reminder time already passed }
 *   get:
 *     tags: [Reminders]
 *     summary: List the logged-in user's reminders
 *     responses:
 *       200: { description: User's reminders }
 */
router.post('/', validate(createReminderSchema), createReminder);
router.get('/', getMyReminders);

/**
 * @swagger
 * /reminders/{id}:
 *   delete:
 *     tags: [Reminders]
 *     summary: Cancel a scheduled reminder
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Reminder deleted }
 *       403: { description: Forbidden }
 */
router.delete('/:id', deleteReminder);

export default router;
