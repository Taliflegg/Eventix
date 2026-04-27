import { getRequest, putRequest } from './apiServices'; // Assuming you have an apiService for making requests
export interface NotificationPreferences {
  notify_event_created: boolean;
  notify_event_updated: boolean;
  notify_reminder: boolean;
  notify_menu_changed: boolean;
}

// שליפה לפי userId
export const fetchNotificationPreferences = async (userId: string): Promise<NotificationPreferences> => {
  const endpoint = `notification/notification-preferences/${userId}`;
  return await getRequest<{ data: NotificationPreferences }>(endpoint).then(res => res.data);
};

// עדכון
export const updateNotificationPreferences = async (userId: string, prefs: NotificationPreferences): Promise<void> => {
  const endpoint = `notification/notification-preferences/${userId}`;
  await putRequest(endpoint, prefs);
};
