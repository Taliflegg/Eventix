import { columnMappings, mapKeys } from './column.mapper';
import { supabase } from './database.service';
import { getEventAttendees, getEventById } from './events.service';
import { Attendee, Event, EventDetailsView, ShareLinkFullEvent, ShareLinkErrorResult, ShareLinkNotAuthenticatedSuccess } from '@eventix/shared';



export async function getShareTokenByEventId(
  eventId: string
): Promise<string | null> {
  const { data, error } = await supabase
    .from('share_link') // או tableName אם יש לך משתנה מוגדר
    .select('token')
    .eq('event_id', eventId)
    // .single();
    .limit(1).maybeSingle() // מצפה לרשומה אחת בלבד אם קיימות כמה שורות לאותו event_id
  if (error) {
    console.error('Error fetching share token:', error);
    return null;
  }

  return data?.token || null;
}

// טבלת קישורים
const tableName = 'share_link';

type PublicEvent = Pick<Event, 'id' | 'title' | 'datetime' | 'location' | 'mealType'>;

type ShareLinkSuccessResult = {
  event: PublicEvent;
  accessLevel: string;
};

// type ShareLinkErrorResult = {
//   error: string;
//   status: number;
// };

// הפונקציה הראשית
export async function getEventByShareToken(
  token: string,
  userId?: string
): Promise<ShareLinkFullEvent | ShareLinkErrorResult | ShareLinkNotAuthenticatedSuccess> {
  // שלב 1: שליפת הקישור לפי הטוקן
  const { data: links, error } = await supabase
    .from(tableName)
    .select('*')
    .eq('token', token);

  if (error) {
    return { error: 'Database error while fetching share link', status: 500 };
  }

  const link = links?.[0];
  console.log("from service", link, token)

  if (!link) {
    return { error: 'Share link not found', status: 404 };
  }

  // שלב 2: בדיקה אם הקישור פג תוקף
  const now = new Date();
  if (link.expiration_date && new Date(link.expiration_date) < now) {
    return { error: 'Share link expired', status: 404 };
  }

  // שלב 3: שליפת האירוע
  const event = await getEventById(link.event_id);
  if (!event) {
    return { error: 'Event not found', status: 404 };
  }

  // שלב 4: בדיקת משתמש מחובר
  const isAuthenticated = !!userId;
  console.log("is Authenticated ", isAuthenticated)
  if (isAuthenticated) {
    const participants = await getEventAttendees(link.event_id);
    return {
      event: {
        ...event,
        participants,
      },
      accessLevel: link.access_level,
      isAuthenticated: true,
    };
  } else {
    const fullMappedEvent = mapKeys<Event>(event, columnMappings.events.toCamel as unknown as Record<string, keyof Event>);
    const attendees = await getEventAttendees(link.event_id);

    const joinedCount = attendees.length;

    const allDietaryRestrictions: string[] = attendees
      .flatMap((attendee) => attendee.dietaryRestrictions || []);
    const uniqueDietaryRestrictions = Array.from(new Set(allDietaryRestrictions));

    const mappedEvent: EventDetailsView = {
      title: fullMappedEvent.title,
      datetime: fullMappedEvent.datetime,
      location: fullMappedEvent.location,
      description: fullMappedEvent.description || '',
      DietaryRestriction: uniqueDietaryRestrictions,
      joinedCount,
    };

    return {
      event: mappedEvent,
      accessLevel: link.access_level,
      isAuthenticated: false,
    };
  }
}
