import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslation from './translations/en.json';
import heTranslation from './translations/he.json';

i18n.use(LanguageDetector)  // Enables automatic language detection
    .use(initReactI18next)
    .init({
        fallbackLng: 'en', //Default language if detection fails
        debug: true,
        interpolation: {   // Interpolation settings
            escapeValue: false,
        },
        resources: {
            en: {
                translation: enTranslation,
            },
            he: {
                translation: heTranslation,
            },
        },
    });
export default i18n;   
