import { supabase } from './database.service';
import moment from 'moment';
/**
Get the number of unique accounts that created ShabbatSync plans
in the last 7 days (used as a proxy for weekly active accounts).
@returns number of active accounts this week

*/
export async function getWeeklyActiveAccounts(): Promise<any> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const isoDate = sevenDaysAgo.toISOString();
    const { data, error } = await supabase
        .from('plans')
        .select('account_id')
        .gte('created_at', isoDate);

    if (error) {
        console.error('❌ Failed to fetch weekly active accounts:', error.message);
        throw new Error('Could not load weekly active accounts');
    }

    const uniqueAccounts = new Set(data?.map((row) => row.account_id));
    return uniqueAccounts.size;
}

export const getActiveMealTrainsCount = async () => {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const now = new Date().toISOString(); // כולל שעה
  const { count, error } = await supabase
    .from('meal_trains')
    .select('*', { count: 'exact', head: true })
    .gte('end_date', now); // end_date >= today

  if (error) {
    throw new Error(`Error fetching active meal trains: ${error.message}`);
  }

  return count ?? 0;
};
export async function getPlansCountForThisWeek(): Promise<number> {
    // תחילת השבוע - יום ראשון בשעה 00:00
    const startOfWeek = moment().startOf('week').startOf('day').format('YYYY-MM-DD');

    // סוף השבוע - יום שבת בשעה 23:59:59
    const endOfWeek = moment().endOf('week').endOf('day').format('YYYY-MM-DD');

    // לתיקון השוואה ב- date ללא שעות, מוסיפים יום אחד ל-endOfWeek ומשתמשים ב- lt (פחות מ)
    const adjustedEndOfWeek = moment(endOfWeek).add(1, 'day').format('YYYY-MM-DD');

    const { count, error } = await supabase
        .from('plans')
        .select('id', { count: 'exact', head: true })
        .gte('date', startOfWeek)
        .lt('date', adjustedEndOfWeek);  // פחות מיום ראשון הבא

    if (error) {
        console.error('Error counting plans for this week:', error.message);
        throw new Error('Failed to count plans for this week');
    }

    return count ? count + 1 : 0;
}
