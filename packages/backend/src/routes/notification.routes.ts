import { Router } from 'express';
import * as notificationController from '../controllers/notification.controller';
import { authMiddleware } from '../middlewares/authMiddleware'; // אם יש לך מידלוור

const router = Router();

router.put(
  '/notification-preferences/:id',
  notificationController.updateNotificationPreferences
);
router.get(
  '/notification-preferences/:id',
  notificationController.getNotificationPreferences
);

export default router;
