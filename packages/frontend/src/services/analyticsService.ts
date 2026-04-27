import { getRequest } from "./apiServices";
export const fetchAverageAttendees = async (): Promise<number | null> => {
  try {
    const response = await getRequest<{ average_actual_attendees_per_event: number }>(
      "analytics/average-attendees-actual"
    );
    return response.average_actual_attendees_per_event;
  } catch (error) {
    console.error("Error fetching actual average attendees:", error);
    return null;
  }
};

export const fetchWeeklyActiveAccounts = async (): Promise<any> => {
  const response = await getRequest<any>('/analytics/weekly-active');
  if (response) {
    return response;
  } else {
    throw new Error( 'Failed to fetch weekly active accounts');
  }
};


export const activeMealTRain = async (): Promise<{ activeMealTrains: number }> => {
  return await getRequest<{ activeMealTrains: number }>('/analytics/numActiveTrains');
};
  
export const fetchPlansThisWeek = async (): Promise<any> => {
  const response = await getRequest<number>('/analytics/plans-this-week');
  if (response) {
    return response;
  } else {
    throw new Error( 'Failed to fetch plans this week');
  }
};
