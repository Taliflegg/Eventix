import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getParticipantsWithDiets, handleJoinEvent } from '../../services/eventsService';
import { getMenuActionsByEventId } from '../../services/menuActionService';
import i18n from '../../i18n/i18n';
import { AssignedMenuItem } from '@eventix/shared';
import { useNavigate, useParams } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { log } from 'node:console';

const tdStyle: React.CSSProperties = {
  padding: '10px',
  borderBottom: '1px solid #eee',
  textAlign: 'right',
};
const thStyle: React.CSSProperties = {
  padding: '10px',
  borderBottom: '1px solid #ccc',
  textAlign: 'right',
};
const sectionTitleStyle: React.CSSProperties = {
  fontSize: 26,
  marginTop: 40,
  paddingBottom: 8,
  borderBottom: '4px solid #28A745',
  fontWeight: 'bold',
};
interface TokenPayload {
  eventId: string;
}
interface Participant {
  userId: string;
  name: string;
  dietaryRestrictions: string[] | string;
}
interface RawParticipant {
  userId: string;
  userName: string;
  requirements?: { requirementName: string }[];
}
function MealEventView() {
  const { t }: { t: (key: string) => string } = useTranslation();
  const rtlLanguages = ['he', 'ar', 'fa', 'ur'];
  const direction: 'rtl' | 'ltr' = rtlLanguages.includes(i18n.language) ? 'rtl' : 'ltr';
  const { token = '' } = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [menuItems, setMenuItems] = useState<AssignedMenuItem[]>([]);
  const [eventId, setEventId] = useState<string | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const navigate = useNavigate();
  useEffect(() => {
    if (token) {
      console.log("טוקן בפרונט לפני", token);

      try {
        const decoded = jwtDecode<TokenPayload>(token);
        setEventId(decoded.eventId);
        console.log(":tada: eventId מהטוקן:", decoded.eventId);
      } catch (err) {
        console.error("שגיאה בפענוח הטוקן:", err);
        setError(t('MealEventView.error_prefix') + ': ' + t('MealEventView.Unknown error'));
      }
    } else {
      setError(t('MealEventView.error_prefix') + ': ' + t('MealEventView.Unknown error'));
    }
  }, [token, t]);

  useEffect(() => {
    const fetchMenu = async () => {
      if (!eventId) return;
      setLoading(true);
      setError(null);
      try {
        const response = await getMenuActionsByEventId(eventId);
        setMenuItems(response.assignedMenuItems || []);
        console.log("מנות:", response.assignedMenuItems);
      } catch (err: any) {
        setError(t('MealEventView.Unknown error'));
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, [eventId, t]);

  useEffect(() => {
    const fetchParticipants = async () => {
      if (!eventId) return;
      setLoading(true);
      setError(null);
      try {
        const response = await getParticipantsWithDiets(eventId);
        const rawData = response as unknown as RawParticipant[];
        const mappedParticipants: Participant[] = rawData.map((p) => ({
          userId: p.userId,
          name: p.userName,
          dietaryRestrictions: p.requirements?.map((r) => r.requirementName) || [],
        }));
        console.log("משתתפים:", mappedParticipants);
        setParticipants(mappedParticipants);
      } catch (err: any) {
        setError(t('MealEventView.Unknown error'));
      } finally {
        setLoading(false);
      }
    };
    fetchParticipants();
  }, [eventId, t]);

  // const handleJoin = async () => {
  //   setLoading(true);
  //   setError(null);
  //   setSuccessMessage(null);
  //   try {
  //     await handleJoinEvent(token);
  //     setSuccessMessage(t('MealEventView.join_success_message'));
  //     // navigate(`/event/{eventId}`);
  //   } catch {
  //     navigate('/MenuDisplay');
  //   } finally {
  //     setLoading(false);
  //   }
  // };
const handleJoin = async () => {
  setLoading(true);
  setError(null);
  setSuccessMessage(null);

  try {
    const response = await handleJoinEvent(token);
    const status = response?.status;

    if (status === 409) {
      setSuccessMessage('אתה רשום כבר. נעביר אותך לאירוע בעוד 5 שניות...');
      setTimeout(() => {
        navigate(`/event/${eventId}`);
      }, 5000);
    } else if (status === 201) {
      setSuccessMessage('הצטרפת בהצלחה🎉🎉!ונשלך אליך מייל עכשיו אם סימנת אישור קבלת מיילים נעביר אותך לאירוע בעוד 5 שניות...');
      setTimeout(() => {
        navigate(`/event/${eventId}`);
      }, 5000);
    } else if (status === 202) {
      setSuccessMessage('הצטרפת לרשימת ההמתנה. נעביר אותך לרשימת האירועים בעוד 5 שניות...');
      setTimeout(() => {
        navigate('/events');
      }, 5000);
    } else {
      const errorText = `שגיאה לא צפויה. סטטוס: ${status}, הודעה: ${response?.message}`;
      console.error(errorText);
      setError(`${errorText} נעביר אותך לעמוד האירועים בעוד 5 שניות...`);
      setTimeout(() => {
        navigate('/events');
      }, 5000);
    }
  } catch (err: any) {
    console.error('שגיאה ב-catch:', err);
    let errorMsg = 'שגיאה בעת ההצטרפות';
    if (err.response) {
      try {
        const serverMsg = await err.response.text?.();
        errorMsg = `שגיאת שרת: ${serverMsg || err.message}`;
      } catch (e) {
        errorMsg = `שגיאת שרת: ${err.message}`;
      }
    } else {
      errorMsg = err.message || 'שגיאה בעת ההצטרפות';
    }

    setError(`${errorMsg} נעביר אותך לעמוד האירועים בעוד 5 שניות...`);
    setTimeout(() => {
      navigate('/events');
    }, 5000);
  } finally {
    setLoading(false);
  }
};



  const handleDecline = () => {
    setError(null);
    setSuccessMessage('החלטת לא להצטרף. נחזיר אותך למסך הראשי בעוד 5 שניות...');
    setTimeout(() => {
      navigate('/events');
    }, 5000); // 5 שניות
  };
  return (
    <div style={{ direction }}>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: 30 }}>
        <h2 style={{ textAlign: 'center' }}>{t('MealEventView.event_details')}</h2>
        {error && (
          <div style={{
            backgroundColor: '#F8D7DA',
            color: '#721C24',
            padding: 20,
            marginBottom: 20,
            borderRadius: 8,
            textAlign: 'center',
            fontSize: 24,
            fontWeight: 'bold',
          }}>
            {error}
          </div>
        )}
        {successMessage && (
          <div style={{
            backgroundColor: '#D4EDDA',
            color: '#155724',
            padding: 20,
            marginBottom: 20,
            borderRadius: 8,
            textAlign: 'center',
            fontSize: 24,
            fontWeight: 'bold',
          }}>
            {successMessage}
          </div>
        )}
        <h3 style={sectionTitleStyle}>{t('MealEventView.meal_menu')}</h3>
        {menuItems.length > 0 && (
          <>
            {Array.from(
              menuItems.reduce((map, item) => {
                const categoryId = item.item.isCategory
                  ? item.item.id
                  : item.item.categoryId;
                if (!categoryId) return map;
                if (!map.has(categoryId)) map.set(categoryId, []);
                map.get(categoryId)!.push(item);
                return map;
              }, new Map<string, AssignedMenuItem[]>())
            ).map(([categoryId, items]) => {
              const category = items.find(i => i.item.isCategory);
              const dishes = items.filter(i => !i.item.isCategory);
              return (
                <div key={categoryId}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    marginBottom: 30,
                    gap: 20,
                    flexDirection: direction === 'rtl' ? 'row-reverse' : 'row',
                  }}>
                  <div style={{
                    backgroundColor: '#F0F0F0',
                    padding: '10px 16px',
                    borderRadius: 8,
                    fontWeight: 'bold',
                    minWidth: 120,
                    textAlign: 'center',
                    fontSize: 18,
                  }}>
                    {category?.item.name || t('MealEventView.none')}
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th style={thStyle}>{t('MealEventView.dish_name')}</th>
                        <th style={thStyle}>{t('MealEventView.dish_brought_by')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dishes.map((dish, i) => (
                        <tr key={i}>
                          <td style={tdStyle}>{dish.item.name}</td>
                          <td style={tdStyle}>{dish.assignedUser?.name || t('MealEventView.none')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })}
          </>
        )}
        <h3 style={sectionTitleStyle}>{t('MealEventView.dietary_restrictions')}</h3>
        {participants.length > 0 ? (
          <>
            {participants.map((participant) => (
              <div
                key={participant.userId}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  marginBottom: 20,
                  gap: 20,
                  flexDirection: direction === 'rtl' ? 'row-reverse' : 'row',
                }}>
                <div
                  style={{
                    backgroundColor: '#F0F0F0',
                    padding: '10px 16px',
                    borderRadius: 8,
                    fontWeight: 'bold',
                    minWidth: 120,
                    textAlign: 'center',
                    fontSize: 18,
                  }}>
                  {participant.name}
                </div>
                <div
                  style={{
                    flexGrow: 1,
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '10px',
                  }}>
                  {participant.dietaryRestrictions.length > 0 ? (
                    (Array.isArray(participant.dietaryRestrictions)
                      ? participant.dietaryRestrictions
                      : [participant.dietaryRestrictions]
                    ).map((restriction, i) => (
                      <div
                        key={i}
                        style={{
                          backgroundColor: '#E9ECEF',
                          padding: '6px 12px',
                          borderRadius: 6,
                        }}>
                        {restriction}
                      </div>
                    ))
                  ) : (
                    <div
                      style={{
                        backgroundColor: '#E9ECEF',
                        padding: '6px 12px',
                        borderRadius: 6,
                      }}>
                      {t('MealEventView.none')}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </>
        ) : (
          <p style={{ textAlign: 'center', marginTop: 40 }}>
            {t('MealEventView.none')}
          </p>
        )}
        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <button
            onClick={handleJoin}
            disabled={loading}
            style={{
              backgroundColor: loading ? '#6C757D' : '#28A745',
              color: 'white',
              fontSize: 20,
              padding: '14px 28px',
              border: 'none',
              borderRadius: 8,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              margin: 10,
            }}>
            {loading
              ? t('MealEventView.joining_loading')
              : t('MealEventView.join_meal')}
          </button>
          <button
            onClick={handleDecline}
            disabled={loading}
            style={{
              backgroundColor: '#ccc',
              color: '#333',
              fontSize: 18,
              padding: '12px 24px',
              border: 'none',
              borderRadius: 8,
              cursor: loading ? 'not-allowed' : 'pointer',
              margin: 10,
            }}>
            {t('MealEventView.decline_meal')}
          </button>
        </div>
      </div>
    </div>
  );
}
export default MealEventView;