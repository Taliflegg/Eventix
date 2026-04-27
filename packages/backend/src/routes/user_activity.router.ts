import { Router } from 'express';
import { userActivityController } from '../controllers/user_activity.controller';
import { authMiddleware } from '../middlewares/authMiddleware';

const router: Router = Router();
router.post('/add', authMiddleware, userActivityController.addUserActivity);
router.get('/cross-platform-adoption', userActivityController.getCrossPlatformAdoptionRate);
router.get('/analytics/user-acquisition', userActivityController.getUserAcquisitionAnalytics);
//  router.get('/overall-m onthly-active-users', userActivityController.getMonthlyActiveUsersByApp);
router.get('/overall-monthly-active-users', userActivityController.getOverallMonthlyActiveUsers);
router.get('/monthly-active-users-by-app', userActivityController.getMonthlyActiveUsersByApp);






export default router;
