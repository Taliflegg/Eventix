import axios from 'axios';
import { MenuAction } from '@eventix/shared';
import { getAccessToken, clearAccessToken } from '../utils/auth'; // ✅ ייבוא פונקציות ניהול טוקנים

const backendUrl = process.env.REACT_APP_BACKEND_URL;
const BASE_URL = `${backendUrl}/api/`;

interface CheckPermissionResponse {
  success: boolean;
  canEdit: boolean;
}

interface menuActresponse {
  status: number;
  body: {
    success: boolean;
    error?: string;
    data?: any;
  };
}

// יצירת מופע axios עם הגדרות בסיס
export const apiService = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ בקשת טוקן מה-localStorage והוספה לכותרת
apiService.interceptors.request.use(
  (config: any) => {
    const token = getAccessToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error: any) => Promise.reject(error)
);

// טיפול בתשובות שגיאה
apiService.interceptors.response.use(
  (response: any) => response,
  (error: any) => {
    if (error.response) {
      console.error('Server Error:', error.response.data.message || error.response.statusText);
      // ✅ אם השגיאה היא 401, נקה את הטוקן
      if (error.response.status === 401) {
        console.warn('Authentication token expired or invalid. Clearing token.');
        clearAccessToken();
      }
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }
    return Promise.reject(error);
  }
);

// בקשות בסיסיות
export const getRequest = async <T>(endpoint: string): Promise<T> => {
  const response = await apiService.get<T>(endpoint, { withCredentials: true });
  return response.data;
};

export const postRequest = async <T>(endpoint: string, data: any): Promise<T> => {
  console.log('POST request to:', endpoint, 'with data:', data);
  const response = await apiService.post<T>(endpoint, data);
  return response.data;
};

export const putRequest = async <T>(endpoint: string, data: any): Promise<T> => {
  console.log('PUT request to:', endpoint, 'with data:', data);
  const response = await apiService.put<T>(endpoint, data);
  return response.data;
};

export const deleteRequest = async <T>(endpoint: string): Promise<T> => {
  console.log("endpoint",endpoint);
  
  const response = await apiService.delete<T>(endpoint, { withCredentials: true });
  if (response.status === 204) {
    return { success: true } as T;
  }
  return response.data;
};

// בדיקת תקינות שרת
export const CheckHealth = async () => {
  const response = await apiService.get('/health');
  return response.data;
};

// שליפת אפשרויות תזונה
export type DietaryOption = {
  id: string;
  name: string;
};

export const fetchDietaryRestrictions = async (): Promise<DietaryOption[]> => {
  try {
    const response = await apiService.get<DietaryOption[]>('/dietary-restrictions');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch dietary restrictions:', error);
    throw new Error('Could not fetch dietary restrictions');
  }
};

// בדיקת הרשאות למשתמש לאירוע
export const checkPermission = async (eventId: string, userId: string): Promise<boolean | null> => {
  try {
    const result = await getRequest<CheckPermissionResponse>(
      `/menu-actions/createEditAndRemoveDishRoute/${eventId}/${userId}`
    );
    return result.canEdit;
  } catch (error) {
    console.error('שגיאה בבדיקת הרשאות:', error);
    return false;
  }
};

// ביצוע פעולה בתפריט
export const UseHandleMenuActionFunction = async (
  menuAction: MenuAction,
  userId: string
): Promise<menuActresponse> => {
  try {
    const result = await postRequest<menuActresponse>('/menu-actions/', {
      menuAction,
      userId,
    });
    return result;
  } catch (error) {
    console.log('שגיאה בפעולה', error);
    return {
    status: 500,
    body: {
      success: false,
      error: "שגיאה בפעולה",
      data: error
    } };
}};

export const putRequestWithConfig = async <T>(endpoint: string, data: any, config: object): Promise<T> => {
  console.log("PUT request to:", endpoint, "with data:", data, "and config:", config);
  const response = await apiService.put<T>(endpoint, data, config);  // עם config מותאם אישית
  return response.data;
};








 
 
