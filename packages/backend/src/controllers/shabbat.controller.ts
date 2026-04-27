//shabbat.controller
import { Request, Response } from 'express';
import { shabbatService } from '../services/shabbat.service';
import { JwtPayload } from '../middlewares/authMiddleware';
import { supabase } from '../services/database.service';
import { log } from 'node:console';
import { getAccountIdByUserId } from '../services/users.service';
// import { getSharedLocationsByUser, deleteLocationShare } from '../services/shabbat.service';



export const shabbatController = {
    getAllShabbat: async (req: Request & { user?: JwtPayload }, res: Response) => {
        try {
            const userId = req.user?.userId
            if (!userId) {
                return res.status(401).json({ message: 'Unauthorized: User ID not found.' });
            }

            // הגדרת ברירות מחדל למקרה שהפרמטרים לא נשלחו או לא תקינים
            let limit = 4;
            let offset = 0;

            // קבלת ואימות 'limit' מפרמטרי השאילתה (query parameters)
            if (req.query.limit) {
                const parsedLimit = parseInt(req.query.limit as string, 10);
                if (!isNaN(parsedLimit) && parsedLimit > 0) {
                    limit = parsedLimit;
                } else {
                    console.warn('Invalid limit provided, using default (4).');
                }
            }

            // קבלת ואימות 'offset' מפרמטרי השאילתה
            if (req.query.offset) {
                const parsedOffset = parseInt(req.query.offset as string, 10);
                if (!isNaN(parsedOffset) && parsedOffset >= 0) { // offset יכול להיות 0
                    offset = parsedOffset;
                } else {
                    console.warn('Invalid offset provided, using default (0).');
                }
            }

            const shabbats = await shabbatService.getAllUpcomingShabbats(userId, limit, offset);
            return res.status(200).json(shabbats);

        } catch (error) {
            console.error('Error fetching all shabbats:', error);
            return res.status(500).json({ message: 'Failed to retrieve shabbat data', error: (error as Error).message });
        }
    },

    getMyLocationShares: async (req: Request & { user?: JwtPayload }, res: Response) => {
        try {

            const userId = req.user?.userId;
            if (!userId) return res.status(401).json({ success: false, error: 'Missing user ID' });
            const accountId = await getAccountIdByUserId(userId);
            const shares = await shabbatService.getSharedLocationsByUser(accountId);
            return res.status(200).json({ success: true, data: shares });
        } catch (error: any) {
            console.error('Error getting location shares:', error);
            return res.status(500).json({ success: false, error: error.message });
        }
    },

    deleteMyLocationShare: async (req: Request & { user?: JwtPayload }, res: Response) => {
        try {
            
            const userId = req.user?.userId;
            if (!userId) return res.status(401).json({ success: false, error: 'Missing user ID' });
            const accountAId = await getAccountIdByUserId(userId);
            // const accountAId = '5447af7a-a6be-485f-99b0-535fe25fb1f9';

            const accountBId = req.params.accountBId;

            if (!accountAId || !accountBId)
                return res.status(400).json({ success: false, error: 'Missing user IDs' });

            await shabbatService.deleteLocationShare(accountAId, accountBId);
            return res.status(204).send();
        } catch (error: any) {
            console.error('Error deleting location share:', error);
            return res.status(500).json({ success: false, error: error.message });
        }
    },


    // מחזיר למשתמש את כל המיקומים האישיים שלו לשבת הנוכחית
    // כולל הסטטוס האישי שלו ומי מהחברים שלו מתכנן להיות בכל מיקום
    getShabbatDecision: async (req: Request & { user?: JwtPayload }, res: Response) => {
        try {
            // שלב 1: בדיקת תאריך שבת בפרמטרים
            const { date } = req.query;
            if (!date || typeof date !== 'string') {
                return res.status(400).json({ message: 'Missing or invalid date' });
            }

            // שלב 2: שליפת המשתמש מהטוקן
            const userId = req.user?.userId;
            if (!userId) {
                console.log("from getShabbatDecision", userId)
                console.error("Unauthorized: Missing accountId in token.");
                return res.status(401).json({ message: 'Unauthorized' });
            }
            const { data: userRecord, error: userError } = await supabase
                .from('users')
                .select('account_id')
                .eq('id', userId)
                .single();

            if (userError || !userRecord) {
                return res.status(404).json({ message: 'Account ID not found for user' });
            }
            const accountId = userRecord.account_id;
            // שלב 3: קריאה ללוגיקת השירות
            const decisionData = await shabbatService.getShabbatDecisionData(accountId, date);

            // שלב 4: החזרת תשובה
            return res.status(200).json(decisionData);

        } catch (error) {
            console.error('Error in getShabbatDecision:', error);
            return res.status(500).json({
                message: 'Failed to retrieve shabbat decision data',
                error: (error as Error).message
            });
        }
    },


    //שינוי מקום נוכחי
    savePlan: async (req: Request & { user?: JwtPayload }, res: Response) => {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            const { date, locationId, status } = req.body;

            if (!date || !status) {
                return res.status(400).json({ message: 'Missing required fields: date or status' });
            }

            const { data: userRecord, error: userError } = await supabase
                .from('users')
                .select('account_id')
                .eq('id', userId)
                .single();

            if (userError || !userRecord) {
                return res.status(404).json({ message: 'Account ID not found for user' });
            }

            const accountId = userRecord.account_id;

            await shabbatService.savePlan(accountId, date, locationId, status);

            return res.status(200).json({ success: true });

        } catch (error) {
            const errMsg = (error as Error).message;

            if (errMsg === 'Invalid status') {
                return res.status(400).json({ message: 'סטטוס לא חוקי' });
            }

            if (errMsg === 'Invalid or past date') {
                return res.status(400).json({ message: 'תאריך לא חוקי או עבר' });
            }

            if (errMsg === 'locationId is required for Going or Maybe') {
                return res.status(400).json({ message: 'חסר locationId לסטטוס הנדרש' });
            }

            if (errMsg === 'Invalid locationId') {
                return res.status(404).json({ message: 'המיקום לא נמצא או לא שייך למשתמש' });
            }

            if (errMsg === 'Error checking existing plans') {
                return res.status(500).json({ message: 'שגיאה בבדיקת תכנונים קיימים' });
            }

            console.error('Unhandled error in savePlan:', errMsg);
            return res.status(500).json({ message: 'שגיאה בלתי צפויה', error: errMsg });
        }
    }
};
