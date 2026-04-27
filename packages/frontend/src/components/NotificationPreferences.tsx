import React, { useState, useEffect } from "react";
import { putRequest, getRequest } from "../services/apiServices";
import { toast } from "react-toastify";
import { FaPlus, FaTimes } from "react-icons/fa";

// טיפוסים
interface BooleanNotificationPreferences {
  notify_joined_event: boolean;
  notify_event_updated: boolean;
  notify_menu_changed: boolean;
  notify_delete_event: boolean;
}
interface ComplexNotificationPreferences {
  notify_reminder: string[];
}
type NotificationPreferences = BooleanNotificationPreferences & ComplexNotificationPreferences;
export default function NotificationPreferencesModal({
  userId,
  onClose,
}: {
  userId: string;
  onClose: () => void;
}) {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    notify_joined_event: false,
    notify_event_updated: false,
    notify_menu_changed: false,
    notify_delete_event: false,
    notify_reminder: [],
  });
  useEffect(() => {
    const toastId = "preferences-missing";
    getRequest<{ data: any }>(`notification/notification-preferences/${userId}`)
      .then((res) => {
        const data = res.data;
        const parsedReminderTimes = typeof data.notify_reminder === "string"
          ? JSON.parse(data.notify_reminder)
          : data.notify_reminder || [];
        setPreferences({
          notify_joined_event: data.notify_joined_event,
          notify_event_updated: data.notify_event_updated,
          notify_menu_changed: data.notify_menu_changed,
          notify_delete_event: data.notify_delete_event,
          notify_reminder: parsedReminderTimes,
        });
      })
      .catch(() => {
        if (!toast.isActive(toastId)) {
          toast.error("לא הוגדרו עדיין", { toastId });
        }
      });
  }, [userId]);
  const handleSave = async () => {
    try {
      await putRequest(`notification/notification-preferences/${userId}`, {
        ...preferences,
        notify_reminder: JSON.stringify(preferences.notify_reminder),
      });
      toast.success("העדפות עודכנו בהצלחה");
      onClose();
    } catch (err: any) {
      console.error("שגיאה בשמירת ההעדפות:", err.response?.data || err.message);
      toast.error("שגיאה בשמירת ההעדפות");
    }
  };
  const booleanFields: { key: keyof BooleanNotificationPreferences; label: string }[] = [
    { key: "notify_joined_event", label: "קבלת מייל על הצטרפות לארוע" },
    { key: "notify_event_updated", label: "קבלת מייל על שינוי פרטי אירוע" },
    { key: "notify_menu_changed", label: "עדכון על שינוי בתפריט" },
    { key: "notify_delete_event", label: "קבלת מייל על מחיקת אירוע" },
  ];
  const reminderOptions = [
    { value: "1_hour_before", label: "שעה לפני" },
    { value: "2_hours_before", label: "שעתיים לפני" },
    { value: "1_day_before", label: "יום לפני" },
    { value: "2_days_before", label: "יומיים לפני" },
    { value: "3_days_before", label: "שלושה ימים לפני" },
    { value: "1_week_before", label: "שבוע לפני" },
    { value: "1_month_before", label: "חודש לפני" },
    { value: "same_day", label: "באותו יום" },
  ];
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md text-right">
        <h2 className="text-xl font-semibold mb-4 text-green-700">
          העדפות קבלת מיילים
        </h2>
        <div className="flex flex-col gap-4">
          {booleanFields.map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between">
              <span>{label}</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={preferences[key]}
                  onChange={() =>
                    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }))
                  }
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-300 rounded-full peer-checked:bg-green-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
              </label>
            </div>
          ))}
          {/* תזכורות */}
          <div className="mt-4">
            <label className="block font-semibold text-green-700 mb-2">מתי לקבל תזכורות?</label>
            {preferences.notify_reminder.map((time, index) => (
              <div key={index} className="flex items-center gap-2 mb-2">
                <select
                  className="p-2 border rounded w-full"
                  value={time}
                  onChange={(e) => {
                    const updated = [...preferences.notify_reminder];
                    updated[index] = e.target.value;
                    setPreferences((prev) => ({ ...prev, notify_reminder: updated }));
                  }}
                >
                  {reminderOptions.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                <button
                  className="text-red-500 text-lg"
                  onClick={() => {
                    const updated = preferences.notify_reminder.filter((_, i) => i !== index);
                    setPreferences((prev) => ({ ...prev, notify_reminder: updated }));
                  }}
                  aria-label="מחק תזכורת"
                >
                  <FaTimes />
                </button>

              </div>
            ))}
            <button
              className="mt-2 px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
              onClick={() =>
                setPreferences((prev) => ({
                  ...prev,
                  notify_reminder: [...prev.notify_reminder, "1_day_before"],
                }))
              }
            >
              <FaPlus /> הוסף תזכורת
            </button>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
          >
            ביטול
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            שמור
          </button>
        </div>
      </div>
    </div>
  );
}
