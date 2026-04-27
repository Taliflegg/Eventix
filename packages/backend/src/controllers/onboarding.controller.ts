
import { Request, Response } from 'express';
import { addLocationForAccount, createAccountAndLinkToUser } from '../services/onboarding.service';
import { supabase } from '../services/database.service';

// יצירת חשבון עם מיקום ראשי
export const completeOnboarding = async (req: Request, res: Response) => {
  try {
    const {
      userId,
      email,
      accountName,
      homeLocation,
      locationType,
    } = req.body;

    if (!userId || !accountName || !email) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const { accountId } = await createAccountAndLinkToUser(userId, accountName, email);

    let locationId: string | null = null;
    if (homeLocation && locationType) {
      const location = await addLocationForAccount(accountId, homeLocation, locationType);
      locationId = location.locationId;
    }

    res.status(200).json({ success: true, accountId, locationId });

  } catch (err: any) {
    console.error('Onboarding Error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// קריאה נפרדת להוספת מיקומים נוספים
export const addAdditionalLocations = async (req: Request, res: Response) => {
  try {
    const { userId, locations } = req.body;

    if (!userId || !Array.isArray(locations)) {
      return res.status(400).json({ success: false, message: 'Invalid input' });
    }

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('account_id')
      .eq('id', userId)
      .single();

    if (userError || !user?.account_id) {
      return res.status(400).json({ success: false, message: 'User or account not found' });
    }

    const accountId = user.account_id;

    for (const loc of locations) {
      if (loc.name && loc.address && loc.locationType) {
        await addLocationForAccount(accountId, { name: loc.name, address: loc.address }, loc.locationType);
      }
    }

    res.status(200).json({ success: true });

  } catch (err: any) {
    console.error('Add Locations Error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};
