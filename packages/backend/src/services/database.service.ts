///database.service.ts
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config(); // טוען את הקובץ .env

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase configuration.');
}

// יצירת קליינט רגיל
export const supabase = createClient(supabaseUrl, supabaseKey);

// פונקציה ליצירת קליינט עם טוקן גישה
export const createSupabaseClientWithToken = (accessToken: string) => {
  return createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
};

