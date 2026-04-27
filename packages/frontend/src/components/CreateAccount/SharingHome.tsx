
import React from 'react';
import { useTranslation } from 'react-i18next';
import { NewAccountData } from './OnboadingFlow';
import { toast } from 'react-toastify';

interface SharingHomeProps {
  onNext: () => void;
  onBack: () => void;
  data: NewAccountData;
  setData: React.Dispatch<React.SetStateAction<NewAccountData>>;
}

const SharingHome: React.FC<SharingHomeProps> = ({ onNext, onBack, data }) => {
  const { t }: { t: (key: string) => string } = useTranslation();


  const handleShareWhatsApp = (): void => {
    toast.success(`📱 ${t('SharingHomeShabbat.whatsapp_message')}`);
  };

  const handleCopyLink = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText('https://yachad.app/share/xyz789');
      toast.success(t('copied_to_clipboard'));
    } catch (err) {
      console.error('Failed to copy link:', err);
      toast.error(t('copy_failed'));
    }
  };

  const handleContinue = (): void => {
    onNext();
  };

  const handleSkip = (): void => {
    onNext();
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Screen Indicator */}
      <div className="absolute top-5 right-5 bg-black bg-opacity-10 px-2 py-1 rounded-xl text-xs text-gray-600">
        {t('SharingHomeShabbat.step_5_of_6')}
      </div>

      {/* Header */}
      <div className="bg-white px-5 py-4 border-b border-gray-200 flex items-center sticky top-0 z-10">
        <button
          onClick={onBack}
          className="text-lg text-blue-500 mr-4 hover:text-blue-700"
        >
          ←
        </button>
        <h1 className="text-lg font-semibold text-gray-800">{t('SharingHomeShabbat.share_with_friends')}</h1>
      </div>

      {/* Content */}
      <div className="px-5 py-5 max-w-md mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-3">
            {t('SharingHomeShabbat.start_coordinating')}
          </h2>
          <p className="text-sm text-gray-600">
            {t('SharingHomeShabbat.share_tel_aviv_with_friends')}
          </p>
        </div>

        {/* Share Container */}
        <div className="bg-white rounded-xl p-5 mb-5 shadow-lg">
          <div className="text-center mb-5">
            <div className="text-5xl mb-3">🔗</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {t('SharingHomeShabbat.share_home_location')}
            </h3>
            <p className="text-sm text-gray-600">
              {t('SharingHomeShabbat.share_tel_aviv_tip')}
            </p>
          </div>

          {/* Location Preview */}
          <div className="bg-gray-50 p-3 rounded-lg mb-4">
            <div className="text-xs text-gray-600 mb-2">{t('SharingHomeShabbat.youll_be_sharing')}</div>
            <div className="text-sm font-semibold text-gray-800 mb-1">
              🏠 {data.homeLocation.name}
            </div>
            <div className="text-xs text-gray-600">
              {data.homeLocation.address}
            </div>
          </div>

          {/* Share Buttons */}
          <button
            onClick={handleShareWhatsApp}
            className="w-full bg-green-500 text-white py-3.5 rounded-lg text-sm font-semibold hover:bg-green-600 mb-2"
          >
            📱 {t('SharingHomeShabbat.share_via_whatsapp')}
          </button>

          <button
            onClick={handleCopyLink}
            className="w-full bg-white text-blue-500 border-2 border-blue-500 py-3.5 rounded-lg text-sm font-semibold hover:bg-blue-50"
          >
            📋 {t('SharingHomeShabbat.copy_share_link')}
          </button>
        </div>

        {/* Tip Box */}
        <div className="bg-gray-50 border-l-4 border-blue-500 p-3 rounded-r-lg mb-5">
          <div className="text-xs text-gray-600">
            {t('SharingHomeShabbat.share_link_tip')}
          </div>
        </div>

        {/* Navigation Buttons */}
        <button
          onClick={handleContinue}
          className="w-full bg-blue-500 text-white py-4 rounded-lg text-base font-semibold hover:bg-blue-600 mb-3"
        >
          {t('SharingHomeShabbat.continue')}
        </button>

        <button
          onClick={handleSkip}
          className="w-full bg-white text-blue-500 border-2 border-blue-500 py-3.5 rounded-lg text-sm font-semibold hover:bg-blue-50"
        >
          {t('SharingHomeShabbat.skip_for_now')}
        </button>
      </div>

      {/* Progress Indicator */}
      <div className="absolute top-5 left-1/2 transform -translate-x-1/2 flex gap-2">
        <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
        <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
        <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
        <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
        <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
        <div className="w-2.5 h-2.5 rounded-full bg-gray-300"></div>
      </div>
    </div>
  );
};

export default SharingHome;
