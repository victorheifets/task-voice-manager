'use client';

import React, { ReactNode, useEffect } from 'react';
import { AppProvider } from './contexts/AppProvider';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  // Force i18n initialization on client side
  useEffect(() => {
    if (i18n.isInitialized) {
      i18n.changeLanguage(i18n.language);
    }
  }, []);

  return (
    <I18nextProvider i18n={i18n}>
      <AppProvider>{children}</AppProvider>
    </I18nextProvider>
  );
} 