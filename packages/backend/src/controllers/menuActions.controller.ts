// controllers/menuActions.controller.ts
import { Request, Response } from 'express';
import { getAllMenuActions, getMenuActionById, getMenuActionsByUserId, getProcessedMenuByEventId, groupAndSortDishesByCategory } from '../services/menuActions.service';
import { AssignedMenuItem, MenuAction, MenuActionResponse, MenuActionsResponse, MenuItem, User } from '@eventix/shared';
import { get } from 'http';
import { getAllUsers } from '../services/users.service';
import { getAllEvents, getEventById } from '../services/events.service';
import { canEditOrRemoveDish } from '../services/menuActions.service';
import {
  addCategory, removeCategory, updateCategory,
  addDish, updateDish, removeDish,
  assignDish, unassignDish, moveItem, undoAction
} from "../services/menuActions.service";
import { JwtPayload } from 'jsonwebtoken';


interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email?: string;
  };
}

export const postMenuAction = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { menuAction } = req.body;

    // וידוא שהמידע הדרוש אכן קיים
    if (!menuAction) {
      return res.status(400).json({ error: "לא סופקה פעולה" });
    }

    // שימוש בפרטי המשתמש שעבר אימות דרך המידלוואר
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(403).json({ error: "משתמש לא מאומת" });
    }

    // מצרפים את userId לפעולה לצורך הרשאות וכו'
    const enrichedAction = { ...menuAction, userId };

    // ממשיכים עם ההפניה לפונקציה הראשית
    req.body.menuAction = enrichedAction;

    // שליחה להמשך הטיפול בפונקציה המרכזית
    return handleMenuAction(req, res);
  } catch (err) {
    console.error("שגיאה ב־postMenuAction:", err);
    return res.status(500).json({ error: "שגיאת שרת" });
  }
};




export async function handleMenuAction(req: JwtPayload, res: Response) {
  const { menuAction } = req.body;
  const user = req.user?.role;
  console.log('התקבלה פעולה:', menuAction);

  if (!menuAction) {
    return res.status(400).send("אירוע לא סופק.");
  }
  try {
    let result;
    switch (menuAction.actionType) {
      case 'add_category':
        result = await addCategory(menuAction, user);
        if (!result)
          return res.status(500).send("שגיאה פנימית בעת הוספת הקטגוריה");
        return res.status(result.status).send(result.body);
      case 'remove_category':
        result = await removeCategory(menuAction, user);
        if (!result)
          return res.status(500).send("שגיאה פנימית בעת הסרת הקטגוריה");
        return res.status(result.status).send(result.body);
      case 'update_category':
        result = await updateCategory(menuAction, user);
        if (!result)
          return res.status(500).send("שגיאה פנימית בעת עדכון הקטגוריה");
        return res.status(result.status).send(result.body);
      case 'add_dish':
        result = await addDish(menuAction, user);
        if (!result)
          return res.status(500).send("שגיאה פנימית בעת הוספת המנה");
        return res.status(result.status).send(result.body);
      case 'update_dish':
        result = await updateDish(menuAction, user);
        if (!result)
          return res.status(500).send("שגיאה פנימית בעת עדכון המנה");
        return res.status(result.status).send(result.body);
      case 'remove_dish':
        result = await removeDish(menuAction, user);
        if (!result)
          return res.status(500).send("שגיאה פנימית בעת הסרת המנה");
        return res.status(result.status).send(result.body);
      case 'assign_dish':
        result = await assignDish(menuAction, user);
        if (!result)
          return res.status(500).send("שגיאה פנימית בעת שיוך ךמנה");
        return res.status(result.status).send(result.body);
      case 'unassign_dish':
        result = await unassignDish(menuAction, user);
        if (!result)
          return res.status(500).send("שגיאה פנימית בעת הסרת שיוך למנה");
        return res.status(result.status).send(result.body);
      case 'move_item':
        result = await moveItem(menuAction, user);
        if (!result)
          return res.status(500).send("שגיאה פנימית בעת שינוי מיקום המנה/הקטגוריה");
        return res.status(result.status).send(result.body);
      case 'undo_action':
        result = await undoAction(menuAction,user);
        if (!result)
          return res.status(500).send("שגיאה פנימית בעת ביטול פעולה");
        return res.status(result.status).send(result.body);
      default:
        res.status(400).send("סוג פעולה לא מוכר");
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "שגיאה לא מזוהה";
    res.status(500).send(errorMessage);
  }
}

export const menuActionsController = {
  getAllMenuActions: async (req: Request, res: Response) => {
    try {
      const menuAction = await getAllMenuActions();
      const response: MenuActionsResponse = { success: true, data: menuAction };
      res.json(response);
    }
    catch (error: any) {
      res.json({ success: false, error: error.message, data: [] } as MenuActionsResponse);
    }
  },
  getMenuActionById: async (req: Request, res: Response) => {
    try {
      const menuAction = await getMenuActionById(req.params.id);
      if (!menuAction) {
        return res.status(404).json({ success: false, error: 'menu action not found' });
      }
      const response: MenuActionResponse = { success: true, data: menuAction };
      res.json(response);
    }
    catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  },
  getMenuByEventId: async (req: Request, res: Response) => {
    const { eventId } = req.params;
    try {
      const { eventName, eventCreatorID, assignedMenuItems } = await getProcessedMenuByEventId(eventId);
      return res.status(200).json({
        success: true,
        eventName,
        eventCreatorID,
        assignedMenuItems,
      });
    } catch (error: any) {
      const statusCode = error.status || error.statusCode || 500;
      const message = error.message || 'Server error';
      return res.status(statusCode).json({
        success: false,
        error: message,
      });
    }
  },
  getMenuActionsByUserId: async (req: Request, res: Response) => {
    const { eventId, userId } = req.params;
    try {
      const menuActions = await getMenuActionsByUserId(eventId, userId);
      return res.status(200).json({
        success: true,
        data: menuActions,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  },
  exportJSONmenu: async (req: Request, res: Response) => {
    const { eventId } = req.params;

    try {
      const menuData = await getProcessedMenuByEventId(eventId);

      // ממיינים את המנות תחת קטגוריות
      const sortedMenu = menuData.assignedMenuItems.length > 0
        ? groupAndSortDishesByCategory(menuData.assignedMenuItems)
        : [];

      // בונים אובייקט תפריט ממויין לפי קטגוריה
      const cleanMenu: Record<string, any[]> = {};

      for (const group of sortedMenu) {
        const categoryName = group.categoryName;
        cleanMenu[categoryName] = group.dishes.map(dish => ({
          name: dish.item.name,
          notes: dish.item.notes,
          tags: dish.item.tags,
          assignedTo: dish.assignedUser?.name || null,
          createdAt: dish.item.createdAt,
          updatedAt: dish.item.updatedAt,
        }));
      }

      // שולחים רק את שם האירוע והתפריט המסודר
      res.status(200).json({
        eventName: menuData.eventName,
        menu: cleanMenu,
      });

    } catch (error: any) {
      console.error('Error exporting menu:', error);
      res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
  },
  //בדיקת הרשאות
  getAccessToEditOrRemove: async (req: Request, res: Response) => {
    try {
      console.log("in the server");
      const { eventId, userId } = req.params;
      if (!eventId || !userId) {
        return res.status(400).json({ success: false, error: "Missing parameters" });
      }
      const hasPermission = await canEditOrRemoveDish(eventId, userId);
      res.status(200).json({ success: true, canEdit: hasPermission });
    } catch (error) {
      console.error("שגיאה בשרת:", error);
      res.status(500).json({ success: false, error: "Internal Server Error" });
    }

  }
};
