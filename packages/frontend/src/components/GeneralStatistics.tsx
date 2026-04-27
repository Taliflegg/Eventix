import { Link } from 'react-router-dom';
import MonthlyActiveUsersByApp from './MonthlyActiveUsersByApp';
import MonthlyActiveUsersCard from './MonthlyActiveUsersCard';
import PlatformAdoptionRateCard from './platformAdoptionRateCard'
import { useTranslation } from 'react-i18next';
import AcquisitionChart from './AcquisitionChart';
import AnalyticsCards from './AnalyticsCards';

const GeneralStatisticsCard = () => {
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
            color: '#2B6A2C',
            borderRadius: '20px',
            border: '2px solid #2B6A2C',
            textDecoration: 'none',
            fontWeight: 'bold',
            fontSize: '1em',
            transition: 'background-color 0.3s, color 0.3s',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#2B6A2C';
            e.currentTarget.style.color = '#fff';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#2B6A2C';
          }}
          onClick={(e) => {
            e.currentTarget.style.backgroundColor = '#fff';
            e.currentTarget.style.color = '#2B6A2C';
          }}
        >
          {t("NavBar.Back_To_Analytics")}
        </Link>
      </div>
      {/* אזור הכרטיסים */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '20px',
          marginTop: '20',
        }}
      >
        <AnalyticsCards />
        <MonthlyActiveUsersCard />
        <PlatformAdoptionRateCard />
      </div>
      {/* אזור הגרפים */}
      <div
        style={{
          display: 'flex',
          gap: '30px',
          marginTop: '50px',
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}
      >
        <div
          style={{
            flex: '1 1 45%',
            minWidth: '300px',
            maxWidth: '600px',
            height: '450px',
            boxSizing: 'border-box',
          }}
        >
          <MonthlyActiveUsersByApp />
        </div>
        <div
          style={{
            flex: '1 1 45%',
            minWidth: '300px',
            maxWidth: '600px',
            height: '450px',
            boxSizing: 'border-box',
          }}
        >
          <AcquisitionChart />
        </div>
      </div>
    </div>
  );
};
export default GeneralStatisticsCard;
