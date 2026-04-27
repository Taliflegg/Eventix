import { Router } from 'express';
import { eventsController } from "../controllers/events.controller";
const router: Router = Router();

router.get("/analytics/average-attendees-actual", eventsController.averageActualAttendeesController);

export default router;