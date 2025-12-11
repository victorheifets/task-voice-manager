'use client';

import { useState, useEffect, useCallback } from 'react';
import i18n from '@/i18n';
import { useNotification } from '@/contexts/NotificationContext';
import { useTranscriptionConfig, VoiceLanguage, TranscriptionService } from '@/contexts/TranscriptionContext';

export interface SettingsState {
  selectedLanguage: string;
  voiceRecognitionLanguage: string;
  apiKey: string;
  groqApiKey: string;
  azureKey: string;
  azureRegion: string;
}

export interface SettingsActions {
  setSelectedLanguage: (lang: string) => void;
  setVoiceRecognitionLanguage: (lang: VoiceLanguage) => void;
  setApiKey: (key: string) => void;
  setGroqApiKey: (key: string) => void;
  setAzureKey: (key: string) => void;
  setAzureRegion: (region: string) => void;
  handleSaveSettings: () => void;
  handleLanguageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleVoiceLanguageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function useSettingsState(): SettingsState & SettingsActions & {
  transcriptionService: TranscriptionService;
  setTranscriptionService: (service: TranscriptionService) => void;
} {
  const { showSuccess } = useNotification();
  const {
    service: transcriptionService,
    setService: setTranscriptionService,
    language: voiceRecognitionLanguage,
    setLanguage: setVoiceRecognitionLanguage
  } = useTranscriptionConfig();

  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language || 'en');
  const [apiKey, setApiKey] = useState('');
  const [groqApiKey, setGroqApiKey] = useState('');
  const [azureKey, setAzureKey] = useState('');
  const [azureRegion, setAzureRegion] = useState('');

  // Load saved settings on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const savedApiKey = localStorage.getItem('openaiApiKey') || '';
    const savedGroqApiKey = localStorage.getItem('groqApiKey') || '';
    const savedAzureKey = localStorage.getItem('azureApiKey') || '';
    const savedAzureRegion = localStorage.getItem('azureRegion') || '';

    setApiKey(savedApiKey);
    setGroqApiKey(savedGroqApiKey);
    setAzureKey(savedAzureKey);
    setAzureRegion(savedAzureRegion);
    setSelectedLanguage(i18n.language || 'en');
  }, []);

  const handleLanguageChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedLanguage(event.target.value);
  }, []);

  const handleVoiceLanguageChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    // Update the context (which also persists to localStorage)
    setVoiceRecognitionLanguage(event.target.value as VoiceLanguage);
  }, [setVoiceRecognitionLanguage]);

  const handleSaveSettings = useCallback(() => {
    // Save interface language setting
    i18n.changeLanguage(selectedLanguage);

    // Voice recognition language is now saved automatically via TranscriptionContext
    // No need to manually save to localStorage here

    // Note: API keys are no longer stored client-side for security
    // They are managed server-side only

    showSuccess('Settings saved successfully!');
  }, [selectedLanguage, showSuccess]);

  return {
    // State
    selectedLanguage,
    voiceRecognitionLanguage,
    apiKey,
    groqApiKey,
    azureKey,
    azureRegion,
    transcriptionService,

    // Setters
    setSelectedLanguage,
    setVoiceRecognitionLanguage,
    setApiKey,
    setGroqApiKey,
    setAzureKey,
    setAzureRegion,
    setTranscriptionService,

    // Handlers
    handleLanguageChange,
    handleVoiceLanguageChange,
    handleSaveSettings,
  };
}
