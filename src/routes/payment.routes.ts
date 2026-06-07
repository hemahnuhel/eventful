import { Router, Request, Response, NextFunction } from 'express';
import Paystack from 'paystack';
import crypto from 'crypto';
import { authenticate } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';
import { AuthRequest } from '../types';
import { ticketService } from '../services/ticket.service';
import { env } from '../config/env';
import prisma from '../config/prisma';

const router = Router();
const paystack = Paystack(env.PAYSTACK_SECRET_KEY);

/**
 * @swagger
 * tags:
 *   - name: Payments
 *     description: Paystack payment initiation and webhook
 */

/**
 * @swagger
 * /payments/initiate:
 *   post:
 *     tags: [Payments]
 *     summary: Initiate ticket payment (eventees only)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [eventId]
 *             properties:
 *               eventId: { type: string }
 *     responses:
 *       200: { description: Returns Paystack authorization URL }
 *       400: { description: Event unavailable or sold out }
 *       404: { description: Event not found }
 */
// Initiate payment
router.post(
  '/initiate',
  authenticate,
  authorize('EVENTEE'),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { eventId } = req.body;
      const user = req.user!;

      if (!eventId) {
        return res.status(400).json({ success: false, message: 'eventId is required' });
      }

      const event = await prisma.event.findUnique({ where: { id: eventId } });
      if (!event) {
        return res.status(404).json({ success: false, message: 'Event not found' });
      }

      if (!event.isPublished) {
        return res.status(400).json({ success: false, message: 'Event is not available' });
      }

      const soldCount = await prisma.ticket.count({
        where: { eventId, status: 'PAID' },
      });
      if (soldCount >= event.capacity) {
        return res.status(400).json({ success: false, message: 'Event is sold out' });
      }

      // Amount in kobo (Paystack uses smallest currency unit)
      const amountInKobo = Number(event.price) * 100;

      const response = await paystack.transaction.initialize({
        email: user.email,
        amount: amountInKobo,
        metadata: {
          eventId: event.id,
          userId: user.id,
          eventTitle: event.title,
        },
        callback_url: `${env.CLIENT_URL}/payment/verify`,
      });

      res.json({
        success: true,
        message: 'Payment initialized',
        data: {
          authorizationUrl: response.data.authorization_url,
          accessCode: response.data.access_code,
          reference: response.data.reference,
          event: {
            id: event.id,
            title: event.title,
            price: event.price,
          },
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

// Paystack webhook
router.post('/webhook', async (req: Request & { rawBody?: Buffer }, res: Response) => {
  const payload = req.rawBody ?? Buffer.from(JSON.stringify(req.body));
  const hash = crypto
    .createHmac('sha512', env.PAYSTACK_SECRET_KEY)
    .update(payload)
    .digest('hex');

  if (hash !== req.headers['x-paystack-signature']) {
    return res.status(400).send('Invalid signature');
  }

  const { event, data } = req.body;

  if (event === 'charge.success') {
    const { metadata, reference } = data;

    // Guard: skip if ticket already exists for this reference
    const existing = await prisma.ticket.findUnique({
      where: { paystackRef: reference },
    });

    if (!existing) {
      await ticketService.purchase(metadata.eventId, metadata.userId, reference);
    }
  }

  res.sendStatus(200);
});

export default router;