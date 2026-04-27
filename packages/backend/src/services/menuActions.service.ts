import { MenuAction, MenuActionData, User, AssignedMenuItem, MenuItem } from "@eventix/shared";
import { columnMappings, mapKeys } from './column.mapper';
import { broadcastMessage } from './socket.service';
import { createSupabaseClientWithToken, supabase } from './database.service';
import { getEventById } from "./events.service";
import createHttpError from 'http-errors';
import { data } from "react-router";
import { log } from "console";

export const addMenuAction = async (menuAction: any, accessToken: string) => {
  const supabase = createSupabaseClientWithToken(accessToken);
  const { data, error } = await supabase
    .from('menuaction')
    .insert(menuAction)
    .select();
  return { data, error };
};

//הוספת קטגוריה
//רק מנהל
export async function addCategory(cat: MenuAction, user: User) {
  try {
    const eventId = cat.eventId;
    //שליפת הארוע מהטבלה
    const { data: events, error: eventError } = await supabase.from('events').select('*').eq('id', eventId);
    if (eventError) return { status: 404, body: { success: false, error: `שגיאה בשליפת האירוע: ${eventError.message}` } };
    if (!events || events.length === 0) return { status: 404, body: { success: false, error: `אירוע לא נמצא` } };
    const event = events[0];
    //בדיקת הרשאה לפי מי שיצר את הארוע או לפי מנהל כללי
    if (cat.userId !== event.created_by || user?.role == 'administrator')
      return { status: 401, body: { success: false, error: `אינך רשאי לבצע פעולה זו` } };
    //הוספה לטבלת menuAction
    const toInsert = flattenMenuAction3ForCategory(cat);
    const { data, error } = await supabase.from("menuaction").insert([toInsert]).select();
    if (error) return { status: 404, body: { success: false, error: `שגיאה בהוספת הקטגוריה: ${error.message}` } };
    console.log("הקטגוריה נוספה בהצלחה:", data);
    //שליחת הודעה ל webSocket
    broadcastMessage({
      type: 'category',
      action: 'add',
      payload: {
        itemId: data[0].id,
        name: cat.actionData.name,
        position: cat.actionData.position
      }
    });

    return {
      status: 200,
      body: {
        success: true,
        data: data[0],
      }
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "שגיאה לא מזוהה";
    console.error(errorMessage);
    return { status: 500, body: { success: false, error: errorMessage } };
  }
}

//עדכון קטגוריה
//רק למנהל
export async function updateCategory(cat: MenuAction, user: User) {
  try {
    const eventId = cat.eventId;
    //שליפת הארוע מהטבלה
    const { data: events, error: eventError } = await supabase.from('events').select('*').eq('id', eventId);
    if (eventError) return { status: 404, body: { success: false, error: `שגיאה בשליפת האירוע: ${eventError.message}` } };
    if (!events || events.length === 0) return { status: 404, body: { success: false, error: `אירוע לא נמצא` } };
    const event = events[0];
    //בדיקת הרשאה לפי מי שיצר את הארוע או לפי מנהל כללי
    if (cat.userId !== event.created_by || user?.role == 'administrator')
      return { status: 404, body: { success: false, error: `אינך רשאי לבצע פעולה זו` } };
    //הוספה לטבלת menuAction
    const toInsert = flattenMenuAction(cat);
    const { data, error } = await supabase.from("menuaction").insert([toInsert]);
    if (error) return { status: 404, body: { success: false, error: `שגיאה בהשלמת פעולה: ${error.message}` } };
    console.log("הקטגוריה עודכנה בהצלחה:", data);
    //שליחת הודעה ל webSocket
    broadcastMessage({
      type: 'category',
      action: 'update',
      payload: {
        itemId: cat.actionData.itemId,
        name: cat.actionData.name
      }
    });
    return { status: 200, body: { success: true, data: "הקטגוריה עודכנה בהצלחה" } };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "שגיאה לא מזוהה";
    console.error(errorMessage);
    return { status: 500, body: { success: false, error: errorMessage } };
  }
}

//מחיקת קטגוריה
//רק למנהל
export async function removeCategory(cat: MenuAction, user: User) {
  try {
    const eventId = cat.eventId;
    //שליפת הארוע מהטבלה
    const { data: events, error: eventError } = await supabase.from('events').select('*').eq('id', eventId);
    if (eventError) return { status: 404, body: { success: false, error: `שגיאה בשליפת האירוע: ${eventError.message}` } };
    if (!events || events.length === 0) return { status: 404, body: { success: false, error: `אירוע לא נמצא` } };
    const event = events[0];
    //בדיקת הרשאת גישה לפי מי שיצר את הארוע או לפי מנהל כללי
    if (cat.userId !== event.created_by || user?.role == 'administrator')
      return { status: 404, body: { success: false, error: `אינך רשאי לבצע פעולה זו` } };
    //הכנסה לטבלת menuAction
    const toInsert = flattenMenuAction(cat);
    const { data, error } = await supabase.from("menuaction").insert([toInsert]);
    if (error) return { status: 404, body: { success: false, error: `שגיאה בהשלמת פעולה: ${error.message}` } };
    console.log("הקטגוריה הוסרה בהצלחה:", data);
    //שליחת הודעה ל webSocket
    broadcastMessage({
      type: 'category',
      action: 'delete',
      payload: {
        itemId: cat.actionData.itemId
      }
    });
    return { status: 200, body: { success: true, data: "הקטגוריה הוסרה בהצלחה" } };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "שגיאה לא מזוהה";
    console.error(errorMessage);
    return { status: 500, body: { success: false, error: errorMessage } };
  }
}

//הוספת מנה
//לכל המשתמשים
export async function addDish(dish: MenuAction, user: any) {
  console.log("מנסה להוסיף את הפעולה ל־Supabase:", dish);
  const eventId = dish.eventId;
  //בדיקת הרשאות גישה
  const isAdmin = await isParticipant(dish.userId, eventId);
    if (user?.role != 'administrator' && isAdmin.body.error)
    return { status: 401, body: { success: false, error: `אינך משתתף בארוע` } };
  //הוספה לטבלת menuAction
  const toInsert = flattenMenuAction2ForDish(dish);
  const { data, error } = await supabase.from("menuaction").insert([toInsert]).select();
  if (error) {
    console.error(" שגיאה בהוספת המנה:", error);
    return { status: 404, body: { success: false, error: `שגיאה בהוספת מנה ${error.message}` } };
  } else {
    console.log(" המנה נוספה בהצלחה:", data);
    broadcastMessage({
      type: 'dish',
      action: 'add',
      payload: {
        itemId: data[0].id,
        name: dish.actionData.name,
        categoryId: dish.actionData.categoryId,
        notes: dish.actionData.notes,
        tags: dish.actionData.tags,
        position: dish.actionData.position,
        assignedUser: {
          id: dish.userId,
          name: dish.userId
        }
      }

    });

    return {
      status: 200,
      body: {
        success: true,
        data: data[0],
      }
    };

  }
}

//עדכון מנה
//רק למנהל
export async function updateDish(dish: MenuAction, user: any) {
  try {
    const eventId = dish.eventId;
    console.log('item', dish.actionData.itemId);
    //בדיקת הרשאות גישה
    const isAdmin = await isParticipant(dish.userId, eventId);
    if (user?.role != 'administrator' && isAdmin.body.error)
      return { status: 401, body: { success: false, error: `אינך משתתף בארוע` } };
    //שליפת המנה מהטבלה
    const { data: events, error: eventError } = await supabase.from('events').select('*').eq('id', eventId);
    if (eventError) return { status: 404, body: { success: false, error: `שגיאה בשליפת האירוע: ${eventError.message}` } };
    if (!events || events.length === 0) return { status: 404, body: { success: false, error: `אירוע לא נמצא` } };
    const event = events[0];
    //בדיקת הרשאה לפי מי שיצר את הארוע או לפי מנהל כללי
    if (dish.userId !== event.created_by || user?.role == 'administrator')
      return { status: 404, body: { success: false, error: `אינך רשאי לבצע פעולה זו` } };
    //הכנסה לטבלת menuAction
    const toInsert = flattenMenuAction(dish);
    const { data, error } = await supabase.from("menuaction").insert([toInsert]);
    if (error) return { status: 404, body: { success: false, error: `שגיאה בהשלמת פעולה: ${error.message}` } };
    console.log("המנה עודכנה בהצלחה:", data);
    //שליחת הודעה ל webSocket
    broadcastMessage({
      type: 'dish',
      action: 'update',
      payload: {
        itemId: dish.actionData.itemId,
        name: dish.actionData.name,
        notes: dish.actionData.notes,
        tags: dish.actionData.tags,
        position: dish.actionData.position
      }
    });
    return { status: 200, body: { success: true, data: "המנה עודכנה בהצלחה" } };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "שגיאה לא מזוהה";
    console.error(errorMessage);
    return { status: 500, body: { success: false, error: errorMessage } };
  }
}

//הסרת מנה
//רק למנהל
export async function removeDish(dish: MenuAction, user: any) {
  try {
    const eventId = dish.eventId;
    //בדיקת הרשאות גישה
    const isAdmin = await isParticipant(dish.userId, eventId);
    if (user?.role != 'administrator' && isAdmin.body.error)
      return { status: 401, body: { success: false, error: `אינך משתתף בארוע` } };
    //שליפת המנה מהטבלה
    const { data: events, error: eventError } = await supabase.from('events').select('*').eq('id', eventId);
    if (eventError) return { status: 404, body: { success: false, error: `שגיאה בשליפת האירוע: ${eventError.message}` } };
    if (!events || events.length === 0) return { status: 404, body: { success: false, error: `אירוע לא נמצא` } };
    const event = events[0];
    //בדיקת הרשאת גישה לפי מי שיצר את הארוע או לפי מנהל כללי
    if (dish.userId !== event.created_by || user?.role == 'administrator')
      return { status: 404, body: { success: false, error: `איך רשאי לבצע פעולה זו` } };
    //הוספה לטבלת menuAction
    const toInsert = flattenMenuAction(dish);
    const { data, error } = await supabase.from("menuaction").insert([toInsert]);
    if (error) return { status: 404, body: { success: false, error: `שגיאה בהשלמת פעולה: ${error.message}` } };
    console.log("הפעולה הושלימה בהצלחה:", data);
    //שליחת הודעה ל webSocket
    broadcastMessage({
      type: 'dish',
      action: 'delete',
      payload: {
        itemId: dish.actionData.itemId
      }
    });
    return { status: 200, body: { success: true, data: "המנה הוסרה בהצלחה" } };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "שגיאה לא מזוהה";
    console.error(errorMessage);
    return { status: 500, body: { success: false, error: errorMessage } };
  }
}

//בחירת מנה זמינה
//כל המשתמשים בתנאי שהיא זמינה
export async function assignDish(dish: MenuAction, user: any) {
  try {
    const dishId = dish.actionData.itemId;
    const eventId = dish.eventId;
    //בדיקת הרשאות גישה
    const isAdmin = await isParticipant(dish.userId, eventId);
    if (user?.role != 'administrator' && isAdmin.body.error)
      return { status: 401, body: { success: false, error: `אינך משתתף בארוע` } };
    //שליפת המנה מהטבלה
    if (!dishId) return { status: 404, body: { success: false, error: `לא סופק מזהה מנה` } };
    const { data: dishes, error: dishError } = await supabase.from('menuaction').select('*').eq('itemid', dishId);
    if (dishError) return { status: 404, body: { success: false, error: `שגיאה בשליפת המנה: ${dishError.message}` } };
    if (!dishes || dishes.length === 0) return { status: 404, body: { success: false, error: `המנה לא נמצאה` } };
    const lastDish = dishes[0];
    //בדיקה שהמנה באמת זמינה
    if (lastDish.assignedTo !== undefined)
      return { status: 404, body: { success: false, error: `מנה זו כבר משוייכת לאדם אחר` } };
    //שיוך המנה והוספה לטבלת MenuAction
    dish.actionData.assignedTo = dish.userId;
    const toInsert = flattenMenuAction(dish);
    const { data, error } = await supabase.from("menuaction").insert([toInsert]);
    if (error) return { status: 404, body: { success: false, error: `שגיאה במימוש פעולה: ${error.message}` } };
    console.log("הפעולה הושלמה בהצלחה:", data);
    //שליחת הודעה ל webSocket
    broadcastMessage({
      type: 'dish',
      action: 'assign',
      payload: {
        itemId: dish.actionData.itemId,
        assignedUser: {
          id: dish.userId,
          name: dish.userId
        }
      }
    });
    return { status: 200, body: { success: true, data: "הפעולה הושלמה בהצלחה" } };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "שגיאה לא מזוהה";
    console.error(errorMessage);
    return { status: 500, body: { success: false, error: errorMessage } };
  }
}

//הסרת הבאת מנה
//מי שלקח את המנה על עצמו
export async function unassignDish(dish: MenuAction, user: any) {
  try {
    const dishId = dish.actionData.itemId;
    const eventId = dish.eventId;
    //בדיקת הרשאות גישה
    const isAdmin = await isParticipant(dish.userId, eventId);
    if (user?.role != 'administrator' && isAdmin.body.error)
      return { status: 401, body: { success: false, error: `אינך משתתף בארוע` } };
    //Aליפת המנה מהטבלה
    const { data: dishes, error: dishError } = await supabase.from('menuaction').select('*').eq('itemid', dishId);
    if (dishError) return { status: 404, body: { success: false, error: `שגיאה בשליפת המנה: ${dishError.message}` } };
    if (!dishes || dishes.length === 0) return { status: 404, body: { success: false, error: `המנה לא נמצאה` } };
    const lastDish = dishes[0];
    //בדיקה שהמנה באמת משוייכת לאותו משתמש
    if (lastDish.assignedTo !== undefined)
      return { status: 404, body: { success: false, error: `מנה זו כבר משוייכת לאדם אחר` } };
    //הסרת הבאת המנה מהטבלה
    const toInsert = flattenMenuAction(dish);
    const { data, error } = await supabase.from("menuaction").insert([toInsert]);
    if (error) return { status: 404, body: { success: false, error: `שגיאה במימוש פעולה: ${error.message}` } };
    console.log("הפעולה הושלמה בהצלחה:", data);
    //שליחת הודעה ל webSocket
    broadcastMessage({
      type: 'dish',
      action: 'unassign',
      payload: {
        itemId: dish.actionData.itemId
      }
    });
    return { status: 200, body: { success: true, data: "הפעולה הושלמה בהצלחה" } };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "שגיאה לא מזוהה";
    console.error(errorMessage);
    return { status: 500, body: { success: false, error: errorMessage } };
  }
}

//הזזת סדר כרונולוגי של מנה או קטגוריה
//רק המנהל
export async function moveItem(act: MenuAction, user: any) {
  try {
    const eventId = act.eventId;
    //בדיקת הרשאות גישה
    const isAdmin = await isParticipant(act.userId, eventId);
    if (user?.role != 'administrator' && isAdmin.body.error)
      return { status: 401, body: { success: false, error: `אינך משתתף בארוע` } };
    //שליפת הארוע מהטבלה
    const { data: events, error: eventError } = await supabase.from('events').select('*').eq('id', eventId);
    if (eventError) return { status: 404, body: { success: false, error: `שגיאה בשליפת האירוע: ${eventError.message}` } };
    if (!events || events.length === 0) return { status: 404, body: { success: false, error: `אירוע לא נמצא` } };
    const event = events[0];
    //בדיקת הרשאת גישה לפי מי שיצר את הארוע או לפי מנהל כללי
    if (act.userId !== event.created_by || user?.role == 'administrator')
      return { status: 404, body: { success: false, error: `אינך רשאי לבצע פעולה זו` } };
    //הכנסה לטבלת menuAction
    const toInsert = flattenMenuAction(act);
    const { data, error } = await supabase.from("menuaction").insert([toInsert]);
    if (error) return { status: 404, body: { success: false, error: `שגיאה במימוש פעולה: ${error.message}` } };
    console.log("הפעולה הושלמה בהצלחה:", data);
    //שליחת הודעה ל webSocket
    broadcastMessage({
      type: act.actionData.isCategory ? 'category' : 'dish',
      action: 'move',
      payload: {
        itemId: act.actionData.itemId,
        categoryId: act.actionData.categoryId,
        position: act.actionData.position,
        newPosition: act.actionData.newPosition
      }
    });
    return { status: 200, body: { success: true, data: "הפעולה הושלמה בהצלחה" } };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "שגיאה לא מזוהה";
    console.error(errorMessage);
    return { status: 500, body: { success: false, error: errorMessage } };
  }
}

//ביטול הפעולה האחרונה
//כל המשתמשים
export async function undoAction(act: MenuAction, user: User) {
  const toInsert = act.actionData.isCategory
    ? flattenMenuAction3ForCategory(act)
    : flattenMenuAction2ForDish(act);
  const { data, error } = await supabase.from("menuaction").insert([toInsert]);
  if (error) {
    console.error(" שגיאה בביטול הפעולה:", error);
    //שליחת הודעה ל webSocket
    broadcastMessage({
      type: act.actionData.isCategory ? "category" : "dish",
      action: "undo",
      payload: {
        itemId: act.actionData.itemId,
        name: act.actionData.name
      }
    });
    return { status: 404, body: { success: false, error: `שגיאה בביטול הפעולה ${error.message}` } };
  } else {
    console.log(" הפעולה בוטלה בהצלחה:", data);
    //שליחת הודעה ל webSocket
    broadcastMessage({
      type: act.actionData.isCategory ? "category" : "dish",
      action: "undo",
      payload: {
        itemId: act.actionData.itemId,
        previousState: {
          notes: act.actionData.notes,
          tags: act.actionData.tags,
          categoryId: act.actionData.categoryId,
          position: act.actionData.position
        }
      }
    });
    return { status: 200, body: { success: true, data } };
  }
}

//פונקציה להחזרת אוביקט שטוח מסוג menuAction
export function flattenMenuAction(action: MenuAction) {
  const data: MenuActionData = action.actionData;
  return {
    eventid: action.eventId,
    userid: action.userId,
    actiontype: action.actionType,
    timestamp: action.timestamp,
    itemid: action.actionType == 'add_category' || action.actionType == 'add_dish' ? null : data.itemId,
    name: data.name,
    notes: data.notes,
    tags: data.tags,
    assignedto: data.assignedTo,
    categoryid: action.actionType == 'add_category' ? null : data.categoryId,
    position: data.position,
    newposition: data.newPosition,
    iscategory: data.isCategory
  };
}

//פונקציה להחזרת אובייקט שטוח למנה מסוג menuAction
export function flattenMenuAction2ForDish(action: MenuAction) {
  const data: MenuActionData = action.actionData;
  return {
    eventid: action.eventId,
    userid: action.userId,
    actiontype: action.actionType,
    timestamp: action.timestamp,
    name: data.name,
    notes: data.notes,
    tags: data.tags,
    assignedto: data.assignedTo,
    categoryid: data.categoryId,
    position: data.position,
    newposition: data.newPosition,
    iscategory: data.isCategory
  };
}

//פונקציה להחזרת אובייקט שטוח לקטגוריה מסג menuAction
export function flattenMenuAction3ForCategory(action: MenuAction) {
  const data: MenuActionData = action.actionData;
  return {
    eventid: action.eventId,
    userid: action.userId,
    actiontype: action.actionType,
    timestamp: action.timestamp,
    name: data.name,
    notes: data.notes,
    tags: data.tags,
    assignedto: data.assignedTo,
    position: data.position,
    newposition: data.newPosition,
    iscategory: data.isCategory
  };
}

export async function isParticipant(participantId: string, eventId: string) {
  // שליפת רשומות עבור המשתמש הספציפי
  const { data: records, error } = await supabase
    .from('user_events')
    .select('*')
    .eq('user_id', participantId)
    .eq('event_id', eventId); // מסנן גם לפי האירוע
  // טיפול בשגיאה טכנית
  if (error) {
    return {
      status: 500,
      body: {
        success: false,
        error: `שגיאה בשליפת נתונים: ${error.message}`
      }
    };
  }

  // אם לא נמצאה התאמה – המשתמש לא משתתף באירוע
  if (!records || records.length === 0) {
    return {
      status: 401,
      body: {
        success: false,
        isParticipant: false,
        error: "אינך משתתף בארוע"
      }
    };
  }

  // נמצאה התאמה – המשתמש משתתף באירוע
  return {
    status: 200,
    body: {
      success: true,
      isParticipant: true,
      details: records[0] // ניתן להחזיר מידע נוסף אם נדרש
    }
  };
}

export async function getMenuActionsById(id: string): Promise<MenuAction[] | null> {
  const { data, error } = await supabase
    .from('menuaction')
    .select('*')
    .eq('eventid', id);
  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(error.message);
  }
  if (!data) return null;
  const dataCamel = data.map(item => ({
    ...mapKeys(
      {
        id: item.id,
        eventid: item.eventid,
        userid: item.userid,
        actiontype: item.actiontype,
        timestamp: item.timestamp,
      },
      toCamel
    ),
    actionData: mapKeys(
      {
        itemid: item.itemid,
        name: item.name,
        notes: item.notes,
        tags: item.tags,
        assignedto: item.assignedto,
        categoryid: item.categoryid,
        position: item.position,
        newposition: item.newposition,
        iscategory: item.iscategory,
      },
      toCamelData
    ),
  }));
  return filterUndoneActions(dataCamel);

}

const tableName = 'menuaction';
const { toCamel, toSnake } = columnMappings.menuActions;
const { toCamel: toCamelData, toSnake: toSnakeData } = columnMappings.menuActionsData;

export async function getAllMenuActions(): Promise<MenuAction[]> {
  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .order('timestamp', { ascending: true });
  if (error) {
    console.log(error);
    throw new Error(error.message);
  }
  if (!data) return [];
  return data.map(row => {
    const base = mapKeys(
      {
        id: row.id,
        eventid: row.eventid,
        userid: row.userid,
        actiontype: row.actiontype,
        timestamp: row.timestamp,
      },
      toCamel
    );
    const actionData = mapKeys(
      {
        itemid: row.itemid,
        name: row.name,
        notes: row.notes,
        tags: row.tags,
        assignedto: row.assignedto,
        categoryid: row.categoryid,
        position: row.position,
        newposition: row.newposition,
        iscategory: row.iscategory,
      },
      toCamelData
    );
    return {
      ...base,
      actionData,
    };
  });
}

export async function getMenuActionById(id: string): Promise<MenuAction | null> {
  const { data, error } = await supabase
    .from('menuaction')
    .select('*')
    .eq('id', id)
    .single();
  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(error.message);
  }
  if (!data) return null;
  const base = mapKeys(
    {
      id: data.id,
      eventid: data.eventid,
      userid: data.userid,
      actiontype: data.actiontype,
      timestamp: data.timestamp,
    },
    toCamel
  );
  const actionData = mapKeys(
    {
      itemid: data.itemid,
      name: data.name,
      notes: data.notes,
      tags: data.tags,
      assignedto: data.assignedto,
      categoryid: data.categoryid,
      position: data.position,
      newposition: data.newposition,
      iscategory: data.iscategory,
    },
    toCamelData
  );
  return {
    ...base,
    actionData,
  };
}

export async function getMenuActionsByEventID(eventId: string): Promise<MenuAction[]> {
  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .eq('eventid', eventId)
    .order('timestamp', { ascending: true });

  if (error) {
    console.log(error);
    throw new Error(error.message);
  }

  if (!data) return [];

  return data.map(row => {
    const base = mapKeys(
      {
        id: row.id,
        eventid: row.eventid,
        userid: row.userid,
        actiontype: row.actiontype,
        timestamp: row.timestamp,
      },
      toCamel
    );

    const actionData = mapKeys(
      {
        itemid: row.itemid,
        name: row.name,
        notes: row.notes,
        tags: row.tags,
        assignedto: row.assignedto,
        categoryid: row.categoryid,
        position: row.position,
        newposition: row.newposition,
        iscategory: row.iscategory,
      },
      toCamelData
    );
    return {
      ...base,
      actionData,
    };
  });
}

export async function createMenuAction(menuAction: Omit<MenuAction, 'id'>): Promise<MenuAction> {
  const flatMenuAction = {
    eventId: menuAction.eventId,
    userId: menuAction.userId,
    actionType: menuAction.actionType,
    timestamp: menuAction.timestamp,
    ...menuAction.actionData,
  };
  const snakeCaseMenuAction = mapKeys(flatMenuAction, {
    ...columnMappings.menuActions.toSnake,
    ...columnMappings.menuActionsData.toSnake,
  });
  const { data, error } = await supabase
    .from('menuaction')
    .insert([snakeCaseMenuAction])
    .select()
    .single();
  if (error) throw new Error(error.message);
  if (!data) throw new Error('Failed to create menu action');
  const base = mapKeys<MenuAction>(data, columnMappings.menuActions.toCamel);
  const actionData = mapKeys<MenuActionData>(data, columnMappings.menuActionsData.toCamel);
  return {
    ...base,
    timestamp: data.timestamp,
    actionData: {
      ...actionData,
      name: data.name,
      notes: data.notes,
      tags: data.tags,
      position: data.position,
    },
  };
}

// --- פונקציה שמסננת פעולות שבוטלו ע"י undo_action ---
export function filterUndoneActions(actions: MenuAction[]): MenuAction[] {
  if (!actions || actions.length === 0) {
    return [];
  }

  // יצירת מפה של פעולות לביטול לפי משתמש
  const undoActionsByUser = new Map<string, number[]>();

  // איסוף כל פעולות ה-undo_action
  for (let i = 0; i < actions.length; i++) {
    const action = actions[i];
    if (action.actionType === 'undo_action') {
      if (!undoActionsByUser.has(action.userId)) {
        undoActionsByUser.set(action.userId, []);
      }
      undoActionsByUser.get(action.userId)!.push(i);
    }
  }

  // אם אין פעולות undo, החזר את המערך המקורי
  if (undoActionsByUser.size === 0) {
    return actions;
  }

  // יצירת Set של אינדקסים לביטול
  const indicesToRemove = new Set<number>();

  // עבור כל משתמש עם פעולות undo
  for (const [userId, undoIndices] of undoActionsByUser) {
    // מיון האינדקסים בסדר יורד כדי לא לפגוע באינדקסים
    undoIndices.sort((a, b) => b - a);

    for (const undoIndex of undoIndices) {
      // חיפוש הפעולה האחרונה של אותו משתמש לפני ה-undo_action
      for (let i = undoIndex - 1; i >= 0; i--) {
        const action = actions[i];
        if (action.userId === userId && action.actionType !== 'undo_action') {
          indicesToRemove.add(i);
          break;
        }
      }
      // הוספת פעולת ה-undo עצמה לביטול
      indicesToRemove.add(undoIndex);
    }
  }

  // יצירת המערך הסופי ללא הפעולות שבוטלו
  return actions.filter((_, index) => !indicesToRemove.has(index));
}

export async function getProcessedMenuByEventId(eventId: string): Promise<{
  eventName: string;
  eventCreatorID: string;
  assignedMenuItems: AssignedMenuItem[];
}> {
  try {
    // קריאות מקבילות לבסיס הנתונים
    const [event, menuActions] = await Promise.all([
      getEventById(eventId),
      getMenuActionsByEventID(eventId)
    ]);

    if (!event) {
      throw createHttpError(400, 'Invalid event ID – event not found');
    }

    const eventName = event.title;
    const eventCreatorID = event.createdBy;

    // סינון פעולות שבוטלו
    const filteredMenuActions = filterUndoneActions(menuActions);

    if (!filteredMenuActions || filteredMenuActions.length === 0) {
      return { eventName, eventCreatorID, assignedMenuItems: [] };
    }

    // הפרדה לקטגוריות ומנות
    const dishArr: MenuAction[] = [];
    const categoryArr: MenuAction[] = [];

    for (const action of filteredMenuActions) {
      if (action.eventId !== eventId) continue;
      if (action.actionData.isCategory) categoryArr.push(action);
      else dishArr.push(action);
    }

    if (categoryArr.length === 0) {
      return { eventName, eventCreatorID, assignedMenuItems: [] };
    }

    // עיבוד קטגוריות
    const categoryMap = new Map<string, MenuAction>();
    const sortedCategory = [...categoryArr].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    for (const action of sortedCategory) {
      const itemId = action.actionData.itemId?.trim();
      if (!itemId) continue;

      switch (action.actionType) {
        case 'add_category':
        case 'update_category':
          categoryMap.set(itemId, action);
          break;
        case 'remove_category':
          categoryMap.delete(itemId);
          break;
        case 'move_item':
          if (action.actionData.isCategory) {
            // נבנה מערך של כל הקטגוריות הקיימות
            const categoriesArr = Array.from(categoryMap.values())
              .sort((a, b) => (a.actionData.position ?? 0) - (b.actionData.position ?? 0));
            const fromIndex = categoriesArr.findIndex(c => c.actionData.itemId === itemId);
            const toIndex = action.actionData.newPosition ?? 0;
            if (fromIndex !== -1 && toIndex >= 0 && toIndex < categoriesArr.length) {
              // נוציא את הקטגוריה מהמיקום הישן
              const [movedCategory] = categoriesArr.splice(fromIndex, 1);
              // נכניס אותה למיקום החדש
              categoriesArr.splice(toIndex, 0, movedCategory);
              // נעדכן את ה-position של כל הקטגוריות
              categoriesArr.forEach((cat, idx) => {
                cat.actionData.position = idx;
                cat.actionData.newPosition = idx;
                categoryMap.set(cat.actionData.itemId!, cat);
              });
            }
            // נעדכן גם את הקטגוריה שזזה
            categoryMap.set(itemId, action);
          }
          break;
      }
    }

    // עיבוד מנות
    const dishMap = new Map<string, MenuAction>();
    const sortedDish = [...dishArr].sort((a, b) =>
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    for (const action of sortedDish) {
      const itemId = action.actionData.itemId?.trim();
      if (!itemId) continue;

      switch (action.actionType) {
        case 'add_dish':
        case 'update_dish':
        case 'assign_dish':
        case 'unassign_dish':
          dishMap.set(itemId, action);
          break;
        case 'remove_dish':
          dishMap.delete(itemId);
          break;
        case 'move_item':
          const categoryId = action.actionData.categoryId;
          if (categoryId) {
            // נבנה מערך של כל המנות בקטגוריה הנוכחית
            const dishesInCategory = Array.from(dishMap.values())
              .filter(d => d.actionData.categoryId === categoryId)
              .sort((a, b) => (a.actionData.position ?? 0) - (b.actionData.position ?? 0));
            // נמצא את המנה שזזה ואת המיקום הישן והחדש
            const fromIndex = dishesInCategory.findIndex(d => d.actionData.itemId === itemId);
            const toIndex = action.actionData.newPosition ?? 0;
            if (fromIndex !== -1 && toIndex >= 0 && toIndex < dishesInCategory.length) {
              // נוציא את המנה מהמיקום הישן
              const [movedDish] = dishesInCategory.splice(fromIndex, 1);
              // נכניס אותה למיקום החדש
              dishesInCategory.splice(toIndex, 0, movedDish);
              // נעדכן את ה-position של כל המנות בקטגוריה
              dishesInCategory.forEach((dish, idx) => {
                dish.actionData.position = idx;
                dish.actionData.newPosition = idx;
                dishMap.set(dish.actionData.itemId!, dish);
              });
            }
            // נעדכן גם את המנה שזזה
            dishMap.set(itemId, action);
          }
          break;
      }
    }

    // סינון מנות ששייכות לקטגוריות קיימות
    const existingCategoryItemIds = new Set(
      Array.from(categoryMap.values()).map(c => c.actionData.itemId).filter(id => !!id)
    );

    const validDishes = Array.from(dishMap.values()).filter(dish => {
      const categoryId = dish.actionData.categoryId;
      return categoryId && existingCategoryItemIds.has(categoryId);
    });

    // איסוף כל ה-IDs של משתמשים שמוקצים למנות
    const assignedUserIds = new Set<string>();
    for (const dish of validDishes) {
      if (dish.actionData.assignedTo) {
        assignedUserIds.add(dish.actionData.assignedTo);
      }
    }

    // שליפת משתמשים רק לפי ה-IDs הנדרשים
    const users = assignedUserIds.size > 0
      ? await getUsersByIds(Array.from(assignedUserIds))
      : [];

    // יצירת מפת משתמשים לגישה מהירה
    const userMap = new Map(users.map(user => [user.id, user]));

    // יצירת מפת תאריכי יצירה
    const createdAtMap = new Map<string, Date>();
    for (const action of menuActions) {
      if (
        (action.actionType === 'add_dish' || action.actionType === 'add_category') &&
        action.actionData.itemId
      ) {
        if (!createdAtMap.has(action.actionData.itemId)) {
          createdAtMap.set(action.actionData.itemId, action.timestamp);
        }
      }
    }

    // יצירת התוצאה הסופית
    const allItems = [...validDishes, ...categoryMap.values()];
    const assignedMenuItems: AssignedMenuItem[] = allItems.map((action) => {
      const data = action.actionData;
      const createdAt = createdAtMap.get(data.itemId!) ?? action.timestamp;
      const updatedAt = action.timestamp;

      const item: MenuItem = {
        id: data.itemId!,
        name: data.name ?? '',
        notes: data.notes ?? '',
        tags: data.tags ?? [],
        assignedTo: data.assignedTo ?? undefined,
        categoryId: data.categoryId ?? undefined,
        position: data.newPosition ?? data.position!,
        isCategory: data.isCategory ?? false,
        createdAt,
        updatedAt,
      };

      const assignedUser = item.isCategory || !data.assignedTo
        ? undefined
        : userMap.get(data.assignedTo);

      return {
        assignedUser,
        item,
      };
    });
    console.log('eventCreatorID:', eventCreatorID);

    return { eventName, eventCreatorID, assignedMenuItems };
  } catch (error: any) {
    throw error;
  }
}

// פונקציה חדשה לשליפת משתמשים לפי IDs
async function getUsersByIds(userIds: string[]): Promise<User[]> {
  if (userIds.length === 0) return [];

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .in('id', userIds);

  if (error) {
    throw new Error(error.message);
  }

  if (!data) return [];

  return data.map(row => mapKeys<User>(row, columnMappings.users.toCamel));
}

export function groupAndSortDishesByCategory(
  assignedMenuItems: AssignedMenuItem[]
): {
  category: AssignedMenuItem;
  categoryName: string;
  dishes: AssignedMenuItem[];
}[] {
  // הפרדת קטגוריות ומנות
  const categories = assignedMenuItems
    .filter(item => item.item.isCategory)
    .sort((a, b) => a.item.position - b.item.position);

  const dishes = assignedMenuItems
    .filter(item => !item.item.isCategory)
    .sort((a, b) => a.item.position - b.item.position);

  const seenDishIds = new Set<string>();
  const result: {
    category: AssignedMenuItem;
    categoryName: string;
    dishes: AssignedMenuItem[];
  }[] = [];

  for (const category of categories) {
    const categoryId = category.item.id;
    const categoryName = category.item.name?.trim() || `Unnamed (${categoryId})`;

    // סינון מנות ששייכות לקטגוריה ושעוד לא ראינו
    const dishesInCategory = dishes
      .filter(dish => dish.item.categoryId === categoryId && !seenDishIds.has(dish.item.id))
      .map(dish => {
        seenDishIds.add(dish.item.id);
        return dish;
      });

    result.push({
      category,
      categoryName,
      dishes: dishesInCategory,
    });
  }

  return result;
}

//בדיקת הרשאות
export async function canEditOrRemoveDish(eventId: string, userId: string): Promise<boolean> {
  const isCreatedBy = await getEventById(eventId);
  if (!isCreatedBy)
    return false;
  return isCreatedBy.createdBy === userId;
}
export async function getMenuActionsByUserId(eventId: string, userId: string) {
  const { data, error } = await supabase
    .from('menuaction')
    .select('*')
    .eq('eventid', eventId)
    .eq('userid', userId);

  if (error) {
    console.error("שגיאה בשליפת פעולות התפריט:", error);
    throw new Error(error.message);
  }

  if (!data) return [];
  const dataCamel = data.map(item => ({
    ...mapKeys(
      {
        id: item.id,
        eventid: item.eventid,
        userid: item.userid,
        actiontype: item.actiontype,
        timestamp: item.timestamp,
      },
      toCamel
    ),
    actionData: mapKeys(
      {
        itemid: item.itemid,
        name: item.name,
        notes: item.notes,
        tags: item.tags,
        assignedto: item.assignedto,
        categoryid: item.categoryid,
        position: item.position,
        newposition: item.newposition,
        iscategory: item.iscategory,
      },
      toCamelData
    ),
  }));
  return filterUndoneActions(dataCamel);
}