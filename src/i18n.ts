'use client';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations directly
import enCommon from '../public/locales/en/common.json';
import enTasks from '../public/locales/en/tasks.json';
import enNotes from '../public/locales/en/notes.json';
import esCommon from '../public/locales/es/common.json';
import esTasks from '../public/locales/es/tasks.json';
import esNotes from '../public/locales/es/notes.json';
import frCommon from '../public/locales/fr/common.json';
import frTasks from '../public/locales/fr/tasks.json';
import frNotes from '../public/locales/fr/notes.json';
import heCommon from '../public/locales/he/common.json';
import heTasks from '../public/locales/he/tasks.json';
import heNotes from '../public/locales/he/notes.json';

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
          tasks: esTasks,
          notes: esNotes,
        },
        fr: {
          common: frCommon,
          tasks: frTasks,
          notes: frNotes,
        },
        he: {
          common: heCommon,
          tasks: heTasks,
          notes: heNotes,
        },
      },
      lng: 'en', // Set default language
      fallbackLng: 'en',
      supportedLngs: ['en', 'es', 'fr', 'he'],
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