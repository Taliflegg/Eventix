import React, { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { userevent } from '../services/usersService';
import { ApexOptions } from 'apexcharts';
import { useMediaQuery } from 'react-responsive';

interface EventData {
    range: string;
    count: number;
}

const EventDistributionChart = () => {
    const isMobile = useMediaQuery({ maxWidth: 767 });
    const [data, setData] = useState<EventData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const ApexChart = ReactApexChart as any;

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const distribution = await userevent();
                if (distribution && typeof distribution === 'object') {
                    const chartData: EventData[] = [
                        { range: '1-10', count: distribution['1-10'] || 0 },
                        { range: '11-20', count: distribution['11-20'] || 0 },
                        { range: '21-50', count: distribution['21-50'] || 0 },
                        { range: '50+', count: distribution['50+'] || 0 },
                    ];
                    setData(chartData);
                } else {
                    setData([]);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                setError("Failed to fetch data.");
                setData([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const colors = ['#008FFB', '#00E396', '#FEB019', '#FF4560'];

    const series = [
        {
            name: 'Event Distribution',
            data: data.map((item, index) => ({
                x: item.range,
                y: item.count,
                fillColor: colors[index % colors.length],
            })),
        },
    ];

    const options: ApexOptions = {
        chart: {
            type: 'bar',
            height: '100%', // מתאימים לגובה של המכל החיצוני
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
            categories: data.length > 0 ? data.map(item => item.range) : ['No Data'],
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
                text: 'Event Count',
            },
            labels: {
                style: {
                    fontSize: isMobile ? '10px' : '12px',
                },
            },
        },
        colors: colors.slice(0, data.length),
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
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="bg-white rounded-2xl shadow-md p-6 h-full w-full box-border flex flex-col">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
                Event Distribution Chart
            </h2>
            <div style={{ flexGrow: 1, width: '100%' }}>
                <ApexChart
                    options={options}
                    series={series}
                    type="bar"
                    height="100%"
                    width="100%"
                />
            </div>
        </div>
    );
};

export default EventDistributionChart;








