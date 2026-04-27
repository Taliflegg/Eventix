import { format, differenceInCalendarDays } from 'date-fns';
import { he, enUS } from 'date-fns/locale';

export function formatDateRange(startDate: Date | string, endDate: Date | string, language: string): string {
    const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
    const end = typeof endDate === 'string' ? new Date(endDate) : endDate;

    if (isNaN(start.getTime()) || isNaN(end.getTime())) return '---';

    const locale = language.startsWith('he') ? he : enUS;
    const daysCount = differenceInCalendarDays(end, start) + 1;
    const sameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();

    const formatDayMonth = (date: Date) => {
        const day = format(date, 'd', { locale });
        const month = format(date, 'LLLL', { locale });
        return language.startsWith('he') ? `${day} ב${month}` : `${month} ${day}`;
    };

    let rangeStr: string;

    if (sameMonth) {
        const startDay = format(start, 'd', { locale });
        const endDay = format(end, 'd', { locale });
        const month = format(end, 'LLLL', { locale });
        rangeStr = language.startsWith('he')
            ? `${endDay}-${startDay} ב${month}`
            : `${startDay}-${endDay} ${month}`;
    } else {
        const startStr = formatDayMonth(start);
        const endStr = formatDayMonth(end);
        rangeStr = `${startStr} - ${endStr}`;
    }

    const daysText = language.startsWith('he')
        ? `${daysCount} ${daysCount === 1 ? 'יום' : 'ימים'}`
        : `${daysCount} ${daysCount === 1 ? 'day' : 'days'}`;

    return `${rangeStr} (${daysText})`;
}