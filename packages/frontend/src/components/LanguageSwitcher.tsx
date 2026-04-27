import React from 'react';
import i18n from '../i18n/i18n';

const LanguageSwitcher: React.FC = () => {
  const currentLang = i18n.language;

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className={`fixed top-4 ${currentLang === 'he' ? 'left-4' : 'right-4'} flex gap-4`}>
      <button
        onClick={() => changeLanguage('en')}
        className={`transition text-sm md:text-base px-2 py-1 
          ${currentLang === 'en'
            ? 'text-green-700 font-bold underline underline-offset-4'
            : 'text-gray-600 hover:text-black hover:underline hover:underline-offset-4'}
        `}
      >
        English
      </button>
      <button
        onClick={() => changeLanguage('he')}
        className={`transition text-sm md:text-base px-2 py-1 
          ${currentLang === 'he'
            ? 'text-green-700 font-bold underline underline-offset-4'
            : 'text-gray-600 hover:text-black hover:underline hover:underline-offset-4'}
        `}
      >
        עברית
      </button>
    </div>
  );
};

export default LanguageSwitcher;
