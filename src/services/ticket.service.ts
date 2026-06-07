import prisma from '../config/prisma';
import { generateQrCode } from '../utils/qrcode';
import { AppError } from '../middlewares/errorHandler';
import { emailQueue } from '../jobs/queues';

export const ticketService = {
  async purchase(eventId: string, userId: string, paystackRef: string) {
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new AppError(404, 'Event not found');

    const soldCount = await prisma.ticket.count({
      where: { eventId, status: 'PAID' },
    });
    if (soldCount >= event.capacity) throw new AppError(400, 'Event is sold out');

    // Create ticket first so we have the real id to encode in the QR
    const ticket = await prisma.ticket.create({
      data: {
        eventId, userId, status: 'PAID',
        paystackRef,
        amountPaid: event.price,
        purchasedAt: new Date(),
      },
      include: { user: true, event: true },
    });

    // QR encodes the verify URL for THIS ticket's real id
    const qrDataUrl = await generateQrCode(ticket.id);
    await prisma.ticket.update({
      where: { id: ticket.id },
      data: { qrCodeUrl: qrDataUrl },
    });
    ticket.qrCodeUrl = qrDataUrl;

    await emailQueue.add('ticket-confirmation', {
      to: ticket.user.email,
      subject: `Your ticket for ${ticket.event.title}`,
      html: `
        <h2>You're going to ${ticket.event.title}!</h2>
        <p>Date: ${ticket.event.startsAt.toDateString()}</p>
        <p>Location: ${ticket.event.location}</p>
        <p>Here is your QR code &mdash; present this at the entrance:</p>
        <img src="${qrDataUrl}" alt="QR Code" style="width:200px;height:200px;" />
        <p>Reference: ${ticket.paystackRef}</p>
      `,
    });

    return ticket;
  },

  async verify(ticketId: string) {
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: { event: true, user: { select: { firstName: true, lastName: true, email: true } } },
    });
    if (!ticket) throw new AppError(404, 'Ticket not found');
    if (ticket.status !== 'PAID') throw new AppError(400, 'Ticket is not valid');
    if (ticket.scannedAt) throw new AppError(400, 'Ticket already scanned');

    return prisma.ticket.update({
      where: { id: ticketId },
      data: { scannedAt: new Date() },
    });
  },

  async getUserTickets(userId: string) {
    return prisma.ticket.findMany({
      where: { userId },
      include: { event: true },
      orderBy: { createdAt: 'desc' },
    });
  },
};
