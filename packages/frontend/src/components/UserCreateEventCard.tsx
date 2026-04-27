// import React, { useEffect, useState } from 'react';
// import { FaUser } from 'react-icons/fa';
// import { useTranslation } from 'react-i18next';
// import eventService from '../services/eventsService';


// const PrimaryUserIcon = FaUser as unknown as React.FC<React.SVGProps<SVGSVGElement>>;

// const UserCreateEventCard: React.FC = () => {
//   const [usersCount, setUsersCount] = useState<number | null>(null);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);
//   const { t }: { t: (key: string) => string } = useTranslation();

//   useEffect(() => {
//     async function fetchUsersCreateEvents() {
//       try {
//         const usersWithManyEventsCount = await eventService.getUsersWithManyEvents();
//         setUsersCount(usersWithManyEventsCount);
//       } catch (err: any) {
//         setError(err.message || t('common.unexpectedError'));
//       } finally {
//         setLoading(false);
//       }
//     }

//     fetchUsersCreateEvents();
//   }, [t]);

//   return (
//     <div className="bg-gray-100 h-screen grid place-items-center">
//       <div>
//         <div className="flex justify-center mb-8">
//           {/* הכרטיס למידע נוסף (אם צריך) */}
//         </div>
//         <div className="bg-white border border-gray-200 rounded-lg shadow-lg transition-transform duration-300 ease-in-out max-w-xs w-full hover:scale-105">
//           <div className="bg-gray-50 border-b border-gray-200 rounded-t-lg p-4">
//             <h5 className="m-0 text-xl font-semibold text-gray-600">
//               {t('AnalyticsCard.CreatedManyEventsCard.title')}
//             </h5>
//           </div>
//           <div className="p-6">
//             <div className="flex items-center justify-center">
//               <PrimaryUserIcon className="text-4xl text-purple-600 mr-4" />
//               {loading ? (
//                 <h4 className="m-0 text-3xl font-bold text-gray-700">
//                   {t('common.loading')}...
//                 </h4>
//               ) : error ? (
//                 <h4 className="m-0 text-xl font-bold text-red-600">{error}</h4>
//               ) : (
//                 <h4 className="m-0 text-3xl font-bold text-gray-800">
//                   {usersCount ?? 0}
//                 </h4>
//               )}
//             </div>
//             <p className="m-0 text-base text-gray-700 mt-0">
//               {t('AnalyticsCard.CreatedManyEventsCard.description')}
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>

//   );
// };

// export default UserCreateEventCard;
// import React, { useEffect, useState } from 'react';
// import { FaUser } from 'react-icons/fa';
// import { useTranslation } from 'react-i18next';
// import eventService from '../services/eventsService';
// import CardWrapper from './CardWrapper';

// const PrimaryUserIcon = FaUser as unknown as React.FC<React.SVGProps<SVGSVGElement>>;

// const UserCreateEventCard: React.FC = () => {
//   const [usersCount, setUsersCount] = useState<number | null>(null);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);
//   const { t }: { t: (key: string) => string } = useTranslation();

//   useEffect(() => {
//     async function fetchUsersCreateEvents() {
//       try {
//         const usersWithManyEventsCount = await eventService.getUsersWithManyEvents();
//         setUsersCount(usersWithManyEventsCount);
//       } catch (err: any) {
//         setError(err.message || t('common.unexpectedError'));
//       } finally {
//         setLoading(false);
//       }
//     }

//     fetchUsersCreateEvents();
//   }, [t]);

//   return (
//     <CardWrapper
//       title={t('AnalyticsCard.CreatedManyEventsCard.title')}
//       icon={<PrimaryUserIcon className="text-4xl text-purple-600" />}
//       value={
//         loading ? (
//           <span className="text-3xl font-bold text-gray-700">
//             {t('common.loading')}...
//           </span>
//         ) : error ? (
//           <span className="text-xl font-bold text-red-600">
//             {error}
//           </span>
//         ) : (
//           <span className="text-4xl font-bold text-gray-800">
//             {usersCount ?? 0}
//           </span>
//         )
//       }
//       description={t('AnalyticsCard.CreatedManyEventsCard.description')}
//     />
//   );
// };

// export default UserCreateEventCard;
import React, { useEffect, useState } from 'react';
import { FaUser } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import eventService from '../services/eventsService';
import CardWrapper from './CardWrapper';
const PrimaryUserIcon = FaUser as unknown as React.FC<React.SVGProps<SVGSVGElement>>;
const UserCreateEventCard: React.FC = () => {
  const [usersCount, setUsersCount] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { t }: { t: (key: string) => string } = useTranslation();
  useEffect(() => {
    async function fetchUsersCreateEvents() {
      try {
        const usersWithManyEventsCount = await eventService.getUsersWithManyEvents();
        setUsersCount(usersWithManyEventsCount);
      } catch (err: any) {
        setError(err.message || t('common.unexpectedError'));
      } finally {
        setLoading(false);
      }
    }
    fetchUsersCreateEvents();
  }, [t]);
  return (
    <CardWrapper
      title={t('AnalyticsCard.CreatedManyEventsCard.title')}
      icon={<PrimaryUserIcon className="text-4xl text-green-600" />}
      value={
        loading ? (
          <span className="text-3xl font-bold text-gray-700">
            {t('common.loading')}...
          </span>
        ) : error ? (
          <span className="text-xl font-bold text-red-600">
            {error}
          </span>
        ) : (
          <span className="text-4xl font-bold text-gray-800">
            {usersCount ?? 0}
          </span>
        )
      }
      description={t('AnalyticsCard.CreatedManyEventsCard.description')}
    />
  );
};
export default UserCreateEventCard;









