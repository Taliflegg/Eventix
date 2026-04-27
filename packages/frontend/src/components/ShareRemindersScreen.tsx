import { MealTrainDates, MealTrains } from '@eventix/shared';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Square2StackIcon } from '@heroicons/react/24/outline';
import { log } from 'console';
import { fetchAuthenticatedUser } from '../services/usersService';
import { use } from 'i18next';
import { useTranslation } from 'react-i18next';
import { MealTrainService } from '../services/mealTrainService';
import { toast } from 'react-toastify';
 const API_URL = `${window.location.origin}`;

const ShareRemindersScreen = () => {
  const { t }: { t: (key: string) => string } = useTranslation();
  const fullUrl = window.location.href;
  console.log("👌" + fullUrl);
  console.log("❤️" + API_URL);
  const navigate = useNavigate();
  const [screenIndex, setScreenIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState('');
  const [volunteerName, setVolunteerName] = useState('');
  const [mealDescription, setMealDescription] = useState('');
  const [reminderDays, setReminderDays] = useState(2);
  const [family, setFamily] = useState<MealTrains | null>(null);
  const [notes, setNotes] = useState('');
  const [availableDates, setAvailableDates] = useState<MealTrainDates[]>([]);
  const [isCopied, setIsCopied] = useState(false);
  const [currentObj, setCcurrentObj] = useState<MealTrainDates>()
  const { familyId } = useParams();
  const location = useLocation();
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };
  
const submitMealSignup = async () => {
  let user = null;
  try {
    user = await fetchAuthenticatedUser();
  } catch (err) {
    console.warn('⚠️ לא מחובר - מפנה לדף התחברות', err);
    const currentPath = location.pathname + location.search;
    navigate(`/login?redirect=${encodeURIComponent(currentPath)}`);
    return;
  }

  if (!familyId && !selectedDate && !volunteerName && !mealDescription && !user.id) return;

  const payload = {
    meal_train_id: familyId,
    date: new Date(selectedDate).toISOString(),
    volunteer_name: volunteerName,
    notes: notes,
    meal_description: mealDescription,
    reminder_days: reminderDays,
    volunteer_user_id: user.id,
  };

  try {
    console.log('📦 נתונים שנשלחים:', payload);
    await MealTrainService.submitMealSignup(currentObj?.id, payload);
    goToNext();
  } catch (error) {
    console.error('❌ שגיאה בשליחת ההתנדבות:', error);
    toast.error('אירעה שגיאה בשמירת ההתנדבות. נסו שוב.');
  }
};

  useEffect(() => {
  const loadData = async () => {
    try {
      if (!familyId) return;

      const family = await MealTrainService.fetchFamilyDetails(familyId);
      setFamily(family);

      const dates = await MealTrainService.fetchMealDates(familyId);
      setAvailableDates(dates);
    } catch (err) {
      console.error('❌ שגיאה בטעינת המידע:', err);
    }
  };

  loadData();
}, [familyId]);

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString('he-IL', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }

  function getDaysCount(start: string, end: string) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diff = endDate.getTime() - startDate.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
  }

  const goToNext = () => {
    if (screenIndex === 2) {
      if (!volunteerName.trim()) return toast.error('אנא הכניסו את השם שלכם');
      if (!mealDescription.trim()) return toast.error('אנא ציינו מה תביאו');
    }
    setScreenIndex(i => i + 1);
  };

  const goToPrev = () => setScreenIndex(i => i - 1);

  const selectReminder = (days: number) => setReminderDays(days);

  const screens = [
    // Screen 0 - Invitation
    <div className="p-6 text-center space-y-4">
      <div className="text-6xl">🍲</div>
      <h2 className="text-2xl font-bold">{t('MealTrainJoin.invit')}</h2>
      <p className="text-gray-600">{t('MealTrainJoin.join__message')}</p>
      <div className="bg-white rounded-xl shadow p-4">
        <h3 className="text-lg font-semibold">{t('MealTrainJoin.family')} {family?.name}</h3>
        <p className="text-sm">📍 {family?.address}</p>
        {(() => {
          const startDateStr = family?.startDate && typeof family.startDate === 'string' ? formatDate(family.startDate) : '—';
          const endDateStr = family?.endDate && typeof family.endDate === 'string' ? formatDate(family.endDate) : '—';
          const daysCount = family?.startDate && family?.endDate && typeof family.startDate === 'string' && typeof family.endDate === 'string'
            ? getDaysCount(family.startDate, family.endDate)
            : '—';
          return (
            <p className="text-sm">
              📅 {startDateStr} - {endDateStr} ({daysCount} {t('MealTrainJoin.days')})
            </p>
          );
        })()}
        <p className="text-sm">👥  {t('MealTrainJoin.adults')}{family?.adults}+  {t('MealTrainJoin.childrens')}{family?.childrens} </p>
        {/* <p className="text-sm text-black bg-yellow-200">🕐 משלוח מועדף: {family?.deliveryTime}</p> */}
        <p className="text-sm">🕐{t('MealTrainJoin.preferreddelivery')}: {family?.deliveryTime || t('MealTRainJoin.notDlivery')}</p>
        <div className="bg-yellow-100 text-yellow-800 p-2 mt-2 rounded text-xs">
          <strong>חשוב לדעת:</strong> {family?.dietaryInfo}
        </div>
      </div>
      <button className="w-full bg-blue-600 text-white p-3 rounded" onClick={goToNext}>{t('MealTrainJoin.wantsHelp')}💪</button>
      <button className="w-full border border-blue-600 text-blue-600 p-3 rounded mt-2" onClick={goToNext}>{t('MealTrainJoin.seeDetails')} 👀</button>
    </div>,

    // Screen 1 - Select Date
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">{t('MealTrainJoin.chooseDate')}</h2>
      <div className="space-y-2">
        {availableDates.map((dateObj: MealTrainDates) => {
          console.log("Available Date Object:", dateObj);
          const rawDate = typeof dateObj.date === 'string' ? dateObj.date : dateObj.date.toISOString().split('T')[0];
          const formatted = formatDate(rawDate); // פונקציה שלך לעיצוב תאריך
          
          const isTaken = !!dateObj.volunteerName
          console.log( dateObj+"   "+isTaken);
          
          return (
            <button
              key={rawDate}
              className={`w-full border p-2 rounded text-right flex items-center justify-between ${isTaken ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-white hover:bg-blue-100'
                }`}
              onClick={() => {
                if (!isTaken) {
                  setSelectedDate(rawDate);
                  setCcurrentObj(dateObj);
                  goToNext();
                }
              }}
              disabled={isTaken}
            >
              <span className="text-right">{formatted}</span>
              <span
                className={`text-sm px-3 py-1 rounded-full font-semibold ${isTaken ? 'bg-gray-100 text-gray-500' : 'bg-green-100 text-green-800'
                  }`}
              >
                {isTaken ? t('MealTrainJoin.occupied') : t('MealTrainJoin.available')}
              </span>
            </button>

          );
        })}
      </div>
    </div>,
    // Screen 2 - Volunteer Form
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold text-center">{t('MealTrainJoin.volunteertoMeal')} </h2>
      <div className="text-center bg-blue-100 text-blue-800 p-2 rounded">📅 {selectedDate}</div>
      <input className="form-input w-full" placeholder={t('MealTrainJoin.name')} value={volunteerName} onChange={e => setVolunteerName(e.target.value)} />
      <input className="form-input w-full" placeholder={t('MealTrainJoin.bring')} value={mealDescription} onChange={e => setMealDescription(e.target.value)} />
      <input className="form-input w-full" placeholder={t('MealTrainJoin.notes')} value={notes} onChange={e => setNotes(e.target.value)} />
      <div>
        <label className="block font-semibold mb-1">{t('MealTrainJoin.reminder')}</label>
        <div className="flex gap-2">
          {[1, 2, 3].map(d => (
            
            <div key={d} className={`flex-1 p-2 text-center border rounded cursor-pointer ${reminderDays === d ? 'bg-blue-100 border-blue-600' : ''}`} onClick={() => selectReminder(d)}>
              {d === 1 ? t('MealTrainJoin.reminder1') : d === 2 ? t('MealTrainJoin.reminder2') :t('MealTrainJoin.reminder3')}
            </div>
          ))}
        </div>
      </div>
      <button className="w-full bg-blue-600 text-white p-3 rounded" onClick={submitMealSignup}>{t('MealTrainJoin.approval')} </button>
    </div>,

    // Screen 3 - Success
    <div className="p-6 text-center space-y-4">
      <div className="text-5xl">🎉</div>
      <h2 className="text-xl font-bold">{t('MealTrainJoin.thanks')}</h2>
      <p className="text-gray-600">{t('MealTrainJoin.joinSuccess')}</p>
      <div className="bg-green-100 text-green-800 p-3 rounded text-sm text-right mb-4">
        <p><strong>{t('MealTrainJoin.date')}:</strong> {selectedDate}</p>
        <p><strong>{t('MealTrainJoin.meal')}:</strong> {mealDescription}</p>
        <p><strong>{t('MealTrainJoin.reminderTime')}:</strong> {reminderDays === 1 ? t('MealTrainJoin.reminder1') : reminderDays === 2 ? t('MealTrainJoin.reminder2') : t('MealTrainJoin.reminder3')}</p>
        <p><strong>{t('MealTrainJoin.address')}:</strong> {family?.address || 'לא צוין'}</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
        <p className="text-sm text-gray-600 mb-3 text-center"> {t('MealTrainJoin.shareLink')}</p>
        <div className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
          <span className="text-sm text-gray-700 break-all px-3 py-2 bg-white rounded">
            {fullUrl}
          </span>
          <button
            onClick={handleCopyLink}
            title="העתק קישור"
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <Square2StackIcon className="h-5 w-5 text-gray-600 hover:text-gray-800" />
          </button>
        </div>
        {isCopied && (
          <div className="text-center mt-2 text-sm text-green-600">
            {t('MealTrainJoin.copyLinkSuccess')}
          </div>
        )}
      </div>
      <button className="w-full bg-blue-600 text-white p-3 rounded mt-4" onClick={() => navigate(`/mealTrain`)}>{t('MealTrainJoin.WatchtheMealTrain')}</button>
    </div>
  ];

  return (
    <div className="max-w-md mx-auto">
      {screens[screenIndex]}
      {screenIndex > 0 && screenIndex < screens.length - 1 && (
        <div className="flex justify-between mt-4">
          <button onClick={goToPrev}>{t('MealTrainJoin.back')}</button>
        </div>
      )}
    </div>
  );
};

export default ShareRemindersScreen;
