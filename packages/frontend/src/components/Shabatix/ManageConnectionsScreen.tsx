import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { deleteRequest } from '../../services/apiServices';
import { getLocationShares } from '../../services/shabbatService';
import { toast } from 'react-toastify';

type Connection = {
  account_b: {
    id: string;
    name: string;
  };
  location_b: {
    id: string;
    name: string | null;
    address: string;
  };
  created_at: string;
  is_mutual: boolean
};

const ManageConnectionsScreen = () => {
  const navigate = useNavigate();
  const { t }: { t: (key: string) => string } = useTranslation();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);

  const loadConnections = async () => {
    try {
      console.log('🔄 loadConnections called');

      const response = await getLocationShares(); // מצפה למבנה: { success: true, data: [...] }
      console.log('📦 server response:', response);

      if (response && Array.isArray(response) && response.length > 0) {
        setConnections(response); // אם יש נתונים, מעדכנים את המצב
      } else {
        setConnections([]); // אם אין נתונים, נשאיר מערך ריק
        console.warn('No location shares found for this user');
      }
    } catch (err) {
      console.error('❌ Failed to load connections:', err);
    } finally {
      setLoading(false);
    }
  };


  const handleRemove = async (accountBId: string) => {
    if (!window.confirm(t('ManageConnections.confirm_remove'))) return;

    try {
      await deleteRequest(`/shabbat/location-shares/${accountBId}`);
      setConnections((prev) =>
        prev.filter((conn) => conn.account_b.id !== accountBId)
      );
      toast.success(t('ManageConnections.removed'));
    } catch (err) {
      console.error('Failed to remove connection:', err);
    }
  };

  useEffect(() => {
    loadConnections();
  }, []);

  return (
    <div className="bg-gray-100 min-h-screen">
      <header className="bg-white px-5 py-4 border-b sticky top-0 z-10 flex items-center justify-between">
        <button className="text-blue-500 text-lg" onClick={() => navigate(-1)}>
          {t('ManageConnections.back')}
        </button>
        <h1 className="text-lg font-semibold text-gray-800">
          {t('ManageConnections.title')}
        </h1>
        <div />
      </header>

      <div className="p-4 space-y-6">
        <section className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="border-b p-4">
            <h2 className="text-base font-semibold text-gray-800">
              {t('ManageConnections.network')}
            </h2>
            <p className="text-sm text-gray-500">
              {t('ManageConnections.description')}
            </p>
          </div>

          {loading ? (
            <div className="text-center p-6 text-gray-600">
              {t('ManageConnections.loading')}
            </div>
          ) : connections.length === 0 ? (
            <div className="text-center p-6 text-gray-600">
              {t('ManageConnections.empty')}
            </div>
          ) : (
            connections.map((conn) => (
              <div
                key={conn.account_b.id}
                className="flex justify-between items-start border-t px-4 py-3"
              >
                <div className="flex-1">
                  <div className="flex items-center text-sm font-medium text-gray-800">
                    <span>{conn.account_b.name}</span>
                    <span className="mx-2 text-blue-600">↔</span>
                    <span>{t('ManageConnections.you')}</span>
                    {conn.is_mutual ? (
                      <span className="ml-2 bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full uppercase font-semibold">
                        {t('ManageConnections.mutual')}
                      </span>
                    ) : (
                      <span className="ml-2 bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full uppercase font-semibold">
                        {t('ManageConnections.one_sided')}
                      </span>
                    )}

                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {conn.location_b?.name} – {conn.location_b?.address}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {new Date(conn.created_at).toLocaleDateString()}
                  </div>
                </div>
                <button
                  className="bg-red-100 text-red-700 px-3 py-1 text-xs rounded-full font-semibold"
                  onClick={() => handleRemove(conn.account_b.id)}
                >
                  {t('ManageConnections.remove')}
                </button>
              </div>
            ))
          )}
        </section>
      </div>
    </div>
  );
};

export default ManageConnectionsScreen;
