import { Link } from 'react-router-dom';
import AverageAttendeesCard from './AverageAttendees';
import CompletedEventsCard from './CompletedEventsSummary';
import EventsCreatedThisMonth from './EventsCreatedThisMonth';
import UserCreateEventCard from './UserCreateEventCard';

import { useTranslation } from 'react-i18next';
import EventDistributionChart from './EventDistributionChart';
import MonthlyEventChart from './MonthlyEventChart';

const EventStatisticsCard = () => {
    const { t }: { t: (key: string) => string } = useTranslation();

    return (
        <div
            className="p-4"
            style={{
                maxHeight: '90vh', // מגביל את הגובה ל-90% מהחלון ומאפשר גלילה פנימית
                overflowY: 'auto',
            }}
        >
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
                    marginTop: 20,
                }}
            >
                <CompletedEventsCard />
                <AverageAttendeesCard />
                <EventsCreatedThisMonth />
                <UserCreateEventCard />
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
                    <EventDistributionChart />
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
                    <MonthlyEventChart />
                </div>
            </div>
        </div>
    );
};

export default EventStatisticsCard;
