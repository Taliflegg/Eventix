//waiting_list.router
import { Router } from 'express';
import { waitingListController } from '../controllers/waiting_list.controllers';

const router = Router();

// קריאה לפעולה אחרי שמחקו משתמש מאירוע
router.post('/handle-user-removed', waitingListController.handleUserRemoved);

export default router;