import cron from 'node-cron';
import { sendReminderEmails } from '../services/reminderService';
import { sendAdminReminder, sendParticipantsRemindersByPreference } from '../services/meal_trains.service';

export function setupReminderCronJob() {
    console.log('[🕒] הגדרת משימת קרון לשליחת תזכורות...');
    
  cron.schedule('*/10 * * * *', async () => {
    console.log('[📧] בדיקת תזכורות...');

    try {
      await sendReminderEmails();
      console.log('[✅] סיום שליחת תזכורות');
    } catch (error) {
      console.error('[❌] שגיאה בשליחת תזכורות:', error);
    }
  })
}

// פונקציה שמריצה תזכורות למנהלים ולמשתתפים ברכבות הארוחות
export function setupMealTrainReminderCronJob() {
  console.log('[🕒] הגדרת משימת קרון לשליחת תזכורות רכבת הארוחות...');

  cron.schedule('0 8 * * *', async () => { // כל יום בשעה 8:00
    console.log('[📧] בדיקת תזכורות רכבת הארוחות...');

    try {
      await sendAdminReminder();
      await sendParticipantsRemindersByPreference();

      console.log('[✅] סיום שליחת תזכורות רכבת הארוחות');
    } catch (error) {
      console.error('[❌] שגיאה בשליחת תזכורות רכבת הארוחות:', error);
    }
  });
}