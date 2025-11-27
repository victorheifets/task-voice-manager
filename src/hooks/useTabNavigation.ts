'use client';

import { useState, useCallback } from 'react';

export function useTabNavigation(initialTab = 0) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isWideView, setIsWideView] = useState(true);
  const [showMobileTextInput, setShowMobileTextInput] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');

  const handleTabChange = useCallback((_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  }, []);

  const handleHeaderTabChange = useCallback((tabIndex: number) => {
    setActiveTab(tabIndex);
  }, []);

  const handleViewToggle = useCallback(() => {
    setIsWideView(prev => !prev);
  }, []);

  const handleShowMobileTextInput = useCallback((show: boolean) => {
    setShowMobileTextInput(show);
  }, []);

  const handleFloatingMicTranscript = useCallback((text: string) => {
    setCurrentTranscript(text);
  }, []);

  const handleMenuClick = useCallback(() => {
    // Handle mobile menu click - could open a drawer or show mobile navigation
  }, []);

  return {
    // State
    activeTab,
    isWideView,
    showMobileTextInput,
    currentTranscript,
    
    // Handlers
    handleTabChange,
    handleHeaderTabChange,
    handleViewToggle,
    handleShowMobileTextInput,
    handleFloatingMicTranscript,
    handleMenuClick,
  };
}
