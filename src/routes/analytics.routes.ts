import { Router } from 'express';
import { getOverview, getEventStats } from '../controllers/analytics.controller';
import { authenticate } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';

const router = Router();

router.use(authenticate, authorize('CREATOR'));

/**
 * @swagger
 * tags:
 *   - name: Analytics
 *     description: Creator analytics (cached)
 */

/**
 * @swagger
 * /analytics/overview:
 *   get:
 *     tags: [Analytics]
 *     summary: Overall stats across all of a creator's events
 *     responses:
 *       200: { description: Totals for events, tickets, revenue, check-ins }
 */
router.get('/overview', getOverview);

/**
 * @swagger
 * /analytics/events/{id}:
 *   get:
 *     tags: [Analytics]
 *     summary: Per-event stats (sold, available, scanned, revenue)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Event statistics }
 */
router.get('/events/:id', getEventStats);

export default router;
