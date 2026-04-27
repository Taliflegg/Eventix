//shabbat.router
import { Router } from 'express';
import { shabbatController } from "../controllers/shabbat.controller";
import { authMiddleware } from '../middlewares/authMiddleware';
import { analyticsController } from '../controllers/analytics.controller';

const router = Router();
router.get('/', authMiddleware, shabbatController.getAllShabbat);
router.get('/decision', authMiddleware, shabbatController.getShabbatDecision);
router.get('/analytics/weekly-active',analyticsController.getWeeklyActiveAccounts);
router.get('/location-shares',authMiddleware,shabbatController.getMyLocationShares);

router.post('/plan', authMiddleware, shabbatController.savePlan);

router.delete('/location-shares/:accountBId',authMiddleware, shabbatController.deleteMyLocationShare);


export default router;



