import React, { useState, useRef, useEffect } from 'react';
import { Box, Fab, Tooltip } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import VoiceRecorder from './VoiceRecorder';

interface FloatingMicButtonProps {
  onTranscript: (text: string) => void;
  transcriptionService?: 'browser' | 'whisper' | 'azure' | 'hybrid';
}

const FloatingMicButton: React.FC<FloatingMicButtonProps> = ({ onTranscript, transcriptionService = 'browser' }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [voiceRecorderMounted, setVoiceRecorderMounted] = useState(false);
  const [voiceLanguage, setVoiceLanguage] = useState('en-US');
  const voiceRecorderRef = useRef<{ startRecording: () => Promise<void>; stopRecording: () => Promise<void> }>(null);

  // Load voice recognition language from localStorage
  useEffect(() => {
    const savedVoiceLanguage = localStorage.getItem('voiceRecognitionLanguage') || 'en';
    // Convert to speech recognition format
    const languageMap: { [key: string]: string } = {
      'en': 'en-US',
      'he': 'he-IL',
      'es': 'es-ES',
      'fr': 'fr-FR'
    };
    setVoiceLanguage(languageMap[savedVoiceLanguage] || 'en-US');
  }, []);

  const handleFloatingMicClick = async () => {
    if (isRecording) {
      try {
        await voiceRecorderRef.current?.stopRecording();
        setIsRecording(false);
      } catch (error) {
        console.error('Error stopping recording:', error);
        setIsRecording(false);
      }
    } else {
      // Mount the VoiceRecorder component only when needed
      if (!voiceRecorderMounted) {
        setVoiceRecorderMounted(true);
        // Wait a bit for the component to mount
        setTimeout(async () => {
          try {
            await voiceRecorderRef.current?.startRecording();
            setIsRecording(true);
          } catch (error) {
            console.error('Error starting recording:', error);
            setIsRecording(false);
          }
        }, 100);
      } else {
        try {
          await voiceRecorderRef.current?.startRecording();
          setIsRecording(true);
        } catch (error) {
          console.error('Error starting recording:', error);
          setIsRecording(false);
        }
      }
    }
  };

  const handleVoiceRecorderResult = (text: string) => {
    onTranscript(text);
    // Don't stop recording automatically - let user control it
  };

  const handleVoiceRecorderError = (error: any) => {
    console.error('Voice recorder error:', error);
    setIsRecording(false);
  };

  return (
    <Box sx={{ position: 'relative' }}>
      {/* Voice Recorder (Hidden) - Only mount when needed */}
      {voiceRecorderMounted && (
        <Box sx={{ position: 'absolute', left: -9999, top: -9999, opacity: 0 }}>
          <VoiceRecorder
            ref={voiceRecorderRef}
            onTranscript={handleVoiceRecorderResult}
            onRecordingStateChange={(recording) => {
              setIsRecording(recording);
            }}
            language={voiceLanguage}
            transcriptionService={transcriptionService}
          />
        </Box>
      )}

      {/* Voice Recording Button */}
      <Tooltip title={isRecording ? "Stop Recording" : "Start Recording"}>
        <Fab
          color="primary"
          onClick={handleFloatingMicClick}
          sx={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            backgroundColor: theme => isRecording 
              ? (theme.palette.mode === 'dark' ? '#F87171' : 'error.main') 
              : (theme.palette.mode === 'dark' ? '#818CF8' : 'primary.main'),
            color: 'white',
            boxShadow: theme => theme.palette.mode === 'dark' 
              ? '0 4px 20px rgba(0,0,0,0.4), 0 0 0 2px rgba(255,255,255,0.1)' 
              : '0 4px 16px rgba(0,0,0,0.2)',
            position: 'relative',
            zIndex: 2,
            '&:hover': {
              backgroundColor: theme => isRecording 
                ? (theme.palette.mode === 'dark' ? '#EF4444' : 'error.dark') 
                : (theme.palette.mode === 'dark' ? '#6366F1' : 'primary.dark'),
              boxShadow: theme => theme.palette.mode === 'dark'
                ? '0 8px 25px rgba(0,0,0,0.5), 0 0 0 2px rgba(255,255,255,0.15)'
                : '0 8px 20px rgba(0,0,0,0.25)',
              transform: 'translateY(-2px)',
            },
            '&:active': {
              transform: 'translateY(0)',
              boxShadow: theme => theme.palette.mode === 'dark'
                ? '0 4px 12px rgba(0,0,0,0.4), 0 0 0 2px rgba(255,255,255,0.1)'
                : '0 4px 8px rgba(0,0,0,0.2)',
            },
            ...(isRecording && {
              animation: 'pulse 2s infinite',
            }),
          }}
        >
          {isRecording ? <StopIcon /> : <MicIcon />}
        </Fab>
      </Tooltip>
      
      {/* Background glow effect */}
      {isRecording && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 80,
            height: 80,
            borderRadius: '50%',
            backgroundColor: theme => theme.palette.mode === 'dark' ? 'rgba(248, 113, 113, 0.15)' : 'rgba(244, 67, 54, 0.15)',
            filter: 'blur(8px)',
            zIndex: 1,
            animation: 'expandGlow 2s infinite',
          }}
        />
      )}

      {/* Animations */}
      <style jsx>{`
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(244, 67, 54, 0.7);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(244, 67, 54, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(244, 67, 54, 0);
          }
        }
        
        @keyframes expandGlow {
          0% {
            opacity: 0.7;
            transform: translate(-50%, -50%) scale(0.8);
          }
          50% {
            opacity: 0.3;
            transform: translate(-50%, -50%) scale(1.2);
          }
          100% {
            opacity: 0.7;
            transform: translate(-50%, -50%) scale(0.8);
          }
        }
      `}</style>
    </Box>
  );
};

export default FloatingMicButton;