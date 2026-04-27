import React from 'react';
import { useTranslation } from 'react-i18next';

interface CardWrapperProps {
  title: string;
  icon: React.ReactNode;
  value: React.ReactNode;
  description: string;
}

const CardWrapper = ({ title, icon, value, description }: CardWrapperProps) => {
  const { i18n } = useTranslation();
  console.log("Current dir:", i18n.dir());
  const isRtl = i18n.dir() === 'rtl';

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow w-full max-w-xs text-center">
      <div className="bg-gray-50 border-b border-gray-200 rounded-t-lg px-4 py-3">
        <h5 className="text-sm font-semibold text-gray-700 text-center">{title}</h5>
      </div>
      <div className="px-6 py-5 flex flex-col items-center justify-center space-y-2">
        {/* שורה של אייקון + ערך */}
        <div className={`flex items-center justify-center gap-2 text-center break-words max-h-40 overflow-hidden ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
          {value}
          {icon}
          
        </div>
        <p className="text-sm text-gray-600 text-center" dir={isRtl ? 'rtl' : 'ltr'}>{description}</p>
      </div>
    </div>
  );
};

export default CardWrapper;
