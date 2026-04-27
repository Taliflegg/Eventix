//user_event.router.ts
import { Router } from 'express';
import { UserEventsController } from '../controllers/user_events.controller';
import { authMiddleware } from '../middlewares/authMiddleware';
const router = Router();
router.get('/', UserEventsController.getAllUserEvents);
router.get('/:id', UserEventsController.getUserEventByUserId);
router.post('/', UserEventsController.createUserEvent);
router.delete('/remove-user',authMiddleware, UserEventsController.removeUserFromEvent);

export default router;