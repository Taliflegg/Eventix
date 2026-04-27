import { SharedLocationConnection } from '@eventix/shared/src';
import { deleteRequest, getRequest, postRequest } from './apiServices';
import { ShabbatDataForFrontend } from '@eventix/shared'



export const getLocationShares = async (): Promise<SharedLocationConnection[]> => {
  const response = await getRequest<{ success: boolean; data: SharedLocationConnection[] }>('/shabbat/location-shares');
  console.log(':satellite_antenna: API raw response (in getLocationShares):', response);
  return response.data;
};

// מוחק חיבור מסויים לפי account_b_id
export const deleteLocationShare = async (accountBId: string): Promise<void> => {
  await deleteRequest(`/shabbat/location-shares/${accountBId}`);
};

export const savePlan = async (
  date: string,
  locationId: string | null,
  status: "going" | "maybe" | "away"|"tentative"
): Promise<{ success: boolean; message?: string; data?: any }> => {
  // const endpoint = '/shabbat/plan'; 
  
  try {
    const response = await postRequest('/shabbat/plan', {
      date,
      locationId,
      status,
    });
  
    return response as { success: boolean; message?: string; data?: any };
  } catch (error: any) {
    console.error("שגיאה בשמירת התוכנית:", error);
    return {
      success: false,
      message: error.message || "שגיאה בשמירה",
    };
  }
};


export const getShabbatList = async (
  userId: string,
  offset: number = 4, // ערך ברירת מחדל
  limit: number = 0 // ערך ברירת מחדל
): Promise<ShabbatDataForFrontend[]> => {
  return await getRequest<ShabbatDataForFrontend[]>(`/shabbat?limit=${limit}&offset=${offset}&userId=${userId}`);
};

//CreateAccount:
//1
export const completeOnboarding = async (
  userId: string,
  email: string,
  accountName: string
): Promise<{ success: boolean; message?: string }> => {
  try {
    const response = await postRequest('/onboarding/complete', {
      userId,
      email,
      accountName,
    });
    return response as { success: boolean; message?: string };
  } catch (error: any) {
    console.error("שגיאה בהשלמת ההדרכה:", error);
    return { success: false, message: error.message || "שגיאה בהשלמת ההדרכה" };
  }
};
//2
export const addHomeLocationToAccount = async (
  userId: string,
  email: string,
  accountName: string,
  homeLocation: { name: string; address: string }
) => {
  try {
    const response = await postRequest('/onboarding/complete', {
      userId,
      email,
      accountName,
      homeLocation,
      locationType: 'home',
    });

    return response;
  } catch (error: any) {
    console.error("שגיאה בהוספת מיקום הביתה:", error);
    throw new Error(error.message || "שגיאה בהוספת מיקום הביתה");
  }
};
//3

export const saveLocations = async (userId: string, locations: { name: string; address: string; locationType: string }[]): Promise<{ success: boolean; message?: string }> => {
  try {
    const response = await postRequest('onboarding/locations', {
      userId,
      locations,
    });
   return response as { success: boolean; message?: string; data?: any };
  } catch (error: any) {
    console.error("שגיאה בשמירת המיקומים:", error);
    return {
      success: false,
      message: error.message || "שגיאה בשמירה",
    };
  }
};