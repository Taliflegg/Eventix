import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { IconType } from 'react-icons';
import { FaCalendarAlt, FaChartBar, FaHome, FaUtensils } from 'react-icons/fa';
import { Link } from 'react-router-dom';

function Analytics() {
  const { t }: { t: (key: string) => string } = useTranslation();
  const [isMobile, setIsMobile] = useState(false);

  // בדיקה אם המסך הוא מובייל
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  const statisticsCards = [
    {
      title: t('Analytics.title_general'),
      icon: FaChartBar,
      link: "/general-statistics",
      gradient: "linear-gradient(135deg, #2b6a2c 0%, #4ca64a 50%, #78c27b 100%)",
      description: t('Analytics.description_general')
    },
    {
      title: t('Analytics.title_events'),
      icon: FaCalendarAlt,
      link: "/events-statistics",
      gradient: "linear-gradient(135deg, #2b6a2c 0%, #4ca64a 50%, #78c27b 100%)",
      description: t('Analytics.description_events')
    },
    {
      title: t('Analytics.title_shabbat'),
      icon: FaHome,
      link: "/shabbat-statistics",
      gradient: "linear-gradient(135deg, #2b6a2c 0%, #4ca64a 50%, #78c27b 100%)",
      description: t('Analytics.description_shabbat')
    },
    {
      title: t('Analytics.title_meals'),
      icon: FaUtensils,
      link: "/meals-statistics",
      gradient: "linear-gradient(135deg, #2b6a2c 0%, #4ca64a 50%, #78c27b 100%)",
      description: t('Analytics.description_meals')
    }
  ];

  return (
    <div>
      <main style={{
        padding: isMobile ? '20px' : '40px',
        maxWidth: '1200px',
        margin: '0 auto',
        textAlign: 'center'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
          gap: isMobile ? '20px' : '30px',
          marginBottom: '40px'
        }}>
          {statisticsCards.map((card, index) => (
            <StatisticsCard
              key={index}
              title={card.title}
              icon={card.icon}
              link={card.link}
              gradient={card.gradient}
              description={card.description}
            />
          ))}
        </div>
      </main>
    </div>
  );
}

// קומפוננטה של כרטיסיית סטטיסטיקות
const StatisticsCard = ({ title, icon: Icon, link, gradient, description }: {
  title: string;
  icon: IconType;
  link: string;
  gradient: string;
  description: string;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      to={link}
      style={{
        textDecoration: 'none',
        color: 'inherit'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={{
        background: gradient,
        borderRadius: '16px',
        padding: '30px 25px',
        boxShadow: isHovered
          ? '0 15px 35px rgba(0,0,0,0.2), 0 5px 15px rgba(0,0,0,0.1)'
          : '0 10px 25px rgba(0,0,0,0.15), 0 5px 10px rgba(0,0,0,0.1)',
        transform: isHovered ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        minHeight: '180px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)',
          animation: isHovered ? 'shine 1.5s infinite' : 'none'
        }} />

        <div style={{
          fontSize: '3em',
          marginBottom: '15px',
          opacity: 0.9,
          transform: isHovered ? 'scale(1.1)' : 'scale(1)',
          transition: 'transform 0.3s ease'
        }}>
          {Icon && React.createElement(Icon as React.ComponentType, {})}
        </div>

        <h3 style={{
          fontSize: '1.3em',
          fontWeight: 'bold',
          marginBottom: '10px',
          textAlign: 'center',
          lineHeight: '1.2',
          textShadow: '0 2px 4px rgba(0,0,0,0.3)'
        }}>
          {title}
        </h3>

        <p style={{
          fontSize: '0.9em',
          opacity: 0.9,
          textAlign: 'center',
          lineHeight: '1.4',
          margin: 0
        }}>
          {description}
        </p>

        <div style={{
          marginTop: '15px',
          fontSize: '1.2em',
          transform: isHovered ? 'translateX(5px)' : 'translateX(0)',
          transition: 'transform 0.3s ease'
        }}>
          →
        </div>
      </div>
    </Link>
  );
};

export default Analytics;