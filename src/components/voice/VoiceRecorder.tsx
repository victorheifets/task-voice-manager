'use client';

import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import ErrorIcon from '@mui/icons-material/Error';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { SpeechConfig } from '../../lib/speech/types';

interface VoiceRecorderProps {
  onTranscript: (text: string) => void;
  onRecordingStateChange?: (isRecording: boolean) => void;
  language?: string;
  azureKey?: string;
  azureRegion?: string;
  transcriptionService?: 'browser' | 'whisper' | 'azure' | 'hybrid';
}

const VoiceRecorder = React.forwardRef<
  { startRecording: () => Promise<void>; stopRecording: () => Promise<void> },
  VoiceRecorderProps
>(({
  onTranscript,
  language = 'en-US',
  azureKey,
  azureRegion,
  transcriptionService = 'browser',
  onRecordingStateChange
}, ref) => {

  const {
    isRecording,
    transcript,
    error,
    startRecording: originalStartRecording,
    stopRecording: originalStopRecording
  } = useSpeechRecognition({
    defaultLanguage: language,
    useAzureFallback: Boolean(azureKey && azureRegion),
    azureKey,
    azureRegion,
    transcriptionService,
    onTranscript: (text) => {
      console.log('VoiceRecorder: Transcript updated:', text);
      console.log('VoiceRecorder: Calling onTranscript prop with:', text);
      onTranscript(text);
    },
    onError: (error) => {
      console.log('Recording error:', error);
    }
  });

  React.useImperativeHandle(ref, () => ({
    startRecording: originalStartRecording,
    stopRecording: originalStopRecording
  }));

  const startRecording = async () => {
    console.log('Starting recording...');
    try {
      await originalStartRecording();
      console.log('Recording started successfully');
      onRecordingStateChange?.(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
      onRecordingStateChange?.(false);
    }
  };

  const stopRecording = async () => {
    console.log('Stopping recording...');
    try {
      await originalStopRecording();
      console.log('Recording stopped successfully');
      onRecordingStateChange?.(false);
    } catch (error) {
      console.error('Failed to stop recording:', error);
    }
  };

  // Transcript handling is now done in the hook callback


  return (
    <div className="voice-recorder" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <Tooltip title={isRecording ? 'Stop Recording' : 'Start Recording'}>
        <IconButton
          onClick={isRecording ? stopRecording : startRecording}
          color={isRecording ? 'error' : 'primary'}
          sx={{
            width: 48,
            height: 48,
            border: '2px solid',
            borderColor: isRecording ? 'error.main' : 'primary.main',
            bgcolor: isRecording ? 'error.lighter' : 'primary.lighter',
            '&:hover': {
              bgcolor: isRecording ? 'error.light' : 'primary.light',
            },
            animation: isRecording ? 'pulse 2s infinite' : 'none',
            '@keyframes pulse': {
              '0%': { boxShadow: '0 0 0 0 rgba(244, 67, 54, 0.4)' },
              '70%': { boxShadow: '0 0 0 10px rgba(244, 67, 54, 0)' },
              '100%': { boxShadow: '0 0 0 0 rgba(244, 67, 54, 0)' },
            },
          }}
        >
          {isRecording ? <StopIcon /> : <MicIcon />}
        </IconButton>
      </Tooltip>
      
      {error && (
        <Tooltip title={error.message}>
          <IconButton 
            color="error" 
            size="small"
            sx={{
              border: '1px solid',
              borderColor: 'error.main',
              bgcolor: 'error.lighter',
              '&:hover': {
                bgcolor: 'error.light',
              },
            }}
          >
            <ErrorIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
      
      {transcript && (
        <div 
          style={{
            padding: '8px 16px',
            borderRadius: '20px',
            backgroundColor: 'rgba(33, 150, 243, 0.08)',
            border: '1px solid rgba(33, 150, 243, 0.2)',
            color: '#1976d2',
            fontSize: '0.875rem',
            maxWidth: '300px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {transcript}
        </div>
      )}
    </div>
  );
});

export default VoiceRecorder;
