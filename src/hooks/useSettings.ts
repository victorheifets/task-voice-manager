'use client';

import { useState, useEffect, useCallback } from 'react';
import i18n from '@/i18n';
import { useNotification } from '@/contexts/NotificationContext';

export function useSettings() {
  const { showSuccess } = useNotification();
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language || 'en');
  const [voiceRecognitionLanguage, setVoiceRecognitionLanguage] = useState('en');
  const [apiKey, setApiKey] = useState('');
  const [azureKey, setAzureKey] = useState('');
  const [azureRegion, setAzureRegion] = useState('');

  // Load saved settings on mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem('openaiApiKey') || '';
    const savedAzureKey = localStorage.getItem('azureApiKey') || '';
    const savedAzureRegion = localStorage.getItem('azureRegion') || '';
    const savedVoiceLanguage = localStorage.getItem('voiceRecognitionLanguage') || 'en';
    
    setApiKey(savedApiKey);
    setAzureKey(savedAzureKey);
    setAzureRegion(savedAzureRegion);
    setVoiceRecognitionLanguage(savedVoiceLanguage);
    setSelectedLanguage(i18n.language || 'en');
  }, []);

  // Handlers
  const handleLanguageChange = useCallback((event: { target: { value: string } }) => {
    setSelectedLanguage(event.target.value);
  }, []);

  const handleVoiceLanguageChange = useCallback((event: { target: { value: string } }) => {
    setVoiceRecognitionLanguage(event.target.value);
  }, []);

  const handleApiKeyChange = useCallback((value: string) => {
    setApiKey(value);
  }, []);

  const handleAzureKeyChange = useCallback((value: string) => {
    setAzureKey(value);
  }, []);

  const handleAzureRegionChange = useCallback((value: string) => {
    setAzureRegion(value);
  }, []);

  const handleSaveSettings = useCallback(() => {
    // Save interface language setting
    i18n.changeLanguage(selectedLanguage);
    
    // Save voice recognition language
    localStorage.setItem('voiceRecognitionLanguage', voiceRecognitionLanguage);
    
    // Save API keys to localStorage
    if (apiKey) localStorage.setItem('openaiApiKey', apiKey);
    if (azureKey) localStorage.setItem('azureApiKey', azureKey);
    if (azureRegion) localStorage.setItem('azureRegion', azureRegion);
    
    // Show success notification
    showSuccess('Settings saved successfully!');
  }, [selectedLanguage, voiceRecognitionLanguage, apiKey, azureKey, azureRegion, showSuccess]);

  return {
    // State
    selectedLanguage,
    voiceRecognitionLanguage,
    apiKey,
    azureKey,
    azureRegion,
    
    // Handlers
    handleLanguageChange,
    handleVoiceLanguageChange,
    handleApiKeyChange,
    handleAzureKeyChange,
    handleAzureRegionChange,
    handleSaveSettings,
  };
}
