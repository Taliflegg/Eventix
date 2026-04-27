import { ApexOptions } from 'apexcharts';
import { useEffect, useState } from 'react';

import { useMediaQuery } from 'react-responsive';
import { toast } from 'react-toastify';
import { fetchMonthlyActiveUsersByApp } from '../services/userActivityService';
import ReactApexChart from 'react-apexcharts';
import { supabase } from '../services/supabaseClient';
import { useTranslation } from 'react-i18next';
type ActiveUsers = {
  [appName: string]: number;
};
const MonthlyActiveUsersByApp = () => {
  const ApexChart = ReactApexChart as any;
  const [activeUsers, setActiveUsers] = useState<ActiveUsers>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const { t }: { t: (key: string) => string } = useTranslation();
  const fetchMonthlyActiveUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchMonthlyActiveUsersByApp();
      if (!response) {
        throw new Error('No response from API');
      }
      setActiveUsers(response);
    } catch (error: any) {
      setError(error.message);
      toast.error( t('MonthlyActiveUsersByApp.error') + ':' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonthlyActiveUsers(); // טען פעם ראשונה
    // התחברות לערוץ בזמן אמת על טבלת user_event
    const channel = supabase
      .channel('realtime-user_activity')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'user_activity' },
        (payload) => {
          console.log(':arrows_counterclockwise: שינוי ב-user_activity:', payload);
          fetchMonthlyActiveUsers(); // טען מחדש כל פעם שיש שינוי
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel); // ניקוי בעת השמדה
    };
  }, []);
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  const dataForChart = Object.keys(activeUsers).map((app) => ({
    app_name: app,
    active_users: activeUsers[app],
  }));
  // צבעים שונים לכל עמודה
  const colors = [
    '#008FFB', '#00E396', '#FEB019', '#FF4560', '#775DD0',
    '#FF6347', '#3CB371', '#8A2BE2', '#7FFF00', '#D2691E'
  ];
  const options: ApexOptions = {
    chart: {
      type: 'bar',
      height: 400,
      zoom: { enabled: true },
      toolbar: { show: true },
    },
    plotOptions: {
      bar: {
        borderRadius: 6,
        horizontal: false,
        columnWidth: '50%',
      },
    },
    xaxis: {
      categories: dataForChart.map((item) => item.app_name),
      labels: {
        rotate: isMobile ? -45 : 0,
        style: {
          fontSize: isMobile ? '10px' : '12px',
        },
      },
      tickAmount: isMobile ? 5 : undefined,
    },
    yaxis: {
      title: {
        text: 'Active Users',
      },
      labels: {
        style: {
          fontSize: isMobile ? '10px' : '12px',
        },
      },
    },
    colors: colors.slice(0, dataForChart.length), // מבטח שהצבעים יותאמו למספר העמודות
    grid: {
      padding: {
        left: isMobile ? 0 : 20,
        right: isMobile ? 0 : 20,
      },
    },
    tooltip: {
      shared: true,
      intersect: false,
    },
    legend: {
      position: 'bottom',
      fontSize: isMobile ? '12px' : '14px',
      itemMargin: {
        horizontal: isMobile ? 5 : 10,
      },
    },
  };
  const series = [
    {
      name: 'Active Users',
      data: dataForChart.map((item) => item.active_users),
    },
  ];


  return (
    <div className="bg-white rounded-2xl shadow-md p-6 h-full w-full box-border flex flex-col">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
      {t('MonthlyActiveUsersByApp.title')}
      </h2>
      <div style={{ flexGrow: 1, width: '100%' }}>
      <ApexChart options={options} series={series} type="bar" height="100%" width="100%" />
      </div>
    </div>
  );
};
export default MonthlyActiveUsersByApp;