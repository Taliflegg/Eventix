import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
import {  addLocationConnection, getCurrentUserAccountId, getLocationByLocationId } from '../../services/accountService'; // עדכני נתיב לפי הצורך
import { useEffect } from 'react';
import { getLocationsByUserId } from '../../services/accountService';
import { Location } from '@eventix/shared';
import { getCurrentUserAccountId as getCurrentUser } from '../../services/usersService';
import Swal from 'sweetalert2';
import { useTranslation } from 'react-i18next';


const LocationItem = ({
  location,
  selected,
  onClick,
}: {
  location: Location;
  selected: boolean;
  onClick: () => void;
}) => (
  <div
    onClick={onClick}
    className={`flex items-center p-4 border-b last:border-b-0 cursor-pointer ${selected ? 'bg-blue-50 border-l-4 border-blue-600' : 'hover:bg-gray-100'
      }`}
  >

    <div className="flex-1">
      <div className="font-medium text-gray-800">{location.name}</div>
      <div className="text-sm text-gray-600">{location.address}</div>
    </div>
    <div
      className={`w-5 h-5 rounded-full border-2 ${selected ? 'border-blue-600 bg-blue-600 relative' : 'border-gray-300 bg-white'
        }`}
    >
      {selected && (
        <div className="w-2 h-2 bg-white rounded-full absolute top-1 left-1"></div>
      )}
    </div>
  </div>
);
const getIcon = (location_type: string) => {
  switch (location_type) {
    case 'home': return '🏠';
    case 'parents': return '👨‍👩‍👧‍👦';
    case 'inlaws': return '👰';
    case 'friends': return '👥';
    default: return '📍';
  }
};
const getIconBg = (location_type: string) => {
  switch (location_type) {
    case 'home': return 'bg-blue-100';
    case 'parents': return 'bg-orange-100';
    case 'inlaws': return 'bg-purple-100';
    case 'friends': return 'bg-green-100';
    default: return 'bg-gray-100';
  }
};

const getIconColor = (location_type: string) => {
  switch (location_type) {
    case 'home': return 'text-blue-700';
    case 'parents': return 'text-orange-700';
    case 'inlaws': return 'text-purple-700';
    case 'friends': return 'text-green-700';
    default: return 'text-gray-500';
  }
};


const ShareLocationSecond: React.FC = () => {
  const location = useLocation();
  const { t }: { t: (key: string) => string } = useTranslation();
  const navigate = useNavigate();
  const [accountId, setAccountId] = useState<string>('');
  const [searchParams] = useSearchParams();
  const [friendName, setFriendName] = useState<string | null>(null);
  const [friendAddress, setFriendAddress] = useState<string | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [location_id, setLocationId] = useState<string>('');
  const [accountIdB, setAccountIdB] = useState<string>('');


  useEffect(() => {
    const fetchData = async () => {
      const accountId = searchParams.get("account_id");
      setAccountId(accountId || '');
      const locationId = searchParams.get("location_id");
      setLocationId(locationId || '');
      try {
        const response = await getCurrentUser();
        console.log(response.data);
        setAccountIdB(response.data.accountId);

      }
      catch (error) {
        console.error('Error fetching current user:', error);

        navigate('/login', { state: { from: location } });
      }
      const locs = await getLocationsByUserId();
      setLocations(Array.isArray(locs) ? locs : []);
      if (locs.length > 0) setSelectedLocation(locs[0].id);
      console.log("Account ID:", accountId);
      if (accountId) {
        const name = await getCurrentUserAccountId(accountId);
        console.log("Friend name:", name);
        setFriendName(name);
      }

      if (locationId) {
        const location = await getLocationByLocationId(locationId);
        if (location) {
          console.log("Friend address:", location.address);
          setFriendAddress(location.address);
        }
      }
    };

    fetchData();
  }, [searchParams]);

  const [step, setStep] = useState(2);
  // const [linkedLocation, setLinkedLocation] = useState<string>('myhome');
  const [shareBack, setShareBack] = useState<boolean>(true);
  const locationName = locations.find((loc) => loc.id === selectedLocation)?.name || '';

  const next = () => setStep(s => Math.min(4, s + 1));
  const back = () => setStep(s => Math.max(2, s - 1));

  const headerTitle = [
    t('ShareLocationSecond.Invitation Received'),
    t('ShareLocationSecond.Connect Locations'),
    t('ShareLocationSecond.Complete Connection'),
  ][step - 2];
  const handleShareClick = async () => {
    const result = await Swal.fire({
      title: shareBack
        ? `🤝 ${t('ShareLocationSecond.Mutual sharing with')}${friendName}`
        : `${t('ShareLocationSecond.One-sided sharing')}`,
      text: shareBack
        ? `${t('ShareLocationSecond.You are now sharing your plans with')}${friendName}.`
        : `${friendName} ${t('ShareLocationSecond.Sharing plans with you but you still arent sharing back')}.`,
      icon: shareBack ? 'success' : 'info',
      showCancelButton: true,
      confirmButtonText: t('ShareLocationSecond.OK'),
      cancelButtonText: t('ShareLocationSecond.Cancel'),
    });

    if (result.isConfirmed) {
      try {
        // תמיד מוסיפים שורה חדשה, עם שדה is_mutual בהתאם לבחירה
        console.log(shareBack ? "שיתוף הדדי!" : "שיתוף חד צדדי!!");
        await addLocationConnection(
          accountId,
          location_id,
          accountIdB,
          selectedLocation,
          shareBack
        );
      } catch (error) {
        console.error('Error putting location:', error);
      }
    
      navigate('/shabbat');
    }
    
    
  };
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col w-full">
      {/* Header */}
      <header className="bg-white px-5 py-3 border-b sticky top-0 z-10 min-h-[60px]">
        <div className="flex items-center">
          {step > 2 ? (
            <button onClick={back} className="text-blue-600 text-2xl font-bold mr-5">←</button>
          ) : <div className="w-8 mr-5" />}
          <h1 className="text-lg font-semibold text-gray-800 flex-1">{headerTitle}</h1>
        </div>
        <div className="bg-red-100">{t('ShareLocationSecond.step')} {step - 1}/3 – {t('ShareLocationSecond.Friend’s View')}</div>

      </header>

      {/* Step Indicator */}


      {/* Main Content */}
      <main className="flex-1 px-5 w-full overflow-auto space-y-6 pt-0 mt-0">
        {/* Step 2 - Invitation received */}
        {step === 2 && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="text-center p-8 space-y-4">
              <div className="text-6xl">🤝</div>
              <div className="text-xl font-semibold">
                {friendName ? `!${friendName} ${t('ShareLocationSecond.want to share with you')}` : `${t('ShareLocationSecond.Loading invitation')}`}
              </div>
              <div className="text-gray-600">
                {friendAddress || t('ShareLocationSecond.Loading locations')} {t('ShareLocationSecond.Location')}
              </div>
            </div>
            <button
              onClick={next}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold"
            >
              {t('ShareLocationSecond.Connect to My Locations')}
            </button>
          </div>
        )}

        {/* Step 3 - Match with your location */}
        {step === 3 && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden space-y-4">
            <div className="border-b px-5 py-4">
              <div className="text-lg font-semibold">{t('ShareLocationSecond.locations matches')}</div>
            </div>
            <div className="bg-gray-100 rounded-lg p-4">
              <div className="flex items-center justify-center gap-3">
                <div className="flex-1 bg-white border p-3 text-center">
                  <div className="text-xs text-gray-600">{t('ShareLocationSecond.The')} {friendName}</div>
                  <div className="text-sm font-medium">{friendAddress || t('ShareLocationSecond.Loading locations')}</div>
                </div>
                <div className="text-blue-600 text-2xl">🔗</div>
                <div className="flex-1 bg-blue-50 border-blue-600 border p-3 text-center">
                  <div className="text-xs text-gray-600">{t('ShareLocationSecond.Your Locations')}</div>
                  <div className="text-sm font-medium">{t('ShareLocationSecond.Choose below')} ↓</div>
                </div>
              </div>
            </div>

            <div className="px-5 py-3 space-y-3">
              {locations.map((loc) => {
                const locKey = loc.id;
                return (
                  <div
                    key={locKey}
                    onClick={() => setSelectedLocation(locKey)}
                    className={`flex items-center justify-between border-b last:border-b-0 py-2 cursor-pointer ${selectedLocation === locKey ? 'bg-blue-50' : 'hover:bg-gray-100'}`}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${getIconBg(loc.location_type)} ${getIconColor(loc.location_type)}`}>
                        {getIcon(loc.location_type)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-800">{loc.name}</div>
                        <div className="text-xs text-gray-600">{loc.address}</div>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedLocation === locKey ? 'border-blue-600' : 'border-gray-300'}`}>
                      {selectedLocation === locKey && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={next}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold"
            >
              {t('ShareLocationSecond.Connect Locations')}
            </button>
          </div>
        )}

        {/* Step 4 - Share back */}
        {step === 4 && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden space-y-6">
            <div className="text-center p-8 space-y-4">
              <div className="text-6xl">✅</div>
              <div className="text-xl font-semibold">{t('ShareLocationSecond.Connected')}</div>
              <div className="text-gray-600">{t('ShareLocationSecond.Youll see when The')} {friendName} {t('ShareLocationSecond.are in')} {friendAddress || t('ShareLocationSecond.Loading locations')}</div>
            </div>

            <div className="bg-green-50 border border-green-300 rounded-lg p-5">
              <div className="text-green-700 font-semibold mb-2">{t('ShareLocationSecond.Share your plans back')}</div>
              <LocationItem
                location={{
                  id: 'yes',
                  location_type: 'home',
                  name: `${t('ShareLocationSecond.Yes share my')} ${locationName} ${t('ShareLocationSecond.plans')} ${friendName}`,
                  address: `${t('ShareLocationSecond.Theyll see when Im')} ${locationName} `,
                }}
                selected={shareBack}
                onClick={() => setShareBack(true)}
              />
              <LocationItem
                location={{
                  id: 'no',
                  // type: 'other',
                  name: t('ShareLocationSecond.No keep my plans private'),
                  address: t('ShareLocationSecond.They wont see my plans') + ` ${friendName}`,
                  // icon: '🔒',
                  // iconBg: 'bg-gray-100',
                  // iconColor: 'text-gray-600',
                  location_type: 'other',
                }}
                selected={!shareBack}
                onClick={() => setShareBack(false)}
              />
            </div>

            <button onClick={handleShareClick}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold"

            >{t('ShareLocationSecond.Complete Connection')}</button>

            {/* Complete Connection
            </button> */}
          </div>
        )}
      </main>
    </div>
  );
};


export default ShareLocationSecond;