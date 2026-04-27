import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaUser } from 'react-icons/fa';
import CardWrapper from './CardWrapper';
import { supabase } from '../services/supabaseClient';
import { getOverallMonthlyActiveUsers } from '../services/userActivityService';



const PrimaryUserIcon = FaUser as unknown as React.FC<React.SVGProps<SVGSVGElement>>;
const MonthlyActiveUsersCard = () => {
  const { t }: { t: (key: string) => string } = useTranslation();
  const [monthlyActiveUsers, setMonthlyActiveUsers] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;

      console.log('[fetchData] מבצע קריאה לשרת עבור שנה:', year, 'חודש:', month);

      const responseData = await getOverallMonthlyActiveUsers(year, month);

      const count = responseData?.data?.totalMonthlyActiveUsers;
      if (typeof count === 'number') {
        console.log('[fetchData] מספר משתמשים פעילים החודש:', count);
        setMonthlyActiveUsers(count);
      } else {
        console.warn('[fetchData] אין מספר משתמשים תקין, שומר ערך קודם');
        // אפשר לשקול לא לגעת ב־setError כאן כדי שלא תימחק התוצאה הקודמת
      }


    } catch (err: any) {
      console.error('[fetchData] שגיאה חריגה בעת שליפת נתונים:', err);
      setError(err.message || t('common.unexpectedError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('[useEffect] טעינה ראשונית');
    fetchData();

    const channel = supabase
      .channel('monthly-active-users-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'user_activity' },
        (payload) => {
          console.log(':arrows_counterclockwise: [Realtime] שינוי בטבלת user_activity:', payload);
          fetchData();
        }
      )
      .subscribe();

    return () => {
      console.log('[useEffect cleanup] מסיר את הערוץ');
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <CardWrapper
      title={t('MonthlyActiveUsersCard.title')}
      icon={<PrimaryUserIcon className="text-4xl text-green-600" />}
      value={
        loading ? (
          <span className="inline-block w-4 h-4 border-2 border-[#045937] border-t-transparent rounded-full animate-spin" />
        ) : error ? (
          <span className="text-xl font-bold text-red-600">
            {t('common.error')}: {error}
          </span>
        ) : (
          <span className="text-4xl font-bold text-gray-800">
            {monthlyActiveUsers ?? t('common.noData')}
          </span>
        )
      }
      description={t('MonthlyActiveUsersCard.description')}
    />
  );
};

export default MonthlyActiveUsersCard;
