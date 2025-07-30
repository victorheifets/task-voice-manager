'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type TranscriptionService = 'browser' | 'whisper' | 'azure' | 'hybrid';

interface TranscriptionConfig {
  service: TranscriptionService;
  setService: (service: TranscriptionService) => void;
  apiKey?: string;
  setApiKey: (key: string) => void;
  azureKey?: string;
  azureRegion?: string;
  setAzureConfig: (key: string, region: string) => void;
}

const TranscriptionContext = createContext<TranscriptionConfig | undefined>(undefined);

export const useTranscriptionConfig = () => {
  const context = useContext(TranscriptionContext);
  if (context === undefined) {
    throw new Error('useTranscriptionConfig must be used within a TranscriptionProvider');
  }
  return context;
};

interface TranscriptionProviderProps {
  children: React.ReactNode;
}

export const TranscriptionProvider: React.FC<TranscriptionProviderProps> = ({ children }) => {
  const [service, setService] = useState<TranscriptionService>('browser');
  const [apiKey, setApiKey] = useState<string>('');
  const [azureKey, setAzureKey] = useState<string>('');
  const [azureRegion, setAzureRegion] = useState<string>('');
  const [isClient, setIsClient] = useState(false);

  // Detect client-side rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load settings from localStorage on mount (client-side only)
  useEffect(() => {
    if (!isClient) return;

    const savedService = localStorage.getItem('transcriptionService') as TranscriptionService;
    const savedApiKey = localStorage.getItem('openaiApiKey');
    const savedAzureKey = localStorage.getItem('azureApiKey');
    const savedAzureRegion = localStorage.getItem('azureRegion');

    if (savedService) setService(savedService);
    if (savedApiKey) setApiKey(savedApiKey);
    if (savedAzureKey) setAzureKey(savedAzureKey);
    if (savedAzureRegion) setAzureRegion(savedAzureRegion);
  }, [isClient]);

  // Save service setting to localStorage when it changes (client-side only)
  useEffect(() => {
    if (!isClient) return;
    localStorage.setItem('transcriptionService', service);
  }, [service, isClient]);

  // Save API keys to localStorage when they change (client-side only)
  useEffect(() => {
    if (!isClient) return;
    if (apiKey) localStorage.setItem('openaiApiKey', apiKey);
  }, [apiKey, isClient]);

  useEffect(() => {
    if (!isClient) return;
    if (azureKey) localStorage.setItem('azureApiKey', azureKey);
    if (azureRegion) localStorage.setItem('azureRegion', azureRegion);
  }, [azureKey, azureRegion, isClient]);

  const setAzureConfig = (key: string, region: string) => {
    setAzureKey(key);
    setAzureRegion(region);
  };

  const value: TranscriptionConfig = {
    service,
    setService,
    apiKey,
    setApiKey,
    azureKey,
    azureRegion,
    setAzureConfig,
  };

  return (
    <TranscriptionContext.Provider value={value}>
      {children}
    </TranscriptionContext.Provider>
  );
};