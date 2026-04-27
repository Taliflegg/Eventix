import { Router } from 'express';
import { accountsController} from '../controllers/accounts.controller';
import { authMiddleware } from '../middlewares/authMiddleware';

const router=Router();
router.get('/name',  authMiddleware,accountsController.getAccountNameByAccountId);
router.get('/',  authMiddleware,accountsController.getLocationsByUserId);
router.get('/:accountId', accountsController.getCurrentUserAccountId);
router.get('/Location/:locationId', accountsController.getLocationByLocationId);
router.post('/postLocation', authMiddleware, accountsController.addLocationConnection);

router.get('/my-account/users',authMiddleware, accountsController.getUsersInMyAccount);
router.get('/my-account/locations',authMiddleware, accountsController.getLocationsInMyAccount);
router.post('/my-account/locations',authMiddleware, accountsController.addLocationToMyAccount);
router.put('/my-account/locations/:id', authMiddleware, accountsController.updateLocationInMyAccount);


export default router;