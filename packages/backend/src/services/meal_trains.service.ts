import dayjs from 'dayjs';
import { supabase } from './database.service';
import { sendMail } from './email.Service';

import { MealTrainDates, MealTrains } from '@eventix/shared';
// import { v4 as uuidv4 } from 'uuid';
import { createMealTrainDate } from '../services/mealTrainDates.service';
import { columnMappings, mapKeys } from './column.mapper';
const { toCamel, toSnake } = columnMappings.meal_train;
const { toCamel: meal_train_dates } = columnMappings.meal_trains_date;
const { toCamel: toCamelMealDates, toSnake: toSnakeDates } = columnMappings.meal_trains_date;


export async function getMealTrainsForUser(userId: string, userRole: string) {
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
 
console.log("volunteerTrains", volunteerTrains);

// מסננים כפילויות רק בין volunteerTrains
let uniqueVolunteerTrains = volunteerTrains.filter((v, i, a) => 
    a.findIndex(t => t.id === v.id) === i
);

// מאחדים את adminTrains עם uniqueVolunteerTrains
let allTrains = [
    ...(adminTrains || []),
    ...uniqueVolunteerTrains
];
   allTrains.sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime());
  if (userRole === 'administrator') {
    const { data: data, error: Error } = await supabase
      .from('meal_trains')
      .select(`* `)
      .order('start_date', { ascending: false });
    if (Error) throw Error;
    allTrains = data;
  }
  for (const train of allTrains) {
    const { data: mealTrainDates, error: datesError } = await supabase
      .from('meal_train_dates')
      .select('*')
      .eq('meal_train_id', train.id);
    if (datesError) {
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
  console.log("allTrains", allTrains);
  
  // שליפת שמות אדמינים
  const adminIds = [...new Set(allTrains.map((m: any) => m.admin_user_id))];
  const { data: admins } = await supabase
    .from('users')
    .select('id, name')
    .in('id', adminIds);
  // מיפוי סופי עם role
  const result = allTrains.map((m: any) => {
    let role = 'viewer';
    if (volunteerTrainIds.includes(m.id)) role = 'volunteer';
    else if (m.admin_user_id === userId) role = 'admin';
  
    return {
      ...m,
      admin_name: admins?.find((a: any) => a.id === m.admin_user_id)?.name || '',
      role,
    };
  });
  const mapped = (result || []).map(x => mapKeys(x, toCamel as unknown as Record<string, keyof MealTrains>));
  return mapped;
}

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
    const { admin_user_id, name, address, start_date, childrens,adults, dietary_info } = mealTrain;

    const { data: admin } = await supabase
      .from('users')
      .select('*')
      .eq('id', admin_user_id)
      .single();
    console.log(`Sending reminder to admin: ${admin?.email} for meal train: ${name}`);

    if (!admin) throw new Error('Admin user not found');

    // await sendMail(
    //   admin.email,
    //   `תזכורת: רכבת הארוחות "${name}" מתחילה בעוד 3 ימים`,
    //   `שלום ${admin.name},\n\nרכבת הארוחות "${name}" תתחיל ב-${start_date} בכתובת ${address}.\nמבוגרים: ${adults} וילדים:${childrens}\nמידע תזונתי: ${dietary_info}\n\nבהצלחה!`
    // );
const language = admin.language === 'he' ? 'he' : 'en';

const subject =
  language === 'he'
    ? `תזכורת: רכבת הארוחות "${name}" מתחילה בעוד 3 ימים`
    : `Reminder: The meal train "${name}" starts in 3 days`;

const body =
  language === 'he'
    ? `שלום ${admin.name},\n\nרכבת הארוחות "${name}" תתחיל ב-${start_date} בכתובת ${address}.\nמבוגרים: ${adults} וילדים: ${childrens}\nמידע תזונתי: ${dietary_info}\n\nבהצלחה!`
    : `Hello ${admin.name},\n\nThe meal train "${name}" will start on ${start_date} at ${address}.\nAdults: ${adults}, Children: ${childrens}\nDietary info: ${dietary_info}\n\nGood luck!`;
console.log("!!!!!!---Sending email to admin:", admin.email, "Subject:", subject, "Body:", body);
await sendMail(
  admin.email,
  subject,
  body,
 language // אם sendMail שלך תומכת בפרמטר שפה – את מעבירה אותו כאן
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

      // await sendMail(
      //   user.email,
      //   `תזכורת: רכבת הארוחות "${date.meal_description}" בעוד ${date.reminder_days} ימים`,
      //   `שלום ${user.name},\n\nהתחייבת ליום ${date.date}.\nהערות: ${date.notes || 'אין'}\n\nבהצלחה!`
      // );
      const language = user.language === 'he' ? 'he' : 'en';

const subject =
  language === 'he'
    ? `תזכורת: רכבת הארוחות "${date.meal_description}" בעוד ${date.reminder_days} ימים`
    : `Reminder: The meal train "${date.meal_description}" is in ${date.reminder_days} days`;

const body =
  language === 'he'
    ? `שלום ${user.name},\n\nהתחייבת ליום ${date.date}.\nהערות: ${date.notes || 'אין'}\n\nבהצלחה!`
    : `Hello ${user.name},\n\nYou committed to ${date.date}.\nNotes: ${date.notes || 'None'}\n\nGood luck!`;

await sendMail(
  user.email,
  subject,
  body,
  language // אם sendMail שלך תומכת בפרמטר שפה – זה יעביר RTL או LTR אוטומטית
);
    }
  }
}

export async function getMealTrainDatesByTrainId(mealTrainId: string): Promise<any[]> {
  const { data, error } = await supabase
    .from('meal_train_dates')
    .select('*') // בוחרים רק את העמודה date
    .eq('meal_train_id', mealTrainId)
    .order('date', { ascending: true });
  if (error) throw error;
  // מחזירים רק את הערכים של התאריכים כמערך פשוט
  return data || [];

}


export async function createMealTrain(mealtrain: Omit<MealTrains, 'id'>): Promise<MealTrains> {
  // const shareToken = uuidv4();

  const snakeCaseMeal = mapKeys(mealtrain, toSnake);
  const { data, error } = await supabase
    .from('meal_trains')
    .insert([snakeCaseMeal])
    .select()
    .single();

  if (error) {
    throw new Error('Failed to create meal train: ' + error.message);
  }

  const mealTrain = mapKeys<MealTrains>(
    data,
    toCamel as unknown as Record<string, keyof MealTrains>
  );
  const meal_train_id = mealTrain.id;

  // 2. יוצרים את טווח התאריכים
  const dates: Date[] = generateDateRange(mealtrain.startDate, mealtrain.endDate);

  dates.map(x => {
    const i: Omit<MealTrainDates, 'id'> = {
      date: x,
      volunteerUserId: null,
      volunteerName: "",
      mealDescription: "",
      mealTrainId: meal_train_id,
      notes: "",
      reminderDays: 1,
      createdAt: new Date()
    }
    createMealTrainDate(i)
  })
  return mealTrain;
}

// פונקציית עזר: מייצרת מערך תאריכים בין start ל־end כולל, בפורמט Date
function generateDateRange(start: Date, end: Date): Date[] {
  const result: Date[] = [];
  const current = new Date(start);
  const last = new Date(end);

  while (current <= last) {
    result.push(new Date(current)); // הוספת עותק חדש כדי לא לשתף את אותו האובייקט
    current.setDate(current.getDate() + 1);
  }

  return result;
}

export async function getMealTrainById(id: string): Promise<MealTrains | null> {
  console.log("getMealTrainById", id);
  const { data: mealtain, error } = await supabase
    .from("meal_trains")
    .select(`
        *,
        meal_train_dates(*)
      `)
    .eq('id', id)
    .single()
  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(error.message);
  }

  if (!mealtain) return null;

  const { data: mealTrainDates, error: datesError } = await supabase
    .from('meal_train_dates')
    .select('*')
    .eq('meal_train_id', mealtain.id);
  if (datesError) {
    throw datesError;
  }
  const startDate = new Date((mealtain as any).start_date);
  const endDate = new Date((mealtain as any).end_date);
  const timeDifference = endDate.getTime() - startDate.getTime();
  const totalDates = Math.ceil(timeDifference / (1000 * 3600 * 24)) + 1; // הוסף 1 כדי לכלול את היום הראשון
  const bookedDates = mealTrainDates.filter(date => date.volunteer_user_id !== null).length;
  const availableDates = totalDates - bookedDates;
  mealtain.progress = {
    total_dates: totalDates,
    booked_dates: bookedDates,
    available_dates: availableDates

  }

  return mapKeys<MealTrains>(mealtain, toCamel as unknown as Record<string, keyof MealTrains>);
}

export async function getMealTrainDate(volunteerUserId: string, mealTrainDateId: string) {
  const { data, error } = await supabase
    .from('meal_train_dates')
    .select(`
      id, 
      date, 
      meal_train_id, 
      meal_description, 
      notes, 
      volunteer_name,
      meal_trains (
        name,
        address,
        start_date,
        end_date,
        dietary_info
      )
    `)
    .eq('volunteer_user_id', volunteerUserId)
    .eq('meal_train_id', mealTrainDateId)
    .single(); // מחזיר אובייקט יחיד במקום מערך

  if (error) {
    console.error('Error fetching specific meal train date:', error);
    return null;
  }

  return mapKeys<MealTrainDates>(data, meal_train_dates as unknown as Record<string, keyof MealTrainDates>);
}
export const getMealTrainWithVolunteers = async (): Promise<number> => {
  const startOfMonth = dayjs().startOf('month').toISOString();
  const endOfMonth = dayjs().endOf('month').toISOString();
  try {
    const { data, count, error } = await supabase
      .from('meal_train_dates')
      .select('id', { count: 'exact' })
      .not('volunteer_user_id', 'is', null)
      .gte('date', startOfMonth)
      .lte('date', endOfMonth);

    if (error) throw new Error(error.message);
    return count || 0;
  } catch (error) {
    console.error('Error fetching meal train with volunteers:', error);
    throw error;
  }
};


export async function sendMailToVolunteers(mealTrainId: string) {
  const { data: mealTrain, error: mealTrainError } = await supabase
    .from('meal_train_dates')
    .select('*')
    .eq('meal_train_id', mealTrainId);

  if (mealTrainError) {
    throw new Error(`Error fetching meal train: ${mealTrainError.message}`);
  }
  if (mealTrain.length !== 0) {
    for (const date of mealTrain) {
      console.log(date);

      const { data: mail, error: mailError } = await supabase
        .from('users')
        .select('email')
        .eq('id', date.volunteer_user_id)
        .single()
      if (mailError) {
        console.error(`Error fetching volunteer email: ${mailError.message}`);

      }
      console.log(date);

      const { data: data, error: dataError } = await supabase
        .from('meal_trains')
        .select('users(name) ,name')
        .eq('id', date.meal_train_id)
        .single()
      if (dataError) {
        throw new Error(`Error fetching volunteer data: ${dataError.message}`);
      }
      if (mail) {
        sendMail((mail as any).email, `תודה על ההתנדבות שלך`,
          `שלום ${date.volunteer_name},

תודה מקרב לב על ההתנדבות המסורה שלך אצל-${data.name}\n. 
העבודה המסורה והמחויבות שלך עושות הבדל משמעותי עבורנו.\n

ההשקעה והנתינה שלך מהווה דוגמה מעוררת השראה למעורבות קהילתית.\n

 בהערכה רבה,
${(data.users as any).name}`);
      }
    }
  }
  
}
export async function getMealTrainDatesByMealTrainId(mealTrainId: string): Promise<MealTrainDates[]> {
  const { data, error } = await supabase
    .from('meal_train_dates')
    .select('*')
    .eq('meal_train_id', mealTrainId);

  if (error) throw new Error(error.message);

  return data.map((row) =>
    mapKeys<MealTrainDates>(row, toCamelMealDates)
  );
}

export async function updateMealTrain(
  id: string,
  updates: Partial<MealTrains>
): Promise<MealTrains> {
  try {
    const mapping = columnMappings.meal_train.toSnake;

    // נבנה אובייקט חדש עם רק הערכים שהתקבלו + המרה ל־snake_case
    const cleanedUpdates: Record<string, any> = {};

    for (const key in updates) {
      const value = updates[key as keyof MealTrains];
      const snakeKey = mapping[key as keyof typeof mapping];
      if (value !== undefined && snakeKey) {
        cleanedUpdates[snakeKey] = value;
      }
    }

    const { data, error } = await supabase
      .from('meal_trains')
      .update(cleanedUpdates)
      .match({ id })
      .select()
      .single();

    if (error) throw error;

    return data as MealTrains;
  } catch (error: any) {
    console.error('❌ Supabase Update Error:', error);
    throw new Error(error.message || 'Unknown error during update');
  }
}


export async function getVolunteerCountByMealTrainId(mealTrainId: string): Promise<{ total: number; count: number }> {
  const { data, error } = await supabase
    .from('meal_train_dates')
    .select('volunteer_user_id')
    .eq('meal_train_id', mealTrainId);
  if (error) throw new Error(error.message);
  const total = data.length;
  const count = data.filter(row => row.volunteer_user_id).length;
  return { total, count };
}

export async function volunteerForDate(mealTrainDateId: string, userId: string, userName: string, note: string, description: string): Promise<MealTrainDates> {
  console.log(`meal_train_id: ${mealTrainDateId} userId: ${userId} userName: ${userName} note: ${note} description: ${description} `)
  const { data, error } = await supabase
    .from('meal_train_dates')
    .update({
      volunteer_user_id: userId,
      // volunteer_id: true,
      volunteer_name: userName,
      notes: note,
      meal_description: description
    })
    .match({ id: mealTrainDateId })
    .select()
    .single();
  if (error) {
    console.error('Supabase error:', error);
    throw new Error(error.message);
  }
  return data;
}

export async function getVolunteerUserIds(mealTrainId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('meal_train_dates')
    .select('volunteer_user_id')
    .eq('meal_train_id', mealTrainId);
  if (error) throw new Error(error.message);
  return (data || []).map(r => r.volunteer_user_id).filter(Boolean);
}
export async function mailByIdVolunteer(userId: string): Promise<string> {
  const { data, error } = await supabase
    .from('meal_train_dates')
    .select('email')
    .eq('id', userId)
    .single();
  if (error) throw new Error(error.message);
  return data.email;
}
export async function updateReminderDays(id: string, days: number): Promise<MealTrainDates> {
  const { data, error } = await supabase
    .from('meal_train_dates')
    .update({ reminder_days: days })
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function volunteerForMeal(mealTrainId: string, mealTrainDateId: string,
  {
    name,
    userId,
  }: { name: string; userId: string }
): Promise<MealTrainDates | null> {
  const { data, error } = await supabase
    .from('meal_train_dates')
    .update({
      volunteer_user_id: userId,
      volunteer_name: name,
    })
    .eq('id', mealTrainDateId)
    .eq('meal_train_id', mealTrainId)
    .select()
    .single();

  if (error) throw new Error(error.message);

  return data;
}
export async function getVolunteerEmails(mealTrainId: string): Promise<string[]> {
  const volunteerIds = await getVolunteerUserIds(mealTrainId);
  const { data: users, error } = await supabase
    .from('meal_trains')
    .select('email')
    .in('id', volunteerIds);
  if (error) throw new Error(error.message);
  return users.map(user => user.email);
}
export async function loadMealTrainById(id: string): Promise<MealTrains> {
  const { data, error } = await supabase
    .from('meal_trains')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw new Error(error.message);
  return mapKeys<MealTrains>(data, toCamel as unknown as Record<string, keyof MealTrains>);
}