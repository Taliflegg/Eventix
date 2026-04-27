import { supabase } from './database.service';
import{DietaryRestriction} from '@eventix/shared';
const tableName = 'dietary_restriction';

/**
 * Fetches all dietary restriction names from the database.
 * Used to provide options for user registration.
 */
export async function getAllDietaryRestrictions(): Promise<{ id: string; name: string }[]> {
  const { data, error } = await supabase
    .from(tableName)
    .select('id, name'); 

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}


/**
 * Links a new user to each selected dietary restriction.
 * Used during user registration to associate restrictions with the user.
 */
export async function saveUserDietaryRestrictions(
  userId: string,
  dietaryNames: string[]
) {
  for (const name of dietaryNames) {
    const { data: restriction, error: findError } = await supabase
      .from('dietary_restriction')
      .select('id')
      .eq('name', name)
      .single();

    if (findError) {
      console.error('Error finding restriction:', findError.message);
      continue;
    }

    if (!restriction?.id) {
      console.error('Restriction not found for name:', name);
      continue;
    }

    const { error: insertError } = await supabase.from('user_dietary_restriction').insert({
      user_id: userId,
      dietary_restrictionId: restriction.id,
    });

    if (insertError) {
      console.error('Error inserting user_dietary_restriction:', insertError.message);
    } else {
      console.log('Inserted dietary restriction', name, 'for user', userId);
    }
  }
}


export async function createDietaryRestriction(restriction: Omit<DietaryRestriction, 'id'>): Promise<DietaryRestriction> {
  const { data, error } = await supabase
  .from('Dietary_restriction')
  .insert([restriction])
  .select()
  .single();
  console.log('Created DietaryRestriction', data);
  
  if (error) throw new Error(error.message);
  return data as DietaryRestriction;
}
export async function updateDietaryRestrictionByName(oldName: string, newName: string): Promise<DietaryRestriction> {
  // שלב 1: מציאת ה-id לפי השם הישן
  const { data: restriction, error: findError } = await supabase
    .from('dietary_restriction')
    .select('id')
    .eq('name', oldName)
    .single();

  if (findError || !restriction?.id) {
    throw new Error('לא נמצאה מגבלה בשם הזה');
  }

  // שלב 2: עדכון לפי ה-id שמצאנו
  const { data, error } = await supabase
    .from('dietary_restriction')
    .update({ name: newName })
    .eq('id', restriction.id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as DietaryRestriction;
}

export async function deleteDietaryRestrictionByName(name: string): Promise<void> {
  // שלב 1: מציאת ה-id לפי השם
  const { data: restriction, error: findError } = await supabase
    .from('dietary_restriction')
    .select('id')
    .eq('name', name)
    .single();

  if (findError || !restriction?.id) {
    throw new Error('לא נמצאה מגבלה בשם הזה');
  }

  // שלב 2: מחיקה לפי ה-id שמצאנו
  const { error } = await supabase
    .from('dietary_restriction')
    .delete()
    .eq('id', restriction.id);

  if (error) throw new Error(error.message);
}

export async function getAllDietaryRestrictionNames(): Promise<{ id: string; name: string }[]> {
  const { data, error } = await supabase
    .from(tableName)
    .select('id, name'); 

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}
