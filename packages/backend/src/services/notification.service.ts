import { supabase } from './database.service';
import { UpdateNotificationPreferencesDto } from '@eventix/shared';
const tableName = 'notification_preferences';
export const updatePreferences = async (
  userId: string,
  preferences: UpdateNotificationPreferencesDto
) => {
  const { data, error } = await supabase
    .from(tableName)
    .upsert(
      {
        user_id: userId,
        ...preferences,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' } // ← חשוב כדי לעדכן לפי user_id אם כבר קיים
    )
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const getPreferencesByUserId = async (userId: string) => {
  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};
