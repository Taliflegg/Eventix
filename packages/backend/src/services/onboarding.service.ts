import { supabase } from './database.service';

type HomeLocation = {
  name: string;
  address: string;
};

export const createAccountAndLinkToUser = async (
  userId: string,
  accountName: string,
  email: string
): Promise<{ accountId: string }> => {
  // שלב 1: בדיקת המשתמש
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('account_id, email')
    .eq('id', userId)
    .single();
  if (userError || !user) throw new Error('Failed to fetch user');
  if (user.account_id) {
    return { accountId: user.account_id };
  }
  // ודא שהאימייל תואם (אם אתה רוצה לבדוק גם אימייל)
  if (user.email !== email) {
    throw new Error('Email does not match user');
  }
  // שלב 2: יצירת חשבון חדש
  const { data: account, error: accountError } = await supabase
    .from('accounts')
    .insert([{ name: accountName }])
    .select()
    .single();
  if (accountError || !account) {
    throw new Error('Failed to create account');
  }
  // שלב 3: עדכון המשתמש עם account_id
  const { error: updateError } = await supabase
    .from('users')
    .update({ account_id: account.id })
    .eq('id', userId);
  if (updateError) {
    throw new Error('Failed to update user with account_id');
  }
  return { accountId: account.id };
};
//פונקציה להוספת מיקום לחשבון
export const addLocationForAccount = async (
  accountId: string,
  homeLocation: HomeLocation,
  locationType: 'home' | 'parents' | 'inlaws' | 'friends' | 'other'
): Promise<{ locationId: string }> => {
  if (!accountId) {
    console.error('accountId is missing!');
    throw new Error('Cannot insert location without valid accountId');
  }

  const { data: location, error } = await supabase
    .from('locations')
    .insert([{
      account_id: accountId,
      name: homeLocation.name,
      address: homeLocation.address,
      location_type: locationType
    }])
    .select()
    .single();
  if (error || !location) {
    console.error('Insert error:', error);
    console.error('Returned location is:', location);
    throw new Error('Failed to insert location');
  }
  return { locationId: location.id };
};