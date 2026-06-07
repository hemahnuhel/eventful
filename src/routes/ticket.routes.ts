import { Router } from 'express';
import { verifyTicket, getMyTickets } from '../controllers/ticket.controller';
import { authenticate } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Tickets
 *     description: Ticket retrieval and QR verification
 */

/**
 * @swagger
 * /tickets/mine:
 *   get:
 *     tags: [Tickets]
 *     summary: List the logged-in eventee's tickets (with QR codes)
 *     responses:
 *       200: { description: User's tickets }
 *       403: { description: Eventees only }
 */
router.get('/mine', authenticate, authorize('EVENTEE'), getMyTickets);

/**
 * @swagger
 * /tickets/{id}/verify:
 *   patch:
 *     tags: [Tickets]
 *     summary: Verify and check in a ticket via its QR (creators only)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Ticket verified and checked in }
 *       400: { description: Ticket invalid or already scanned }
 *       404: { description: Ticket not found }
 */
router.patch('/:id/verify', authenticate, authorize('CREATOR'), verifyTicket);

export default router;
