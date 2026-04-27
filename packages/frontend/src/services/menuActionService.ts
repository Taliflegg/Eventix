import { AssignedMenuItem,MenuAction,MenuActionData} from '@eventix/shared'; 
import { apiService, getRequest ,postRequest} from './apiServices';
interface MenuActionResponse {
  success: boolean;
  data: any[];
  error?: string;
}
interface MenuActionsResponse {
  success:boolean;
  data: MenuAction[];
}
export const fetchMenuActionsByUserId = async (eventId: string,userId:string): Promise<MenuAction[]> => {
  try {
    console.log(eventId);
    const response = await getRequest<MenuActionsResponse>(`/menu-actions/getMenuActionsByUserId/${eventId}/${userId}`);
    return response.data;
  }
  catch (err) {
    console.log(err);
    throw new Error(err instanceof Error ? err.message : "failed to fetch menu action by event");
  }
}

export const addMenuAction = async (menuAction: MenuAction): Promise<any[]> => {
  try {
    const addedMenuAction = await postRequest<MenuActionResponse>('/menu-actions', { menuAction });
    return addedMenuAction.data;
  }
  catch (err: any) {
    console.log(err);
    throw new Error(err instanceof Error? err.message : err.response.data.error);
  }
}

interface AssignedMenuResponse {
  success: boolean;
  eventName?: string;
  assignedMenuItems: AssignedMenuItem[];
  error?: string;
}
// interface AssignedMenuActionResponse {
//   success: boolean;
//   eventName?: string;
//   assignedMenuItems: MenuActionData[];
//   error?: string;
// }

export const menuActionService = {
  sendAction: async (action: MenuAction) => {
    const resp = await postRequest<MenuActionResponse>('/menu-actions', { menuAction: action });
    return resp;  // מחזיר את כל התגובה, ניתן להתאים לפי הצורך
  }
}

export const fetchAssignedMenuItems = async (eventId?: string): Promise<AssignedMenuResponse> => {
  const response = await getRequest<AssignedMenuResponse>(`/menu-actions/event-menu/${eventId}`);

  if (response.success) {
    return response;
  } else {
    throw new Error(response.error || 'Failed to fetch assigned menu items');
  }
};
// export const sendMenuAction = async (menuAction: MenuAction, userId?: string) => {
//   return await postRequest('/menu-actions', { menuAction, userId });
// };
export const getMenuActionsByEventId = async (eventId?: string): Promise<AssignedMenuResponse> => {
  try {
    const response = await getRequest<AssignedMenuResponse>(`/menu-actions/event-menu/${eventId}`);

    if (response.success) {
      return response;
    } else {
      // יש תגובה מהשרת אבל היא לא מוצלחת
      throw new Error(response.error || 'השרת החזיר תשובה לא תקינה');
    }

  } catch (err: any) {
    // שגיאת תקשורת או חריג לא צפוי
    const message = err?.message || 'שגיאה לא ידועה בעת קבלת הנתונים';
    throw new Error(`קריאה נכשלה: ${message}`);
  }
};



export const sendMenuAction = async (menuAction: MenuAction, userId?: string) => {
  const response = await postRequest('/menu-actions', { menuAction, userId });

  if (response && (response as any).success && (response as any).newItem) {
    
    return (response as any).newItem; // גישה דינאמית בלי צורך ב־interface
  } else {
    throw new Error((response as any)?.error || 'שגיאה בשליחת הפעולה');
  }
};


// export const fetchMenuActions = async (eventId: string): Promise<MenuAction[]> => {
//   try {
//     console.log(eventId);
//     const response = await getRequest<MenuActionsResponse>(`/menu-actions/getMenuActionsByUserId/${eventId}/${userId}`);
//     return response.data;
//   }
//   catch (err) {
//     console.log(err);
//     throw new Error(err instanceof Error ? err.message : "failed to fetch menu action by event");
//   }
// }


export const getMenuDataAsJSON = async (eventId: string) => {
  try {
    const response = await apiService.get(`/menu-actions/export-menu/JSON/${eventId}`);
    return response.data;
  } catch (err) {
    throw err; 
  }
};

