import { MealTrainDates } from "@eventix/shared/src";
import { columnMappings, mapKeys } from "./column.mapper";
import { supabase } from "./database.service";

const { toCamel, toSnake } = columnMappings.meal_trains_date;


export async function createMealTrainDate(mealtrainDate: Omit<MealTrainDates, 'id'>): Promise<MealTrainDates> {


  const snakeCaseMealDate = mapKeys(mealtrainDate, toSnake);
  const { data, error } = await supabase
    .from('meal_train_dates')
    .insert([snakeCaseMealDate])
    .select()
    .single();

  if (error) {
    throw new Error('Failed to create meal train: ' + error.message);
  }
   const mealTrainDate = mapKeys<MealTrainDates>(
      data,
      toCamel as unknown as Record<string, keyof MealTrainDates>
    );
    return mealTrainDate;
}