import { getActiveMealTrainsCount, getWeeklyActiveAccounts } from "../services/analytics.service";
import { getPlansCountForThisWeek } from "../services/analytics.service";
import { Request, Response } from 'express';

export const analyticsController = {
    // GET /api/analytics/weekly-active
    getWeeklyActiveAccounts: async (req: Request, res: Response) => {
        try {
            const count = await getWeeklyActiveAccounts();
            return res.status(200).json({ count: count });
        } catch (error: any) {
            console.error('[GET /api/analytics/weekly-active] ❌', error.message || error);
            return res.status(500).json({  message: 'Internal server error' });
        }
    },
    
// my
getActiveMealTrains: async (req: Request, res: Response) => {
  try {
    const count = await getActiveMealTrainsCount();
    res.status(200).json({ activeMealTrains: count });
  } catch (error) {
    res.status(500).json("בעיה")
    // ({ error: (error as Error).message });
  }
}
,
getPlansThisWeek: async (req: Request, res: Response) => {
        try {
          const count = await getPlansCountForThisWeek();
          return res.status(200).json({ count: count });
        } catch (error: any) {
          console.error('[GET /api/analytics/plans-this-week] ❌', error.message || error);
          return res.status(500).json({  message: 'Internal server error' });
        }
      }
};
