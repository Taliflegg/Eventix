import React, { useEffect, useState } from 'react';
import { getRequest } from '../services/apiServices';
import { FaChartBar } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import CardWrapper from './CardWrapper';
import { useAuth } from '../context/AuthContext';
import { fetchPlansThisWeek } from '../services/analyticsService';
const PlansIcon = FaChartBar as unknown as React.FC<React.SVGProps<SVGSVGElement>>;

const ShabbatSyncAnalytics = () => {

    const [count, setCount] = useState<number | null>(null);    
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const { t }: { t: (key: string) => string } = useTranslation();

    useEffect(() => {
        const ShabbatSyncAnalytics = async () => {
            try {
                const response = await fetchPlansThisWeek();
                setCount(response.count);
            } catch (err: any) {
                console.error('Error fetching weekly active accounts:', err);
                setError(err.response?.data?.error || err.message || t('common.unexpectedError'));
            } finally {
                setLoading(false);
            }
        };
        ShabbatSyncAnalytics();
    }, [t]);

    return (
        <div className="grid place-items-center space-y-8">
            <CardWrapper
                title={t('ShabbatSyncAnalytics.title')}
                icon={<PlansIcon className="text-4xl text-green-600" />}
                value={
                    loading ? (
                        <span className="inline-block w-4 h-4 border-2 border-[#045937] 
                        border-t-transparent rounded-full animate-spin" />
                    ) : error ? (
                        <span className="text-xl font-bold text-red-600">
                            {t('common.error')}: {error}
                        </span>
                    ) : (
                        <span className="text-4xl font-bold text-gray-800">
                           {count ?? 0}
                        </span>
                    )
                }
                description={t('ShabbatSyncAnalytics.description')}
            />
        </div>
    );
};

export default ShabbatSyncAnalytics;
