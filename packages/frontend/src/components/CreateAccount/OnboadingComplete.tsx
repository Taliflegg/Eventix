import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { NewAccountData } from './OnboadingFlow';
import { Navigate, useNavigate } from 'react-router-dom';

interface OnboardingCompleteProps {
  onStartPlanning?: () => void;
  data: NewAccountData;
}

interface ChecklistItem {
  icon: string;
  text: string;
}

const OnboardingComplete: React.FC<OnboardingCompleteProps> = ({ onStartPlanning, data }) => {
  const { t }: { t: (key: string, options?: any) => string } = useTranslation();
  const navigate = useNavigate();
  const handleStartPlanning = (): void => {
    navigate('/shabbat');
    if (onStartPlanning) {
      onStartPlanning();
    }
  };

  useEffect(() => {
    console.log('🔄 Account data updated:', data);
  }, [data]);

  const checklistItems: ChecklistItem[] = [
    {
      icon: '✓',
      text: t('OnboardingCompleteShabbat.checklist_account_created', {
        accountName: data.accountName,
      }),
    },
    {
      icon: '✓',
      text: t('OnboardingCompleteShabbat.checklist_home_location', {
        homeLocationName: data.homeLocation.name,
        homeLocationAddress: data.homeLocation.address,
      }),
    },
    ...(data.additionalLocations && data.additionalLocations.length > 0
      ? [
          {
            icon: '✓',
            text: t('OnboardingCompleteShabbat.checklist_additional_locations', {
              count: data.additionalLocations.length,
            }),
          },
        ]
      : []),
    {
      icon: '✓',
      text: t('OnboardingCompleteShabbat.checklist_ready_to_share'),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Screen Indicator */}
      <div className="absolute top-5 right-5 bg-black bg-opacity-10 px-2 py-1 rounded-xl text-xs text-gray-600">
        {t('OnboardingCompleteShabbat.screen_title')}
      </div>

      {/* Success Content */}
      <div className="text-center px-5 py-10 max-w-md mx-auto">
        <div className="text-8xl mb-5">{t('OnboardingCompleteShabbat.congrats_icon')}</div>

        <h2 className="text-2xl font-semibold text-gray-800 mb-3">
          {t('OnboardingCompleteShabbat.header')}
        </h2>

        <p className="text-sm text-gray-600 mb-8">
          {t('OnboardingCompleteShabbat.subtitle')}
        </p>

        {/* Checklist */}
        <div className="text-left mb-8">
          {checklistItems.map((item, index) => (
            <div key={index} className="flex items-center mb-3 text-sm text-gray-800">
              <div className="w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center mr-3 text-xs font-semibold">
                {item.icon}
              </div>
              <div>{item.text}</div>
            </div>
          ))}

          {/* Additional location details */}
          {data.additionalLocations?.map((loc, idx) => (
            <div key={idx} className="ml-8 mb-2 text-xs text-gray-600">
              • {loc.name}: {loc.address}
            </div>
          ))}
        </div>

        {/* Start Planning Button */}
        <button
          onClick={handleStartPlanning}
          className="w-full bg-blue-500 text-white py-4 rounded-lg text-base font-semibold hover:bg-blue-600"
        >
          {t('OnboardingCompleteShabbat.start_planning_button')}
        </button>
      </div>

      {/* Progress Indicator */}
      <div className="absolute top-5 left-1/2 transform -translate-x-1/2 flex gap-2">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: 'rgb(34 197 94)' }} // green-500
          />
        ))}
      </div>
    </div>
  );
};

export default OnboardingComplete;
