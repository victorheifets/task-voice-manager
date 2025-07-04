'use client';

import React, { useEffect } from 'react';
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
}

const VoiceRecorder = ({
  onTranscript,
  language = 'en-US',
  azureKey,
  azureRegion,
  onRecordingStateChange
}: VoiceRecorderProps): React.ReactElement => {
  const config: SpeechConfig = {
    defaultLanguage: language,
    useAzureFallback: Boolean(azureKey && azureRegion),
    azureKey,
    azureRegion
  };

  const {
    isRecording,
    transcript,
    error,
    startRecording: originalStartRecording,
    stopRecording: originalStopRecording
  } = useSpeechRecognition(config);

  const startRecording = () => {
    onRecordingStateChange?.(true);
    originalStartRecording();
  };

  const stopRecording = () => {
    onRecordingStateChange?.(false);
    originalStopRecording();
  };

  useEffect(() => {
    if (transcript) {
      onTranscript(transcript);
    }
  }, [transcript, onTranscript]);

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
};

export default VoiceRecorder;
