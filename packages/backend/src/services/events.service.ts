import { Event, Attendee, MealType, UserEventRole, EventsResponse } from '@eventix/shared';
import { columnMappings, mapKeys } from './column.mapper';
import { supabase } from './database.service';
// import { log } from 'console';
import { sendMail } from '../services/email.Service';
// טבלת האירועים

import fs from 'fs';
import path from 'path';
import { error } from 'console';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
console.log('JWT_SECRET =', process.env.JWT_SECRET);



// טבלת האירועים
const tableName = 'events';
//טבלת הקישורים
const shareLinksTableName = 'share_link';
const JWT_SECRET = process.env.JWT_SECRET!;
const { toCamel, toSnake } = columnMappings.events;
const { toCamel: shareLinkToCamel, toSnake: shareLinkToSnake } = columnMappings.shareLinks;

//גיטי צריכה לעשות את זה
export async function getAllEvents(page = 1, limit = 5): Promise<{
  data: Event[];
  totalItems: number;
  totalPages: number;
}> {
  const from = (page - 1) * limit;
  const to = from + limit - 1;



  const { data, error, count } = await supabase
    .from(tableName)
    .select('*', { count: 'exact' })
    // .order('datetime', { ascending: true })
    .order('created_at', { ascending: false })
    .range(from, to);
  if (error) throw new Error(error.message);
  const mapped = (data || []).map(row => mapKeys<Event>(row, toCamel as unknown as Record<string, keyof Event>));
  const totalItems = count || 0;
  const totalPages = Math.ceil(totalItems / limit);
  return {
    data: mapped,
    totalItems,
    totalPages,
  };
}

  export async function getAllEventsForUser(userId: string, page = 1, limit = 5): Promise<{
  data: { event: Event; role: string }[];
  totalItems: number;
  totalPages: number;
}> {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  // שליפת כל האירועים של המשתמש כולל role
  const { data, error, count } = await supabase
    .from('user_events')
    .select('role, event:events(*)', { count: 'exact' }) // קשר לטבלת Event
    .eq('user_id', userId)
    .range(from, to);

  if (error) throw new Error(error.message);

  const mapped = (data || []).map(item => ({
    role: item.role,
    event: mapKeys<Event>(item.event, toCamel as unknown as Record<string, keyof Event>),
  }));

  const totalItems = count || 0;
  const totalPages = Math.ceil(totalItems / limit);

  return {
    data: mapped,
    totalItems,
    totalPages,
  };
}


export async function getEventById(id: string): Promise<Event | null> {
  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .eq('id', id)
    .single();
  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(error.message);
  }
  if (!data) return null;
  return mapKeys<Event>(data, toCamel as unknown as Record<string, keyof Event>);
}

export async function createEvent(event: Omit<Event, 'id'>): Promise<Event> {
  const snakeCaseEvent = mapKeys(event, toSnake);
  const { data, error } = await supabase
    .from(tableName)
    .insert([snakeCaseEvent])
    .select()
    .single();
  if (error) {
    throw new Error(error.message);
  }
  if (!data) throw new Error('Failed to create event');
  const createdEvent = mapKeys<Event>(
    data,
    toCamel as unknown as Record<string, keyof Event>
  );

  try {
    await createEventShareLink(
      createdEvent.id,
      createdEvent.createdBy,
      'view_only'
    );
  } catch (err) {
    console.error('שגיאה ביצירת קישור שיתוף:', err);
  }

  return createdEvent;

}
export async function getParticipantOfEvent(id: string): Promise<Object[] | undefined> {

  // שליפת כל רשומות user_event עם ה־eventId
  const { data: userEvents, error: error } = await supabase
    .from('user_events')
    .select('user_id')
    .eq('event_id', id);
  if (error) throw new Error(error.message);
  if (!userEvents || userEvents.length === 0) return [];
  const userIds = userEvents.map(ue => ue.user_id);
  const { data: users, error: userError } = await supabase
    .from('users')
    .select('id, name')
    .in('id', userIds);
  if (userError) throw new Error(userError.message);
  const { data: Userrequirements, error: reqUserError } = await supabase
    .from('user_dietary_restriction')
    .select('user_id, dietary_restrictionId')
    .in('user_id', userIds);
  if (reqUserError) throw new Error(reqUserError.message);
  const UserrequirementsId = Userrequirements.map(ue => ue.dietary_restrictionId);
  const { data: requirement, error: reqError } = await supabase
    .from('dietary_restriction')
    .select('id,name, description')
    .in('id', UserrequirementsId);
  if (reqError) throw new Error(reqError.message);
  const result = users.map(user => {
    const userRequirement = Userrequirements.filter(ur => ur.user_id === user.id);
    const requirementDetails = userRequirement.map(ur => {
      const req = requirement.find(r => r.id === ur.dietary_restrictionId);
      return {
        requirementName: req?.name || 'אין דרישה',
        requirementDescription: req?.description || 'אין תיאור של דרישה',
      };
    });
    return {
      userId: user.id,
      userName: user.name,
      requirements: requirementDetails
    };
  });
  return result;
}

 export async function deleteEvent(id: string, userId: string,userRole:string): Promise<void> {
  // שלב 1: שליפת האירוע
  const event = await getEventById(id);
  if (!event) {
    throw new Error('Event not found');
  }
  // שלב 2: בדיקת הרשאה
    if(userRole!=='administrator')
    {
  const { data: user, error: userError } = await supabase
    .from('user_events').select('user_id')
    .eq('event_id', id).eq('user_id', userId).eq('role', 'admin')
    console.log('user',user);
    
    
  if (userError) {
    throw new Error(userError.message);
  }
  if (!user || user.length === 0) {
    throw new Error('Permission denied: Only the organizer can delete this event');
  }
}

  // שלב 3: שליפת כל המשתתפים שרוצים לקבל עדכון לפני מחיקה
  const { data: participants, error: participantsError } = await supabase
    .from('user_events')
    .select('user_id, users(email)')
    .eq('event_id', id);

  if (participantsError) throw new Error(participantsError.message);

  const userIds = participants.map((p: any) => p.user_id);
  console.log('User IDs to notify:', userIds);

  // שלב 3.1: שליפת משתמשים שמעדיפים לקבל עדכון על מחיקה
  const { data: notifyUsers, error: notifyError } = await supabase
    .from('notification_preferences')
    .select('user_id')
    .in('user_id', userIds)
    .eq('notify_delete_event', 1);

  if (notifyError) throw new Error(notifyError.message);
  console.log('notifyUsers:', notifyUsers);
  const notifyUserIds = notifyUsers.map((n: any) => n.user_id);

  // שלב 3.2: סינון המיילים של המשתמשים שרוצים לקבל עדכון
  const emails = participants
    .filter((p: any) => notifyUserIds.includes(p.user_id))
    .map((p: any) => p.users?.email)
    .filter((email: string | undefined) => !!email);

  // שלב 4: מחיקת user_events
  const { error: userEventsError } = await supabase
    .from('user_events')
    .delete()
    .eq('event_id', id);
  if (userEventsError) throw new Error(userEventsError.message);

  // שלב 5: מחיקת menuaction
  const { error: menuActionError } = await supabase
    .from('menuaction')
    .delete()
    .eq('eventid', id);
  if (menuActionError) throw new Error(menuActionError.message);

  // שלב 6: מחיקת shared_link
  const { error: sharedLinkError } = await supabase
    .from('share_link')
    .delete()
    .eq('event_id', id);
  if (sharedLinkError) throw new Error(sharedLinkError.message+'shared_link'+id);
// מחיקת התמונה מהסטורג
 const { data: event1, error: fetchError } = await supabase
      .from('events')
      .select('thumbnail')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Fetch Event Error:', fetchError);
      throw fetchError;
    }

    // Log the thumbnail path
    console.log('Full Thumbnail Path:', event1.thumbnail);

    if (event1.thumbnail) {
      // Directly use the path as it appears to be already in the correct format
      const { error: storageError, data: storageData } = await supabase
        .storage
        .from('event-thumbnails')
        .remove([event1.thumbnail]);

      if (storageError) {
        console.error('Storage Deletion Error:', storageError);
        throw storageError;
      }

      console.log('Storage Deletion Result:', storageData);
    }

  // שלב 7: מחיקת האירוע עצמו
  const { error } = await supabase
    .from(tableName)
    .delete()
    .eq('id', id);
  if (error) {
    throw new Error(error.message);
  }

  // שלב 8: שליחת עדכון במייל לכל המשתתפים

  console.log(emails);
  if (emails && emails.length > 0) {
    for (const email of emails) {
      console.log(`Sending email to ${email}: The event with ID ${id} has been deleted.`);
      sendMail(email, 'Event Deleted', `The event ${event.title} has been deleted. 😕,'en`);

    }
  }
}

export async function updateEvent(id: string, updates: Partial<Event>, userId: string,userRole:string): Promise<Event> {
  // שלב 1: שליפת האירוע
  const event = await getEventById(id);
  if (!event) {
    throw new Error('Event not found');
  }
  // // שלב 2: בדיקת הרשאה
   if(userRole!=='administrator')
    {
  const { data: user, error: userError } = await supabase
    .from('user_events').select('*')
    .eq('event_id', id).eq('user_id', userId).eq('role', 'admin');
  if (userError) throw new Error(userError.message);
  if (!user) {
    throw new Error('Permission denied: User is not orgnaize for this event');
  }
}
  // שלב 3: שליפת כל המשתתפים שרוצים לקבל עדכון לפני עריכה
const { data: participants, error: participantsError } = await supabase
  .from('user_events')
  .select('user_id, users(email)')
  .eq('event_id', id);
if (participantsError) throw new Error(participantsError.message);
const userIds = participants.map((p: any) => p.user_id);
console.log('User IDs to notify:', userIds);
// שלב 3.1: שליפת משתמשים שמעדיפים לקבל עדכון על עריכת אירוע
const { data: notifyUsers, error: notifyError } = await supabase
  .from('notification_preferences')
  .select('user_id')
  .in('user_id', userIds)
  .eq('notify_event_updated',1);
if (notifyError) throw new Error(notifyError.message);
console.log('notifyUsers:', notifyUsers);
const notifyUserIds = notifyUsers.map((n: any) => n.user_id);
// שלב 3.2: סינון המיילים של המשתמשים שרוצים לקבל עדכון
const emails = participants
  .filter((p: any) => notifyUserIds.includes(p.user_id))
  .map((p: any) => p.users?.email)
  .filter((email: string | undefined) => !!email);
  // שלב 3: עדכון האירוע
  const snakeCaseUpdates = mapKeys(updates, toSnake);
  const { data, error } = await supabase
    .from(tableName)
    .update(snakeCaseUpdates)
    .eq('id', id)
    .select()
    .single();
  if (error) {
    console.log(error);
    throw new Error(error.message);
  }
  if (!data) throw new Error('Failed to update event');
   console.log(emails);
  if (emails && emails.length > 0) {
    for (const email of emails) {
      console.log(`Sending email to ${email}: The event with ID ${id} has been updated.`);
      sendMail(email, 'Event Updated', `The event ${event.title} has been updated. :sparkles:,'en`);
    }
  }
  return mapKeys<Event>(data, toCamel);
}

export async function getEventAttendees(eventId: string): Promise<Attendee[]> {
  const { data, error } = await supabase
    .from('user_events')
    .select(`
      users!inner(
        id,
        name,
        user_dietary_restriction(
          dietary_restriction(name)
        )
      )
    `)
    .eq('event_id', eventId);

  if (error) {
    throw new Error(`Failed to fetch user names for event ${eventId}: ${error.message}`);
  }

  return (data || []).map((row: any) => ({
    id: row.users.id,
    name: row.users.name,
    dietaryRestrictions: row.users.user_dietary_restriction?.map(
      (r: any) => r.dietary_restriction.name
    ) || []
  }));
}

// פונקציה להצטרפות לאירוע מסויים עם הדפסות DEBUG
export async function handleJoinEvent(userId: string, token: string): Promise<{
  status: number;
  body: object;
}> {
  let decodedToken: any;

  try {
    console.log("🚀 התחלת handleJoinEvent");
    console.log("📨 טוקן שהתקבל:", token);
    console.log("🔑 JWT_SECRET:", JWT_SECRET);
    decodedToken = jwt.verify(token, JWT_SECRET);
    console.log("✅ טוקן פוענח בהצלחה:", decodedToken);
  } catch (error: any) {
    console.error("❌ שגיאה בפיענוח הטוקן:", error.message);
    if (error.name === 'TokenExpiredError') {
      return { status: 410, body: { success: false, error: 'Link has expired' } };
    }
    return { status: 401, body: { success: false, error: 'Invalid or malformed token' } };
  }

  const { eventId, accessLevel } = decodedToken;
  console.log("🔍 eventId:", eventId, "| accessLevel:", accessLevel);

  if (accessLevel === 'view_only') {
    console.warn("🚫 למשתמש יש גישה לצפייה בלבד");
    return { status: 403, body: { success: false, error: 'View-only access' } };
  }

  console.log("🔎 בודק אם המשתמש כבר הצטרף לאירוע...");
  const { data: existing } = await supabase
    .from('user_events')
    .select('*')
    .eq('user_id', userId)
    .eq('event_id', eventId)
    .maybeSingle();

  if (existing) {
    console.warn("⚠️ המשתמש כבר רשום לאירוע הזה");
    return { status: 409, body: { success: false, error: 'User already joined this event' } };
  }

  console.log("📅 טוען פרטי אירוע...");
  const { data: event, error: eventError } = await supabase
    .from('events')
    .select('expected_count,title, datetime')
    .eq('id', eventId)
    .maybeSingle();

  if (eventError || !event) {
    console.error("❌ אירוע לא נמצא או שגיאה:", eventError);
    return { status: 404, body: { success: false, error: 'Event not found' } };
  }

  const maxParticipants = event.expected_count;
  console.log("👥 מקסימום משתתפים לאירוע:", maxParticipants);

  const { count: currentCount, error: countError } = await supabase
    .from('user_events')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', eventId);

  if (countError) {
    console.error("❌ שגיאה בספירת המשתתפים:", countError);
    return { status: 500, body: { success: false, error: 'Failed to count participants' } };
  }

  const newCount = (currentCount || 0) + 1;
  console.log("📈 משתתפים אחרי הצטרפות:", newCount);

  if (newCount <= maxParticipants) {
    console.log("✅ יש מקום באירוע — מוסיף משתמש...");
    const { data: inserted, error: insertError } = await supabase
      .from('user_events')
      .insert([{
        user_id: userId,
        event_id: eventId,
        role: 'participant',
        joined_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (insertError) {
      console.error("❌ שגיאה בהכנסת המשתמש לטבלת user_events:", insertError);
      return { status: 500, body: { success: false, error: 'Failed to join event' } };
    }

    console.log("📧 טוען פרטי משתמש והעדפות התראות...");
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('email, name')
      .eq('id', userId)
      .maybeSingle();

    const { data: notificationPrefs, error: prefError } = await supabase
      .from('notification_preferences')
      .select('notify_joined_event')
      .eq('user_id', userId)
      .maybeSingle();

    let emailSent = false;

    if (!userError && !prefError && userData?.email && notificationPrefs?.notify_joined_event) {
      const subject = `🎉 הצטרפת לאירוע: ${event.title}`;
      const text = `שלום ${userData.name || ''},\n\nהצטרפת בהצלחה לאירוע "${event.title}".\n\nתאריך האירוע: ${new Date(event.datetime).toLocaleString()}\n\nנתראה שם!`;
      try {
        console.log("📨 מנסה לשלוח מייל ל:", userData.email);
        const result = await sendMail(userData.email, subject, text);
        console.log("📤 תוצאת שליחת מייל:", result);
        emailSent = result.success;
        if (!emailSent) console.warn("⚠️ שליחת המייל נכשלה");
      } catch (mailError) {
        console.error("❌ שגיאה כללית בשליחת מייל:", mailError);
      }
    } else {
      console.log("🔕 מייל לא נשלח בגלל העדפות או חוסר במידע");
    }

    return {
      status: 201,
      body: {
        status: 201,
        success: true,
        data: inserted,
        emailSent,
      },
    };
  } else {
    console.log("⏳ אין מקום — מוסיף לרשימת המתנה...");
    const { data: waitRow, error: waitError } = await supabase
      .from('waiting_list')
      .insert([{
        user_id: userId,
        event_id: eventId,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (waitError) {
      console.error("❌ שגיאה בהוספה לרשימת המתנה:", waitError);
      return { status: 500, body: { success: false, error: 'Failed to join waiting list' } };
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('email, name')
      .eq('id', userId)
      .maybeSingle();

    const { data: notificationPrefs, error: prefError } = await supabase
      .from('notification_preferences')
      .select('notify_joined_event')
      .eq('user_id', userId)
      .maybeSingle();

    let emailSent = false;

    if (!userError && !prefError && userData?.email && notificationPrefs?.notify_joined_event) {
      const subject = `📋 נרשמת לרשימת המתנה: ${event.title}`;
      const text = `שלום ${userData.name || ''},\n\nנרשמת לרשימת ההמתנה לאירוע "${event.title}". נעדכן אותך אם יתפנה מקום.\n\nתודה!`;
      try {
        console.log("📨 מנסה לשלוח מייל ל:", userData.email);
        const result = await sendMail(userData.email, subject, text);
        console.log("📤 תוצאת שליחת מייל (רשימת המתנה):", result);
        emailSent = result.success;
        if (!emailSent) console.warn("⚠️ שליחת מייל לרשימת המתנה נכשלה");
      } catch (mailError) {
        console.error("❌ שגיאה כללית בשליחת מייל לרשימת המתנה:", mailError);
      }
    } else {
      console.log("🔕 מייל רשימת המתנה לא נשלח בגלל העדפות או חוסר בפרטים");
    }

    return {
      status: 202,
      body: {
        status: 202,
        success: true,
        message: 'Added to waiting list',
        data: waitRow,
        emailSent,
      },
    };
  }
}

// export const getAverageActualAttendees = async (): Promise<number | null> => {
//   // 1. שליפת כל האירועים שהיו בפועל
//   const { data, error } = await supabase
//     .from("user_events")
//     .select("event_id");

//   if (error) {
//     console.error("Error fetching user_event:", error);
//     return null;
//   }
//   if (!data || data.length === 0) {
//     return 0;
//   }

//   // 2. ספירת משתתפים לכל event_id
//   const countsByEvent: Record<string, number> = {};
//   data.forEach((row) => {
//     const id = row.event_id;
//     countsByEvent[id] = (countsByEvent[id] || 0) + 1;
//   });

//   // 3. חישוב הממוצע
//   const totalEvents = Object.keys(countsByEvent).length;
//   const totalAttendees = Object.values(countsByEvent).reduce((a, b) => a + b, 0);
//   const average = totalAttendees / totalEvents;

//   return Math.round(average * 100) / 100; // לדוגמא, עם שתי ספרות אחרי הנקודה
// };

export async function getEventPreviewHtml(id: string): Promise<string> {
  const { data: event, error } = await supabase
    .from('events')
    .select('id, title, description, thumbnail')
    .eq('id', id)
    .single();

  if (error || !event) {
    throw new Error('אירוע לא נמצא');
  }

  const templatePath = path.join(__dirname, '../../event-template.html');

  if (!fs.existsSync(templatePath)) {
    throw new Error('קובץ התבנית לא נמצא: ' + templatePath);
  }

  const htmlTemplate = fs.readFileSync(templatePath, 'utf-8');

  return htmlTemplate
    .replace(/{{TITLE}}/g, event.title)
    .replace(/{{DESCRIPTION}}/g, event.description)
    .replace(/{{IMAGE}}/g, event.thumbnail)
    .replace(/{{ID}}/g, event.id);
}



// export async function createEventShareLink(
//   eventId: string,
//   createdBy: string,
//   accessLevel: string
// ): Promise<string> {
//   // שלב 1: שולף את תאריך האירוע ממסד הנתונים
//   const { data: event, error: eventError } = await supabase
//     .from('events')
//     .select('datetime')
//     .eq('id', eventId)
//     .single();

//   if (eventError || !event) {
//     throw new Error('Failed to fetch event datetime');
//   }

//   const expiresAt = new Date(event.datetime);

//   // ש  מייצר טוקן JWT עם פקיעת תוקף
//   const token = jwt.sign(
//     {
//       eventId,
//       createdBy,
//       accessLevel,
//     },
//     JWT_SECRET,
//     { expiresIn: Math.floor((expiresAt.getTime() - Date.now()) / 1000) } // שניות
//   );
//   //  שומר במסד הנתונים
//   const { error: insertError } = await supabase
//     .from('share_link')
//     .insert([
//       {
//         event_id: eventId,
//         token: token,
//         expiration_date: expiresAt.toISOString(),
//         access_level: accessLevel,
//         usage_count: 0,
//         created_by: createdBy,
//       },
//     ]);
//   if (insertError) {
//     console.error('Insert error full details:', insertError);
//     throw new Error(`Failed to save share link: ${insertError.message || JSON.stringify(insertError)}`);
//   }
//   const link = `https://eventix.app/join?token=${token}`;
//   const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(link)}`;
//   return whatsappUrl;
// }
export async function createEventShareLink(
  eventId: string,
  createdBy: string,
  accessLevel: string
): Promise<string> {
  // שלב 1: שליפת תאריך האירוע
  const { data: event, error: eventError } = await supabase
    .from('events')
    .select('datetime')
    .eq('id', eventId)
    .single();

  if (eventError || !event) {
    console.error("❌ שגיאה בשליפת האירוע:", eventError);
    throw new Error('Failed to fetch event datetime');
  }

  const expiresAt = new Date(event.datetime);
  const now = new Date();
  const expiresInSeconds = Math.floor((expiresAt.getTime() - now.getTime()) / 1000);

  console.log('📅 תאריך האירוע:', event.datetime);
  console.log('🕒 תוקף שניות עד פקיעה:', expiresInSeconds);
  console.log('🔐 JWT_SECRET קיים:', !!JWT_SECRET);

  if (isNaN(expiresAt.getTime())) {
    throw new Error('Invalid event datetime – תאריך האירוע לא תקין');
  }

  if (expiresInSeconds <= 0) {
    console.warn("⚠️ תוקף הטוקן שלילי או אפס – ניתן ערך ברירת מחדל של שעה");
  }

  const safeExpiresIn = expiresInSeconds > 60 ? expiresInSeconds : 3600;

  // יצירת הטוקן
  const token = jwt.sign(
    {
      eventId,
      createdBy,
      accessLevel,
    },
    JWT_SECRET,
    { expiresIn: safeExpiresIn }
  );

  console.log("📦 טוקן שנוצר:", token);

  // שמירת הטוקן במסד
  const { error: insertError } = await supabase
    .from('share_link')
    .insert([{
      event_id: eventId,
      token,
      expiration_date: expiresAt.toISOString(),
      access_level: accessLevel,
      usage_count: 0,
      created_by: createdBy,
    }]);

  if (insertError) {
    console.error('❌ שגיאה בהכנסת קישור למסד:', insertError);
    throw new Error(`Failed to save share link: ${insertError.message || JSON.stringify(insertError)}`);
  }

  const link = `https://eventix.app/join?token=${token}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(link)}`;
  return whatsappUrl;
}

export async function getUserEventsWithFilter(
  req: any,
 
  eventFilters?: Record<string, any>
): Promise<EventsResponse> {
  try {
    const user_id = req.user?.userId;

    if (!user_id) {
      return { success: false, data: [], error: 'Unauthorized' };
    }

    const { data: userEvents, error } = await supabase
      .from('user_events')
      .select('event_id, role')
      .eq('user_id', user_id);

    if (error) {
      return { success: false, data: [], error: error.message };
    }

    if (!userEvents || userEvents.length === 0) {
      return { success: true, data: [], totalItems: 0, totalPages: 0, currentPage: 1 };
    }

    const eventIds = userEvents.map(ue => ue.event_id);
    const eventRoleMap = userEvents.reduce((map, ue) => {
      map[ue.event_id] = ue.role;
      return map;
    }, {} as Record<string, string>);

    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .in('id', eventIds)
      .order('created_at', { ascending: false });

    if (eventsError) {
      return { success: false, data: [], error: eventsError.message };
    }

    if (!events || events.length === 0) {
      return { success: true, data: [], totalItems: 0, totalPages: 0, currentPage: 1 };
    }

    // צירוף role לכל event
    const eventsWithRole = events.map(event => ({
      ...event,
      role: eventRoleMap[event.id] ?? null,
    }));
    console.log('eventsWithRole:', eventsWithRole);

    // מיפוי למפתחות camelCase
    const eventsCamel = eventsWithRole.map(event => mapKeys<Event>(event, toCamel));
 return {
  success: true,
  data: eventsCamel,   // מחזיר כאן את המיפוי הנכון!
  totalItems: eventsCamel.length,
  totalPages: 1,
  currentPage: 1,
};

  } catch (e: any) {
    return {
      success: false,
      data: [],
      error: e.message || 'Unknown server error',
    };
  }
}
export async function getMonthlyEventCreationStats(year?: number): Promise<{ month: number; count: number }[]> {
  const targetYear = year || new Date().getFullYear();

  const { data, error } = await supabase
    .from('events')
    .select(`created_at`, { count: 'exact' })
    .gte('created_at', `${targetYear}-01-01`)
    .lt('created_at', `${targetYear + 1}-01-01`);

  if (error) {
    throw new Error(error.message);
  }



  const monthlyCounts: { [key: number]: number } = {};

  data?.forEach(event => {
    const month = new Date(event.created_at).getMonth() + 1; // החודש (1-12)
    monthlyCounts[month] = (monthlyCounts[month] || 0) + 1;
  });

  const result = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    count: monthlyCounts[i + 1] || 0,
  }));

  return result;
}
//אנליטיקות
export async function getEventsCreatedThisMonth(): Promise<any> {
  const currentDate = new Date();
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString();
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString();

  const { data, error } = await supabase
    .from('events')  // טבלה שבה נשמרים האירועים
    .select('id')  // בוחרים רק את ה-id של כל אירוע
    .gte('created_at', startOfMonth)
    .lte('created_at', endOfMonth);
  // .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()); // בודקים את האירועים שנוצרו מהתחלת החודש

  if (error) {
    console.error('Error fetching data', error);
    throw error;
  }
  return data.length; // מחזירים את מספר האירועים
};

// export async function getUserEventsWithFilter(
//   req: any,
//   res: Response,
//   page: number = 1,
//   pageSize: number = 15,
//   eventFilters?: Record<string, any>
// ): Promise<{ event: Event }[]> {
//  //const user_id ='04cd1f19-8800-494e-914a-e5256b876fab' // זמני בגלל NetFree
//   const user_id = req.user?.userId; // שליפת userId מה-Middleware
//   console.log(':mag: [getUserEventsWithFilter] req.user:', req.user);
//   console.log(':mag: [getUserEventsWithFilter] user_id:', user_id);
//   if (!user_id) throw new Error('Unauthorized');
//   // שלב 1: שליפת כל האירועים של המשתמש (בלי paging)
//   const { data: userEvents, error } = await supabase
//     .from('user_events')
//     .select('event_id, role')
//     .eq('user_id', user_id);
//   console.log(':mag: [getUserEventsWithFilter] userEvents:', userEvents);
//   if (error) throw new Error(error.message);
//   if (!userEvents || userEvents.length === 0) {
//     console.log(':x: No user events found - returning empty array');
//     return [];
//   }
//   const eventIds = userEvents.map(ue => ue.event_id);
//   console.log(':dart: Event IDs found:', eventIds);
//   if (!eventIds || eventIds.length === 0) {
//     console.log(':x: No event IDs - returning empty array');
//     return [];
//   }
//   // יצירת מפה של event_id לrole
//   const eventRoleMap = userEvents.reduce((map, ue) => {
//     map[ue.event_id] = ue.role;
//     return map;
//   }, {} as Record<string, string>);
//   // שלב 2: שליפת כל האירועים עצמם (בלי paging)
//   console.log(':mag: Fetching events data...');
//   const { data: events, error: eventsError } = await supabase
//     .from('events')
//     .select('*')
//     .in('id', eventIds)
//     .order('created_at', { ascending: true });
//   if (eventsError) throw new Error(eventsError.message);
//   if (!events) {
//     console.log(':x: No events data - returning empty array');
//     return [];
//   }
//   // שלב 3: סינון ומיון (ב-controller) והוספת userRole
//  console. log('events', events);
//   for (const  key of events) {
//   console.log("key",key );
//   console.log((key as any).user_id);
//    const { data: rol, error: rolError } = await supabase
//     .from('user_events')
//     .select('role')
//     .eq('event_id', (key as any).id)
//     .eq('user_id',user_id);
// if(rolError) {
//      throw  rolError;
//     }
//     (key as any).role = rol.length > 0 ? rol[0].role : null;
//     // (key as any).role=rol;
//     console.log(key);
//   }
//   return events;
// }
// export function filterTitle(events: Event[], title?: string): Event[] {
//   if (!title) return events;
//   return events.filter(event =>
//     event.title.toLowerCase().includes(title.toLowerCase())
//   );
// }
// export function filterByFromDate(events: Event[], fromDate?: Date): Event[] {
//   console.log("filterByFromDate called with fromDate:", fromDate);
//   if (!fromDate) return events;
//   return events.filter(event => new Date(event.datetime) > fromDate);
// }
// export function filterByToDate(events: Event[], toDate?: Date): Event[] {
//   console.log("filterByToDate called with toDate:", toDate);
//   if (!toDate) return events;
//   return events.filter(event => new Date(event.datetime) < toDate);
// }
// export function filterByMealTypes(events: Event[], mealTypes?: MealType[]): Event[] {
//   if (!mealTypes || mealTypes.length === 0) return events;
//   return events.filter(event => mealTypes.includes(event.mealType as MealType));
// }
// // פונקציות מיון
// export function sortByname(events: Event[]) {
//   console.log("sortByname called");
//   return [...events].sort((a, b) => a.title.localeCompare(b.title));
// }
// export function sortBynameDescending(events: Event[]) {
//   console.log("sortBynameDescending called");
//   return [...events].sort((a, b) => b.title.localeCompare(a.title));
// }
// export function sortByDate(events: Event[]) {
//   console.log("sortByDate called");
//   return [...events].sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());
// }
// export function sortByDateDescending(events: Event[]) {
//   console.log("sortByDateDescending called");
//   return [...events].sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime());
// }
// export function sortByMealType(events: Event[]) {
//   console.log("sortByMealType called");
//   return [...events].sort((a, b) => a.mealType.localeCompare(b.mealType));
// }
//  export function sortByMealTypeDescending(events: Event[]) {
//   console.log("sortByMealTypeDescending called" );
//   return [...events].sort((a, b) => b.mealType.localeCompare(a.mealType));
// }



export async function countUsersWithMoreThanTwoEvents(): Promise<number> {
  const { data, error } = await supabase
    .from('events')
    .select('*');

  if (error) throw new Error(error.message);
  if (!data) return 0;

  // סופרים כמה אירועים יש לכל משתמש
  const userEventCounts: Record<string, number> = {};
  data.forEach(event => {
    userEventCounts[event.created_by] = (userEventCounts[event.created_by] || 0) + 1;
  });
console.log("userEventCounts:", userEventCounts);
  // סופרים כמה משתמשים יש להם יותר מ-2 אירועים
  const count = Object.values(userEventCounts).filter(c => c >= 2).length;
  console.log("count:", count);
  return count;
}


export function filterTitle(events: Event[], title?: string): Event[] {
  if (!title) return events;
  return events.filter(event =>
    event.title.toLowerCase().includes(title.toLowerCase())
  );
}
export function filterByFromDate(events: Event[], fromDate?: Date): Event[] {
  console.log("filterByFromDate called with fromDate:", fromDate);
  if (!fromDate) return events;
  return events.filter(event => new Date(event.datetime) > fromDate);
}
export function filterByToDate(events: Event[], toDate?: Date): Event[] {
  console.log("filterByToDate called with toDate:", toDate);
  if (!toDate) return events;
  return events.filter(event => new Date(event.datetime) < toDate);
}
export function filterByMealTypes(events: Event[], mealTypes?: MealType[]): Event[] {
  if (!mealTypes || mealTypes.length === 0) return events;
  return events.filter(event => mealTypes.includes(event.mealType as MealType));
}
// פונקציות מיון
export function sortByname(events: Event[]) {
  console.log("sortByname called");
  return [...events].sort((a, b) => a.title.localeCompare(b.title));
}
export function sortBynameDescending(events: Event[]) {
  console.log("sortBynameDescending called");
  return [...events].sort((a, b) => b.title.localeCompare(a.title));
}
export function sortByDate(events: Event[]) {
  console.log("sortByDate called");
  return [...events].sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());
}
export function sortByDateDescending(events: Event[]) {
  console.log("sortByDateDescending called");
  return [...events].sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime());
}
export function sortByMealType(events: Event[]) {
  console.log("sortByMealType called");
  return [...events].sort((a, b) => a.mealType.localeCompare(b.mealType));
}
 export function sortByMealTypeDescending(events: Event[]) {
  console.log("sortByMealTypeDescending called" );
  return [...events].sort((a, b) => b.mealType.localeCompare(a.mealType));
}
export async function getCompletedEvents(): Promise<Event[]> {
  const now = new Date().toISOString();
  console.log('NOW:', now);
  console.log('Querying events with datetime < now…');

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .lt('datetime', now)
    .order('datetime', { ascending: false });
  console.log('Error:', error);
  console.log('Data returned:', data);
  if (error) throw new Error(error.message);
  return (data || []).map(row => mapKeys<Event>(row, toCamel));
}
export const getAverageActualAttendees = async (): Promise<number | null> => {
  // 1. שליפת כל האירועים שהיו בפועל
  const { data, error } = await supabase
    .from("user_events")
    .select("event_id");

  if (error) {
    console.error("Error fetching user_event:", error);
    return null;
  }
  if (!data || data.length === 0) {
    return 0;
  }

  // 2. ספירת משתתפים לכל event_id
  const countsByEvent: Record<string, number> = {};
  data.forEach((row) => {
    const id = row.event_id;
    countsByEvent[id] = (countsByEvent[id] || 0) + 1;
  });

  // 3. חישוב הממוצע
  const totalEvents = Object.keys(countsByEvent).length;
  const totalAttendees = Object.values(countsByEvent).reduce((a, b) => a + b, 0);
  const average = totalAttendees / totalEvents;

  return Math.round(average * 100) / 100; // לדוגמא, עם שתי ספרות אחרי הנקודה
};