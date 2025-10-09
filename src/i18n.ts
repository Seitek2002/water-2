import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import kg from './locales/kg.json';
// 👇 Импортируй твои файлы переводов
import ru from './locales/ru.json';

import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'ru',
    supportedLngs: ['ru', 'kg', 'en'],
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    },
    resources: {
      ru: { translation: ru },
      kg: { translation: kg },
      en: { translation: en }
    },
    interpolation: {
      escapeValue: false // для React это не требуется
    }
  });

export default i18n;
