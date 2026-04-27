import { ApexOptions } from 'apexcharts';
import { useCallback, useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { useTranslation } from 'react-i18next';
import { useMediaQuery } from 'react-responsive';
import { apiService } from '../services/apiServices';

const ApexChart = ReactApexChart as any;

type RawEntry = {
  month: string;
  app_name: string;
  active_users: number;
};

type SeriesEntry = {
  name: string;
  data: number[];
};

export default function AcquisitionChart() {
  const { t }: { t: (key: string) => string } = useTranslation();
  const [series, setSeries] = useState<SeriesEntry[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const isMobile = useMediaQuery({ maxWidth: 767 });

  const formatChartData = useCallback((raw: RawEntry[]): { categories: string[]; series: SeriesEntry[] } => {
    const dataMap: { [appName: string]: { [month: string]: number } } = {};
    const monthSet = new Set<string>();
    raw.forEach(({ month, app_name, active_users }) => {
      monthSet.add(month);
      if (!dataMap[app_name]) dataMap[app_name] = {};
      dataMap[app_name][month] = active_users;
    });

    const sortedMonths = Array.from(monthSet).sort(); // YYYY-MM
    if (sortedMonths.length === 0) return { categories: [], series: [] };

    const first = sortedMonths[0];
    const last = sortedMonths[sortedMonths.length - 1];
    const allMonths = getMonthRange(first, last);

    const series: SeriesEntry[] = Object.entries(dataMap).map(([app, data]) => ({
      name: app,
      data: allMonths.map((month) => data[month] ?? 0),
    }));

    return { categories: allMonths, series };
  }, []);

  function getMonthRange(start: string, end: string): string[] {
    const result: string[] = [];
    const [startY, startM] = start.split('-').map(Number);
    const [endY, endM] = end.split('-').map(Number);
    let y = startY;
    let m = startM;
    while (y < endY || (y === endY && m <= endM)) {
      result.push(`${y}-${String(m).padStart(2, '0')}`);
      m++;
      if (m > 12) {
        m = 1;
        y++;
      }
    }
    return result;
  }

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await apiService.get<RawEntry[]>('/user-activity/analytics/user-acquisition');
        console.log(':bar_chart: Raw acquisition data from API:', res.data);
        const formatted = formatChartData(res.data);
        setCategories(formatted.categories);
        setSeries(formatted.series);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [formatChartData]);

  const isSinglePoint = categories.length === 1;
  const hasData = categories.length > 0 && series.length > 0;

  const options: ApexOptions = {
    chart: {
      type: 'line',
      zoom: { enabled: !isSinglePoint },
      toolbar: { show: !isSinglePoint },
    },
    stroke: {
      width: isSinglePoint ? 0 : 3,
      curve: 'smooth',
    },
    markers: {
      size: isSinglePoint ? 6 : 4,
      strokeWidth: isSinglePoint ? 2 : 1,
      hover: { sizeOffset: 2 },
    },
    tooltip: {
      shared: true,
      intersect: false,
      theme: 'light',
    },
    legend: {
      position: 'bottom',
      fontSize: isMobile ? '12px' : '14px',
      itemMargin: {
        horizontal: isMobile ? 5 : 10,
      },
    },
    xaxis: {
      categories,
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
        text: t('yaxis_active_users') || 'Active Users',
      },
      labels: {
        style: {
          fontSize: isMobile ? '10px' : '12px',
        },
      },
    },
    colors: ['#008FFB', '#00E396', '#FEB019', '#FF4560', '#775DD0'],
    grid: {
      padding: {
        left: isMobile ? 0 : 20,
        right: isMobile ? 0 : 20,
      },
    },
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 h-full w-full box-border flex flex-col">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
        {t('chart_title') || 'Acquisition Chart'}
      </h2>
      {loading ? (
        <div className="flex justify-center py-10">
          <span className="loading loading-spinner loading-lg" />
        </div>
      ) : hasData ? (
        <div style={{ flexGrow: 1, width: '100%' }}>

          <ApexChart
            options={options}
            series={series}
            type="line"
            height="100%"
            width="100%"
          />
        </div>
      ) : (
        <div className="text-center text-gray-500 py-10">
          {t('no_data_available') || 'אין נתונים להצגה.'}
        </div>
      )}
    </div>
  );
}
