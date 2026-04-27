import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import AnalyticsActiveMealTRain from './AnalyticsActiveMealTrain';
import TotalMonthlyVolunteers from './TotalMonthlyVolunteers';
import MonthlyMealTrainCard from './MonthlyMealTrainCard';

const MealsStatisticsCard = () => {
  const { t }: { t: (key: string) => string } = useTranslation();
  return (
    <div className="p-4">
      {/* כפתור לינק */}
      <div style={{ marginTop: '15px', padding: '20px' }}>
        <Link
          to="/Analytics"
          style={{
            display: 'inline-block',
            padding: '8px 20px',
            backgroundColor: 'transparent',
            color: '#2b6a2c',
            borderRadius: '20px',
            border: '2px solid #2b6a2c',
            textDecoration: 'none',
            fontWeight: 'bold',
            fontSize: '1em',
            transition: 'background-color 0.3s, color 0.3s',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#2b6a2c';
            e.currentTarget.style.color = '#fff';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#2b6a2c';
          }}
          onClick={(e) => {
            e.currentTarget.style.backgroundColor = '#fff';
            e.currentTarget.style.color = '#2b6a2c';
          }}
        >
          {t("NavBar.Back_To_Analytics")}
        </Link>
      </div>

      {/* כרטיסים - אנליטיקות */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '20px',
          marginTop: '40px',
        }}
      >
        {/* כאן להוסיף את הקומפוננטות של הכרטיסים */}
        <TotalMonthlyVolunteers />
        <AnalyticsActiveMealTRain />
      </div>

      {/* גרפים - אנליטיקות */}
      <div
        style={{
          display: 'flex',
          gap: '30px',
          marginTop: '50px',
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}
      >
        {/* כאן להוסיף את הקומפוננטות של הגרפים */}
        <div
          style={{
            flex: '1 1 45%',
            minWidth: '300px',
            maxWidth: '600px',
            height: '450px',
            boxSizing: 'border-box',
          }}
        >
          <MonthlyMealTrainCard />
        </div>
      </div>
    </div >
  );
};

export default MealsStatisticsCard;
