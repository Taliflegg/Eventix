// ✅ meal_train.service.ts 


import {  MealTrainDates } from '@eventix/shared';
const tableNameMealTrains = 'meal_trains';
const tableNameMealTrainDates = 'meal_train_dates';
const tableNameUsers = 'users';
export class MealTrainService {
  public async getAllMealTrains(): Promise<MealTrains[]> {
    const { data, error } = await supabase.from(tableNameMealTrains).select('*');
    if (error) throw new Error(error.message);
    return data;
  }

  public async createMealTrain(mealTrain: Omit<MealTrains, 'id'>): Promise<MealTrains> {
    const { data, error } = await supabase
      .from(tableNameMealTrains)
      .insert([mealTrain])
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  public async getAllMealTrainDates(): Promise<MealTrainDates[]> {
    const { data, error } = await supabase.from(tableNameMealTrainDates).select('*');
    if (error) throw new Error(error.message);
    return data;
  }

  public async createMealTrainDate(mealTrainDate: Omit<MealTrainDates, 'id'>): Promise<MealTrainDates> {
    const { data, error } = await supabase
      .from(tableNameMealTrainDates)
      .insert([mealTrainDate])
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  public async getVolunteerCountByMealTrainId(mealTrainId: string): Promise<{ total: number; count: number }> {
    const { data, error } = await supabase
      .from(tableNameMealTrainDates)
      .select('volunteer_user_id')
      .eq('meal_train_id', mealTrainId);
    if (error) throw new Error(error.message);
    const total = data.length;
    const count = data.filter(row => row.volunteer_user_id).length;
    return { total, count };
  }
  public async updateMealTrain(id: string, updates: Partial<MealTrains>): Promise<MealTrains> {
    const { data, error } = await supabase
      .from(tableNameMealTrains)
      .update(updates)
      .match({ id })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  public async getVolunteerUserIds(mealTrainId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from(tableNameMealTrainDates)
      .select('volunteer_user_id')
      .eq('meal_train_id', mealTrainId);
    if (error) throw new Error(error.message);
    return (data || []).map(r => r.volunteer_user_id).filter(Boolean);
  }
  public async getVolunteerEmails(mealTrainId: string): Promise<string[]> {
    const volunteerIds = await this.getVolunteerUserIds(mealTrainId);
    const { data: users, error } = await supabase
      .from(tableNameUsers)
      .select('email')
      .in('id', volunteerIds);
    if (error) throw new Error(error.message);
    return users.map(user => user.email);
  }
  public async volunteerForDate(mealTrainDateId: string, userId: string, userName: string): Promise<MealTrainDates> {
    const { data, error } = await supabase
      .from(tableNameMealTrainDates)
      .update({
        volunteer_user_id: userId,
        volunteered: true,
        volunteer_name: userName,
      })
      .match({ id: mealTrainDateId })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }
  public async isAdmin(mealTrainId: string, userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from(tableNameMealTrains)
      .select('admin_user_id')
      .eq('id', mealTrainId)
      .single();
    if (error) throw new Error(error.message);
    return data.admin_user_id === userId;
  }
  public async getMealTrainById(id: string): Promise<MealTrains> {
    const { data, error } = await supabase
      .from(tableNameMealTrains)
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  public async getMealTrainDate(userId: string, mealTrainId: string): Promise<MealTrainDates | null> {
    const { data, error } = await supabase
      .from(tableNameMealTrainDates)
      .select('*')
      .eq('volunteer_user_id', userId)
      .eq('meal_train_id', mealTrainId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(error.message);
    }
    return data;
  }
  // :white_check_mark: חדש - קבלת מייל לפי מזהה משתמש
  public async mailByIdVolunteer(userId: string): Promise<string> {
    const { data, error } = await supabase
      .from(tableNameUsers)
      .select('email')
      .eq('id', userId)
      .single();
    if (error) throw new Error(error.message);
    return data.email;
  }
  // :white_check_mark: חדש - עדכון reminder_days לפי ID
  public async updateReminderDays(id: string, days: number): Promise<MealTrainDates> {
    const { data, error } = await supabase
      .from(tableNameMealTrainDates)
      .update({ reminder_days: days })
      .match({ id })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }
}
import { MealTrains } from '@eventix/shared';
import { columnMappings, mapKeys } from './column.mapper';
import { supabase } from './database.service';
import { sendMail } from './email.Service';


export async function getMealTrainsForUser(userId: string) {
    // שליפת כל ה-meal_train_id שבהם המשתמש מתנדב
    const { data: volunteerDates } = await supabase
        .from('meal_train_dates')
        .select('meal_train_id')
        .eq('volunteer_user_id', userId);
      
    const volunteerTrainIds = volunteerDates?.map((row: any) => row.meal_train_id) || [];
    // שליפת כל ה-meal trains שהמשתמש אדמין בהם
    const { data: adminTrains, error: adminError } = await supabase
        .from('meal_trains')
        .select(`  * `)
        .eq('admin_user_id', userId);
    if (adminError) throw adminError;
    // שליפת כל ה-meal trains שהמשתמש מתנדב בהם
    let volunteerTrains: any[] = [];
    if (volunteerTrainIds.length) {
        const { data: vData, error: vError } = await supabase
            .from('meal_trains')
            .select(`* `)
            .in('id', volunteerTrainIds);
        if (vError) throw vError;
        volunteerTrains = vData || [];
    }
    // איחוד ומיון (הסרת כפילויות)
    const allTrains = [...(adminTrains || []), ...volunteerTrains]
        .filter((v, i, a) => a.findIndex(t => t.id === v.id) === i)
        .sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime());
        for(const train of allTrains) {
            
        const { data: mealTrainDates, error: datesError } = await supabase
    .from('meal_train_dates')
    .select('*')
    .eq('meal_train_id', train.id);
        
if (datesError){
     throw datesError;
     
}

const startDate = new Date((train as any).start_date);
const endDate = new Date((train as any).end_date);
const timeDifference = endDate.getTime() - startDate.getTime();
const totalDates = Math.ceil(timeDifference / (1000 * 3600 * 24)) + 1; // הוסף 1 כדי לכלול את היום הראשון


const bookedDates = mealTrainDates.filter(date => date.volunteer_user_id !== null).length;
const availableDates = totalDates - bookedDates;
        train.progress = {
            total_dates: totalDates,
            booked_dates: bookedDates,
            available_dates: availableDates 
        }    
    }     
    // שליפת שמות אדמינים
    const adminIds = [...new Set(allTrains.map((m: any) => m.admin_user_id))];
    const { data: admins } = await supabase
        .from('users')
        .select('id, name')
        .in('id', adminIds);
    // מיפוי סופי עם role
    const result = allTrains.map((m: any) => {
        let role = 'viewer';
        if (m.admin_user_id === userId) role = 'admin';
        else if (volunteerTrainIds.includes(m.id)) role = 'volunteer';
        return {
            ...m,
            admin_name: admins?.find((a: any) => a.id === m.admin_user_id)?.name || '',
            role,
        };
    });
    return result;
}
// ⬇️ פונקציה חדשה לשליפת meal train לפי ID
export async function getMealTrainByIdOne(id: string) {
    const { data, error } = await supabase
        .from('meal_trains')
        .select(`*, users (name)`)
        .eq('id', id)
        .single();

    if (error||!data) throw error;
const fullMappedEvent = mapKeys<MealTrains>(
    data,
    columnMappings.mealTrains.toCamel as Record<string, keyof MealTrains>
  );
    return {
         ...fullMappedEvent,
    adminName: data.users?.name || '',
    };
}
export async function getMealTrainDatesByTrainIdOne(mealTrainId: string): Promise<any[]> {
  const { data, error } = await supabase
    .from('meal_train_dates')
    .select('*') // בוחרים את כל העמודות
    .eq('meal_train_id', mealTrainId)
    .order('date', { ascending: true }); // עדיין נמיין לפי התאריך
  if (error) throw error;
  return data || []; // מחזירים את כל הרשומות כמות שהן
}


// שליחת תזכורת למנהל 3 ימים לפני
export async function sendAdminReminder(): Promise<void> {
    console.log("---------------------------");// שליפת כל הרכבות
const { data: mealTrains } = await supabase
  .from('meal_trains')
  .select('*');
if (!mealTrains) throw new Error('No meal trains found');
const today = new Date();
const trainsIn3Days = mealTrains.filter((train: any) => {
  const startDate = new Date(train.start_date);
  const diffDays = Math.ceil((startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays === 3;
});
for (const mealTrain of trainsIn3Days) {
  // כאן תשלוף את המנהל ותשלח מייל
  const { admin_user_id, name, address, start_date, people_count, dietary_info } = mealTrain;
  const { data: admin } = await supabase
    .from('users')
    .select('*')
    .eq('id', admin_user_id)
    .single();
console.log(`Sending reminder to admin: ${admin?.email} for meal train: ${name}`);
  if (!admin) throw new Error('Admin user not found');
  await sendMail(
    admin.email,
    `תזכורת: רכבת הארוחות "${name}" מתחילה בעוד 3 ימים`,
    `שלום ${admin.name},\n\nרכבת הארוחות "${name}" תתחיל ב-${start_date} בכתובת ${address}
    .\nמספר משתתפים: ${people_count}\nמידע תזונתי: ${dietary_info}\n\nבהצלחה!`
  );
}
}
// שליחת תזכורת למשתתף לפי daysBefore
export async function sendParticipantsRemindersByPreference(): Promise<void> {
  const { data: mealTrainDates } = await supabase
    .from('meal_train_dates')
    .select('*');
  if (!mealTrainDates || mealTrainDates.length === 0) throw new Error('No meal dates found');
  const today = new Date();
  for (const date of mealTrainDates) {
    // נניח שיש שדה days_before שמייצג כמה ימים לפני המשתתף רוצה תזכורת
    const participantDate = new Date(date.date);
    const diffDays = Math.ceil((participantDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === date.reminder_days) {
      // שליפת פרטי המשתמש
      const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('id', date.volunteer_user_id)
        .single();
      if (!user) continue;
      await sendMail(
        user.email,
        `תזכורת: רכבת הארוחות "${date.meal_description}" בעוד ${date.reminder_days} ימים`,
        `שלום ${user.name},\n\nהתחייבת ליום ${date.date}.\nהערות: ${date.notes || 'אין'}\n\nבהצלחה!`
      );
    }
  }
}


interface MealDateInput { 
  id?: string; // אם יש ID קיים, אחרת ניצור חדש
  date: string;
  volunteer_name: string;
  meal_description: string;
  meal_train_id: string; // ID של רכבת הארוחות
  reminder_days: number;
  notes?: string;
  volunteer_user_id?: string; // אם יש ID של משתמש מתנדב
}

export async function addMealTrainDateServiceOne(
  mealTrainDateId: string,
  input: MealDateInput
) {
  console.log('📌 addMealTrainDateService started',input);
  const { data, error } = await supabase
    .from('meal_train_dates')
    .update([{ id: mealTrainDateId, ...input }])
    .eq('id',mealTrainDateId) // אם יש ID קיים, נעדכן אותו, אחרת ניצור חדש

  if (error) {
    console.error('❌ Supabase insert error:', error);
    throw error;
  }

  // 🟢 הדפסת הנתונים שחזרו בהצלחה
  console.log('✅ Supabase insert success:', data);
  return data;
}

// export async function getMonthlyMealTrainCreationStats(year?: number): Promise<{ month: number; count: number }[]> {
//   const targetYear = year || new Date().getFullYear();

//   const { data, error } = await supabase
//     .from('meal_trains')
//     .select(created_at, { count: 'exact' })
//     .gte('created_at', ${targetYear}-01-01)
//     .lt('created_at', ${targetYear + 1}-01-01);

//   if (error) {
//     throw new Error(error.message);
//   }



//   const monthlyCounts: { [key: number]: number } = {};

//   data?.forEach(mealTrain => {
//     const month = new Date(mealTrain.created_at).getMonth() + 1; // החודש (1-12)
//     monthlyCounts[month] = (monthlyCounts[month] || 0) + 1;
//   });

//   const result = Array.from({ length: 12 }, (_, i) => ({
//     month: i + 1,
//     count: monthlyCounts[i + 1] || 0,
//   }));

//   return result;
// }
export async function getMonthlyMealTrainCreationStats(year?: number): Promise<{ month: number; count: number }[]> {
  const targetYear = year || new Date().getFullYear();

  const { data, error } = await supabase
    .from('meal_trains')
    .select('created_at', { count: 'exact' })
    .gte('created_at', `${targetYear}-01-01`)
    .lt('created_at', `${targetYear + 1}-01-01`);

  if (error) {
    throw new Error(error.message);
  }

  const monthlyCounts: { [key: number]: number } = {};

  data?.forEach(mealTrain => {
    const month = new Date(mealTrain.created_at).getMonth() + 1;
    monthlyCounts[month] = (monthlyCounts[month] || 0) + 1;
  });

  const result = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    count: monthlyCounts[i + 1] || 0,
  }));

  return result;
}
