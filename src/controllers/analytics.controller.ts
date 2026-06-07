import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { analyticsService } from '../services/analytics.service';

export const getOverview = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = await analyticsService.getCreatorOverview(req.user!.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

export const getEventStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = await analyticsService.getEventStats(req.params.id, req.user!.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};
