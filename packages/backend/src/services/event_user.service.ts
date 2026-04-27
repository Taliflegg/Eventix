//event_user.service.ts
import { columnMappings, mapKeys } from './column.mapper';
import { supabase } from './database.service';
import { UserEvent } from '@eventix/shared';

// טבלת האירועים
const tableName = 'user_events';

const { toCamel, toSnake } = columnMappings.user_events;
export class UserEventService {
  static getUserEventByUserId: any;
  public async getAllUser_Events(): Promise<UserEvent[]> {
    const { data, error } = await supabase
      .from(tableName)
      .select('*');

    if (error) {
      throw new Error(error.message);
    }

    if (!data) return [];

    return data.map(row => mapKeys<UserEvent>(row, toCamel));
  }

  public async getUserEventByUserId(id: string): Promise<UserEvent[] | []> {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .eq('user_id', id);

    if (error) {
      if (error.code === 'PGRST116') return [];
      throw new Error(error.message);
    }

    if (!data) return [];

    return data.map((row: UserEvent) => mapKeys<UserEvent>(row, toCamel));
  }

  public async createUserEvent(user_event: Omit<UserEvent, 'id'>): Promise<UserEvent> {
    const snakeCaseEvent = mapKeys(user_event, toSnake);
    const { data, error } = await supabase
      .from(tableName)
      .insert([snakeCaseEvent])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) throw new Error('Failed to create event');

    return mapKeys<UserEvent>(data, toCamel);
  }
 
async removeUserFromEvents(userId: string, eventId: string): Promise<void> {
  console.log(`Removing user ${userId} from event ${eventId}`);
  const { data, error } = await supabase
    .from('user_events')
    .delete()
    .eq('user_id', userId)
    .eq('event_id', eventId)
    .select(); // ← מחזיר את השורות שנמחקו
  if (error) {
    throw new Error(error.message);
  }
  if (!data || data.length === 0) {
    throw new Error("No matching user or event found to delete.");
  }

  
  console.log('Deleted:', data);
}




  public async getEventById(eventId: string): Promise<UserEvent | null> {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .eq('id', eventId)
      .single();
    if (error) {
      throw new Error(error.message);
    }
    return data ? mapKeys<UserEvent>(data, toCamel) : null;
  }
  public async checkIfUserIsAdmin(userId: string, eventId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('user_events')
      .select('*')
      .eq('user_id', userId)
      .eq('event_id', eventId)
      .maybeSingle(); // ← שינוי פה בלבד
    if (error) {
      console.log(error);
      throw new Error(error.message);
    }
    return data ? data.role === 'admin' : false;
  }
}