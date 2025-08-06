import React, { useState } from 'react';
import { Box, Fab, Tooltip, Typography } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';

interface FloatingMicButtonProps {
  onTranscript: (text: string) => void;
  transcriptionService?: 'browser' | 'whisper' | 'azure' | 'hybrid';
}

const FloatingMicButton: React.FC<FloatingMicButtonProps> = ({ onTranscript, transcriptionService = 'browser' }) => {
  const [currentTranscript, setCurrentTranscript] = useState('');
  
  const {
    isRecording,
    transcript,
    error,
    startRecording,
    stopRecording,
    isInitialized
  } = useSpeechRecognition({
    transcriptionService,
    onTranscript: (text: string) => {
      setCurrentTranscript(text);
      if (text.trim()) {
        onTranscript(text);
      }
    },
    onError: (error) => {
      console.error('Voice recognition error:', error);
    }
  });

  const handleMicClick = async () => {
    if (isRecording) {
      await stopRecording();
      setCurrentTranscript('');
    } else {
      await startRecording();
    }
  };

  return (
    <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 2 }}>
      {/* Real-time transcript display */}
      {(isRecording && currentTranscript) && (
        <Box
          sx={{
            position: 'absolute',
            right: 72,
            top: '50%',
            transform: 'translateY(-50%)',
            bgcolor: 'primary.main',
            color: 'white',
            px: 2,
            py: 1,
            borderRadius: 3,
            maxWidth: 250,
            fontSize: '0.875rem',
            fontWeight: 500,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)',
            animation: 'slideIn 0.3s ease-out',
            '@keyframes slideIn': {
              '0%': { opacity: 0, transform: 'translateY(-50%) translateX(20px)' },
              '100%': { opacity: 1, transform: 'translateY(-50%) translateX(0)' },
            },
          }}
        >
          {currentTranscript}
        </Box>
      )}
      
      <Tooltip title={isRecording ? "Stop Recording" : "Start Recording"}>
        <Fab
          color="primary"
          onClick={handleMicClick}
          disabled={!isInitialized}
          sx={{
            width: 56,
            height: 56,
            background: isRecording 
              ? 'linear-gradient(180deg, #f44336 0%, #d32f2f 100%)'
              : !isInitialized
              ? 'linear-gradient(180deg, #9e9e9e 0%, #757575 100%)'
              : 'linear-gradient(180deg, #2196F3 0%, #1976D2 100%)',
            boxShadow: isRecording 
              ? '0 4px 12px rgba(244, 67, 54, 0.3)' 
              : !isInitialized
              ? '0 4px 12px rgba(158, 158, 158, 0.3)'
              : '0 4px 12px rgba(33, 150, 243, 0.3)',
            '&:hover': {
              boxShadow: isRecording 
                ? '0 6px 16px rgba(244, 67, 54, 0.4)' 
                : !isInitialized
                ? '0 4px 12px rgba(158, 158, 158, 0.3)'
                : '0 6px 16px rgba(33, 150, 243, 0.4)',
              transform: isInitialized ? 'translateY(-1px)' : 'none',
            },
            animation: isRecording ? 'pulse 1s infinite' : 'none',
            '@keyframes pulse': {
              '0%': { transform: 'scale(1)' },
              '50%': { transform: 'scale(1.05)' },
              '100%': { transform: 'scale(1)' },
            },
          }}
        >
          {isRecording ? <StopIcon /> : <MicIcon />}
        </Fab>
      </Tooltip>
    </Box>
  );
};

export default FloatingMicButton;