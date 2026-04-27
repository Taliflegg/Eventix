
import { JwtPayload } from '@supabase/supabase-js';
import { Request, Response } from 'express';
import { addUserActivity, getCrossPlatformAdoptionRate, getMonthlyActiveUsersByApp, getOverallMonthlyActiveUsers, getUserAcquisitionAnalytics } from "../services/user_activity.service";
export const userActivityController = {

  addUserActivity: async (req: Request & { user?: JwtPayload }, res: Response) => {
    try {
      const appName = req.body.app_name;
      const userId = req.user?.userId;
      // קריאה לשירות להוסיף את הנתונים
      const result = await addUserActivity(appName, userId);
      res.status(200).json({ message: 'Activity added successfully', data: result });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  getMonthlyActiveUsersByApp: async (req: Request, res: Response) => {
    try {
      const data = await getMonthlyActiveUsersByApp();
      res.status(200).json(data); // מחזיר את נתוני המשתמשים הפעילים לאפליקציות
    } catch (error: any) {
      console.error('Error fetching monthly active users by app:', error);
      res.status(500).json({ error: error.message || 'An unknown error occurred' });
    }
  },
  getUserAcquisitionAnalytics: async (req: Request, res: Response) => {
    try {
      const data = await getUserAcquisitionAnalytics();
      res.status(200).json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
  getOverallMonthlyActiveUsers: async (req: Request, res: Response) => {
    try {
      const year = parseInt(req.query.year as string);
      const month = parseInt(req.query.month as string);
      if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
        return res.status(400).json({ success: false, message: 'שנה וחודש חוקיים נדרשים בפרמטרים (לדוגמה: ?year=2023&month=10)' });
      }
      // **תיקון תחבירי:** קריאה ישירה לפונקציה המיובאת, לא דרך אובייקט לא מוגדר
      const totalMonthlyActiveUsers = await getOverallMonthlyActiveUsers(year, month);
      res.status(200).json({ success: true, data: { year, month, totalMonthlyActiveUsers } });
    } catch (error: any) {
      console.error('Error in userActivityController.getOverallMonthlyActiveUsers:', error);
      res.status(500).json({ success: false, error: error.message || 'שגיאה בחישוב סך משתמשים פעילים חודשיים.' });
    }
  }, // **תיקון תחבירי: סוגר מסולסל סוגר חסר שהיה חסר כאן**
  getCrossPlatformAdoptionRate: async (req: Request, res: Response) => {
    try {
      const data = await getCrossPlatformAdoptionRate();
      console.log("the percent", data);

      res.status(200).json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

}
