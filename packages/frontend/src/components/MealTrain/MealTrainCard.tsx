import { useTranslation } from 'react-i18next';
import { MealTrainWithRole } from '@eventix/shared';
import { format, differenceInCalendarDays, isBefore, isAfter } from 'date-fns';
import { he, enUS } from 'date-fns/locale';
import i18n from '../../i18n/i18n';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames';
import { MealTrainService } from '../../services/mealTrainService';
import Swal from 'sweetalert2';

export function formatDateRange(startDate: Date | string, endDate: Date | string, language: string): string {
    const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
    const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
    if (!startDate || !endDate) return '---';
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
        rangeStr = language.startsWith('he')
            ? `${startStr} - ${endStr}`
            : `${startStr} - ${endStr}`;
    }

    const daysText = language.startsWith('he')
        ? `${daysCount} ${daysCount === 1 ? 'יום' : 'ימים'}`
        : `${daysCount} ${daysCount === 1 ? 'day' : 'days'}`;

    return `${rangeStr} (${daysText})`;
}

interface Props {
    train: MealTrainWithRole;
    showActions?: boolean; // ברירת מחדל true
}

export default function MealTrainCard({ train, showActions = true }: Props) {
    const { t }: { t: (key: string) => string } = useTranslation();
    const navigate = useNavigate();
    const language = i18n.language;

    const start = new Date(train.startDate);
    const end = new Date(train.endDate);
    const now = new Date();

    // סטטוס: פעיל / עתידי / הושלם
    let status: 'active' | 'upcoming' | 'completed' = 'upcoming';
    if (isBefore(end, now)) status = 'completed';
    else if (isBefore(start, now) && isAfter(end, now)) status = 'active';

    const statusLabel = {
        active: t('MealTrainCard.status.active'),
        upcoming: t('MealTrainCard.status.upcoming'),
        completed: t('MealTrainCard.status.completed'),
    }[status];

    const statusClasses = {
        active: 'text-green-600',
        upcoming: 'text-blue-600',
        completed: 'text-gray-600',
    };

    const roleLabel = {
        admin: t('MealTrainCard.role.admin'),
        volunteer: t('MealTrainCard.role.volunteer'),
        viewer: t('MealTrainCard.role.viewer'),
        adminVolunteer: t('MealTrainCard.role.admin_volunteer')
    }[train.role];

    const roleColor = {
        admin: 'bg-blue-100 text-blue-800',
        volunteer: 'bg-green-100 text-green-800',
        viewer: 'bg-orange-100 text-orange-800',
        adminVolunteer: 'bg-purple-100 text-purple-800'
    }[train.role];

    const handleSendThankYouEmails = async (mealTrainId: string) => {
        try {
            Swal.fire({
                title: t('MealTrainCard.send_emails_question'),
                text: t('MealTrainCard.send_emails_text'),
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: t('MealTrainCard.send_emails_confirm'),
                cancelButtonText: t('MealTrainCard.send_emails_cancel'),
                background: '#fff',
                color: '#333',
                backdrop: `rgba(0,0,0,0.6)`,
            }).then(async (result) => {
                if (result.isConfirmed) {
                    // אם המשתמש אישר, שלח את המייל
                    await MealTrainService.sendThankYouEmails(mealTrainId);
                    Swal.fire(t('MealTrainCard.send_emails_success'), t('MealTrainCard.send_emails_success_text'), 'success');
                } else {
                    Swal.fire(t('MealTrainCard.send_emails_cancel'), t('MealTrainCard.send_emails_cancel_text'), 'info');
                }
            });
        } catch (error) {
            Swal.fire(t('MealTrainCard.send_emails_error'), t('MealTrainCard.send_emails_error_text'), 'error');
        }
    };

    const formattedDateRange = formatDateRange(train.startDate, train.endDate, language);
    const total = train.progress?.total_dates || 0;
    const booked = train.progress?.booked_dates || 0;
    const progressPercent = total ? (booked / total) * 100 : 0;

    return (
        <div className="bg-white rounded-xl shadow mb-4 overflow-hidden">
            <div className="p-4 border-b">
                <div className="flex justify-between items-center mb-1">
                    <h2 className="text-lg font-bold text-gray-800">{train.name}</h2>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${roleColor}`}>
                        {roleLabel}
                    </span>
                </div>
                <div className={`text-sm font-bold text-right ${statusClasses[status]}`}>
                    {statusLabel}
                </div>
            </div>

            <div className="px-4 pb-4 pt-2 text-sm text-gray-700 space-y-2">
                <div className="flex items-center">
                    <span className="w-4 ml-2">📍</span>
                    <span>{train.address}</span>
                </div>

                {/* הצגת טווח התאריכים */}
                <div className="flex items-center">
                    <span className="w-4 ml-2">📅</span>
                    <span className="font-bold">{formattedDateRange}</span>
                </div>

                <div className="flex items-center">
                    <span className="w-4 ml-2">👥</span>
                    <span>
                        {t('MealTrainCard.people_count')}: {train.adults} {t('MealTrainCard.adults')} + {train.childrens} {t('MealTrainCard.children')}
                    </span>
                </div>

                <div className="flex items-center">
                    <span className="w-4 ml-2">🕐</span>
                    <span>{t('MealTrainCard.delivery_time')}: {train.deliveryTime}</span>
                </div>

                <div className="flex items-center">
                    <span className="w-4 ml-2">🥗</span>
                    <span className={classNames(!train.dietaryInfo && 'text-gray-400 italic')}>
                        {train.dietaryInfo || t('MealTrainCard.no_dietary_info')}
                    </span>
                </div>

                {showActions && (
                    <div>
                        {/* פס התקדמות */}
                        <div className="mt-2">
                            <div className="text-xs mb-1">
                                {t('MealTrainCard.registration_progress')}: {booked}/{total} {t('MealTrainCard.meals')}
                            </div>
                            <div className="w-full h-2 bg-gray-200 rounded">
                                <div className="h-2 bg-green-500 rounded" style={{ width: `${progressPercent}%` }}></div>
                            </div>
                        </div>

                        {/* כפתורים */}
                        <div className="mt-3 flex gap-2">
                            {/* כפתור צפייה */}
                            <button
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-semibold"
                                onClick={() => navigate(`/meal-trains/${train.id}`, { state: { role: train.role } })}
                            >
                                {t('MealTrainCard.view')}
                            </button>

                            {/* כפתור התנדבות */}
                            {(train.role !== 'volunteer' && train.role !== 'adminVolunteer') && status !== 'completed' && progressPercent !== 100 && (
                                <button
                                    className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 text-sm font-semibold"
                                    onClick={() => navigate(`/shareRemindersScreen/${train.id}`)}
                                >
                                    {t('MealTrainCard.volunteer')}
                                </button>
                            )}
                            {/* כפתור ניהול */}
                            {train.role !== 'volunteer' && (
                                <button
                                    className="flex-1 px-4 py-2 bg-gray-300 text-gray-900 rounded-md hover:bg-gray-400 text-sm font-semibold"
                                    onClick={() => navigate(`/meal-trains/${train.id}/manage`)}
                                >
                                    {t('MealTrainCard.manage')}
                                </button>
                            )}

                            {/* כפתור תודות */}
                            {status === 'completed' && train.role !== 'volunteer' && (
                                <button
                                    onClick={() => handleSendThankYouEmails(train.id)}
                                    className="flex-1 px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 text-sm font-semibold"
                                >
                                    {t('MealTrainCard.thank_you')}
                                </button>
                            )}

                            {/* כפתור הארוחה שלי */}
                            {(train.role === 'volunteer' || train.role === 'adminVolunteer') && (
                                <button
                                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-semibold"
                                    onClick={() => navigate(`/meal-trains/${train.id}/my-hosting`)}
                                >
                                    {t('MealTrainCard.my_meal')}
                                </button>
                            )}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}

