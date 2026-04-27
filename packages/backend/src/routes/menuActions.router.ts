import { Router, Request, Response } from 'express';
import { handleMenuAction } from '../controllers/menuActions.controller';
import { postMenuAction } from '../controllers/menuActions.controller';
import { menuActionsController } from '../controllers/menuActions.controller';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();



router.get('/', menuActionsController.getAllMenuActions);
router.get('/:id', menuActionsController.getMenuActionById);
router.get('/event-menu/:eventId',authMiddleware, menuActionsController.getMenuByEventId);
router.get('/export-menu/JSON/:eventId',authMiddleware, menuActionsController.exportJSONmenu);
router.get('/createEditAndRemoveDishRoute/:eventId/:userId',menuActionsController.getAccessToEditOrRemove);
router.get('/getMenuActionsByUserId/:eventId/:userId',authMiddleware, menuActionsController.getMenuActionsByUserId);

router.post('/',authMiddleware ,postMenuAction);

// router.post('/', (req: Request, res: Response) => {
//   const { menuAction } = req.body;

//   console.log('התקבלה פעולה:', menuAction);

//   if (!menuAction) {
//     return res.status(400).send("אירוע לא סופק.");
//   }

//   handleMenuAction(req,res)
// });

export default router;




