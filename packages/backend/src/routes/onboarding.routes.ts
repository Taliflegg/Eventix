
import express from 'express';
import {
  completeOnboarding,
  addAdditionalLocations
} from '../controllers/onboarding.controller';

const router = express.Router();

router.post('/complete', completeOnboarding);
router.post('/locations', addAdditionalLocations); // ← הנתיב החדש

export default router;
