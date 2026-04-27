import { columnMappings, mapKeys } from './column.mapper';
import { supabase } from './database.service';

const tableName = 'user_activity';
const { toCamel, toSnake } = columnMappings.userActivity;

export async function addUserActivity(appName: string, userId: string | undefined): Promise<any> {
  const activityData = mapKeys(
    { app_name: appName, user_id: userId },
    toSnake
  );
  const { data, error } = await supabase
    .from(tableName)
    .insert([activityData])
    .select()
    .single();
  if (error) throw new Error(`Error inserting data: ${error.message}`);
  if (!data) throw new Error('Failed to create user activity');
  // return data; // מחזירים את הנתונים שהוזנו
  return true;
};

export async function getMonthlyActiveUsersByApp(): Promise<any> {
  const currentDate = new Date();
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString();
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString();

  const { data, error } = await supabase
    .from(tableName)
    .select('app_name, user_id, activity_date')
    .gte('activity_date', startOfMonth)
    .lte('activity_date', endOfMonth);

  if (error) {
    console.error('Supabase error:', error);
    throw new Error(error.message);
  }
  if (!data) throw new Error('No data found');

  const activeUsersByApp: { [appName: string]: Set<string> } = {};

  data.forEach((row) => {
    if (!activeUsersByApp[row.app_name]) {
      activeUsersByApp[row.app_name] = new Set();
    }
    activeUsersByApp[row.app_name].add(row.user_id);
  });

  const result = Object.keys(activeUsersByApp).reduce((acc: { [key: string]: number }, appName) => {
    acc[appName] = activeUsersByApp[appName].size;
    return acc;
  }, {});

  return result;
}

// ✅ פונקציה חדשה – שליפת משתמשים פעילים לפי חודש ואפליקציה בשנה האחרונה
export async function getUserAcquisitionAnalytics(): Promise<any[]> {
  const today = new Date();
  const oneYearAgo = new Date(today);
  oneYearAgo.setFullYear(today.getFullYear() - 1);
  const from = oneYearAgo.toISOString(); // ✅ הגדרה של from
  const to = today.toISOString();        // ✅ הגדרה של to

  // ✅ הדפסות למעקב
  console.log('📆 From:', from);
  console.log('📆 To:', to);
  const { data, error } = await supabase
    .from(tableName)
    .select('user_id, app_name, activity_date')
    .gte('activity_date', from) // כולל שעה
    .lte('activity_date', to);


  console.log('🔎 Fetched data from Supabase:', data);

  if (error) throw new Error(`Error fetching user activity: ${error.message}`);
  if (!data) throw new Error('No data returned from Supabase');

  const grouped: { [month: string]: { [appName: string]: Set<string> } } = {};

  data.forEach((row) => {
    const date = new Date(row.activity_date);
    const month = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    const app = row.app_name;

    if (!grouped[month]) grouped[month] = {};
    if (!grouped[month][app]) grouped[month][app] = new Set();

    grouped[month][app].add(row.user_id);
  });

  const result: { month: string; app_name: string; active_users: number }[] = [];

  for (const month in grouped) {
    for (const app in grouped[month]) {
      result.push({
        month,
        app_name: app,
        active_users: grouped[month][app].size,
      });
    }
  }
  console.log('📊 Final result:', result);
  return result;
}
export async function getOverallMonthlyActiveUsers(year: number, month: number): Promise<number> {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 1);
  console.log(`Calculating overall active users for: ${startDate.toISOString()} to ${endDate.toISOString()}`);
  try {
    const { data, error } = await supabase
      .from(tableName) // שונה מ-this.userActivityTableName
      .select('user_id')
      .gte('activity_date', startDate.toISOString())
      .lt('activity_date', endDate.toISOString());
    if (error) {
      console.error('Error fetching overall user activity from Supabase:', error);
      throw new Error(`Failed to fetch overall user activity: ${error.message}`);
    }
    const uniqueUserIds = new Set<string>();
    if (data) {
      data.forEach((row: { user_id: string }) => {
        uniqueUserIds.add(row.user_id);
      });
    }
    console.log('Start date:', startDate.toISOString());
    console.log('End date:', endDate.toISOString());
    const activeUsersCount = uniqueUserIds.size;
    console.log(`Found ${activeUsersCount} overall distinct active users for ${month}/${year}.`);
    return activeUsersCount;
  } catch (error) {
    console.error('An unexpected error occurred in getOverallMonthlyActiveUsers:', error);
    throw error;
  }
}
export async function getCrossPlatformAdoptionRate(): Promise<any> {
  // שליפת כל המשתמשים והאפליקציות
  const { data, error } = await supabase
    .from(tableName)
    .select('user_id, app_name');

  if (error) throw new Error(`Error fetching user activity: ${error.message}`);
  if (!data) throw new Error('No data returned from Supabase');

  const userAppCount: { [key: string]: Set<string> } = {};
  
  data.forEach((row) => {
    if (!userAppCount[row.user_id]) {
      userAppCount[row.user_id] = new Set();
    }
    userAppCount[row.user_id].add(row.app_name);
  });

  const totalUsers = Object.keys(userAppCount).length;
  const multiAppUsers = Object.values(userAppCount).filter(apps => apps.size >= 2).length;

  const adoptionRate = totalUsers > 0 ? Number(((multiAppUsers / totalUsers) * 100).toFixed(0)) : 0;

  return {
    adoptionRate
  };
}

