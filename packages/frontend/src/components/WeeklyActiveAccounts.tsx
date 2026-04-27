import React, { useEffect, useState } from 'react';
import { FaUsers } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import CardWrapper from './CardWrapper';
import { fetchWeeklyActiveAccounts } from '../services/analyticsService';

const AccountsIcon = FaUsers as unknown as React.FC<React.SVGProps<SVGSVGElement>>;

const WeeklyActiveAccounts = () => {
    const [count, setCount] = useState<number | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const { t }: { t: (key: string) => string } = useTranslation();

    useEffect(() => {
        const fetchWeeklyAccounts = async () => {
            try {
                const response = await fetchWeeklyActiveAccounts();
                setCount(response.count);
            } catch (err: any) {
                console.error('Error fetching weekly active accounts:', err);
                setError(err.response?.data?.error || err.message || t('common.unexpectedError'));
            } finally {
                setLoading(false);
            }
        };
        fetchWeeklyAccounts();
    }, [t]);

    return (
        <div className="grid place-items-center space-y-8">
            <CardWrapper
                title={t('WeeklyActiveAccounts.title')}
                icon={<AccountsIcon className="text-4xl text-green-600" />}
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
                            {count ?? t('common.noData')}
                        </span>
                    )
                }
                description={t('WeeklyActiveAccounts.description')}
            />
        </div>
    );
};

export default WeeklyActiveAccounts;