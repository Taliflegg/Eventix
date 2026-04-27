import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Event } from '@eventix/shared';
import { fetchAuthenticatedUser } from '../services/usersService';

export interface EventCardProps {
  event: Event;
  onClick?: (event: Event) => void;
  onDelete?: (id: string) => void;
  isOrganizer?: boolean;
  currentUserId?: string | null;
}


const EventCard: React.FC<EventCardProps> = ({ event, onClick, onDelete, isOrganizer,currentUserId }) => {
  debugger
    const { t }: { t: (key: string) => string } = useTranslation();
//   const [currentUserId, setCurrentUserId] = useState<string | null>(null);
// const [isLoadingUser, setIsLoadingUser] = useState(true);
// useEffect(() => {
//   const loadUser = async () => {
//     try {
//       const user = await fetchAuthenticatedUser();
//       setCurrentUserId(user.id);
//     } catch (err) {
//       console.error('Failed to fetch current user', err);
//     } finally {
//       setIsLoadingUser(false);
//     }
//   };
//   loadUser();
// }, []);
// // בדיקה מתי currentUserId משתנה:
// useEffect(() => {
//   console.log('currentUserId updated:', currentUserId);
// }, [currentUserId]);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('he-IL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(event.id);
  };

  return (
    <div
      onClick={() => onClick?.(event)}
      className={`
        border border-gray-300 rounded-lg p-4 m-2 bg-gray-50 transition-all duration-200 relative
        ${onClick ? 'hover:bg-gray-100 hover:-translate-y-0.5 hover:shadow-md cursor-pointer' : ''}
        w-full max-w-xl mx-auto
      `}
    >
      <h3 className="text-base font-medium text-gray-800 bg-gray-50 px-2 absolute -top-3 left-1/2 transform -translate-x-1/2">{event.title}</h3>

      <div>
        <p className="my-1 text-sm text-gray-600">
        <strong>{t('EventCard.when')}:</strong> {formatDate(event.datetime)}
      </p>
      <p className="my-1 text-sm text-gray-600">
        <strong>{t('EventCard.where')}:</strong> {event.location}
      </p>
      <p className="my-1 text-sm text-gray-600">
        <strong>{t('EventCard.expected guests')}:</strong> {event.expectedCount}
      </p>
    
{currentUserId!=null && (
  <p className="my-1 text-sm text-gray-600 text-center">
    <strong>{t('EventCard.role')}:</strong>{' '}
    {event.createdBy === currentUserId
      ? t('EventCard.organizer')
      : t('EventCard.participant')}
  </p>
)}
      <p className="my-1 text-sm text-gray-600 text-center">
        <strong>כמות משתתפים מוגבלת?</strong>{' '}
        {event.isLimited ? (
          <span className="text-red-600 font-semibold">כן</span>
        ) : (
          <span className="text-green-600 font-semibold">לא</span>
        )}
      </p>

      {isOrganizer && (
        <button
          onClick={handleDelete}
          className="mt-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded shadow transition-colors duration-150"
        >
          {t('EventCard.delete')}
        </button>
      )}
      </div>

    </div>
  );
};

export default EventCard;