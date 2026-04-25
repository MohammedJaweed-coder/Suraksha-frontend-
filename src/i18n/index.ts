import i18n from 'i18next';
import HttpBackend from 'i18next-http-backend';
import { initReactI18next } from 'react-i18next';

const fallbackLanguage = 'en';
const savedLanguage = localStorage.getItem('kaval-language') ?? fallbackLanguage;

void i18n
  .use(HttpBackend)
  .use(initReactI18next)
  .init({
    lng: savedLanguage,
    fallbackLng: fallbackLanguage,
    supportedLngs: ['en', 'kn', 'hi'],
    interpolation: {
      escapeValue: false
    },
    backend: {
      loadPath: '/locales/{{lng}}/translation.json'
    },
    react: {
      useSuspense: false
    }
  });

i18n.on('languageChanged', (language) => {
  localStorage.setItem('kaval-language', language);
});

export default i18n;
