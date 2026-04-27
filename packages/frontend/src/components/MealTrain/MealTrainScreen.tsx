import React, { useEffect, useState } from 'react';
import MealTrainCard from './MealTrainCard';
import { useTranslation } from 'react-i18next';
import { MealTrainService } from '../../services/mealTrainService';
import { MealTrainWithRole } from '@eventix/shared';
import { useNavigate } from 'react-router-dom';
import { fetchAuthenticatedUser } from '../../services/usersService';

function MealTrainScreen() {
  const { t }: { t: (key: string) => string } = useTranslation();
  const [filter, setFilter] = useState<'all' | 'admin' | 'volunteer' | 'viewer'>('all');
  const [mealTrains, setMealTrains] = useState<MealTrainWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>(''); // הסטייט עבור חיפוש

  const navigate = useNavigate();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await fetchAuthenticatedUser();
        setCurrentUserId(user?.id);
      } catch (err) {
        console.error('Failed to fetch current user', err);
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    const loadMealTrains = async () => {
      setLoading(true);
      try {
        const trains = await MealTrainService.getMyMealTrains();
        const sortedTrains = trains.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setMealTrains(sortedTrains);
      } catch (err: any) {
        console.error(err);
        setError(t('MyMealTrain.error_loading_mealTrain'));
      } finally {
        setLoading(false);
      }
    };
    loadMealTrains();
  }, []);

  const filteredMealTrainsByRole = mealTrains.reduce((acc: MealTrainWithRole[], train) => {
    // הגדרת משתנים לבדיקת אם המשתמש מנהל או מתנדב
    const isManager = train.adminUserId === currentUserId;  // צריך לוודא שה-ID של המשתמש תואם
    const isVolunteer = train.role === 'volunteer'; // או אם יש לך ID למתנדב, בדוק אותו

    // אם המשתמש גם מנהל וגם מתנדב לאותה ארוחה, הוסף את הארוחה פעם אחת עם שני הרולים
    if (isManager && isVolunteer) {
      // מוודא שהארוחה לא חוזרת
      if (!acc.some(item => item.id === train.id)) {
        acc.push({
          ...train,
          role: 'adminVolunteer' // רול חדש שמציין את שני הרולים
        });
      }
    } else {
      // אם הוא רק מנהל או רק מתנדב, הוסף אותו כרגיל
      if (!acc.some(item => item.id === train.id)) {
        acc.push(train);
      }
    }

    return acc;
  }, []);

  const filteredByRole = filteredMealTrainsByRole.filter((train) => {
    if (filter === 'all') return true;
    if (filter === 'admin') return train.role === 'admin' || train.role === 'adminVolunteer';
    if (filter === 'volunteer') return train.role === 'volunteer' || train.role === 'adminVolunteer';
    if (filter === 'viewer') return train.role === 'viewer';
    return false;
  });

  const filteredByName = filteredByRole.filter((train) =>
    train.name.toLowerCase().includes(searchTerm.toLowerCase())
  );


  // כעת משנה את התגית בזמן הסינון
  const finalMealTrains = filteredByName.map((train) => {
    if (filter === 'admin' && train.role === 'adminVolunteer') {
      return { ...train, role: 'admin' as 'admin' }; // אם מסננים לפי מנהל, הצג את זה כ"מנהל"
    }
    if (filter === 'volunteer' && train.role === 'adminVolunteer') {
      return { ...train, role: 'volunteer' as 'volunteer' }; // אם מסננים לפי מתנדב, הצג את זה כ"מתנדב"
    }
    return train; // אחרת השאר את התגית כפי שהיא
  });

  return (
    <div dir="rtl" className="bg-[#f8f9fa] min-h-screen">
      <div className="bg-white p-4 border-b border-gray-200 flex justify-between items-center z-50">
        <h1 className="text-xl font-semibold text-gray-800">{t('MyMealTrain.my_meal_trains')}</h1>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded-full text-sm font-semibold"
          onClick={() => navigate(`/meal-trains/createMealtrain`)}
        >
          {t('MyMealTrain.create_meal_train')}
        </button>
      </div>

      <div className="max-w-xl mx-auto p-4 pb-20">

        <div className="mb-4">
          <input
            type="text"
            placeholder={t('MyMealTrain.search_placeholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>


        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-4 flex overflow-hidden">
          {['all', 'admin', 'volunteer', 'viewer'].map((tab) => (
            <button
              key={tab}
              className={`flex-1 py-2 text-sm font-bold text-center transition ${filter === tab
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
                }`}
              onClick={() => setFilter(tab as any)}
            >
              {tab === 'all'
                ? t('MyMealTrain.all')
                : tab === 'admin'
                  ? t('MyMealTrain.admin')
                  : tab === 'volunteer'
                    ? t('MyMealTrain.volunteer')
                    : t('MyMealTrain.viewer')}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-500">{t('MyMealTrain.loading')}</div>
        ) : error ? (
          <div className="text-center py-20 text-red-500">{error}</div>
        ) : finalMealTrains.length === 0 ? (
          <div className="text-center text-gray-600 py-20">
            <div className="text-5xl mb-4">🍲</div>
            <div className="text-lg font-bold mb-2">{t('MyMealTrain.no_meal_trains')}</div>
            <div className="text-sm">{t('MyMealTrain.try_filtering')}</div>
          </div>
        ) : (
          finalMealTrains.map((train) => (
            <MealTrainCard key={train.id} train={train} showActions={true} />
          ))
        )}
      </div>
    </div>
  );
}

export default MealTrainScreen;
