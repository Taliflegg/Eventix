import { EventsResponse } from '@eventix/shared';
import { Event } from '@eventix/shared/src/types';
import { AccessLevel } from '@eventix/shared';
import { EventDetailsView } from '@eventix/shared/src';
import { deleteRequest, putRequest, getRequest, postRequest, putRequestWithConfig } from './apiServices';
import { get } from 'axios';

// interface EventsResponse {
//   success: boolean;
//   data: Event[];
//   error?: string;
// }

interface EventResponse {
  success: boolean;
  data: Event;
  error?: string;
}


export interface SharedEventResponse {
  success: boolean;
  error?: string;
  data: {
    eventPreview: EventDetailsView;
    isAuthenticated: boolean;
    accessLevel: AccessLevel;
  };
}
export interface EventWithUserInfo extends Event, UserEventInfo { }
interface JoinEventResponse {
  success: boolean;
  data: Event;
  error?: string;
}
interface UserEventsResponse {
  success: boolean;
  data: (Event & { role: string })[];
  total: number; // סך כל הפריטים לאחר סינון
}
const PAGE_SIZE_DEFAULT = 150;

export interface EventParticipant {
  userId: string;
  name: string;
  dietaryRestrictions: string[] | string;
}

export interface UserEventInfo {
  role: string;
  joined_at: string;
  status: string;
  // שדות אחרים מטבלת user_events אם יש
}

// טיפוס שמכיל גם אירוע וגם מידע משתמש
export type SortBy  = 'name' | 'date' | 'mealType';
export type SortDir = 'asc'  | 'desc';
 export  interface EventFilterOptions {
  page?: number;
  pageSize?: number;
  title?: string;
 date?: string;       // תאריך בפורמט ISO string

  mealType?: string | string[];
   sortBy?: SortBy;          // ← במקום sort
  sortDir?: SortDir; 
}
const eventService = {
  getEvents: async (page: number = 1, limit: number = 5): Promise<{
    success: boolean;
    data: Event[];
    totalPages: number;
    currentPage: number;
    totalItems: number
  }> => {

    const response = await getRequest<EventsResponse>(`/events?page=${page}&limit=${limit}`);
    // console.log("aaa", response.data)
    return {
      success: response.success,
      data: response.data,
      totalPages: response.totalPages ?? 1,
      currentPage: response.currentPage ?? 1,
      totalItems: response.totalItems ?? 0
    };
  },

 
 getUserEventsWithFilter :async (
  params:  EventFilterOptions 
 
): Promise<EventsResponse> => {
  debugger
  const queryParams = new URLSearchParams();

  if (params.page) queryParams.append('page', params.page.toString());
  if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());
  if (params.title) queryParams.append('title', params.title);
  if (params.date) queryParams.append('fromDate', params.date);

  if (params.sortBy) queryParams.append('sort', params.sortBy);
 if (params.sortDir) queryParams.append('sort', params.sortDir);
  // תמיכה ב־mealType כערך אחד או מערך
  if (params.mealType) {
    if (Array.isArray(params.mealType)) {
      params.mealType.forEach(type => queryParams.append('mealType', type));
    } else {
      queryParams.append('mealType', params.mealType);
    }
  }

  const queryString = queryParams.toString();
  const url = `/events/user-events?${queryString}`;

  return await getRequest<EventsResponse>(url);
},

  getEventById: async (eventId: string, checkAuth: boolean = true): Promise<Event> => {
    const url = `/events/${eventId}?checkAuth=${checkAuth}`;
    const response = await getRequest<EventResponse>(url);

    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error || 'Failed to fetch event');
  },
  getCompletedEvents: async (): Promise<Event[]> => {
    const response = await getRequest<EventsResponse>(`/events/completed`);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error || 'Failed to fetch completed events');


  },

  // Update event function
  // updateEvent: async (id: string, updatedData: Partial<Event>): Promise<Event> => {
  //   const response = await putRequest<EventResponse>(`/events/${id}`, updatedData);
  //   if (response.success && response.data) {
  //     return response.data;
  //   }
  //   throw new Error(response.error || 'Failed to update event');
  // },
//   updateEvent: async (id: string, updatedData: Partial<Event>): Promise<Event> => {
//   if (updatedData.thumbnail === null) {
//     // אם התמונה נדרשת להסרה (null), נשלח בקשה לעדכון האירוע עם null בתור thumbnail
//     updatedData.thumbnail = null;
//     const response = await putRequest<EventResponse>(`/events/${id}`, updatedData);
//     if (response.success && response.data) {
//       return response.data;
//     }
//     throw new Error(response.error || 'Failed to update event');
//   }

//   // אם יש תמונה, נשתמש ב- updateEventWithImage לעדכון
//   const formData = new FormData();
//   Object.keys(updatedData).forEach((key) => formData.append(key, updatedData[key as keyof typeof updatedData] as string | Blob));
//   return updateEventWithImage(id, formData); // זו הפונקציה לעדכון עם תמונה
// },
updateEvent: async (id: string, updatedData: Partial<Event>): Promise<Event> => {
  if (updatedData.thumbnail === null) {
    // אם התמונה נדרשת להסרה (null), נשלח בקשה לעדכון האירוע עם null בתור thumbnail
    updatedData.thumbnail = null; // אפשר להקצות null כאן
    const response = await putRequest<EventResponse>(`/events/${id}`, updatedData);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error || 'Failed to update event');
  }

  // אם יש תמונה, נשתמש ב- updateEventWithImage לעדכון
  const formData = new FormData();
  Object.keys(updatedData).forEach((key) => formData.append(key, updatedData[key as keyof typeof updatedData] as string | Blob));
  return updateEventWithImage(id, formData); // זו הפונקציה לעדכון עם תמונה
},


updateEventWithImage: async (id: string, formData: FormData): Promise<Event> => {
  const config = {
    headers: {
    }
  };
  try {
    const response = await putRequestWithConfig<Event>(`/events/${id}`, formData, config);
    return response;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`Failed to update event. Error: ${error.message}`);
    } else {
      throw new Error('Failed to update event. Unknown error');
    }
  }
},

  // Delete event function
  delete: async (id: string): Promise<void> => {
    const response = await deleteRequest<EventResponse>(`/events/${id}`);
    if (!response.success) {
      throw new Error(response.error || 'Failed to delete event');
    }
  },
  // Create event function
  createEvent: async (eventData: any): Promise<Event> => {
    const response = await postRequest<EventResponse>(`/events`, eventData);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error || 'Failed to create event');
  },

  fetchEventDetails: async (eventId: string): Promise<Event> => {
    const response = await getRequest<EventResponse>(`/events/${eventId}`);
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.error || 'Failed to fetch event');
    }
  },

  fetchEventByToken: async (token: string): Promise<{
    event: EventDetailsView;
    isAuthenticated: boolean;
    accessLevel: AccessLevel;
  }> => {
    const response = await getRequest<SharedEventResponse>(`/share-link/by-token/${token}`);
    if (response.success && response.data) {
      return {
        event: response.data.eventPreview,
        isAuthenticated: response.data.isAuthenticated,
        accessLevel: response.data.accessLevel,
      };
    } else {
      throw new Error(response.error || 'event isn\'t exist or expired');
    }
  },

handleJoinEvent: async (
  token: string
): Promise<{ status: number; message: string }> => {
  try {
    const response = await postRequest<{
      success: boolean;
      data?: EventWithUserInfo;
      error?: string;
      status?: number | string;
      message?: string;
      messageDetail?: string;
    }>('/events/JoiningTheEvent', { token });

    const status =
      typeof response.status === 'string'
        ? parseInt(response.status, 10)
        : response.status ?? 0;

    const messagePrefix = "Eventix: ";

    switch (status) {
      case 201:
        return {
          status,
          message:
            messagePrefix +
            (response.message || "הצטרפת בהצלחה! " + (response.messageDetail || "")),
        };

      case 202:
        return {
          status,
          message:
            messagePrefix +
            (response.message || "נרשמת לרשימת ההמתנה. " + (response.messageDetail || "")),
        };

      case 401:
        return {
          status,
          message: messagePrefix + (response.error || "טוקן לא תקין או שגוי"),
        };

      case 403:
        return {
          status,
          message: messagePrefix + (response.error || "גישה לקריאה בלבד"),
        };

      case 404:
        return {
          status,
          message: messagePrefix + (response.error || "האירוע לא נמצא"),
        };

      case 409:
        return {
          status,
          message: messagePrefix + (response.error || "כבר מחובר לאירוע זה"),
        };

      case 410:
        return {
          status,
          message: messagePrefix + (response.error || "הקישור פג תוקף"),
        };

      case 500:
        return {
          status,
          message:
            messagePrefix + (response.error || "שגיאה בשרת במהלך הטיפול בבקשה"),
        };

      default:
        return {
          status,
          message: messagePrefix + (response.error || "שגיאה לא ידועה"),
        };
    }
  } catch (error: any) {
    if (error.response) {
      const status = error.response.status;
      const responseData = error.response.data || {};
      const messagePrefix = "Eventix: ";

      switch (status) {
        case 401:
        case 403:
        case 404:
        case 409:
        case 410:
        case 500:
          return {
            status,
            message: messagePrefix + (responseData.error || "שגיאה בשרת"),
          };
        default:
          return {
            status,
            message: messagePrefix + (responseData.error || "שגיאה לא ידועה"),
          };
      }
    } else {
      return {
        status: 0,
        message: "Eventix: " + (error.message || "שגיאה בתקשורת עם השרת"),
      };
    }
  }
},




  getParticipantsWithDiets: async (eventId: string): Promise<EventParticipant[]> => {
    const response = await getRequest<{ success: boolean; data: EventParticipant[]; error?: string }>(
      `/events/getParticipantOfEvent/${eventId}`
    );


    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error || 'Failed to fetch participants');
  },

  getShareLink: async (): Promise<{ link: string }> => {
    try {
      const response = await getRequest<{ link: string }>("/api/event/share-link");
      return response; // מחזיר את ה-link שנמצא בתוצאה
    } catch (error: any) {
      console.error("שגיאה בקבלת הקישור:", error);
      throw new Error(error.message || "שגיאה בקבלת הקישור");
    }
  },

  //אנליטיקות
  getEventsCreatedThisMonth: async (): Promise<any> => {
    try {
      const response = await getRequest<any>('events/events-created-this-month');
      return response;  // מחזיר את התגובה המלאה, כך שבצד הלקוח תוכל לשלוף את המפתח הנכון
    } catch (error) {
      console.error('Error fetching event count:', error);
      return { eventsCreatedThisMonth: -1 };  // ערך ברירת מחדל אם יש בעיה
    }
  },
  getUsersWithManyEvents: async (): Promise<number> => {
    try {
      const response = await getRequest<{ success: boolean; data: number; error?: string }>(
        'events/users-with-many-events'
      );
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to fetch users count');
      }
    } catch (error) {
      console.error('Error fetching users count:', error);
      throw error;
    }
  }
};



// כאן מייצאים גם את הפונקציות עצמן
export const {
  getEvents,
  getEventById,
  fetchEventDetails,
  fetchEventByToken,
  handleJoinEvent,
  getParticipantsWithDiets,
  getUserEventsWithFilter,
  updateEventWithImage,
  createEvent,
  getShareLink,
  getEventsCreatedThisMonth,
  getUsersWithManyEvents
} = eventService;

export default eventService;
