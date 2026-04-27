import React, { useEffect, useState } from 'react';
import { AccountUser, AccountLocation } from '@eventix/shared';
import { getUsersInMyAccount, getLocationsInMyAccount, addLocation, updateLocation } from '../../services/accountService';
import LocationModal from './LocationModal';
import { toast } from 'react-toastify';
import { useTranslation } from "react-i18next";
import i18n from 'i18next';
import { useNavigate } from 'react-router-dom';

const ProfileSettings: React.FC = () => {
  const [members, setMembers] = useState<AccountUser[] | null>(null);
  const [accountName, setAccountName] = useState<string | null>(null);
  const [locations, setLocations] = useState<AccountLocation[] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [accountId, setAccountId] = useState<string>('');
  const [locationToEdit, setLocationToEdit] = useState<AccountLocation | null>(null);
  const [notAuthorized, setNotAuthorized] = useState(false);

  const { t }: { t: (key: string) => string } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';
  const navigate = useNavigate();
  const frontendUrl = process.env.REACT_APP_FRONTEND_URL;

  const handleError = (err: any, context: 'users' | 'locations') => {
    const status = err?.response?.status;
    const message = err?.response?.data?.message || err?.message || '';
    const toastId = 'auth-error';

    if ((status === 401 || message.includes('401')) && !toast.isActive(toastId)) {
      localStorage.setItem('eventSharedUrl', window.location.pathname + window.location.search);
      setNotAuthorized(true);
      toast.error(t('Errors.unauthorized'), { toastId });
      return;
    }

    const contextId = `error-${context}`;
    if (!toast.isActive(contextId)) {
      toast.error(t(`Errors.${context}`), { toastId: contextId });
    }
    console.error(`[${context}]`, err);
  };

  const refreshLocations = () => {
    getLocationsInMyAccount()
      .then((res) => setLocations(res.data))
      .catch((err) => handleError(err, 'locations'));
  };

  const handleCopyLink = () => {
    if (accountId) {
      const inviteUrl = `${frontendUrl}/invite/${accountId}`;
      navigator.clipboard.writeText(inviteUrl);
      toast.success(t('ShareLocationFirst.copy_success'));
    }
  };

  const handleShareWhatsApp = () => {
    const inviteUrl = `${frontendUrl}/invite/${accountId}`;
    const message = `היי! יצרתי חשבון שיתוף שבת עבורנו \n\nהצטרפ/י אליי כאן:\n${inviteUrl}`;
    const whatsappLink = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappLink, '_blank');
  };

  function hexToString(hex: string): string {
    if (hex.startsWith('\\x')) hex = hex.slice(2);
    return hex.match(/.{1,2}/g)?.map(b => String.fromCharCode(parseInt(b, 16))).join('') || '';
  }

  const handleSaveOrUpdate = (location: AccountLocation) => {
    const action = locationToEdit ? updateLocation : addLocation;
    action(location)
      .then(() => {
        toast.success(t(`Success.${locationToEdit ? 'locationUpdated' : 'locationSaved'}`));
        refreshLocations();
      })
      .catch((err) => handleError(err, 'locations'));
    setLocationToEdit(null);
    setIsModalOpen(false);
  };

  useEffect(() => {
    getUsersInMyAccount()
      .then((res) => {
        setNotAuthorized(false);
        setMembers(res.data);
        setAccountName(res.accountName);
        setAccountId(res.accountId);
      })
      .catch((err) => handleError(err, 'users'));

    refreshLocations();
  }, []);

  if (notAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="max-w-sm w-full bg-white shadow-lg rounded-xl p-6 text-center">
          <h2 className="text-lg font-semibold mb-3">{t('Errors.unauthorized')}</h2>
          <p className="text-sm mb-4">{t('ProfileSetting.login_first')}</p>
          <button
            onClick={() => navigate('/login', { state: { from: window.location.pathname } })}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-5 rounded shadow"
          >
            {t('ProfileSetting.login_button')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-base text-gray-700 hover:text-black hover:bg-gray-100 px-3 py-1 rounded-md transition"
            >
              <span className="text-xl">{isRTL ? '→' : '←'}</span>
            </button>

            <h1 className="text-xl font-bold text-gray-800">{t('ProfileSetting.title')}</h1>
          </div>
          <button
            onClick={() => navigate('/connections')}
            className="px-4 py-2 border border-indigo-400 text-indigo-600 bg-transparent rounded-md hover:bg-indigo-50 transition duration-200"
          >
             {t('ProfileSetting.manage_connections')}
          </button>

          {/* <button
          
            className="text-sm bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded shadow"
          >
          
          </button> */}
        </div>

        <div className="bg-white rounded-lg shadow p-5 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center">{accountName}</h2>

          <h3 className="text-base font-semibold text-gray-800 mb-3">{t('ProfileSetting.account_members')}</h3>

          <div className="space-y-3 transition-all duration-300">
            {members?.map((m, i) => (
              <div key={i} className="flex items-center space-x-4 rtl:space-x-reverse border-b last:border-b-0 border-gray-100 pb-2">
                {m.profile_image && (m.profile_image.startsWith('\\x') || /^[0-9a-f]+$/i.test(m.profile_image.replace(/\\x/g, '')))
                  ? <img src={hexToString(m.profile_image)} alt={m.name} className="w-10 h-10 rounded-full object-cover" />
                  : <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-bold">
                    {m.name?.charAt(0)}
                  </div>}
                <span className="text-sm text-gray-800 font-medium">{m.name}</span>
              </div>
            ))}
          </div>

          <div className="mt-5 border-t pt-4 text-sm text-center">
            <p className="text-gray-700 font-semibold mb-1">{t('ProfileSetting.invite_family')}</p>
            <p className="text-gray-500 text-xs mb-3">{t('ProfileSetting.invite_description')}</p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={handleShareWhatsApp}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-1.5 rounded text-sm"
              >
                {t('ProfileSetting.share_invite_link')}
              </button>
              <button
                onClick={handleCopyLink}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-1.5 rounded text-sm"
              >
                {t('ProfileSetting.copy_link')}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-semibold text-gray-800">{t('ProfileSetting.my_locations')}</h3>
            <div className="flex gap-2">
              <button
                onClick={() => { setLocationToEdit(null); setIsModalOpen(true); }}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1.5 rounded text-sm"
              >
                {t('ProfileSetting.add')}
              </button>
              <button
                onClick={() => navigate('shareLocation')}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1.5 rounded text-sm"
              >
                {t('ProfileSetting.sharing_location')}
              </button>
            </div>
          </div>

          <div className="space-y-3 transition-all duration-300">
            {locations?.map((loc, i) => {
              let icon = '📍';
              let bgColor = 'bg-gray-200';
              let textColor = 'text-gray-700';
              switch (loc.locationType) {
                case 'home': icon = '🏠'; bgColor = 'bg-blue-100'; textColor = 'text-blue-700'; break;
                case 'parents': icon = '👨‍👩‍👧‍👦'; bgColor = 'bg-orange-100'; textColor = 'text-orange-700'; break;
                case 'inlaws': icon = '👰'; bgColor = 'bg-purple-100'; textColor = 'text-purple-700'; break;
                case 'friends': icon = '👥'; bgColor = 'bg-green-100'; textColor = 'text-green-700'; break;
              }
              return (
                <div key={i} className="flex items-center p-3 border rounded-md shadow-sm bg-gray-50 hover:bg-gray-100 transition-transform duration-200">
                  <div className={`w-10 h-10 flex items-center justify-center rounded ${bgColor} ${textColor} text-lg mr-3`}>{icon}</div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-800">{loc.name}</div>
                    <div className="text-xs text-gray-500">{loc.address}</div>
                  </div>
                  <button
                    onClick={() => { setLocationToEdit(loc); setIsModalOpen(true); }}
                    className="text-xs text-blue-600 border border-blue-200 px-3 py-1 rounded hover:bg-blue-50"
                  >
                    {t('ProfileSetting.edit')}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <LocationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveOrUpdate}
        initialData={locationToEdit}
      />
    </div>
  );
};

export default ProfileSettings;
