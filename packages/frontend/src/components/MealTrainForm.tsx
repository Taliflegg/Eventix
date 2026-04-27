import React, { ChangeEvent, useEffect, useState } from 'react';
import styles from '../css/MealTrainFlow.module.css';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n/i18n';
import { MealTrainService } from '../services/mealTrainService';
import { MealTrainResponse } from '@eventix/shared';
import axios from 'axios';
import { fetchAuthenticatedUser } from '../services/usersService';

const StepIndicator = ({ current }: { current: number }) => {
  const steps = Array.from({ length: 6 }, (_, i) => i);
  return (
    <div className={styles.step_indicator}>
      {steps.map((i) => (
        <div
          key={i}
          className={`${styles.step_dot} ${i < current ? `${styles.step_dot_completed}` : i === current ? `${styles.step_dot_active}` : ''}`}
        ></div>
      ))}
    </div>
  );
};

const BasicInfoScreen = ({
  onNext,
  mealTrainName,
  setMealTrainName,
  address,
  setAddress,
}: {
  onNext: () => void;
  mealTrainName: string;
  setMealTrainName: (name: string) => void;
  address: string;
  setAddress: (address: string) => void;
}) => {

  const { t }: { t: (key: string) => string } = useTranslation();
  return (
    <div className={styles.container}>
      <StepIndicator current={0} />
      <div className={styles.screen_title}> {t('CreateMealTrain.Basic details')}</div>
      <div className={styles.screen_subtitle}>{t('CreateMealTrain.We will create a meal train to support the family')}</div>
      <div className={styles.form_group}>
        <label className={styles.form_label}>{t('CreateMealTrain.Name of the meal train')}</label>
        <input
          type="text"
          className={styles.form_input}
          placeholder={t('CreateMealTrain.Cohen family')}
          value={mealTrainName}
          onChange={(e) => setMealTrainName(e.target.value)}
        />
        {!mealTrainName.trim() && (
          <div className="text-red-600 text-sm mt-1">
            {t('CreateMealTrain.Name is required')}
          </div>
        )}
      </div>
      <div className={styles.form_group}>
        <label className={styles.form_label}>{t('CreateMealTrain.family address')} </label>
        <input
          type="text"
          className={styles.form_input}
          placeholder={t('CreateMealTrain.address example')}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
        {!address.trim() && (
          <div className="text-red-600 text-sm mt-1">
            {t('CreateMealTrain.Address is required')}
          </div>
        )}
      </div>
      <button
        className={styles.primary_btn}
        onClick={onNext}
        disabled={!mealTrainName.trim() || !address.trim()}
      >
        {t('CreateMealTrain.next')}
      </button>

    </div>)
};

type LogisticsScreenProps = {
  onNext: () => void;
  onBack: () => void;
  selectedTime: string;
  setSelectedTime: (time: string) => void;
  adultCount: number;
  setAdultCount: (count: number) => void;
  kidCount: number;
  setKidCount: (count: number) => void;
};

const LogisticsScreen = ({ onNext, onBack, selectedTime, setSelectedTime, adultCount, setAdultCount, kidCount, setKidCount }: LogisticsScreenProps) => {

  const { t }: { t: (key: string) => string } = useTranslation();
  //          "back":"back",

  return (
    <div className={styles.container}>
      <StepIndicator current={1} />
      <div className={styles.screen_title}>{t('CreateMealTrain.logistique')}</div>
      <div className={styles.screen_subtitle} >{t('CreateMealTrain.When and for how many people to cook')}</div>
      <div className={styles.form_group}>
        <label className={styles.form_label}>{t('CreateMealTrain.Preffered time delvery')}</label>
        <div className={styles.time_selector}>
          {['morning', 'afternoon', 'evening'].map((time) => (
            <div
              key={time}
              className={`${styles.time_option}  ${selectedTime === time ? `${styles.time_option_selected}` : ''}`}
              onClick={() => setSelectedTime(time)}
            >
              <div>{time === 'morning' ? `${t('CreateMealTrain.morning')}` : time === 'afternoon' ? `${t('CreateMealTrain.afternoon')}` : `${t('CreateMealTrain.evening')}`}</div>
              <div className="text-xs text-gray-500">
                {time === 'morning' ? '09:00-12:00' : time === 'afternoon' ? '12:00-17:00' : '17:00-20:00'}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className={styles.form_group}>
        <label className={styles.form_label}>{t('CreateMealTrain.How many people to cook for?')}</label>
        <div className={styles.counter_group}>
          <div className={styles.counter}>
            <span style={{ marginLeft: 8 }}>{t('CreateMealTrain.adults')}:</span>
            <button className={styles.counter_btn} onClick={() => setAdultCount(Math.max(1, adultCount - 1))}>−</button>
            <span className={styles.counter_value}>{adultCount}</span>
            <button className={styles.counter_btn} onClick={() => setAdultCount(adultCount + 1)}>+</button>
          </div>
          <div className={styles.counter}>
            <span style={{ marginLeft: 8 }}>{t('CreateMealTrain.childrens')}:</span>
            <button className={styles.counter_btn} onClick={() => setKidCount(Math.max(0, kidCount - 1))}>−</button>
            <span className={styles.counter_value}>{kidCount}</span>
            <button className={styles.counter_btn} onClick={() => setKidCount(kidCount + 1)}>+</button>
          </div>
        </div>
      </div>
      <button className={styles.primary_btn} onClick={onNext}>{t('CreateMealTrain.next')}</button>
      <button className={styles.back_btn} onClick={onBack}>← {t('CreateMealTrain.back')}</button>
    </div>
  )
};

const CalendarScreen = ({
  onBack,
  onNext,
  selectedDates,
  setSelectedDates,
}: {
  onBack: () => void;
  onNext: () => void;
  selectedDates: string[];
  setSelectedDates: (dates: string[]) => void;
}) => {
  const { t }: { t: (key: string) => string } = useTranslation();
  const { i18n } = useTranslation();
  const [error, setError] = useState('');
  const [months, setMonths] = useState<string[]>([]);
  const [days, setDays] = useState<string[]>([]);
  useEffect(() => {
    if (i18n.language === "he") {
      setMonths([
        "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
        "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"
      ]);

      setDays(["א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "ש׳"]);
    } else {
      setMonths([
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ]);

      setDays(["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]);
    }
  }, [i18n.language]); // מופעל כל פעם שהשפה משתנה
  const [currentMonth, setCurrentMonth] = React.useState<number>(0); // 0 = ינואר
  const handleNext = () => {
    if (selectedDates.length === 0) {
      setError(t('CreateMealTrain.Please select at least one date'));
      return;
    }
    setError('');
    onNext();
  };

  const toggleDate = (dateString: string) => {
    if (selectedDates.includes(dateString)) {
      setSelectedDates(selectedDates.filter(d => d !== dateString));
    } else {
      setSelectedDates([...selectedDates, dateString]);
    }
  };

  const getDaysInMonth = (month: number, year: number) =>
    new Date(year, month + 1, 0).getDate();

  const getFirstDayOfWeek = (month: number, year: number) =>
    new Date(year, month, 1).getDay(); // 0 = Sunday

  const year = 2025;
  const daysInMonth = getDaysInMonth(currentMonth, year);
  const firstDay = getFirstDayOfWeek(currentMonth, year);
  const leadingEmptyDays = (firstDay + 6) % 7; // התאמה לשבוע המתחיל ב-א'

  const dates: (number | null)[] = [
    ...Array(leadingEmptyDays).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1)
  ];

  return (
    <div className={styles.container}>
      <StepIndicator current={2} />
      <div className={styles.screen_title}> {t('CreateMealTrain.Dates')}</div>
      <div className={styles.screen_subtitle}>{t('CreateMealTrain.On what dates does the family need meals?')}</div>

      <div style={{ textAlign: 'center', margin: '12px 0' }}>
        <button onClick={() => setCurrentMonth((prev) => Math.max(0, prev - 1))}>←</button>
        <strong style={{ margin: '0 12px' }}>
          {months[currentMonth]} {year}
        </strong>
        <button onClick={() => setCurrentMonth((prev) => Math.min(11, prev + 1))}>→</button>
      </div>

      <div className={styles.calendar_grid}>
        {days.map(day => (
          <div key={day} className={styles.calendar_header}>{day}</div>
        ))}
        {dates.map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} className={styles.calendar_day}></div>;
          }
          const dateString = `${year}-${currentMonth + 1}-${day}`;
          const isSelected = selectedDates.includes(dateString);
          return (
            <div
              key={dateString}
              className={`${styles.calendar_day} ${isSelected ? styles.calendar_day_selected : ''}`}
              onClick={() => toggleDate(dateString)}
            >
              {day}
            </div>
          );
        })}
      </div>

      {selectedDates.length > 0 && (
        <div className={styles.selected_dates}>
          <div className={styles.selected_dates_title}> {t('CreateMealTrain.Selected dates')}:</div>
          {selectedDates.map(date => {
            const [y, m, d] = date.split('-');
            return (
              <span className={styles.date_tag} key={date}>
                {`${+d} ב${months[+m - 1]} ${y}`}
              </span>
            );
          })}
        </div>
      )}

      <button className={styles.primary_btn} onClick={handleNext}>
        {t('CreateMealTrain.next')}
      </button>
      {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
      <button className={styles.back_btn} onClick={onBack}>← {t('CreateMealTrain.next')}</button>
    </div>
  );
};


const DietaryPreferencesScreen = ({
  onBack,
  onNext,
  allergies,
  setAllergies,
  preferredFoods,
  setPreferredFoods,
}: {
  onBack: () => void;
  onNext: () => void;
  allergies: string;
  setAllergies: (val: string) => void;
  preferredFoods: string;
  setPreferredFoods: (val: string) => void;
}) => {
  const { t }: { t: (key: string) => string } = useTranslation();
  return (

    <div className={styles.container}>
      <StepIndicator current={3} />
      <div className={styles.screen_title}> {t('CreateMealTrain.Dietary preferences')}</div>
      <div className={styles.screen_subtitle}>{t('CreateMealTrain.Help volunteers know what to cook')}</div>

      <div className={styles.form_group}>
        <label className={styles.form_label}> {t('CreateMealTrain.Allergies and dietary restrictions')} </label>
        <textarea
          className={styles.form_textarea}
          placeholder={t('CreateMealTrain.For example nut allergy kosher vegetarian')}
          value={allergies}
          onChange={(e) => setAllergies(e.target.value)}
        />
      </div>

      <div className={styles.form_group}>
        <label className={styles.form_label}>{t('CreateMealTrain.Favorite foods')}  <span className={styles.optional}>(רשות)</span></label>
        <textarea
          className={styles.form_textarea}
          placeholder={t('CreateMealTrain.for example...')}
          value={preferredFoods}
          onChange={(e) => setPreferredFoods(e.target.value)}
        />
      </div>

      <button className={styles.primary_btn} onClick={onNext}>{t('CreateMealTrain.next')}</button>
      <button className={styles.back_btn} onClick={onBack}>← {t('CreateMealTrain.back')}</button>
    </div>
  );
};



const ExtraDetailsScreen = ({
  onNext,
  onBack,
  extraDetails,
  setExtraDetails,
  photo,
  setPhoto,
}: {
  onNext: () => void;
  onBack: () => void;
  extraDetails: string;
  setExtraDetails: (details: string) => void;
  photo: File | null;
  setPhoto: (file: File | null) => void;
}) => {
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    debugger
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto(file);

  };
  const { t }: { t: (key: string) => string } = useTranslation();
  return (

    <div className={styles.container}>
      <StepIndicator current={4} />
      <div className={styles.screen_title}> {t('CreateMealTrain.more details')}</div>
      <div className={styles.screen_subtitle}>{t('CreateMealTrain.Additional information to help volunteers')}</div>

      <div className={styles.form_group}>
        <label className={styles.form_label_optional}>{t('CreateMealTrain.more details')} </label>
        <textarea
          className={styles.form_textarea}
          placeholder={t('CreateMealTrain.For example There are dogs in the yard we need to coordinate with the neighbor')}
          value={extraDetails}
          onChange={(e) => setExtraDetails(e.target.value)}
        />
      </div>


      <div className={styles.form_group}>
        <label className={styles.form_label_optional}>{t('CreateMealTrain.Photo of the family')}</label>
        <div className={styles.photo_upload}>
          {/* קלט קבצים מוסתר */}
          <input
            type="file"
            id="photo-upload"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
          {/* תווית שתפעיל את ה-input */}
          <label
            htmlFor="photo-upload"
            className={styles.photo_upload_label}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
            title={t('CreateMealTrain.Click to add a picture')}
          >
            {photo ? (
              <>
                <img
                  src={URL.createObjectURL(photo)}
                  alt="Preview"
                  style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '2px solid #4ade80' }} // דוגמה לעיצוב ירוק
                />
                <span>{photo.name}</span>
              </>
            ) : (
              <>
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    backgroundColor: '#e5e7eb',
                    border: '2px dashed #9ca3af',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  📷
                </div>
                <span>{t('CreateMealTrain.Add image (optionnaly)')}</span>
              </>
            )}
          </label>
        </div>
      </div>

      <button className={styles.primary_btn} onClick={onNext}>{t('CreateMealTrain.next')}</button>
      <button className={styles.back_btn} onClick={onBack}>← {t('CreateMealTrain.back')}</button>
    </div>
  );
};
const ReviewScreen = ({
  onBack,
  onNext,
  basicInfo,
  logistics,
  selectedDates,
  dietaryPreferences,
  extraDetails,
  photo,
  func
}: {
  onBack: () => void;
  onNext: () => void;
  func: () => void;
  basicInfo: {
    mealTrainName: string;
    address: string;
  };
  logistics: {
    selectedTime: string;
    adultCount: number;
    kidCount: number;
  };
  selectedDates: string[];
  dietaryPreferences: {
    allergies: string;
    preferredFoods: string;
  };
  extraDetails: string;
  photo: File | null;
}) => {
  const hebrewMonths = [
    'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
    'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
  ];

  // פורמט להצגת תאריכים - לדוגמה: "18-20, 22 בדצמבר"
  // כאן נעשה פשוט איחוד של התאריכים לפי חודש, אפשר להרחיב לפי צורך
  const groupDatesByMonth = () => {
    const grouped: Record<string, number[]> = {};
    selectedDates.forEach(dateStr => {
      const [, m, d] = dateStr.split('-');
      if (!grouped[m]) grouped[m] = [];
      grouped[m].push(Number(d));
    });

    return Object.entries(grouped).map(([month, days]) => {
      days.sort((a, b) => a - b);
      // מציג ימים מופרדים בפסיקים - אפשר לשפר לקבוצות טווחים אם תרצה
      return `${days.join(', ')} ב${hebrewMonths[Number(month) - 1]}`;
    }).join('; ');
  };
  const { t }: { t: (key: string) => string } = useTranslation();
  const timeLabels: Record<string, string> = {
    morning: ` (09:00-12:00)' ${t('CreateMealTrain.morning')}`,
    afternoon: ` (12:00-17:00) ${t('CreateMealTrain.after noon')}'`,
    evening: ` (17:00-20:00)  ${t('CreateMealTrain.evening')}`,
  };


  return (
    <div className={styles.container}>
      <StepIndicator current={5} />
      <div className={styles.screen_title}> {t('CreateMealTrain.Creation and summary')}</div>
      <div className={styles.screen_subtitle}>{t('CreateMealTrain.Check the details before creating the meal train')}</div>

      <div className={styles.meal_train_preview}>
        <div className={styles.preview_title}>{basicInfo.mealTrainName || `${t('CreateMealTrain.Last Name')}`}</div>
        <div className={styles.preview_detail}>📍 {basicInfo.address || `${t('CreateMealTrain.address')}`}</div>
        <div className={styles.preview_detail}>🕐  {t('CreateMealTrain.delivery in')}{timeLabels[logistics.selectedTime]}</div>
        <div className={styles.preview_detail}>
          👥 {logistics.adultCount} {t('CreateMealTrain.adults')} + {logistics.kidCount} {t('CreateMealTrain.childrens')}
        </div>
        <div className={styles.preview_detail}>
          📅 {selectedDates.length} {t('CreateMealTrain.meals')}: {groupDatesByMonth()}
        </div>
        <div className={styles.preview_detail}>
          🥗 {dietaryPreferences.allergies || '-'} {dietaryPreferences.preferredFoods ? `, ${dietaryPreferences.preferredFoods}` : ''}
        </div>
        {extraDetails && (
          <div className={styles.preview_detail}>
            ℹ️ {extraDetails}
          </div>
        )}
        {photo && (
          <div className={styles.preview_detail}>
            📷 {t('CreateMealTrain.picture')}: {photo.name}
          </div>
        )}
      </div>

      <button className={styles.primary_btn} onClick={() => { func(); onNext() }}>{t('CreateMealTrain.Create a meal train')}</button>
      <button className={styles.back_btn} onClick={() => {
        onBack();
      }}>← {t('CreateMealTrain.next')}</button>
    </div>
  );
};


type SuccessScreenProps = {
  shareLink: string;
  onGoToMealTrain: () => void;
};

const SuccessScreen = ({ shareLink, onGoToMealTrain }: SuccessScreenProps) => {
  const shareWhatsApp = () => {
    const encodedLink = encodeURIComponent(shareLink);
    const whatsappUrl = `https://wa.me/?text=${encodedLink}`;
    window.open(whatsappUrl, '_blank');
  };
  const { t }: { t: (key: string) => string } = useTranslation();
  const notifySuccess = (message: string) => {
    toast(message, {
      position: "top-center",
      hideProgressBar: true,
      autoClose: 3000,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: false,
      style: {
        background: '#f0fff4',
        color: '#2f855a',
        fontSize: '16px',
        fontWeight: 'bold',
        borderRadius: '12px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        textAlign: 'center',
      },
      icon: () => <span>✅</span>,
    });
  };
  const notifyError = (message: string) => {
    toast(`${t('CreateMealTrain.copy link failed')} 😞`, {
      position: "top-center",
      icon: <span>❌</span>,
      style: {
        background: '#fff5f5',
        color: '#c53030',
        fontSize: '16px',
        fontWeight: 'bold',
        borderRadius: '12px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        textAlign: 'center',
      },
    });
  }
  const copyLink = () => {
    navigator.clipboard.writeText(shareLink).then(() => {
      notifySuccess(`${t('CreateMealTrain.The link was copied successfully!')}`);
    }, () => {
      notifyError(`${t('CreateMealTrain.copy link failed')}`);

    });
  };

  return (
    <div className={`${styles.screen} ${styles.screen_active}`} >
      <div className={styles.header}>
        <div className={styles.header_title}>{t('CreateMealTrain.Meal train created')}  </div>
      </div>

      <div className={styles.container}>
        <div className={styles.share_container}>
          <div className={styles.success_icon}>🎉</div>
          <div className={styles.share_title}>{t('CreateMealTrain.The meal train has been successfully created!')}</div>
          <div className={styles.share_subtitle}>
            {t('CreateMealTrain.Share the link with friends and family so they can sign up for meals.')}
          </div>

          <div className={styles.share_link}>
            {shareLink}
          </div>

          <div className={styles.share_buttons}>
            <button className={`${styles.share_btn} ${styles.whatsapp_btn}`} onClick={shareWhatsApp}>
              📱 {t('CreateMealTrain.Share on WhatsApp')}
            </button>
            <button className={`${styles.share_btn} ${styles.copy_btn}`} onClick={copyLink}>
              📋 {t('CreateMealTrain.Copy link')}
            </button>
          </div>
        </div>

        <button className={styles.primary_btn} onClick={onGoToMealTrain}>
          {t('CreateMealTrain.Go to the meal train')}
        </button>
      </div>
    </div>
  );
};
export const MealTrainForm = () => {



  const [currentScreen, setCurrentScreen] = useState(0);

  // פרטים בסיסיים
  const [mealTrainName, setMealTrainName] = useState('');
  const [address, setAddress] = useState('');

  // לוגיסטיקה
  const [selectedTime, setSelectedTime] = useState('afternoon');
  const [adultCount, setAdultCount] = useState(2);
  const [kidCount, setKidCount] = useState(2);
  const frontendUrl = process.env.REACT_APP_FRONTEND_URL;


  // תאריכים
  const [selectedDates, setSelectedDates] = useState<string[]>([]);

  // העדפות תזונה
  const [allergies, setAllergies] = useState('');
  const [preferredFoods, setPreferredFoods] = useState('');

  // פרטים נוספים ותמונה
  const [extraDetails, setExtraDetails] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [shareLink, setShareLink] = useState<string>('');
  const goToMealTrain = () => {
    window.location.href = shareLink;
  };


  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  useEffect(() => {
    const loadUser = async () => {

      try {
        const user = await fetchAuthenticatedUser();
        setCurrentUserId(user?.id);
      } catch (err) {
        console.error('Failed to fetch current user', err);
      }
    };
    loadUser();
  }, []);
  const submit = async () => {
    debugger
    try {
      const dates = selectedDates
        .map(dateStr => new Date(dateStr))
        .sort((a, b) => a.getTime() - b.getTime());

      // בונים את ה-FormData לשליחה מול backend
      const formDataToSend = new FormData();

      formDataToSend.append('name', mealTrainName);
      formDataToSend.append('address', address);
      formDataToSend.append('startDate', dates[0].toISOString());
      formDataToSend.append('endDate', dates[dates.length - 1].toISOString());
      formDataToSend.append('childrens', String(kidCount));
      formDataToSend.append('adults', String(adultCount));
      formDataToSend.append('dietaryInfo', allergies + " " + extraDetails + " " + preferredFoods);
      formDataToSend.append('deliveryTime', selectedTime);
      if (currentUserId != null)
        formDataToSend.append('adminUserId', currentUserId);
      formDataToSend.append('shareToken', "");
      formDataToSend.append('createdAt', new Date().toISOString());

      // אם יש תמונה (קובץ) מצורף, מוסיפים אותה
      if (photo instanceof File) {
        formDataToSend.append('Image', photo); // חשוב שהשם 'photo' יתאים לשם בקצה השרת שמטפל בקובץ (upload.single('photo'))
      }

      // שולחים את הבקשה עם axios (או השירות שאת משתמשת בו)
      //  const newItem  = await axios.post<MealTrainResponse>(`${process.env.REACT_APP_BACKEND_URL}/api/meal_train/`, formDataToSend, {
      //           headers: {
      //             'Content-Type': 'multipart/form-data',
      //           },
      //           withCredentials: true
      //         });

      const newItem = await MealTrainService.createMealTrain(formDataToSend)
      setShareLink(newItem.data.shareToken);
      if (newItem) {
        toast.success("שרשרת הארוחות התווספה בהצלחה");
      } else {
        console.error("שגיאה בהוספת שרשרת הארוחות");
      }
    } catch (error) {
      console.error("Error submitting meal train:", error);
    }
  };





  return (

    <div className="meal-train-form rtl">



      {currentScreen === 0 && (
        <BasicInfoScreen
          onNext={() => setCurrentScreen(1)}
          mealTrainName={mealTrainName}
          setMealTrainName={setMealTrainName}
          address={address}
          setAddress={setAddress}
        />
      )}
      {currentScreen === 1 && (
        <LogisticsScreen
          onNext={() => setCurrentScreen(2)}
          onBack={() => setCurrentScreen(0)}
          selectedTime={selectedTime}
          setSelectedTime={setSelectedTime}
          adultCount={adultCount}
          setAdultCount={setAdultCount}
          kidCount={kidCount}
          setKidCount={setKidCount}
        />
      )}

      {currentScreen === 2 && (
        <CalendarScreen
          onNext={() => setCurrentScreen(3)}
          onBack={() => setCurrentScreen(1)}
          selectedDates={selectedDates}
          setSelectedDates={setSelectedDates}
        />
      )}
      {currentScreen === 3 && (
        <DietaryPreferencesScreen
          onNext={() => setCurrentScreen(4)}
          onBack={() => setCurrentScreen(2)}
          allergies={allergies}
          setAllergies={setAllergies}
          preferredFoods={preferredFoods}
          setPreferredFoods={setPreferredFoods}
        />
      )}
      {currentScreen === 4 && (
        <ExtraDetailsScreen
          onNext={() => setCurrentScreen(5)}
          onBack={() => setCurrentScreen(3)}
          extraDetails={extraDetails}
          setExtraDetails={setExtraDetails}
          photo={photo}
          setPhoto={setPhoto}
        />
      )}
      {currentScreen === 5 && (
        <ReviewScreen
          onNext={() => setCurrentScreen(6)}
          onBack={() => setCurrentScreen(4)}
          func={() => submit()}
          basicInfo={{ mealTrainName, address }}
          logistics={{ selectedTime, adultCount, kidCount }}
          selectedDates={selectedDates}
          dietaryPreferences={{ allergies, preferredFoods }}
          extraDetails={extraDetails}
          photo={photo}
        />
      )}

      {currentScreen === 6 && (
        <SuccessScreen
          shareLink={shareLink}
          onGoToMealTrain={goToMealTrain}
        />
      )}
    </div>
  );

}
export default MealTrainForm;
