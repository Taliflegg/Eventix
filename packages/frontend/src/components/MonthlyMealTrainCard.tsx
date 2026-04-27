import { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { useTranslation } from 'react-i18next';
import { useMediaQuery } from 'react-responsive';
import { apiService } from '../services/apiServices';

const ApexChart = ReactApexChart as any;

interface MonthlyStat {
  month: number;
  count: number;
}

export default function MonthlyMealTrainCard() {
  const { t }: { t: (key: string) => string } = useTranslation();
     
  // פונקציה שמחזירה תרגום או ברירת מחדל
  const getTranslation = (key: string, defaultValue: string) => {
    const translation = t(key);
    console.log(`Translation for '${key}': '${translation}'`);
    return translation !== key ? translation : defaultValue;
  };
     
  const [data, setData] = useState<MonthlyStat[]>([]);
  const [loading, setLoading] = useState(true);
  const isMobile = useMediaQuery({ maxWidth: 767 });

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await apiService.get<{ success: boolean; data: MonthlyStat[] }>('/events/stats/monthly-event-creation');
        setData(res.data.data);
      } catch (err) {
        console.error('Error fetching monthly meal train stats:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const categories = Array.from({ length: 12 }, (_, i) => `${i + 1}`.padStart(2, '0'));
  const counts = Array.from({ length: 12 }, (_, i) => {
    const entry = data.find((item) => item.month === i + 1);
    return entry ? entry.count : 0;
  });

  const options = {
    chart: {
      type: 'line',
      zoom: { enabled: true },
    },
    stroke: {
      curve: 'smooth',
      width: 3,
    },
    markers: {
      size: 4,
    },
    tooltip: {
      shared: true,
      intersect: false,
    },
    xaxis: {
      categories,
      title: {
        // שימוש בתרגום הנכון עבור "חודש"
        text: getTranslation('MonthlyMealTrainCard.month', 'Month'),
      },
      labels: {
        style: {
          fontSize: isMobile ? '10px' : '12px',
        },
      },
    },
    yaxis: {
      title: {
        // שימוש בתרגום הנכון עבור "רכבות ארועים שנוצרו"
        text: getTranslation('MonthlyMealTrainCard.events_created', 'Meal Train Created'),
      },
      labels: {
        style: {
          fontSize: isMobile ? '10px' : '12px',
        },
      },
    },
    colors: ['#FF5733'],
  };

  const series = [
    {
      // שימוש בתרגום הנכון עבור "רכבות ארועים"
      name: getTranslation('MonthlyMealTrainCard.events', 'Events'),
      data: counts,
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 h-full w-full box-border flex flex-col">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          {/* שימוש בתרגום הנכון עבור הכותרת */}
          {getTranslation('MonthlyMealTrainCard.title', 'Meal Created by Month')}
        </h2>
        {loading ? (
          // <div className="flex justify-center py-10">
            <span className="loading loading-spinner loading-lg" />
          // </div>
        ) : (
          <div style={{ flexGrow: 1, width: '100%' }}>
          <ApexChart
            options={options}
            series={series}
            type="line"
            height="100%"
            width="100%"
          />
          </div>
        )}
      </div>
  );
}