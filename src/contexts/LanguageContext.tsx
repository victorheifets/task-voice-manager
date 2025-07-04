'use client';

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

type Language = 'en' | 'es' | 'fr';

interface LanguageContextType {
  language: Language;
  changeLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  changeLanguage: () => {},
});

export const useLanguageContext = () => useContext(LanguageContext);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  const { i18n } = useTranslation();
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    const storedLanguage = localStorage.getItem('language') as Language | null;
    
    if (storedLanguage && ['en', 'es', 'fr'].includes(storedLanguage)) {
      setLanguage(storedLanguage);
      i18n.changeLanguage(storedLanguage);
    } else {
      // Use browser language if available and supported
      const browserLang = navigator.language.split('-')[0] as Language;
      const finalLang = ['en', 'es', 'fr'].includes(browserLang) ? browserLang : 'en';
      
      setLanguage(finalLang);
      i18n.changeLanguage(finalLang);
    }
  }, [i18n]);

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}; 