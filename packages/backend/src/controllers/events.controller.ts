import { Request, Response } from 'express';
import { getAllEventsForUser, getUserEventsWithFilter } from '../services/events.service';




import { countUsersWithMoreThanTwoEvents, createEvent, createEventShareLink, deleteEvent, getAllEvents, getCompletedEvents, getEventAttendees, getEventById, getEventPreviewHtml, getEventsCreatedThisMonth, getMonthlyEventCreationStats, getParticipantOfEvent, handleJoinEvent, updateEvent } from '../services/events.service';
// import { EventsResponse, EventResponse, AttendeesResponse, UserEvent } from '@eventix/shared/src/types';
// import { getAllEvents, getEventAttendees, getEventById, handleJoinEvent, createEvent, getParticipantOfEvent, updateEvent,deleteEvent } from '../services/events.service';
import { AttendeesResponse, EventResponse, EventsResponse, MealType, UserEvent } from '@eventix/shared';

import fs from 'fs';
import { JwtPayload } from 'jsonwebtoken';
import { supabase } from '../services/database.service';
import { UserEventService } from '../services/event_user.service';
//import { getAllUsers } from '../services/users.service';
import { getAverageActualAttendees } from "../services/events.service";
import { EventsUserResponse } from '@eventix/shared/types';


const userEventService = new UserEventService();
export const eventsController = {
  getAllEvents: async (req: Request, res: Response) => {
    try {

      // קבלת page ו-limit מה-query עם ערכים ברירת מחדל
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 5;
      const { data, totalItems, totalPages } = await getAllEvents(page, limit);
      const response: EventsResponse = {
        success: true,
        data: data,
        totalItems: totalItems,
        totalPages,
        currentPage: page
      };
      res.json(response);
    } catch (error: any) {
      res.json({ success: false, error: error.message, data: [] } as EventsResponse);
    }
  },
  //  מחזיר אירועים שהסתיימו – מיועד לתצוגה בממשק הניהול
  getCompletedEvents: async (req: Request, res: Response) => {
    try {
      const events = await getCompletedEvents();
      res.json({ success: true, data: events });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message, data: [] } as EventsUserResponse);
    }
  },
  getAllEventsForUser: async (req: Request, res: Response) => {
    debugger
    try {
      // קבלת page ו-limit מה-query עם ערכים ברירת מחדל
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 5;

      // הנחה ש-userId נמצא ב-req.user.id
      // const userId = req.user?.userId;
      const userId = '46bb2c19-0c5f-4972-85da-b5269cdd0671';
      console.log("userId", userId)
      if (!userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized: userId missing', data: [] });
      }

      // קריאה לפונקציה עם userId
      const { data, totalItems, totalPages } = await getAllEventsForUser(userId, page, limit);

      const response: EventsUserResponse = {
        success: true,
        data,
        totalItems,
        totalPages,
        currentPage: page
      };
      res.json(response);
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message, data: [] } as EventsUserResponse);
    }
  },


  getEventById: async (req: Request & { user?: JwtPayload }, res: Response) => {

    try {
      //ברגד שיהיה middleWare מסודר
      const userId = req.user?.userId;
      console.log("req.user", req.user)
      const eventId = req.params.id
      // const userFlag=req.params?.flag? req.params.flag : false
      const checkAuth = req.query.checkAuth !== 'false';

      //שולחים לפעולה של חיפש אירוע של משתמש
      const userEvent = await userEventService.getUserEventByUserId(userId);
      console.log(userEvent)
      //מוודא שלמשתמש יש גישה לראות את פרטי האירוע
      if (checkAuth) {
        if (userEvent.find(x => x.eventId == eventId && x.userId == userId) == null)
          return res.status(404).json({ success: false, error: 'you dont have access to see this event' });
      }
      //שולחת לפעולה של הדתה לקבל את פרטי האירוע
      const event = await getEventById(req.params.id);
      console.log(event)
      if (!event) {
        return res.status(404).json({ success: false, error: 'Event not found' });
      }
      const response: EventResponse = { success: true, data: event };
      res.json(response);
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  },
  previewEventHtml: async (req: Request, res: Response) => {
    try {
      const html = await getEventPreviewHtml(req.params.id);
      res.setHeader('Content-Type', 'text/html');
      res.send(html);
    } catch (error: any) {
      res.status(404).send(error.message || 'שגיאה בטעינת האירוע');
    }
  },


  //פעולה להוספת אירוע
  createEvent: async (req: Request & { user?: JwtPayload }, res: Response) => {
    console.log("📸 File received:", req.file);
    const {
      title,
      description,
      location,
      datetime,
      language,
      mealType,
      expectedCount,
    } = req.body;
    // // ולידציה דינמית לשדות חובה
    // if (!title || !datetime) {
    //   return res.status(400).json({
    //     success: false,
    //     error: 'Missing required fields: title, datetime, or createdBy'
    //   });
    // }

    // // בדיקת ערך לערך מספרי
    // if (typeof expectedCount != 'number') {
    //   return res.status(400).json({
    //     success: false,
    //     error: 'The type of expectedCount and actualCount must be a number'
    //   });
    // }
    // // בדיקת ערך לערך מספרי
    // if (typeof expectedCount != 'number') {
    //   return res.status(400).json({
    //     success: false,
    //     error: 'Expected count must be a number',
    //   });
    // }
    // try {
    //   //שולפת את האירוע מהבודי
    //   // createdBy req.user?.userId,
    //   const event = { ...req.body, createdBy: '04fc1787-e65f-43fc-bed9-4c6902d760ba' }
    // if (!title || !datetime) {
    //   return res.status(400).json({ success: false, error: 'Missing required fields' });
    // }

    try {
      let imagePath = null;

      if (req.file) {
        const file = req.file;
        const buffer = fs.readFileSync(file.path);
        const sanitizedFileName = file.originalname
          .normalize("NFD")                      // מפרק תווים עם ניקוד
          .replace(/[\u0300-\u036f]/g, "")       // מסיר ניקוד
          .replace(/[^\w.-]/g, "_");             // כל תו שאינו אות, מספר, מקף, קו תחתון או נקודה – יהפוך לקו תחתון
        const fileName = `event-thumbnails/${Date.now()}_${sanitizedFileName}`;

        const { error } = await supabase.storage
          .from('event-thumbnails')
          .upload(fileName, buffer, {
            contentType: file.mimetype,
          });

        if (error) {
          console.error('Upload error:', error);
          return res.status(500).json({ success: false, error: 'Failed to upload image' });
        }

        imagePath = fileName;
      }

      const event = {
        ...req.body,
        createdBy: req.user?.userId,
        thumbnail: imagePath, // שים את הנתיב של Supabase
      };
      //שןלחת לפעולה שכתובה בדתה
      const newEvent = await createEvent(event)
      console.log(newEvent)
      // החזירה אירוע חדש אם הפעולה מחזירה תגובה של 200 הצליח
      if (newEvent) {
        //לקחת את הuserId cookies
        const u: Omit<UserEvent, 'id'> = {
          userId: req.user?.userId,
          eventId: newEvent.id,
          role: 'admin',
          joinedAt: new Date()
        }
        await userEventService.createUserEvent(u)
        const response = {
          success: true,
          data: newEvent
        }
        const newShareLink = await createEventShareLink(newEvent.id, req.user?.userId, 'join_and_edit');
        console.log(newShareLink)
        return res.status(200).json(response)


      }
      //אחרת מחזירה שגיאה
      else {
        const response = {
          success: false,
          error: 'you dont enter a new event',
        };
        return res.status(404).json(response);
      }
    }
    //במקרה שלא
    catch (error) {
      console.error('Error fetching event:', error);
      const response = {
        success: false,
        error: 'you dont enter a new event',
      };
      return res.status(404).json(response);
    }
  },
  getParticipantOfEvent: async (req: Request, res: Response) => {
    try {
      const eventId = req.params.id
      const detailsParticipant = await getParticipantOfEvent(eventId)
      console.log(detailsParticipant)
      if (!detailsParticipant)
        return res.status(400).json({ success: false, error: 'אין משתתפים באירוע שלך' })
      return res.status(200).json({ success: true, data: detailsParticipant })
    }
    catch (error) {
      console.log(error)
      return res.status(500).json({ success: false, error: 'אירעה שגיאה' })
    }
  },

  updateEvent: async (req: Request, res: Response) => {
    const eventId = req.params.id;
    const updates = req.body;
    const userRole = (req as any).user.role;
    const userId = (req as any).user.userId;
    try {
      const event = await getEventById(eventId);

      if (event && event.thumbnail && updates.thumbnail === null) {
        // אם יש תמונה ישנה וה־thumbnail מעודכן ל־null, נמחק את התמונה מהמאגר
        const { error: deleteError } = await supabase.storage
          .from('event-thumbnails')
          .remove([event.thumbnail]);

        if (deleteError) {
          console.error('Failed to delete old thumbnail:', deleteError);
          return res.status(500).json({ success: false, error: 'Failed to delete old thumbnail' });
        }
      }

      if (req.file) {
        // אם העלו תמונה חדשה
        const file = req.file;
        const buffer = fs.readFileSync(file.path);
        const sanitizedFileName = file.originalname
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^\w.-]/g, "_");
        const fileName = `event-thumbnails/${Date.now()}_${sanitizedFileName}`;
        const { error } = await supabase.storage
          .from('event-thumbnails')
          .upload(fileName, buffer, {
            contentType: file.mimetype,
          });

        if (error) {
          console.error('Upload error:', error);
          return res.status(500).json({ success: false, error: 'Failed to upload image' });
        }

        updates.thumbnail = fileName; // עדכון שם הקובץ החדש
      }

      // שלב עדכון האירוע
      const updatedEvent = await updateEvent(eventId, updates, userId, userRole);
      const response: EventResponse = { success: true, data: updatedEvent };
      res.json(response);
    } catch (error: any) {
      if (error.message === 'Event not found') {
        return res.status(404).json({ success: false, error: 'Event not found' });
      }
      if (error.message.startsWith('Permission denied')) {
        return res.status(403).json({ success: false, error: error.message });
      }
      res.status(500).json({ success: false, error: error.message });
    }
  },

  deleteEvent: async (req: Request, res: Response) => {
    const eventId = req.params.id;
    const userId = (req as any).user.userId;
    const userRole = (req as any).user.role;
    console.log((req as any).user);

    console.log("userRole", userRole);

    try {
      await deleteEvent(eventId, userId, userRole);
      res.status(204).send();
    } catch (error: any) {
      if (error.message === 'Event not found') {
        return res.status(404).json({ success: false, error: 'Event not found' });
      }
      if (error.message.startsWith('Permission denied')) {
        return res.status(403).json({ success: false, error: error.message });
      }
      res.status(500).json({ success: false, error: error.message });
    }
  },


  getEventAttendees: async (req: Request, res: Response) => {
    try {
      const { eventId } = req.params;
      const attendees = await getEventAttendees(eventId);
      const response: AttendeesResponse = { success: true, data: attendees };
      res.json(response);
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message, data: [] } as AttendeesResponse);
    }
  },
  //אפרת עזאני
  joinEvent: async (req: Request & { user?: JwtPayload }, res: Response) => {
    try {
      const token = req.body;
      const userId = req.user?.userId;
      console.log("userId", userId);


      if (!userId || !token) {
        return res.status(400).json({ success: false, error: 'Missing token or user' });
      }
      const result = await handleJoinEvent(userId, token);
      return res.status(result.status).json(result.body);
    } catch (err) {
      console.error('Join error:', err);
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  },
  getUserEventsWithFilter: async (req: Request & { user?: JwtPayload }, res: Response) => {
    try {
      debugger
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 150;
      const { page: _p, pageSize: _ps, ...eventFilters } = req.query;

      const result = await getUserEventsWithFilter(req, eventFilters);

      if (!result.success) {
        return res.status(401).json(result);
      }

      let filteredEvents = result.data;

      if (eventFilters.title) {
        filteredEvents = filteredEvents.filter(event =>
          event.title.toLowerCase().includes((eventFilters.title as string).toLowerCase())
        );
      }
      if (eventFilters.fromDate) {
        const fromDate = new Date(eventFilters.fromDate as string);
        filteredEvents = filteredEvents.filter(event =>
          new Date(event.datetime) > fromDate
        );
      }
      if (eventFilters.toDate) {
        const toDate = new Date(eventFilters.toDate as string);
        filteredEvents = filteredEvents.filter(event =>
          new Date(event.datetime) < toDate
        );
      }
      if (eventFilters.mealType) {
        const mealTypes = Array.isArray(eventFilters.mealType)
          ? eventFilters.mealType
          : [eventFilters.mealType];
        filteredEvents = filteredEvents.filter(event =>
          mealTypes.includes(event.mealType as MealType)
        );
      }

      // סידור
      switch (eventFilters.sort) {
        case 'title':
          filteredEvents.sort((a, b) => a.title.localeCompare(b.title));
          break;
        case 'titleDescending':
          filteredEvents.sort((a, b) => b.title.localeCompare(a.title));
          break;
        case 'date':
          filteredEvents.sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());
          break;
        case 'dateDescending':
          filteredEvents.sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime());
          break;
        case 'mealType':
          filteredEvents.sort((a, b) => a.mealType.localeCompare(b.mealType));
          break;
        case 'mealTypeDescending':
          filteredEvents.sort((a, b) => b.mealType.localeCompare(a.mealType));
          break;
      }

      // Paging סופי
      const totalItems = filteredEvents.length;
      const totalPages = Math.ceil(totalItems / pageSize);
      console.log("totalItems", totalItems, "totalPages", totalPages)
      const currentPage = page;
      const paged = filteredEvents.slice((page - 1) * pageSize, page * pageSize);

      res.json({
        success: true,
        data: paged,
        totalItems,
        totalPages,
        currentPage,
      } satisfies EventsResponse);
    } catch (error: any) {
      console.error('Error fetching user events:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        data: [],
      } satisfies EventsResponse);
    }
  },

  //אנליטיקות
  getEventsCreatedThisMonthController: async (req: Request, res: Response) => {
    try {
      console.log("getEventsCreatedThisMonthController");

      const eventCount = await getEventsCreatedThisMonth();
      console.log("Event count:", eventCount);

      res.json({ eventsCreatedThisMonth: eventCount });
    } catch (error) {
      res.status(500).json({ error: 'An error occurred while fetching the event count' });
    }
  },

  averageActualAttendeesController: async (req: Request, res: Response) => {
    try {
      const avg = await getAverageActualAttendees();
      if (avg === null) {
        return res.status(500).json({ error: "Failed to fetch actual attendees" });
      }
      res.json({ average_actual_attendees_per_event: avg });
    } catch (err) {
      console.error("Controller error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  },
  getUsersWithMoreThanTwoEventsCount: async (req: Request, res: Response) => {
    try {
      const count = await countUsersWithMoreThanTwoEvents();
      console.log("Users with more than two events:", count);
      res.status(200).json({ success: true, data: count });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to get users count" });
    }
  },

  getMonthlyEventStats: async (req: Request, res: Response) => {
    try {
      // אפשר לקבל פרמטר שנה מה-query, ברירת מחדל לשנה הנוכחית
      const year = parseInt(req.query.year as string) || new Date().getFullYear();
      const stats = await getMonthlyEventCreationStats(year);
      res.json({ success: true, year, data: stats });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  

 
};

