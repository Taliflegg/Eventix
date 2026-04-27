import { getRequest, postRequest, putRequest } from './apiServices';
import { MealTrainResponse, MealTrains, EmailListResponse, MealTrainDates, MealTrainDatesResponse, JoinMealTrainResponse } from '@eventix/shared';
import { MealTrainWithDates, MealTrainWithRole } from '@eventix/shared/src';
import axios from 'axios'

//סילשתי כי לא היו בשימוש:
// import { c } from 'framer-motion/dist/types.d-Bq-Qm38R';
// import axios from 'axios';

const backendUrl = process.env.REACT_APP_BACKEND_URL;

export const MealTrainService = {
  fetchFamilyDetails: async (familyId: string): Promise<MealTrains> => {
    const response = await axios.get(`${backendUrl}/api/meal_train/${familyId}`);
    return response.data as MealTrains;
  },
  fetchMealDates : async (id: string): Promise<MealTrainDates[]> => {
    const response = await axios.get<MealTrainDates[]>(`${backendUrl}/api/meal_train/${id}/dates`);
    
    const mappedData = response.data.map((item: any) => ({
    ...item,
    volunteerName: item.volunteer_name,
    mealDescription: item.meal_description,
    reminderDays: item.reminder_days,
    
    
  }));

  return mappedData as MealTrainDates[];
  },


  submitMealSignup: async (currentObjId: string | undefined, payload: {
    meal_train_id: string | undefined;
    date: string;
    volunteer_name: string;
    notes: string;
    meal_description: string;
    reminder_days: number;
    volunteer_user_id: string;
  }) => {
    if (!currentObjId) throw new Error('Missing currentObjId');
    return axios.put(`${backendUrl}/api/meal_train/${currentObjId}`, payload);
  },

  // createMealTrain: async (mealTrainData: any): Promise<MealTrains> => {
  //   debugger
  //   const response = await postRequest<MealTrainResponse>(`${backendUrl}/api/meal_train/`, mealTrainData);

  //   if (response.success && response.data) {
  //     return response.data;
  //   }

  //   throw new Error(response.error || 'Failed to create meal train');
  // },
  createMealTrain: async (mealTrainData: any): Promise<MealTrainResponse> => {
    const item = await axios.post<MealTrainResponse>(`${process.env.REACT_APP_BACKEND_URL}/api/meal_train/`, mealTrainData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      withCredentials: true
    });
    if (item.data.success)
      return item.data
    throw new Error(item.data.error || 'Failed to creye meal train');
  },
  getMyMealTrains: async (): Promise<MealTrainWithRole[]> => {
    const response = await getRequest<MealTrainWithRole[]>('/meal_train');
    console.log('MealTrainService getMyMealTrains response:', response);
    return response;
  },

  fetchMealTrainById: async (id: string): Promise<MealTrainWithDates | null> => {
    const response = await getRequest<MealTrainWithDates>(`/meal_train/${id}`);
    console.log('MealTrainService getMealTrainById response:', response);
    return response;
  },

  getMyMealForTrain: async (mealTrainId: string): Promise<any> => {
    const response = await getRequest(`/meal_train/my/${mealTrainId}`);
    console.log('MealTrainService getMyMealForTrain response:', response);
    return response;
  },

  sendThankYouEmails: async (mealTrainId: string): Promise<void> => {
    try {
      const response = await postRequest<{ message: string }>(`/meal_train/send-emails/${mealTrainId}`, {});
      if (response.message === 'Emails sent successfully') {
        console.log('Emails sent successfully');
      } else {
        throw new Error('Failed to send emails');
      }
    } catch (error) {
      console.error('Error sending thank you emails:', error);
      throw new Error('Failed to send thank you emails');
    }
  },
  getMealTrainById: async (mealTrainId: string): Promise<MealTrains> => {
    const response: MealTrainResponse = await getRequest<MealTrainResponse>(`/meal_train/meal-trains/${mealTrainId}`);
    if (response.success) {
      return response.data;
    }
    throw new Error(response.error || 'Failed to fetch meal train by ID');
  },
  updateMealTrain: async (id: string, updates: Partial<MealTrains>): Promise<MealTrains> => {
    const response: MealTrainResponse = await putRequest<MealTrainResponse>(`/meal_train/meal-trains/${id}`, updates);
    if (response.success) {
      return response.data;
    }
    throw new Error(response.error || 'Failed to update meal train');
  },
  getVolunteerEmails: async (mealTrainId: string): Promise<string[]> => {
    const response: EmailListResponse = await getRequest<EmailListResponse>(`/meal_train/meal-trains/${mealTrainId}/volunteers/emails`);
    if (response.success) {
      return response.data;
    }
    throw new Error(response.error || 'Failed to get volunteer emails');
  },
  getMealTrainDate: async (mealTrainId: string): Promise<MealTrainDates[]> => {
    const response = await getRequest<MealTrainDatesResponse>(`/meal_train/dates/${mealTrainId}`);
    console.log("Meal Train Dates Response:", response);
    if (response.success) {
      return response.data;
    }
    throw new Error(response.error || 'Failed to fetch meal train dates');
  },
  volunteerForDate: async (
    mealTrainDateId: string,
    userId: string,
    userName: string,
    description: string,
    notes: string
  ): Promise<MealTrainDates[]> => {
    const response: MealTrainDatesResponse = await postRequest<MealTrainDatesResponse>(
      `/meal_train/meal-train-dates/volunteer/${mealTrainDateId}`,
      { userId, userName, notes, mealDescription: description }
    );
    if (response.success) {
      return response.data;
    }
    throw new Error(response.error || 'Failed to volunteer for date');
  },
  updateReminderDays: async (mealTrainDateId: string, days: number): Promise<MealTrainDates[]> => {
    const response: MealTrainDatesResponse = await putRequest<MealTrainDatesResponse>(`/meal_train/meal-train-dates/reminder/${mealTrainDateId}`, {
      days,
    });
    if (response.success) {
      return response.data;
    }
    throw new Error(response.error || 'Failed to update reminder days');
  },
  volunteerForMeal: async (
    mealTrainId: string,
    mealTrainDateId: string,
    name: string,
  ): Promise<MealTrainDates> => {
    const response: JoinMealTrainResponse = await postRequest<JoinMealTrainResponse>(
      `/meal_trains/meal-train/${mealTrainId}/dates/${mealTrainDateId}/volunteer`,
      { name }
    );
    if (response.success) {
      return response.data;
    }
    throw new Error(response.error || 'Failed to volunteer for meal');
  },
  sendUpdateToVolunteers: async (mealTrainId: string, message: string) => {
    try {
      const response = await axios.post(
        `/meal_train/send-update/${mealTrainId}`,
        { message }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Error when send the update to volunteers');
    }
  },
  getWithVolunteers: async (): Promise<{ count: number }> => {
    const response = await getRequest<{ count: number }>('/meal_train/with-volunteers');
    return response;
  },

}

