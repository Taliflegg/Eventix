import { Request, Response } from 'express';
import { getEventByShareToken, getShareTokenByEventId } from '../services/share-link.service';
import { authMiddleware } from '../middlewares/authMiddleware';

export const getTokenForEvent = async (req: Request, res: Response) => {
  const { eventId } = req.params;

  const token = await getShareTokenByEventId(eventId);

  if (!token) {
    return res.status(404).json({ success: false, error: 'Token not found' });
  }

  return res.json({ success: true, token });
};





interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email?: string;
  };
}
export const shareLinkController = {
  getEventByToken: async (req: AuthenticatedRequest, res: Response) => {
    const { token } = req.params;
    const userId = req.user?.userId;

    try {
      //const result = await getEventByShareToken(token);
      const result = await getEventByShareToken(token, userId);

      if ('error' in result) {
        return res.status(result.status).json({ success: false, error: result.error });
      }

      return res.json({
        success: true,
        data: {
          eventPreview: result.event,
          accessLevel: result.accessLevel,
          isAuthenticated: result.isAuthenticated,
        },
      });
    } catch (error: any) {
      console.error('Unexpected error:', error);
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  },
};
