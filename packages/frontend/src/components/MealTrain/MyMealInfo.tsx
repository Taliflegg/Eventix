import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MealTrainService } from '../../services/mealTrainService';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { he, enUS } from 'date-fns/locale';
import i18n from '../../i18n/i18n';

function MyMealInfo() {
    const { t }: { t: (key: string) => string } = useTranslation();
    const { mealTrainId } = useParams<{ mealTrainId: string }>();
    const [myMeal, setMyMeal] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (!mealTrainId) return;

        MealTrainService.getMyMealForTrain(mealTrainId)
            .then((data) => setMyMeal(data))
            .catch(() => setError(t('MealTrainCard.error_loading_meal')))
            .finally(() => setLoading(false));
    }, [mealTrainId, t]); 


    if (loading) return <p>{t('MealTrainCard.loading')}</p>;
    if (error) return <p>{error}</p>;
    if (!myMeal) return <p>{t('MealTrainCard.no_meal_found')}</p>;

    const locale = i18n.language.startsWith('he') ? he : enUS;
    const formattedDate = format(new Date(myMeal.date), 'PPP', { locale });

    return (
        <div className="max-w-2xl mx-auto p-4" dir="rtl">

            <button
                onClick={() => navigate('/mealTrain')}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
                {t('MealTrainDetails.back_to_meal_trains')}
            </button>

            <h2 className="text-lg font-bold mt-6">{t('MealTrainCard.my_meal')}</h2>

            <div className="bg-white rounded-xl shadow mb-4 overflow-hidden w-full px-6 py-4">
                <div className="p-4 border-b">
                    <div className="text-sm font-bold text-center text-green-600">
                        {myMeal.volunteerName}
                    </div>
                </div>

                <div className="px-4 pb-4 pt-2 text-sm text-gray-700 space-y-3">
                    <div className="flex items-center">
                        <span className="w-4 ml-2"> 📅 </span>
                        <span><strong> {t('MealTrainCard.date')}:</strong> {formattedDate}</span>
                    </div>

                    <div className="flex items-center">
                        <span className="w-4 ml-2"> 🍽️ </span>
                        <span><strong> {t('MealTrainCard.meal_description')}:</strong> {myMeal.mealDescription}</span>
                    </div>

                    <div className="flex items-center">
                        <span className="w-4 ml-2"> 📝 </span>
                        <span className={myMeal.notes ? '' : 'text-gray-400 italic'}>
                            <strong> {t('MealTrainCard.notes')}:</strong> {myMeal.notes || t('MealTrainCard.no_notes')}
                        </span>
                    </div>

                    <div className="flex items-center">
                        <span className="w-4 ml-2">📍</span>
                        <span>
                            <strong> {t('MealTrainCard.address')}:</strong> {myMeal.meal_trains?.address}
                        </span>
                    </div>

                    <div className="flex items-center">
                        <span className="w-4 ml-2"> 🥗 </span>
                        <span className={myMeal.meal_trains?.dietary_info ? '' : 'text-gray-400 italic'}>
                            <strong> {t('MealTrainCard.dietary_info')}:</strong> {myMeal.meal_trains?.dietary_info || t('MealTrainCard.no_dietary_info')}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MyMealInfo;
