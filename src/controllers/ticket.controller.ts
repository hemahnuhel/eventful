import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { ticketService } from '../services/ticket.service';

export const verifyTicket = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const ticket = await ticketService.verify(req.params.id);
    res.json({ success: true, message: 'Ticket verified', data: ticket });
  } catch (err) { next(err); }
};

export const getMyTickets = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const tickets = await ticketService.getUserTickets(req.user!.id);
    res.json({ success: true, data: tickets });
  } catch (err) { next(err); }
};
