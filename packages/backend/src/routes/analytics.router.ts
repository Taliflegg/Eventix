import { Router } from 'express';
import { analyticsController } from '../controllers/analytics.controller';

const router = Router();
router.get('/weekly-active',analyticsController.getWeeklyActiveAccounts);
router.get('/numActiveTrains', analyticsController.getActiveMealTrains);
router.get('/plans-this-week',analyticsController.getPlansThisWeek);

export default router;

