'use client';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations directly
import enCommon from '../public/locales/en/common.json';
import enTasks from '../public/locales/en/tasks.json';
import enNotes from '../public/locales/en/notes.json';
import esCommon from '../public/locales/es/common.json';
import frCommon from '../public/locales/fr/common.json';

// Initialize only once
if (!i18n.isInitialized) {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources: {
        en: {
          common: enCommon,
          tasks: enTasks,
          notes: enNotes,
        },
        es: {
          common: esCommon,
          tasks: enTasks, // Fallback to English
          notes: enNotes,  // Fallback to English
        },
        fr: {
          common: frCommon,
          tasks: enTasks, // Fallback to English
          notes: enNotes,  // Fallback to English
        },
      },
      lng: 'en', // Set default language
      fallbackLng: 'en',
      supportedLngs: ['en', 'es', 'fr'],
      debug: false, // Disable debug to reduce console noise
      detection: {
        order: ['localStorage', 'cookie', 'navigator'],
        caches: ['localStorage', 'cookie'],
      },
      ns: ['common', 'tasks', 'notes'],
      defaultNS: 'common',
      interpolation: {
        escapeValue: false,
      },
      react: {
        useSuspense: false,
      },
    });
}

export default i18n; 