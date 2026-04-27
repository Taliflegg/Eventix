import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/authMiddleware';




const router: Router = Router();
router.get('/user', authMiddleware, AuthController.getAuthenticatedUser);
router.post('/password/forgot-password', AuthController.forgotPassword);
router.post('/password/reset-password', AuthController.resetPassword);
router.post('/google/register', AuthController.googleRegister);

router.post('/google/check', AuthController.checkIfUserExists);
// הוספת הרישום הרגילה
router.post('/register', AuthController.register);
router.get('/auth/user', authMiddleware, AuthController.getAuthenticatedUser);
export default router;
