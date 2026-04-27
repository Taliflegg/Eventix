import { supabase } from './database.service';
import { sendMail } from './email.Service';

export async function sendReminderEmails() {
  const now = new Date();
  const oneMonthLater = new Date();
  oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);

  const { data: events, error: eventsError } = await supabase
    .from('events')
    .select('*')
    .gte('datetime', now.toISOString())
    .lte('datetime', oneMonthLater.toISOString());

  if (eventsError) {
    console.error('❌ שגיאה בשליפת אירועים:', eventsError);
    return;
  }

  for (const event of events || []) {
    const { data: userEvents, error: ueError } = await supabase
      .from('user_events')
      .select('user_id')
      .eq('event_id', event.id);

    if (ueError) {
      console.error(`❌ שגיאה בשליפת משתמשים לאירוע ${event.id}:`, ueError);
      continue;
    }

    for (const { user_id: userId } of userEvents || []) {
      const { data: prefRows, error: prefError } = await supabase
        .from('notification_preferences')
        .select('notify_reminder')
        .eq('user_id', userId);

      if (prefError || !prefRows || prefRows.length === 0) {
        console.warn(`⚠️ אין העדפות תזכורת למשתמש ${userId}`);
        continue;
      }

      let reminderTimes: string[] = [];
      const preferences = prefRows[0];

      if (typeof preferences.notify_reminder === 'string') {
        try {
          reminderTimes = JSON.parse(preferences.notify_reminder);
        } catch {
          console.warn(`⚠️ תזכורות לא תקינות אצל ${userId}:`, preferences.notify_reminder);
          continue;
        }
      } else if (Array.isArray(preferences.notify_reminder)) {
        reminderTimes = preferences.notify_reminder;
      }
      
      for (const reminder of reminderTimes) {
        if (!shouldSendReminder(reminder, event.datetime, now)) continue;

        // 🔎 בדיקה אם כבר נשלחה תזכורת
        const { data: existingReminder } = await supabase
          .from('sent_reminders')
          .select('id')
          .eq('user_id', userId)
          .eq('event_id', event.id)
          .eq('reminder_type', reminder)
          .maybeSingle();
          
        if (existingReminder) {
          console.log(`⏩ תזכורת ${reminder} כבר נשלחה למשתמש ${userId} על אירוע ${event.id}`);
          break;
        }


        // 📧 שליפת אימייל
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('email')
          .eq('id', userId)
          .maybeSingle();

        if (userError || !userData?.email) {
          console.error(`❌ שגיאה בשליפת מייל למשתמש ${userId}`, userError);
          continue;
        }

        const subject = `📅 תזכורת לאירוע: ${event.title || 'אירוע קרוב'}`;
        const text = `שלום, זוהי תזכורת שהאירוע "${event.title || 'אירוע'}" יתקיים בתאריך ${new Date(event.datetime).toLocaleString()}.`;

        const result = await sendMail(userData.email, subject, text);

        if (result.success) {
          console.log(`📧 מייל נשלח ל־${userData.email}`);

          // 💾 רשום ב־sent_reminders
          const { error: insertError } = await supabase
            .from('sent_reminders')
            .insert({
              user_id: userId,
              event_id: event.id,
              reminder_type: reminder,
              sent_at: new Date().toISOString()
            });

          if (insertError) {
            console.error(`❌ שגיאה ברישום שליחה ל־sent_reminders`, insertError);
          }
        } else {
          console.error(`❌ כשלון בשליחת מייל ל־${userData.email}`);
        }
      }
    }
  }
}

function shouldSendReminder(reminder: string, eventDateStr: string, now: Date): boolean {
  const eventDate = new Date(eventDateStr);
  const diffMs = eventDate.getTime() - now.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  const diffHours = diffMs / (1000 * 60 * 60);

  switch (reminder) {
    case '1_hour_before':
      return diffHours <= 1 && diffHours > 0;
    case '2_hours_before':
      return diffHours <= 2 && diffHours > 1;
    case '1_day_before':
      return diffDays <= 1 && diffDays > 0;
    case '2_days_before':
      return diffDays <= 2 && diffDays > 1;
    case '3_days_before':
      return diffDays <= 3 && diffDays > 2;
    case '1_week_before':
      return diffDays <= 7 && diffDays > 6;
    case '1_month_before':
      return diffDays <= 30 && diffDays > 29;
    case 'same_day':
      return eventDate.getUTCDate() === now.getUTCDate() &&
        eventDate.getUTCMonth() === now.getUTCMonth() &&
        eventDate.getUTCFullYear() === now.getUTCFullYear();
    default:
      return false;
  }
}
