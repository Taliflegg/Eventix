//waiting_list.controllers
import { Request, Response } from 'express';
import {
  getFirstFromWaitingList,
  removeFromWaitingList,
  addUserToEvent,
  getUserById
} from '../services/waiting_list.services';
import { sendMail } from '../services/email.Service';

// פונקציה שמופעלת אחרי שמחקו משתמש מאירוע
export const waitingListController = {
  handleUserRemoved: async (req: Request, res: Response) => {
    const { event_id } = req.body;

    try {
      const waitingUser = await getFirstFromWaitingList(event_id);

      if (!waitingUser) {
        return res.json({ success: true, message: 'No users in waiting list' });
      }

      await removeFromWaitingList(waitingUser.id);
      await addUserToEvent(event_id, waitingUser.user_id);

      const user = await getUserById(waitingUser.user_id);

      if (user?.email) {
        const subject = 'הצטרפתך לאירוע אושרה';
        const text = `שלום ${user.name || ''},\n\nמקומך באירוע התפנה, והצטרפתך אושרה בהצלחה.\nנתראה!`;
        await sendMail(user.email, subject, text);
      }

      res.json({ success: true, message: 'User moved from waiting list to event and email sent' });

    } catch (error: any) {
      console.error('Error handling waiting list:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
};
