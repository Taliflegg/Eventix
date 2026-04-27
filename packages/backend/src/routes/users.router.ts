import { Router } from 'express';
import { usersController } from '../controllers/users.controller';
import { authMiddleware } from '../middlewares/authMiddleware';
import { upload } from '../middlewares/upload.middleware';
import { clearAuthCookies } from '../services/users.service';

// הוסיפי למעלה:

const router: Router = Router();



router.post('/insertEmailVerify', usersController.insertUserToEmailVerify);
router.post('/send-token', usersController.sendToken);
router.post('/verify-token', usersController.verifyToken);
router.post('/check-newUser', usersController.checkUser); 
router.put('/update-email', usersController.updateEmail);
// ---------- Authentication ----------
router.get('/auth/account-id', authMiddleware, usersController.getAccountIdForAuthenticatedUser);router.post('/changePassword', authMiddleware, usersController.changePassword);
router.get('/:email', usersController.getUserByEmail);
router.post('/:userId/uploadImage', upload.single('image'), usersController.uploadImage);
router.get('/bla/bla/getNewUsersCount', usersController.getNewUsersCount);
router.get('/bla/bla/getUserDietaryRestrictions', usersController.getEventDistribution);
router.delete('/account/:id', usersController.deleteAccount);
router.get('/user', authMiddleware, usersController.getAuthenticatedUser);
router.post('/login', usersController.login); // Assuming you have a loginUser method in your controller
// router.post('/upload-image', authMiddleware, upload.single('profileImage'), usersController.uploadProfileImage);
router.post('/logout', async (req, res) => {
  try {
    clearAuthCookies(res);
    res.status(200).json({ message: 'התנתקת בהצלחה!' });
  } catch (error: any) {
    console.error('שגיאה במהלך ההתנתקות:', error);
    res.status(500).json({ message: 'שגיאה בניתוק מהשרת.' });
  }
});
router.post('/verifyGoogleToken', usersController.verifyGoogleToken);
// ---------- Authenticated User ----------
router.get('/auth/user', authMiddleware, usersController.getAuthenticatedUser);
router.get('/users/auth/user', authMiddleware, usersController.getAuthenticatedUser);
router.get('/user', authMiddleware, usersController.getAuthenticatedUser);
router.post('/changePassword', authMiddleware, usersController.changePassword);
router.post('/link-google', authMiddleware, usersController.linkGoogleAccount);
router.post('/unlink-google', authMiddleware, usersController.unlinkGoogle);
// ---------- User Operations ----------
router.get('/accountNum/:id', usersController.getUserAccountNumber);
router.put('/update/:id', usersController.updateUser);
router.get('/getUserDietaryRestrictions/:id', usersController.getUserDietaryRestrictions);
router.get('/:email', usersController.getUserByEmail);
router.put('/update-account', authMiddleware, usersController.updateAccountIdForUser);
// ---------- Image Upload / Remove ----------
router.post('/:userId/uploadImage', upload.single('image'), usersController.uploadImage);
router.delete('/:userId/removeImage', usersController.removeImage);
// ---------- General ----------
router.get('/', usersController.getAllUsers);
router.get('/:id', usersController.getUserById);
router.put('/update-role/:userId', usersController.updateUserRoleController);

// router.delete('/account/:id', usersController.deleteAccount);
// router.post('/upload-image', authMiddleware, upload.single('profileImage'), usersController.uploadProfileImage);
export default router;