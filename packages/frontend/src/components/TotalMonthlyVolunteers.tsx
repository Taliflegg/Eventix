import { useEffect, useState } from 'react';
import CardWrapper from './CardWrapper';
import { MealTrainService } from '../services/mealTrainService';
import { FaUsers } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';


const UsersIcon = FaUsers as unknown as React.FC<React.SVGProps<SVGSVGElement>>;
const TotalMonthlyVolunteers = () => {
    // const { t } = useTranslation();
    const { t, i18n }: any = useTranslation();
    const [count, setCount] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    useEffect(() => {
        async function fetchData() {
            try {
                const result = await MealTrainService.getWithVolunteers();
                setCount(result.count);
            } catch (err) {
                console.error('', err);
                console.error('Error fetching volunteers', err);
                setError(err instanceof Error ? err.message : 'An error occurred while fetching volunteers');
                setCount(0);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    return (
        <CardWrapper
            title={t('volunteers.title')}
            icon={<UsersIcon className="text-4xl text-[#066513]" />}
            value={
                loading ? (
                    <span className="inline-block w-4 h-4 border-2 border-[#045937] border-t-transparent rounded-full animate-spin" />
                ) : error ? (
                    <span className="text-xl font-bold text-red-600">{t('volunteers.error')}</span>
                ) : (
                    <span className="text-4xl font-bold text-gray-800">
                        {count ?? 0}
                    </span>
                )
            }
            description={t('volunteers.description')}
        />
    );
};

export default TotalMonthlyVolunteers;
