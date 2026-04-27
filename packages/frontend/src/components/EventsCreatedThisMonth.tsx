import { CursorArrowRaysIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getEventsCreatedThisMonth } from '../services/eventsService';
import CardWrapper from './CardWrapper';
const EventsCreatedThisMonthAnalytics = () => {
  const [eventCount, setEventCount] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { t }: { t: (key: string) => string } = useTranslation();
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getEventsCreatedThisMonth();
        setEventCount(response.eventsCreatedThisMonth);
      } catch (err: any) {
        console.error(t('AnalyticsCard.EventsCreatedThisMonth.fetch_error'), err);
        setError(
          err.response?.data?.error || err.message || t('common.unexpectedError')
        );
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [t]);
  return (
    <CardWrapper
      title={t('AnalyticsCard.EventsCreatedThisMonth.title') || 'אירועים שנוצרו'}
      icon={
        <CursorArrowRaysIcon
          className="text-4xl text-green-600"
          style={{ width: '50px', height: '50px' }}
        />
      }
      value={
        loading ? (
          <span className="inline-block w-4 h-4 border-2 border-[#045937] border-t-transparent rounded-full animate-spin" />
        ) : error ? (
          <span className="text-xl font-bold text-red-600">{error}</span>
        ) : (
          <span className="text-4xl font-bold text-gray-800">
            {eventCount ?? 0}
          </span>
        )
      }
      description={
        t('AnalyticsCard.EventsCreatedThisMonth.description') || 'מספר האירועים שנוצרו החודש'
      }
    />
  );
};
export default EventsCreatedThisMonthAnalytics;