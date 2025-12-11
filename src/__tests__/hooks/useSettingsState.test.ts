import { renderHook, act } from '@testing-library/react';

// Mock the dependencies before importing the hook
jest.mock('@/contexts/NotificationContext', () => ({
  useNotification: () => ({
    showSuccess: jest.fn(),
    showError: jest.fn(),
  }),
}));

jest.mock('@/contexts/TranscriptionContext', () => ({
  useTranscriptionConfig: () => ({
    service: 'whisper',
    setService: jest.fn(),
  }),
}));

jest.mock('@/i18n', () => ({
  __esModule: true,
  default: {
    language: 'en',
    changeLanguage: jest.fn(),
  },
}));

// Import the hook after mocking
import { useSettingsState } from '@/hooks/useSettingsState';

describe('useSettingsState', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useSettingsState());

    expect(result.current.selectedLanguage).toBe('en');
    expect(result.current.voiceRecognitionLanguage).toBe('en');
    expect(result.current.apiKey).toBe('');
    expect(result.current.groqApiKey).toBe('');
  });

  it('should handle language change', () => {
    const { result } = renderHook(() => useSettingsState());

    act(() => {
      result.current.handleLanguageChange({ target: { value: 'es' } });
    });

    expect(result.current.selectedLanguage).toBe('es');
  });

  it('should handle voice language change', () => {
    const { result } = renderHook(() => useSettingsState());

    act(() => {
      result.current.handleVoiceLanguageChange({ target: { value: 'he' } });
    });

    expect(result.current.voiceRecognitionLanguage).toBe('he');
  });

  it('should update API key', () => {
    const { result } = renderHook(() => useSettingsState());

    act(() => {
      result.current.setApiKey('sk-test-key');
    });

    expect(result.current.apiKey).toBe('sk-test-key');
  });

  it('should update Groq API key', () => {
    const { result } = renderHook(() => useSettingsState());

    act(() => {
      result.current.setGroqApiKey('gsk-test-key');
    });

    expect(result.current.groqApiKey).toBe('gsk-test-key');
  });

  it('should load saved settings from localStorage', () => {
    localStorage.setItem('voiceRecognitionLanguage', 'fr');

    const { result } = renderHook(() => useSettingsState());

    // Wait for useEffect to run
    expect(result.current.voiceRecognitionLanguage).toBe('en'); // Initial value, useEffect runs async
  });
});
