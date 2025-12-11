import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { SpeechService } from '../lib/speech/speechService';
import { TranscriptionResult, SpeechError } from '../lib/speech/types';

interface UseSpeechRecognitionOptions {
  defaultLanguage?: string;
  useAzureFallback?: boolean;
  azureKey?: string;
  azureRegion?: string;
  transcriptionService?: 'browser' | 'whisper' | 'groq' | 'azure' | 'hybrid';
  onTranscript?: (text: string) => void;
  onError?: (error: SpeechError) => void;
}

export const useSpeechRecognition = (options: UseSpeechRecognitionOptions) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<SpeechError | null>(null);
  const speechServiceRef = useRef<SpeechService | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Store callbacks in refs to avoid stale closures
  const onTranscriptRef = useRef(options.onTranscript);
  const onErrorRef = useRef(options.onError);

  // Update refs when callbacks change
  useEffect(() => {
    onTranscriptRef.current = options.onTranscript;
    onErrorRef.current = options.onError;
  }, [options.onTranscript, options.onError]);

  const config = useMemo(() => ({
    defaultLanguage: options.defaultLanguage || 'en',
    useAzureFallback: options.useAzureFallback || false,
    azureKey: options.azureKey,
    azureRegion: options.azureRegion,
    transcriptionService: options.transcriptionService || 'browser',
  }), [options.defaultLanguage, options.useAzureFallback, options.azureKey, options.azureRegion, options.transcriptionService]);

  // Reinitialize speech service when config changes (language, service, etc.)
  useEffect(() => {
    // Clean up existing service
    if (speechServiceRef.current) {
      speechServiceRef.current.cleanup();
      speechServiceRef.current = null;
      setIsInitialized(false);
    }

    const handleResult = (result: TranscriptionResult) => {
      setTranscript(result.text);
      // Call onTranscript for both interim and final results for real-time display
      if (onTranscriptRef.current) {
        onTranscriptRef.current(result.text);
      }
    };

    const handleError = (speechError: SpeechError) => {
      const silentErrors = ['network', 'FALLBACK_MODE', 'USE_TEXT_INPUT', 'language-not-supported', 'no-speech', 'audio-capture'];
      if (!silentErrors.includes(speechError.code)) {
        console.error('Speech recognition error:', speechError);
      }
      setError(speechError);
      setIsRecording(false);
      if (onErrorRef.current) {
        onErrorRef.current(speechError);
      }
    };

    speechServiceRef.current = new SpeechService(config, handleResult, handleError);
    setIsInitialized(true);

    return () => {
      if (speechServiceRef.current) {
        speechServiceRef.current.cleanup();
        speechServiceRef.current = null;
      }
    };
  }, [config]);

  const startRecording = useCallback(async () => {
    if (!speechServiceRef.current) {
      console.error('Speech service not initialized');
      return;
    }

    console.log('Starting recording with service:', !!speechServiceRef.current);
    setError(null);
    setTranscript('');
    
    try {
      console.log('Starting speech service recording...');
      await speechServiceRef.current.startRecording();
      console.log('Speech service recording started');
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
      setError({
        code: 'START_ERROR',
        message: 'Failed to start recording. Please try the text input instead.',
        source: 'hook'
      });
    }
  }, []);

  const stopRecording = useCallback(async () => {
    if (!speechServiceRef.current) {
      return;
    }

    try {
      await speechServiceRef.current.stopRecording();
      setIsRecording(false);
    } catch (error) {
      console.error('Failed to stop recording:', error);
      setIsRecording(false);
    }
  }, []);


  return {
    isRecording,
    transcript,
    error,
    startRecording,
    stopRecording,
    isInitialized
  };
};
