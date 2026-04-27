import { Request, Response } from "express";
import { accountsService } from "../services/accounts.service";
import { JwtPayload } from '../middlewares/authMiddleware';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email?: string;
  };
}


export const accountsController = {
  getUsersInMyAccount: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.userId;
      console.log("from controller userId", userId)

      if (!userId) throw new Error('No user detected');

      const accountId = await accountsService.getAccountIdByUserId(userId);
      const accountName = await accountsService.getAccountNameByAccountId(accountId);
      console.log("from controller accountId", accountId)
      const users = await accountsService.getUsersByAccountId(accountId);

      res.json({
        success: true,
        data: users,
        accountName: accountName,
        accountId: accountId,
      });
    }
    catch (error: any) {
      res.json({
        success: false,
        error: error.message,
        data: []
      });
    }

  },

  getLocationsInMyAccount: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.userId;
      console.log("from controller userId", userId)

      if (!userId) throw new Error('No user detected');

      const accountId = await accountsService.getAccountIdByUserId(userId);
      console.log("from controller accountId", accountId)
      const locations = await accountsService.getLocationsByAccountId(accountId);

      res.json({
        success: true,
        data: locations,
      });
    }
    catch (error: any) {
      res.json({
        success: false,
        error: error.message,
        data: []
      });
    }

  },

  addLocationToMyAccount: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new Error('No user detected');

      const accountId = await accountsService.getAccountIdByUserId(userId);

      const location = req.body as {
        name: string;
        address: string;
        locationType: 'home' | 'inlaws' | 'parents' | 'friends' | 'other';
      };

      if (
        typeof location.name !== 'string' || location.name.trim() === '' ||
        typeof location.address !== 'string' || location.address.trim() === '' ||
        typeof location.locationType !== 'string' ||
        !['home', 'inlaws', 'parents', 'friends', 'other'].includes(location.locationType)
      ) {
        throw new Error('Invalid or missing location data');
      }


      const newLocation = await accountsService.addLocationToAccount(accountId, location);

      res.json({
        success: true,
        message: 'Location added successfully',
        locationId: newLocation.id,
      });
    } catch (error: any) {
      res.json({
        success: false,
        error: error.message,
      });
    }
  },

  updateLocationInMyAccount: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new Error('No user detected');

      const locationId = req.params.id;
      if (!locationId) throw new Error('Missing location id in params');


      const location = req.body as {
        name: string;
        address: string;
        locationType: 'home' | 'inlaws' | 'parents' | 'friends' | 'other';
      };

      if (
        typeof location.name !== 'string' || location.name.trim() === '' ||
        typeof location.address !== 'string' || location.address.trim() === '' ||
        typeof location.locationType !== 'string' ||
        !['home', 'inlaws', 'parents', 'friends', 'other'].includes(location.locationType)
      ) {
        throw new Error('Invalid or missing location data');
      }


      const locationToUpdate = { id: locationId, ...location };

      const updatedLocation = await accountsService.updateLocationInAccount(locationToUpdate);

      res.json({
        success: true,
        message: 'Location updated successfully',
        locationId: updatedLocation.id,
      });
    } catch (error: any) {
      res.json({
        success: false,
        error: error.message,
      });
    }
  },

  getLocationsByUserId: async (req: Request & { user?: JwtPayload }, res: Response) => {
    try {
      const user = req.user as JwtPayload;
      let userId: string | undefined;

      if (user && user.userId) {
        userId = user.userId;
      } else {
        console.error("No authenticated user in req.user. Cannot proceed without userId.");
      }

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized: User ID not found.' });
      }

      const locations = await accountsService.getLocationsByUserId(userId);
      return res.status(200).json(locations);
    } catch (error) {
      console.error('error in controller', error);
      return res.status(500).json({ message: 'Internal server error', error: (error as Error).message });
    }
  },
  getCurrentUserAccountId: async (req: Request, res: Response) => {
    try {
      const userId = req.params.accountId;

      if (!userId) {
        return res.status(400).json({ message: 'Bad Request: Missing user ID.' });
      }

      const accountName = await accountsService.getCurrentUserAccountId(userId);
      return res.status(200).json({ accountName });
    } catch (error) {
      console.error('error in controller', error);
      return res.status(500).json({ message: 'Internal server error', error: (error as Error).message });
    }
  },

  getLocationByLocationId: async (req: Request, res: Response) => {
    try {
      const location_id = req.params.locationId;
      if (!location_id) {
        return res.status(400).json({ message: 'Bad Request: location_id is required.' });
      }
      const locationName = await accountsService.getLocationByLocationId(location_id);
      return res.status(200).json({ locationName });
    } catch (error) {
      console.error('error in controller', error);
      return res.status(500).json({ message: 'Internal server error', error: (error as Error).message });
    }
  },
  addLocationConnection: async (req: Request, res: Response) => {
    try {
      const { account_a_id, locationAId, account_b_id, locationBId , is_mutual,
      } = req.body;

      if (!account_a_id || !locationAId || !account_b_id ) {
        return res.status(400).json({ message: 'Bad Request: Missing required fields.' });
      }
      console.log("from add connection location in controller******************************************************")

      await accountsService.addLocationConnection(account_a_id, locationAId, account_b_id, locationBId, is_mutual);
      return res.status(200).json({ message: 'Location connection created successfully.' });
    } catch (error) {
      console.error('error in controller', error);
      return res.status(500).json({ message: 'Internal server error', error: (error as Error).message });
    }
  },
  getAccountNameByAccountId: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.userId;
      console.log("from controller userId", userId)
      if (!userId) throw new Error('No user detected');
      const accountId = await accountsService.getAccountIdByUserId(userId);
      const accountName = await accountsService.getAccountNameByAccountId(accountId);
      res.json({
        success: true,
        data: accountName,
      });
    }
    catch (error: any) {
      res.json({
        success: false,
        error: error.message,
        data: []
      });
    }
  },
}



