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
            width: 56,
            height: 56,
            backgroundColor: isRecording ? 'error.main' : 'primary.main',
            color: 'white',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            '&:hover': {
              backgroundColor: isRecording ? 'error.dark' : 'primary.dark',
              boxShadow: '0 6px 16px rgba(0,0,0,0.25)',
            },
            ...(isRecording && {
              animation: 'pulse 2s infinite',
            }),
          }}
        >
          {isRecording ? <StopIcon /> : <MicIcon />}
        </Fab>
      </Tooltip>

      {/* Pulse Animation */}
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
      `}</style>
    </Box>
  );
};

export default FloatingMicButton;