import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { reminderService } from '../services/reminder.service';

export const createReminder = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const reminder = await reminderService.create(req.user!.id, req.body);
    res.status(201).json({ success: true, message: 'Reminder set', data: reminder });
  } catch (err) { next(err); }
};

export const getMyReminders = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const reminders = await reminderService.getUserReminders(req.user!.id);
    res.json({ success: true, data: reminders });
  } catch (err) { next(err); }
};

export const deleteReminder = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await reminderService.delete(req.params.id, req.user!.id);
    res.json({ success: true, message: 'Reminder deleted' });
  } catch (err) { next(err); }
};
