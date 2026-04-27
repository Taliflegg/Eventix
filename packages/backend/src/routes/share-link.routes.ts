import { Router } from 'express';
import { getTokenForEvent, shareLinkController } from '../controllers/share-link.controller';
import { authMiddleware } from '../middlewares/authMiddleware';
import { optionalAuthMiddleware } from '../middlewares/optionalAuth';

const router = Router();

router.get('/by-token/:token',optionalAuthMiddleware, shareLinkController.getEventByToken);
router.get('/token/:eventId', getTokenForEvent);
export default router;
