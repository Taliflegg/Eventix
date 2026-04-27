import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchPlatformAdoptionRate } from '../services/userActivityService';
import CardWrapper from './CardWrapper';

const PlatformAdoptionRateCard: React.FC = () => {
  const [adoptionRate, setAdoptionRate] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { t }: { t: (key: string) => string } = useTranslation();

  useEffect(() => {
    const fetchAdoptionRate = async () => {
      try {
        const response = await fetchPlatformAdoptionRate();
       
        setAdoptionRate(response.adoptionRate);
      } catch (err: any) {
        setError(err.message);
        console.error("Error fetching platform adoption rate:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdoptionRate();
  }, [t]);

  return (
    <CardWrapper
      title={t('PlatformAdoptionRateCard.title')}
      icon={<span className="text-4xl text-purple-600"></span>}
      value={
        loading ? (
          <span className="text-3xl font-bold text-gray-700">
            {t('common.loading')}...
          </span>
        ) : error ? (
          <span className="text-xl font-bold text-red-600">
            {t('common.error')}: {error}
          </span>
        ) : (
          <span className="text-4xl font-bold text-gray-800">
            {adoptionRate !== null ? `${adoptionRate}%` : 0}
          </span>
        )
      }
      description={t('PlatformAdoptionRateCard.description')}
    />
  );
};

export default PlatformAdoptionRateCard;
