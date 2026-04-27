//waiting_list.services
import { supabase } from './database.service';
import { UserEvent } from '@eventix/shared';
import { columnMappings, mapKeys } from './column.mapper';
import { sendMail } from './email.Service';

const { toSnake } = columnMappings.user_events;

// שליפת פרטי משתמש לפי מזהה
export async function getUserById(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('email,name')
    .eq('id', userId)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// שליפת הראשון ברשימת המתנה לאירוע מסוים
export async function getFirstFromWaitingList(eventId: string) {
  const { data, error } = await supabase
    .from('waiting_list')
    .select('*')
    .eq('event_id', eventId)
    .order('created_at', { ascending: true })
    .limit(1);

  if (error) throw new Error(error.message);
  return data && data.length > 0 ? data[0] : null;
}

// הסרת משתמש מרשימת המתנה
export async function removeFromWaitingList(id: string) {
  const { error } = await supabase
    .from('waiting_list')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
}

// הוספת משתמש לאירוע
export async function addUserToEvent(eventId: string, userId: string) {
  const newUserEvent: Omit<UserEvent, 'id'> = {
    userId,
    eventId,
    role: 'participant', // ← ודא שערך זה קיים ב־CHECK CONSTRAINT
    joinedAt: new Date(),
  };

  const snakeCaseData = mapKeys(newUserEvent, toSnake);
  const { error } = await supabase
    .from('user_events')
    .insert([snakeCaseData]);

  if (error) throw new Error(error.message);
}

// העברת המשתמש הראשון מרשימת המתנה לאירוע בפועל
export async function moveFirstUserFromWaitingList(eventId: string) {
  const waitingUser = await getFirstFromWaitingList(eventId);
  if (!waitingUser) return;

  await removeFromWaitingList(waitingUser.id);
  await addUserToEvent(eventId, waitingUser.user_id);

  const user = await getUserById(waitingUser.user_id);
  if (user?.email) {
    const subject = 'הצטרפותך לאירוע אושרה';
    const text = `שלום ${user.name || ''},\n\nמקומך באירוע התפנה, והצטרפותך אושרה.\nנתראה!`;
    await sendMail(user.email, subject, text);
  }
}
