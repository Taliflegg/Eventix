import { useEffect, useState } from 'react';
import { getShabbatList } from '../../services/shabbatService'; // נניח שזו פונקציה שיכולה לקבל offset ו-limit
import { ShabbatDataForFrontend } from '@eventix/shared';
import { useNavigate } from 'react-router-dom';
import { Tooltip } from 'react-tooltip';
import { fetchAuthenticatedUser } from '../../services/usersService';
import { useTranslation } from "react-i18next";

const SHABBATS_PER_LOAD = 4; // כמה שבתות לטעון בכל לחיצה
// const MAX_LOAD_CLICKS = 6; // הגבלת מקסימום לחיצות

const ShabbatMainScreen = () => {
  const [shabbatList, setShabbatList] = useState<ShabbatDataForFrontend[]>([]);
  const [loading, setLoading] = useState(true);
  // const [currentOffset, setCurrentOffset] = useState(0); // מתחילים מ-0
  const [hasMore, setHasMore] = useState(true); // קובע אם יש עוד נתונים לטעון
  // const [loadClicks, setLoadClicks] = useState(0);
  const [reachedEnd, setReachedEnd] = useState(false);
  // setReachedEnd(false)//!!!הוספה של אילה שכרוב - שלא יהיו אזהרות. אם לא צריך את המשתנה - למחוק
  const navigate = useNavigate();
  const { t }: { t: (key: string) => string } = useTranslation();
  // const cases=["GOING","MAYBE","You did'nt signal arrival or hesitation."]

  // פונקציית טעינת הנתונים המרכזית
  const fetchData = async (offset: number, limit: number, append: boolean = false) => {
    setLoading(true);
    console.log("Calling fetchData with:", { offset, limit, append });
    try {
      const user = await fetchAuthenticatedUser();
      const userId = user.id;
      const data = await getShabbatList(userId, offset, limit);
      console.log("Fetched data :", data);

      // הגנה: אם לא מערך - נכניס מערך ריק
      const fetchedShabbats = Array.isArray(data) ? data : [];

      if (append) {
        // הוספת השבתות החדשות לרשימה הקיימת
        setShabbatList(prevList => [...prevList, ...fetchedShabbats]);
      } else {
        // טעינה ראשונית - מחליפים את הרשימה
        setShabbatList(fetchedShabbats);
      }
      // עדכון האם יש עוד נתונים לטעון
      setHasMore(fetchedShabbats.length === limit);

    } catch (error) {
      console.error('שגיאת בקרת נתונים', error);
      if (!append) { // אם זו טעינה ראשונית ונכשלה, נציג מערך ריק
        setShabbatList([]);
      }
      setHasMore(false); // במקרה של שגיאה, נניח שאין עוד נתונים
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // בטעינה ראשונית, טוענים את הכמות הראשונית של שבתות
    fetchData(0, SHABBATS_PER_LOAD, false);
  }, []);
  const handleLoadMore = () => {
    if (hasMore) {
      const offset = shabbatList.length;
      fetchData(offset, SHABBATS_PER_LOAD, true);
      // setLoadClicks(prev => {
      //   const next = prev + 1;
      //   if (next >= 6) {
      //     setReachedEnd(true);
      //   }
      //   return next;
      // });
    }
  };



  if (loading && shabbatList.length === 0) return <p className="text-center mt-8 text-gray-700">טוען נתונים....</p>;

  return (
    <div className="bg-gray-100 min-h-screen">
      <header className="bg-white px-5 py-4 border-b sticky top-0 z-10">
        <h1 className="text-xl font-semibold text-center text-gray-800">שבת Planning</h1>
        <button
          onClick={() => navigate('/shabbat-profile')}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-100 text-indigo-700 font-medium text-sm shadow hover:bg-indigo-200 transition"
        >
          <span role="img" aria-label="profile">👥</span>
         {t('ProfileSetting.profile')}
        </button>
      </header>

      <div className="p-4 space-y-6">
        {shabbatList.map((shabbat, index) => (
          <div key={shabbat.dateEnglish || index} className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="px-5 py-4 border-b">
              <div className="text-base font-semibold text-gray-800">{t(shabbat.dateEnglish)}</div>
              <div className="text-sm text-gray-600 font-serif">{t(shabbat.dateHebrew)}</div>
              <div className="text-sm text-blue-600 font-medium">{t(shabbat.parasha)}</div>
            </div>

            <div className="px-5 py-3 space-y-4">
              {shabbat.locations.map((loc, idx) => (
                <div
                  key={idx}
                  onClick={() => navigate('/desicion', { state: shabbat })}
                  className="flex items-center justify-between border-b last:border-b-0 py-2 cursor-pointer hover:bg-gray-50 transition duration-150 ease-in-out"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${getIconBg(loc.type)} ${getIconColor(loc.type)}`}
                    >
                      {getIcon(loc.type)}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-800">{loc.name}</div>
                      <div className="text-xs text-gray-600">{loc.subtitle}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div
                      className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 font-semibold cursor-pointer"
                      data-tooltip-id={`tooltip-confirmed-${index}-${idx}`}
                      data-tooltip-content={loc.confirmedNames?.length > 0 ?t('shabbatMainAcreen.going')+": " + loc.confirmedNames.join(', ') :t('shabbatMainAcreen.noGoing') }
                    >
                      {loc.confirmedCount ?? 0}
                    </div>
                    <div
                      className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 font-semibold cursor-pointer"
                      data-tooltip-id={`tooltip-pending-${index}-${idx}`}
                      data-tooltip-content={loc.pendingNames?.length > 0 ?t('shabbatMainAcreen.maybe')+": " + loc.pendingNames.join(', ') :t('shabbatMainAcreen.noMaybe') }
                    >
                      {loc.pendingCount ?? 0}
                    </div>
                    <Tooltip
                      id={`tooltip-confirmed-${index}-${idx}`}
                      place="top"
                      className="!bg-green-100 !text-green-800"
                    />
                    <Tooltip
                      id={`tooltip-pending-${index}-${idx}`}
                      place="top"
                      className="!bg-yellow-100 !text-yellow-800"
                    />
                    <Tooltip
                      id={`tooltip-status-${index}-${idx}`}
                      place="top"
                      className={getMyStatusStyle(loc.myStatus ?? 'away')}
                    />
                    <div
                      className={`text-xs px-2 py-1 rounded-full uppercase font-semibold ${getMyStatusStyle(loc.myStatus ?? 'away')}`}
                      data-tooltip-id={`tooltip-status-${index}-${idx}`}
                      data-tooltip-content={
                        loc.myStatus === 'going'
                          ?t('shabbatMainAcreen.going')
                          : loc.myStatus === 'tentative'
                            ? t('shabbatMainAcreen.maybe')
                            :t('shabbatMainAcreen.noSignal')
                      }
                    >
                      {t('shabbatMainAcreen.status')}
                    </div>

                  </div>
                </div>
              ))}
            </div>

            <div className="text-center text-xs text-gray-500 py-2 bg-gray-100">
              {t('shabbatMainAcreen.tapDecide')}
            </div>
          </div>
        ))}
        {!reachedEnd ? (
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className={`bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out
      ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? t('shabbatMainAcreen.loading')+"...": t('shabbatMainAcreen.load')}
          </button>
        ) : (
          <p className="bg-blue-200 text-blue-800 font-bold py-2 px-4 rounded-full text-center mt-4">
           {t('shabbatMainAcreen.endList')}
          </p>
        )}

      </div>
    </div>
  );
};

// פונקציות עזר (ללא שינוי, אך ודא ש-!important נשאר כפי שצוין קודם)
const getIcon = (type: string) => {
  switch (type) {
    case 'home': return '🏠';
    case 'parents': return '👨‍👩‍👧‍👦';
    case 'inlaws': return '👰';
    case 'friends': return '👥';
    default: return '📍';
  }
};

const getIconBg = (type: string) => {
  switch (type) {
    case 'home': return 'bg-blue-100';
    case 'parents': return 'bg-orange-100';
    case 'inlaws': return 'bg-purple-100';
    case 'friends': return 'bg-green-100';
    default: return 'bg-gray-100';
  }
};

const getIconColor = (type: string) => {
  switch (type) {
    case 'home': return 'text-blue-700';
    case 'parents': return 'text-orange-700';
    case 'inlaws': return 'text-purple-700';
    case 'friends': return 'text-green-700';
    default: return 'text-gray-500';
  }
};

// const getPeopleCountStyle = (status: string) => {
//   if (status === 'confirmed') return 'bg-blue-100 text-blue-700';
//   if (status === 'tentative') return 'bg-yellow-100 text-yellow-700';
//   return 'bg-gray-200 text-gray-800';
// };

const getMyStatusStyle = (status: string) => {
  switch ((status || '').toLowerCase()) {
    case 'going': return '!bg-green-100 !text-green-800';
    case 'tentative': return '!bg-yellow-100 !text-yellow-800';
    case 'away':
    case '?':
    default: return '!bg-gray-100 !text-gray-500';
  }
};

export default ShabbatMainScreen;