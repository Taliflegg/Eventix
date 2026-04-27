
import { MealTrainDates, MenuAction, User } from "@eventix/shared";
export const columnMappings = {
meal_train:{
  toCamel:{
      name: 'name',
    address: 'address',
    start_date: 'startDate',       // "YYYY-MM-DD"
    end_date: 'endDate',       // "YYYY-MM-DD"
    adults: 'adults',
    childrens: 'childrens',
    dietary_info: 'dietaryInfo',
    delivery_time: 'deliveryTime',
    admin_user_id: 'adminUserId',
    share_token:'shareToken',
    created_at:'createdAt' ,
    Image:'Image'
   
  },
  toSnake:{
       name: 'name',
    address: 'address',
   startDate : 'start_date',       // "YYYY-MM-DD"
   endDate : 'end_date',       // "YYYY-MM-DD"
    adults: 'adults',
    childrens: 'childrens',
    dietaryInfo: 'dietary_info',
    deliveryTime: 'delivery_time',
    adminUserId: 'admin_user_id',
     createdAt:'created_at',
       shareToken:'share_token',
       Image:'Image'
    
  }
},
meal_trains_date:{
  toCamel:{
    meal_train_id:'mealTrainId',
  date: 'date',
  volunteer_user_id: 'volunteerUserId',
  volunteer_name: 'volunteerName',
  meal_description:'mealDescription',
  notes: 'notes',
  reminder_days:'reminderDays',
  created_at: 'createdAt'
  }as Record<string, keyof MealTrainDates>, 
  toSnake:{
   mealTrainId:'meal_train_id',
  date: 'date',
  volunteerUserId: 'volunteer_user_id',
  volunteerName: 'volunteer_name',
  mealDescription:'meal_description',
  notes: 'notes',
  reminderDays:'reminder_days',
  createdAt: 'created_at'
  } as Record<keyof MealTrainDates, string>,
},
    user_events:{
 toSnake: {
        id: 'id',
        userId: 'user_id',
        eventId: 'event_id',
        role: 'role',
        joinedAt: 'joined_at',
      } as const,
      toCamel: {
        id: 'id',
        user_id: 'userId',
        event_id: 'eventId',
        role: 'role',
        joined_at: 'joinedAt',
      } as const,
    },
 connectionLocationsMapper:{
   toSnake: {
       createdAt:'created_at',
       accountIdA:'account_a_id',
       locationIdA:'location_a_id',
       accountIdB:'account_b_id',
       locationIdB:'location_b_id',
      } as const,
      toCamel: {
        created_at: 'createdAt',
        account_a_id: 'accountIdA',
        location_a_id: 'locationIdA',
        account_b_id: 'accountIdB',
        location_b_id: 'locationIdB',
      } as const,
    },
    // ... אפשר להוסיף טבלאות נוספות כאן
  events: {
    toSnake: {
      mealType: 'meal_type',
      expectedCount: 'expected_count',
      actualCount: 'actual_count',
      createdBy: 'created_by',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      isLimited:'is_limited'


    } as const,
    toCamel: {
      meal_type: 'mealType',
      expected_count: 'expectedCount',
      actual_count: 'actualCount',
      created_by: 'createdBy',
      created_at: 'createdAt',
      updated_at: 'updatedAt',
      is_limited:'isLimited'


    } as const,
  },
  
  userDietaryRestriction: {
    toSnake: {
      userId: 'user_id',
      dietaryRestrictionId: 'dietary_restrictionId',
    } as const,
    toCamel: {
      user_id: 'userId',
      dietary_restrictionId: 'dietaryRestrictionId',
    } as const,
  },
  users: {
    toSnake: {
      passwordHash: 'password_hash',
      googleId: 'google_id',
      dietaryRestrictions: 'dietary_restrictions',
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    } as unknown as Record<keyof User, string>,
    toCamel: {
      password_hash: 'passwordHash',
      google_id: 'googleId',
      dietary_restrictions: 'dietaryRestrictions',
      created_at: 'createdAt',
      updated_at: 'updatedAt'
    } as unknown as Record<string, keyof User>,
  }, // סגירת האובייקט users

  shareLinks: {
    toCamel: {
      event_id: 'eventId',
      created_by: 'createdBy',
      expiration_date: 'expirationDate',
      access_level: 'accessLevel',
      usage_count: 'usageCount',
      created_at: 'createdAt',
    },
    toSnake: {
      eventId: 'event_id',
      createdBy: 'created_by',
      expirationDate: 'expiration_date',
      accessLevel: 'access_level',
      usageCount: 'usage_count',
      createdAt: 'created_at',
    },
  },

  menuActions: {
    toSnake: {
      eventId: 'eventid',
      userId: 'userid',
      actionType: 'actiontype',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    } as unknown as Record<string, keyof MenuAction>,
    toCamel: {
      eventid: 'eventId',
      userid: 'userId',
      actiontype: 'actionType',
      created_at: 'createdAt',
      updated_at: 'updatedAt',
    } as unknown as Record<string, keyof MenuAction>,
  },

  menuActionsData: {
    toSnake: {
      itemId: 'itemid',
      assignedTo: 'assignedto',
      categoryId: 'categoryid',
      newPosition: 'newposition',
      isCategory: 'iscategory',
    } as const,
    toCamel: {
      itemid: 'itemId',
      assignedto: 'assignedTo',
      categoryid: 'categoryId',
      newposition: 'newPosition',
      iscategory: 'isCategory',
    } as const,
  },
  location: {
    toSnake: {
      id: 'id',
      name: 'name',
      address: 'address',
      locationType: 'location_type',
    }as const,
    toCamel: {
      id: 'id',
      name: 'name',
      address: 'address',
      location_type: 'locationType',
    }as const,
  },
  userActivity: {
    toSnake: {
      userId: 'user_id',
      appName: 'app_name',
    } as const,
    toCamel: {
      user_id: 'userId',
      app_name: 'appName',
    } as const,
  },
mealTrains:{
  toSnake: {
     id: 'id',
    name: 'name',
    address: 'address',
    startDate: 'start_date',
    endDate: 'end_date',
    peopleCount: 'people_count',
    adults: 'adults',
    childrens: 'childrens',
    dietaryInfo: 'dietary_info',
    deliveryTime: 'delivery_time',
    adminUserId: 'admin_user_id',
    shareToken: 'share_token',
    createdAt: 'created_at',
    Image: 'Image',

    } as const,
    toCamel: {
      id: 'id',
      name: 'name',
      address: 'address',
      start_date: 'startDate',
      end_date: 'endDate',
      people_count: 'peopleCount',
      adults: 'adults',
      childrens: 'childrens',
      dietary_info: 'dietaryInfo',
      delivery_time: 'deliveryTime',
      admin_user_id: 'adminUserId',
      share_token: 'shareToken',
      created_at: 'createdAt',
      Image: 'Image',
    } as const,
    
}

};


// פונקציה גנרית להמרת מפתחות
export function mapKeys<T>(obj: any, map: Record<string, keyof T>): T {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [map[k] || k, v])
  ) as T;
}

