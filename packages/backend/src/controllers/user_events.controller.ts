//user_events.controller.ts
import { Request, Response } from 'express';
import { UserEventService } from '../services/event_user.service';
import { UserEventResponse, UserEventsResponse } from '@eventix/shared';
import { JwtPayload } from '@supabase/supabase-js';
import { sendMail } from '../services/email.Service';
import {
  getFirstFromWaitingList,
  removeFromWaitingList,
  addUserToEvent,
  getUserById,
  moveFirstUserFromWaitingList
} from '../services/waiting_list.services';
import { waitingListController } from './waiting_list.controllers';

const userEventService = new UserEventService();

export const UserEventsController = {
  // פעולה שמחזירה את כל האירועים שהמשתמש מארגן או משתתף
  getAllUserEvents: async (req: Request, res: Response) => {
    try {
      const events = await userEventService.getAllUser_Events();
      const response: UserEventsResponse = { success: true, data: events };
      res.json(response);
    } catch (error: any) {
      res.json({ success: false, error: error.message, data: [] } as UserEventsResponse);
    }
  },

  getUserEventByUserId: async (req: Request, res: Response) => {
    try {
      const event = await userEventService.getUserEventByUserId(req.params.id);
      if (!event) {
        return res.status(404).json({ success: false, error: 'UserEvent not found' });
      }
      console.log("event", event)
      const response: UserEventsResponse = { success: true, data: event };
      res.json(response);
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  createUserEvent: async (req: Request, res: Response) => {
    try {
      const { user_id, event_id, role } = req.body;
      if (!user_id || !event_id || !role)
        return res.status(404).json({ success: false, error: 'one of params was wrong' });
      const userEvent = await userEventService.createUserEvent(req.body);
      if (!userEvent)
        return res.status(404).json({ success: false, error: 'cant create user event' });
      const response: UserEventResponse = { success: true, data: userEvent };
      res.json(response);
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  },


  removeUserFromEvent: async (req: Request & { user?: JwtPayload }, res: Response) => {
    try {
      const userIdToDelete = req.query.userIdToDelete as string;
      const eventId = req.query.eventId as string;
      const UserId = req.query.userId as string;
      const currentUserRole = req.query.role as string;
      console.log('UserId:', UserId);
      console.log('currentUserRole:', currentUserRole);
      console.log('userIdToDelete:', userIdToDelete);
      console.log('eventId:', eventId);
      const role = await userEventService.checkIfUserIsAdmin(UserId, eventId);
      console.log('role--', role);
      let isAllowedToDelete = false;
      if (currentUserRole === 'administrator' && !role) {
        console.log('Admin user allowed to delete');
        isAllowedToDelete = true;
      } else if (UserId === userIdToDelete && !role) {
        console.log('User is deleting themselves');
        isAllowedToDelete = true;
      } else if (role && UserId !== userIdToDelete) {
        console.log('Admin user deleting another user');
        isAllowedToDelete = true;
      }
      if (!isAllowedToDelete) {
        return res.json({ success: false });
      }
      await userEventService.removeUserFromEvents(userIdToDelete, eventId);
      console.log('User removed from event successfully');
      // שליחת בקשה פנימית ל־handle-user-removed עם event_id
// שליחת בקשה פנימית ל־handle-user-removed עם event_id
  await moveFirstUserFromWaitingList(eventId); // ← שינוי: קריאה ישירה לשירות
    return res.json({ success: true });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ success: false, error: error.message });
  }
}
};




