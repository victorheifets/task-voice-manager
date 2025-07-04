import { useState, useEffect, useCallback } from 'react';
import { SpeechService } from '../lib/speech/speechService';
import { SpeechConfig, TranscriptionResult, SpeechError } from '../lib/speech/types';

export const useSpeechRecognition = (config: SpeechConfig) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<SpeechError | null>(null);
  const [speechService, setSpeechService] = useState<SpeechService | null>(null);

  useEffect(() => {
    const service = new SpeechService(
      config,
      (result: TranscriptionResult) => {
        if (result.isFinal) {
          setTranscript(result.text);
          setIsRecording(false);
        }
      },
      (error: SpeechError) => {
        setError(error);
        setIsRecording(false);
      }
    );

    setSpeechService(service);

    return () => {
      service.cleanup();
    };
  }, [config]);

  const startRecording = useCallback(async () => {
    if (!speechService) return;
    
    setError(null);
    setTranscript('');
    setIsRecording(true);
    await speechService.startRecording();
  }, [speechService]);

  const stopRecording = useCallback(async () => {
    if (!speechService) return;
    
    setIsRecording(false);
    await speechService.stopRecording();
  }, [speechService]);

  return {
    isRecording,
    transcript,
    error,
    startRecording,
    stopRecording
  };
};
