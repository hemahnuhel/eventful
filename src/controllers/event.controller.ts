import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { eventService } from '../services/event.service';
import { env } from '../config/env';

export const createEvent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const event = await eventService.create(req.user!.id, req.body);
    res.status(201).json({ success: true, message: 'Event created', data: event });
  } catch (err) { next(err); }
};

export const getEvents = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page, limit } = req.query as any;
    const result = await eventService.findAll(Number(page) || 1, Number(limit) || 10);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

export const getEvent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const event = await eventService.findOne(req.params.id);
    res.json({ success: true, data: event });
  } catch (err) { next(err); }
};

export const updateEvent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const event = await eventService.update(req.params.id, req.user!.id, req.body);
    res.json({ success: true, message: 'Event updated', data: event });
  } catch (err) { next(err); }
};

export const getMyEvents = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page, limit } = req.query as any;
    const result = await eventService.getCreatorEvents(req.user!.id, Number(page) || 1, Number(limit) || 10);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

export const getShareLinks = (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const eventUrl = encodeURIComponent(`${env.CLIENT_URL}/events/${id}`);
  res.json({
    success: true,
    data: {
      twitter: `https://twitter.com/intent/tweet?url=${eventUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${eventUrl}`,
      whatsapp: `https://api.whatsapp.com/send?text=${eventUrl}`,
      link: `${env.CLIENT_URL}/events/${id}`,
    },
  });
};
