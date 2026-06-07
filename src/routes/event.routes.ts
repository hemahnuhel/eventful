import { Router } from 'express';
import {
  createEvent, getEvents, getEvent,
  updateEvent, getMyEvents, getShareLinks,
} from '../controllers/event.controller';
import { authenticate } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';
import { validate } from '../middlewares/validate';
import { z } from 'zod';

const router = Router();

const createEventSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  location: z.string().min(3),
  price: z.number().min(0),
  capacity: z.number().int().min(1),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
});

/**
 * @swagger
 * tags:
 *   - name: Events
 *     description: Event creation, listing, and sharing
 */

/**
 * @swagger
 * /events:
 *   get:
 *     tags: [Events]
 *     summary: List all published events (paginated, cached)
 *     security: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200: { description: List of events }
 */
router.get('/', getEvents);

/**
 * @swagger
 * /events/creator/mine:
 *   get:
 *     tags: [Events]
 *     summary: List events created by the logged-in creator
 *     responses:
 *       200: { description: Creator's events }
 *       403: { description: Creators only }
 */
router.get('/creator/mine', authenticate, authorize('CREATOR'), getMyEvents);

/**
 * @swagger
 * /events/{id}:
 *   get:
 *     tags: [Events]
 *     summary: Get a single event by id
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Event detail }
 *       404: { description: Event not found }
 */
router.get('/:id', getEvent);

/**
 * @swagger
 * /events/{id}/share:
 *   get:
 *     tags: [Events]
 *     summary: Get social share links for an event
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Share links for Twitter, Facebook, WhatsApp }
 */
router.get('/:id/share', getShareLinks);

/**
 * @swagger
 * /events:
 *   post:
 *     tags: [Events]
 *     summary: Create an event (creators only)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, description, location, price, capacity, startsAt, endsAt]
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               location: { type: string }
 *               price: { type: number }
 *               capacity: { type: integer }
 *               startsAt: { type: string, format: date-time }
 *               endsAt: { type: string, format: date-time }
 *     responses:
 *       201: { description: Event created }
 *       403: { description: Creators only }
 */
router.post('/', authenticate, authorize('CREATOR'), validate(createEventSchema), createEvent);

/**
 * @swagger
 * /events/{id}:
 *   patch:
 *     tags: [Events]
 *     summary: Update an event (owner creator only)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Event updated }
 *       403: { description: Forbidden }
 */
router.patch('/:id', authenticate, authorize('CREATOR'), updateEvent);

export default router;
