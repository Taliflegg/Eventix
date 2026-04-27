import { BaseResponse } from '@eventix/shared';
import { getRequest, postRequest } from './apiServices'; // assuming getRequest is defined somewhere else

type ActiveUsers = {
  [appName: string]: number;
};

interface MonthlyActiveUsersResponse extends BaseResponse {
  data: {
    year: number;
    month: number;
    message?: string;
    totalMonthlyActiveUsers: number;
  };
}

export const fetchMonthlyActiveUsersByApp = async (): Promise<ActiveUsers> => {
  try {
    // קריאה ל-API
    const response = await getRequest<ActiveUsers>('user-activity/monthly-active-users-by-app');
    // const data = response.data;
    console.log("fetchMonthlyActiveUsersByApp -> response: ", response);
    return response;
  } catch (error: any) {
    console.error('Error fetching data:', error);
    throw new Error(error.message || 'An error occurred while fetching data');
  }
};

export const getOverallMonthlyActiveUsers = async (
  year: number,
  month: number
): Promise<MonthlyActiveUsersResponse> => {
  try {
    const response = await getRequest<MonthlyActiveUsersResponse>(
      `/user-activity/overall-monthly-active-users?year=${year}&month=${month}`
    );
    return response;
  } catch (error: any) {
    console.error('Error fetching data:', error);
    throw new Error(error.message || 'An error occurred while fetching data');
  }
};
export const fetchPlatformAdoptionRate = async (): Promise<any> => {
  try {
    // השתמש ב-getRequest לקריאה ל-API
    const response = await getRequest('user-activity/cross-platform-adoption');

    return response;  // מחזיר את הנתונים שהתקבלו מה-API
  } catch (error: any) {
    throw new Error(error.message || 'An error occurred while fetching cross-platform adoption rate');
  }
};
export const fetchAddUserActivity = async (app_name: string): Promise<boolean> => {
  return await postRequest<boolean>('user-activity/add', { app_name });
};