import { MealTrainWithRole } from '@eventix/shared';
import MealTrainCard from './MealTrainCard'; // ודאי שזה הנתיב הנכון
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { MealTrainWithDates } from '@eventix/shared/src';
import { MealTrainService } from '../../services/mealTrainService';
import { useLocation } from 'react-router-dom';



export default function MealTrainDetails() {
  const { t }: { t: (key: string) => string } = useTranslation();
  const { mealTrainId } = useParams<{ mealTrainId: string }>();
  const [mealTrain, setMealTrain] = useState<MealTrainWithDates | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const passedRole = location.state?.role;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTrain = async () => {
      try {
        const data = await MealTrainService.fetchMealTrainById(mealTrainId!);
        setMealTrain(data);
      } catch (err) {
        console.error(err);
        setError(t('MealTrainDetails.error_loading'));
      } finally {
        setLoading(false);
      }
    };

    fetchTrain();
  }, [mealTrainId]);

  if (loading) return <div className="p-8 text-center">{t('MealTrainDetails.loading')}</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!mealTrain) return <div className="p-8 text-center">{t('MealTrainDetails.not_found')}</div>;

  const trainForCard: MealTrainWithRole = {
    ...mealTrain,
    role: passedRole || 'viewer',  
  };

  return (
    <div dir="rtl" className="max-w-2xl mx-auto p-4">
      <button
        onClick={() => navigate('/mealTrain')} 
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        {t('MealTrainDetails.back_to_meal_trains')} 
      </button>
      <h2>{t('MealTrainDetails.mealTrain_details')} </h2>
      {loading && <p>{t('MealTrainDetails.loading details')}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <MealTrainCard train={trainForCard} showActions={false} />
    </div>
  );
}
