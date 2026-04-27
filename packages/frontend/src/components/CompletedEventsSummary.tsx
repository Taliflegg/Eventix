import React, { useEffect, useState } from 'react';
import { FaCheckCircle } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import eventService from '../services/eventsService';
import CardWrapper from './CardWrapper';

// ⚠️ תיקון חשוב לטיפוס של האייקון:
const CheckIcon = FaCheckCircle as unknown as React.FC<React.SVGProps<SVGSVGElement>>;

const CompletedEventsCard: React.FC = () => {
  const [completedCount, setCompletedCount] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { t }: { t: (key: string) => string } = useTranslation();
  useEffect(() => {
    async function fetchCompletedEvents() {
      try {
        const events = await eventService.getCompletedEvents();
        setCompletedCount(events.length);
      } catch (err: any) {
        setError(err.message || t('common.unexpectedError'));
      } finally {
        setLoading(false);
      }
    }
    fetchCompletedEvents();
  }, [t]);
  return (
    <CardWrapper
      title={t('AnalyticsCard.CompletedEventsCard.title')}
      icon={<CheckIcon className="text-4xl text-green-600" />}
      value={
        loading ? (
          <span className="text-3xl font-bold text-gray-700">
            {t('common.loading')}...
          </span>
        ) : error ? (
          <span className="text-xl font-bold text-red-600">
            {error}
          </span>
        ) : (
          <span className="text-4xl font-bold text-gray-800">
            {completedCount ?? 0}
          </span>
        )
      }
      description={t('AnalyticsCard.CompletedEventsCard.description')}
    />
  );
};
export default CompletedEventsCard;