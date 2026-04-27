import { Request, Response } from 'express';
import * as notificationService from '../services/notification.service';
import { UpdateNotificationPreferencesDto } from '@eventix/shared';

export const updateNotificationPreferences = async (req: Request, res: Response) => {
  try {
    const userId = req.params?.id;
    const preferences: UpdateNotificationPreferencesDto = req.body;

    console.log("קיבלנו עדכון עבור:", userId, preferences); // ← לוג

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const updated = await notificationService.updatePreferences(userId, preferences);

    return res.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("שגיאה בשרת:", error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const getNotificationPreferences = async (req: Request, res: Response) => {
  try {
    const userId = req.params?.id;

    if (!userId) {
      return res.status(400).json({ success: false, error: 'User not found' });
    }

    const preferences = await notificationService.getPreferencesByUserId(userId);

    return res.json({ success: true, data: preferences });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

