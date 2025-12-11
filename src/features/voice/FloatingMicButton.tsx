import React, { useState } from 'react';
import { Box, Fab, Tooltip, IconButton, alpha, useTheme } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { useNotification } from '../../contexts/NotificationContext';

interface FloatingMicButtonProps {
  onTranscript: (text: string) => void;
  transcriptionService?: 'browser' | 'whisper' | 'groq' | 'azure' | 'hybrid';
  language?: string;
  showTextOption?: boolean;
  onTextInput?: () => void;
  onRecordingStart?: () => void;
}

const FloatingMicButton: React.FC<FloatingMicButtonProps> = ({
  onTranscript,
  transcriptionService = 'browser',
  language = 'en',
  showTextOption = false,
  onTextInput,
  onRecordingStart
}) => {
  const theme = useTheme();
  const { showWarning, showError } = useNotification();
  const [currentTranscript, setCurrentTranscript] = useState('');

  const {
    isRecording,
    transcript: _transcript,
    error,
    startRecording,
    stopRecording,
    isInitialized
  } = useSpeechRecognition({
    transcriptionService,
    defaultLanguage: language,
    onTranscript: (text: string) => {
      setCurrentTranscript(text);
      if (text.trim()) {
        onTranscript(text);
      }
    },
    onError: (voiceError) => {
      // Show user-friendly error notifications for actionable errors
      const silentCodes = ['network', 'FALLBACK_MODE', 'USE_TEXT_INPUT', 'no-speech'];
      if (!silentCodes.includes(voiceError.code)) {
        if (voiceError.code === 'audio-capture') {
          showWarning('Microphone not available. Please check permissions.');
        } else if (voiceError.code === 'not-allowed') {
          showError('Microphone access denied. Please enable in browser settings.');
        } else if (voiceError.code === 'START_ERROR') {
          showWarning('Could not start voice recording. Try using the keyboard input.');
        }
      }
    }
  });

  const handleMicClick = async () => {
    if (isRecording) {
      await stopRecording();
      setCurrentTranscript('');
    } else {
      await startRecording();
      // Notify parent that recording has started (useful for opening dialogs on mobile)
      onRecordingStart?.();
    }
  };

  return (
    <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 1.5 }}>
      {/* Real-time transcript display with aria-live for screen readers */}
      {(isRecording && currentTranscript) && (
        <Box
          role="status"
          aria-live="polite"
          aria-label="Voice transcript"
          sx={{
            position: 'absolute',
            right: showTextOption ? 112 : 72,
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
            boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
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

      {/* Text input button - always visible when showTextOption is true */}
      {showTextOption && onTextInput && (
        <Tooltip title="Type task manually">
          <IconButton
            onClick={onTextInput}
            aria-label="Open keyboard input for typing task"
            sx={{
              width: 44,
              height: 44,
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                borderColor: 'primary.main',
                transform: 'translateY(-1px)',
                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
              },
              transition: 'all 0.2s ease',
            }}
          >
            <KeyboardIcon sx={{ color: 'primary.main' }} />
          </IconButton>
        </Tooltip>
      )}

      <Tooltip title={!isInitialized ? "Voice not available - use keyboard" : isRecording ? "Stop Recording" : "Start Recording"}>
        <span>
          <Fab
            color="primary"
            onClick={handleMicClick}
            disabled={!isInitialized}
            aria-label={!isInitialized ? "Voice recording not available" : isRecording ? "Stop voice recording" : "Start voice recording"}
            aria-pressed={isRecording}
            sx={{
              width: 56,
              height: 56,
              background: isRecording
                ? `linear-gradient(180deg, ${theme.palette.error.main} 0%, ${theme.palette.error.dark} 100%)`
                : !isInitialized
                ? `linear-gradient(180deg, ${theme.palette.grey[500]} 0%, ${theme.palette.grey[600]} 100%)`
                : `linear-gradient(180deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              boxShadow: isRecording
                ? `0 4px 12px ${alpha(theme.palette.error.main, 0.3)}`
                : !isInitialized
                ? `0 4px 12px ${alpha(theme.palette.grey[500], 0.3)}`
                : `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
              '&:hover': {
                boxShadow: isRecording
                  ? `0 6px 16px ${alpha(theme.palette.error.main, 0.4)}`
                  : !isInitialized
                  ? `0 4px 12px ${alpha(theme.palette.grey[500], 0.3)}`
                  : `0 6px 16px ${alpha(theme.palette.primary.main, 0.4)}`,
                transform: isInitialized ? 'translateY(-1px)' : 'none',
              },
              '&.Mui-disabled': {
                background: `linear-gradient(180deg, ${theme.palette.grey[500]} 0%, ${theme.palette.grey[600]} 100%)`,
                opacity: 0.7,
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
        </span>
      </Tooltip>

      {/* Error indicator */}
      {error && !isRecording && (
        <Box
          sx={{
            position: 'absolute',
            bottom: -8,
            right: 0,
            width: 12,
            height: 12,
            borderRadius: '50%',
            bgcolor: 'error.main',
            border: '2px solid',
            borderColor: 'background.paper',
          }}
        />
      )}
    </Box>
  );
};

export default FloatingMicButton;