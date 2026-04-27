
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NewAccountData } from './OnboadingFlow';

interface Props {
  onNext: () => void;
  onBack: () => void;
  data: NewAccountData;
  setData: React.Dispatch<React.SetStateAction<NewAccountData>>;
}

function InvitePartners({ onNext, onBack, data }: Props) {
  const { t }: { t: (key: string) => string } = useTranslation();

  const [email, setEmail] = useState('');
  const frontendUrl = process.env.REACT_APP_FRONTEND_URL;

  // const handleShareWhatsApp = () => {
  //   if (!data.id) return; 
  //   const inviteUrl = `${window.location.origin}/invite/${data.id}`;
  //   const message = `היי! יצרתי חשבון שיתוף שבת עבורנו 🎉\n\nהצטרפ/י אליי כאן:\n${inviteUrl}`;
  //   const whatsappLink = `https://wa.me/?text=${encodeURIComponent(message)}`;
  //   window.open(whatsappLink, '_blank');
  // };
  const handleShareWhatsApp = () => {
    const inviteUrl = `${frontendUrl}/invite/${data.id}`;
    const message =
      `היי! יצרתי חשבון שיתוף שבת עבורנו \n\n` +
      `הצטרפ/י אליי כאן:\n` +
      `${inviteUrl}`;
    const whatsappLink = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappLink, '_blank');
  };


//   const handleShareEmail = () => {
//   if (!data.id) return;

//   const inviteUrl = `${window.location.origin}/invite/${data.id}`;
//   const subject = 'הזמנה לשיתוף שבת 🕯️';
//   const body = `היי! יצרתי חשבון שיתוף שבת עבורנו 🎉\n\nהצטרפ/י אליי כאן:\n${inviteUrl}`;

//   const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
//   window.open(mailtoLink, '_blank');
// };
const handleShareEmail = () => {
  if (!data.id) return;
  const inviteUrl = `${frontendUrl}/invite/${data.id}`;
  const subject = 'הזמנה לשיתוף שבת :candle:';
  const body = `היי! יצרתי חשבון שיתוף שבת עבורנו :tada:\n\nהצטרפ/י אליי כאן:\n${inviteUrl}`;
  const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.open(mailtoLink, '_blank');
};


  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <div className="bg-white px-5 py-4 border-b border-gray-200 flex items-center sticky top-0 z-50">
        <button
          onClick={onBack}
          className="text-lg text-blue-500 cursor-pointer mr-4 hover:text-blue-700"
        >
          ←
        </button>
        <div className="text-lg font-semibold text-gray-800">
          {t('InvitePartnersShabbat.invite_family_member')}
        </div>
      </div>

      {/* Main Content */}
      <div className="px-5 py-5 max-w-sm mx-auto">
        {/* Invite Box */}
        <div className="bg-white rounded-xl p-5 my-5 shadow-sm border">
          <div className="text-center mb-5">
            <div className="text-5xl mb-3">👫</div>
            <div className="text-lg font-semibold text-gray-800 mb-2">
              {t('InvitePartnersShabbat.invite_sarah_to_join')}
            </div>
            <div className="text-sm text-gray-600">
              {t('InvitePartnersShabbat.share_account_access')}
            </div>
          </div>

          <button
            onClick={handleShareWhatsApp}
            className="w-full bg-green-500 text-white border-none rounded-lg px-5 py-3.5 text-sm font-semibold cursor-pointer my-2 hover:bg-green-600 transition-colors"
          >
            📱 {t('InvitePartnersShabbat.send_invite_whatsapp')}
          </button>

          <button
            onClick={handleShareEmail}
            className="w-full bg-white text-blue-500 border-2 border-blue-500 rounded-lg px-5 py-3.5 text-sm font-semibold cursor-pointer my-2 hover:bg-blue-50 transition-colors"
          >
            📧 {t('InvitePartnersShabbat.send_invite_email')}
          </button>
        </div>

        {/* Tip Box */}
        <div className="bg-gray-50 border-l-4 border-blue-500 p-3 my-5 rounded-r-lg">
          <div className="text-xs text-gray-600">
            💡 {t('InvitePartnersShabbat.both_can_set_plans')}
          </div>
        </div>

        {/* Buttons */}
        <button
          onClick={onNext}
          className="w-full px-4 py-4 bg-blue-500 text-white border-none rounded-lg text-base font-semibold cursor-pointer mt-5 hover:bg-blue-600 transition-colors"
        >
          {t('InvitePartnersShabbat.continue')}
        </button>

        <button
          onClick={onNext}
          className="w-full px-4 py-3.5 bg-white text-blue-500 border-2 border-blue-500 rounded-lg text-sm font-semibold cursor-pointer mt-3 hover:bg-blue-50 transition-colors"
        >
          {t('InvitePartnersShabbat.skip_for_now')}
        </button>
      </div>

      {/* Progress Indicator */}
      <div className="absolute top-5 left-1/2 transform -translate-x-1/2 flex gap-2">
        <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
        <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
        <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
        <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
        <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
        <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
      </div>

      {/* Screen Indicator */}
      <div className="absolute top-2.5 right-5 bg-black bg-opacity-10 px-2 py-1 rounded-xl text-xs text-gray-600">
        Step 3/6
      </div>
    </div>
  );
}

export default InvitePartners;
