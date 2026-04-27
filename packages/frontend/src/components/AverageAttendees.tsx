import React, { useEffect, useState } from 'react';
import { FaUsers } from 'react-icons/fa';
import { fetchAverageAttendees } from '../services/analyticsService';
import { supabase } from '../services/supabaseClient';
import { useTranslation } from 'react-i18next';
import CardWrapper from './CardWrapper';
const UsersIcon = FaUsers as unknown as React.FC<React.SVGProps<SVGSVGElement>>;
const AverageAttendeesCard = () => {
  const [average, setAverage] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const { t }: { t: (key: string) => string } = useTranslation();
  const loadAverage = async () => {
    try {
      setLoading(true);
      const result = await fetchAverageAttendees();
      setAverage(result);
    } catch (error) {
      console.error('Error fetching average attendees:', error);
      setAverage(null);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadAverage();
    const channel = supabase
      .channel('realtime-user_event')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'user_events' },
        () => {
          loadAverage();
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  return (
    <CardWrapper
      title={t('AverageAttendeesCard.title')}
      icon={<UsersIcon className="text-4xl text-[#06653F]" />}
      value={
        loading ? (
          <span className="inline-block w-4 h-4 border-2 border-[#045937] border-t-transparent rounded-full animate-spin" />
        ) : (
          <span className="text-4xl font-bold text-gray-800">{average}</span>
        )
      }
      description={
        average !== null
          ? t('AverageAttendeesCard.description')
          : t('AverageAttendeesCard.no_data')
      }
    />
  );
};
export default AverageAttendeesCard;