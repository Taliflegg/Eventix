import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaUserPlus } from 'react-icons/fa';
import { NumCard } from '../services/usersService';
import CardWrapper from './CardWrapper';


const UserPlusIcon = FaUserPlus as unknown as React.FC<React.SVGProps<SVGSVGElement>>;

const AnalyticsCards: React.FC = () => {
  const [newUsers, setNewUsers] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { t }: { t: (key: string) => string } = useTranslation();

  useEffect(() => {
    const fetchNewUsers = async () => {
      try {
        const response = await NumCard();
        if (response.count !== undefined) {
          setNewUsers(response.count);
        }
      } catch (err: any) {
        setError(err.message || t('common.unexpectedError'));
        console.error("Error fetching new users count:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNewUsers();
  }, [t]);

  return (
    <CardWrapper
      title={t('NewUsersCard.title')}
      icon={<UserPlusIcon className="text-4xl text-green-600" />}
      value={
        loading ? (
          <span className="text-3xl font-bold text-gray-700">
            {t('common.loading')}...
          </span>
        ) : error ? (
          <span className="text-xl font-bold text-red-600">
            {t('common.error')}: {error}
          </span>
        ) : (
          <span className="text-4xl font-bold text-gray-800">
            {newUsers ?? 0}
          </span>
        )
      }
      description={t('NewUsersCard.description')}
    />
  );
};

export default AnalyticsCards;

