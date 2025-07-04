'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  IconButton,
  Paper,
  useTheme,
  alpha,
  Tooltip,
  LinearProgress,
  Chip,
  Button
} from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import DeleteIcon from '@mui/icons-material/Delete';
import SendIcon from '@mui/icons-material/Send';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import ErrorIcon from '@mui/icons-material/Error';
import RefreshIcon from '@mui/icons-material/Refresh';

// Import speech recognition types
type SpeechRecognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onstart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null;
  onend: ((this: SpeechRecognition, ev: Event) => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
  stream: MediaStream;
};

type SpeechRecognitionEvent = {
  resultIndex: number;
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
        confidence: number;
      };
      isFinal: boolean;
      length: number;
    };
    length: number;
  };
};

type SpeechRecognitionErrorEvent = {
  error: 'network' | 'not-allowed' | 'service-not-allowed' | 'aborted' | string;
  message: string;
};

interface VoiceRecorderProps {
  onTranscription: (text: string) => void;
  language?: 'en' | 'he';
  onRecordingStateChange?: (isRecording: boolean) => void;
}

export default function VoiceRecorder({ onTranscription, language = 'en', onRecordingStateChange }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [visualizerValues, setVisualizerValues] = useState<number[]>(Array(20).fill(5));
  const [realtimeTranscript, setRealtimeTranscript] = useState<string>('');
  const [isRealTimeTranscribing, setIsRealTimeTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const animationRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const theme = useTheme();

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationRef.current) clearInterval(animationRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  // Notify parent component of recording state changes
  useEffect(() => {
    if (onRecordingStateChange) {
      onRecordingStateChange(isRecording);
    }
  }, [isRecording, onRecordingStateChange]);

  // Auto-start recording when component mounts
  useEffect(() => {
    // Check browser support before auto-starting
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Speech recognition is not supported in this browser');
      return;
    }
    startRecording();
  }, []);

  const startRecording = async () => {
    setError(null); // Clear any previous errors
    try {
      // First check if we have microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Check browser support again (in case it changed)
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        throw new Error('Speech recognition not supported');
      }

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        setAudioBlob(audioBlob);
        setAudioUrl(audioUrl);
        
        // Create audio element for playback
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      setRealtimeTranscript('');
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      // Start visualizer animation
      startVisualizerAnimation();
      
      // Start real-time speech recognition
      startRealTimeTranscription();
      
    } catch (error) {
      console.error('Error starting recording:', error);
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          setError('Please allow microphone access to use voice recording');
        } else if (error.name === 'NotFoundError') {
          setError('No microphone found. Please connect a microphone and try again');
        } else if (error.message === 'Speech recognition not supported') {
          setError('Speech recognition is not supported in this browser');
        } else {
          setError('Failed to start recording. Please try again');
        }
      } else {
        setError('An unknown error occurred. Please try again');
      }
      // Clean up any partial state
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
      setIsRecording(false);
      setIsRealTimeTranscribing(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Stop all audio tracks
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      
      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      // Stop visualizer animation
      if (animationRef.current) {
        clearInterval(animationRef.current);
        animationRef.current = null;
      }
      
      // Stop real-time transcription
      stopRealTimeTranscription();
      
      // Immediately use the real-time transcript if available
      if (realtimeTranscript.trim()) {
        onTranscription(realtimeTranscript.replace(/\.\.\.$/, '').trim());
        handleDelete(); // Clean up
        return; // Exit early - no need to process audio
      }
      
      // Only process audio if no real-time transcript is available
      if (!realtimeTranscript.trim()) {
        handleProcessAudio();
      }
    }
  };

  const startVisualizerAnimation = () => {
    if (animationRef.current) {
      clearInterval(animationRef.current);
    }
    
    animationRef.current = setInterval(() => {
      setVisualizerValues(prev => 
        prev.map(() => isRecording ? Math.floor(Math.random() * 30) + 5 : 5)
      );
    }, 100);
  };

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    
    setIsPlaying(!isPlaying);
  };

  const handleDelete = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    
    setAudioBlob(null);
    setAudioUrl(null);
    setIsPlaying(false);
    setRealtimeTranscript('');
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleProcessAudio = async () => {
    if (!audioBlob && !realtimeTranscript.trim()) return;
    
    setIsProcessing(true);
    
    try {
      if (audioBlob) {
        // Create a FormData object to send the audio file
        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.webm');
        formData.append('language', language);
        
        // Send to transcription API
        const response = await fetch('/api/transcribe', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error('Failed to transcribe audio');
        }
        
        const data = await response.json();
        onTranscription(data.text || realtimeTranscript);
      } else if (realtimeTranscript.trim()) {
        // Use real-time transcript if no audio blob
        onTranscription(realtimeTranscript);
      }
      
      setIsProcessing(false);
      handleDelete(); // Clean up after processing
      
    } catch (error) {
      console.error('Error processing audio:', error);
      // Fall back to real-time transcript if available
      if (realtimeTranscript.trim()) {
        onTranscription(realtimeTranscript);
      }
      setIsProcessing(false);
    }
  };

  // Real-time speech recognition functions
  const startRealTimeTranscription = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn('Speech recognition not supported');
      return;
    }
    
    try {
      const SpeechRecognitionConstructor = (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any }).SpeechRecognition || (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any }).webkitSpeechRecognition;
      const recognition = new SpeechRecognitionConstructor();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = language === 'he' ? 'he-IL' : 'en-US';
      recognition.maxAlternatives = 1;
      
      let lastUpdateTime = Date.now();
      let retryCount = 0;
      const maxRetries = 3;
      const retryDelay = 1000; // Start with 1 second
      
      recognition.onstart = () => {
        setIsRealTimeTranscribing(true);
        retryCount = 0; // Reset retry count on successful start
      };
      
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const currentTime = Date.now();
        
        // Throttle updates to reduce performance impact - increased to 500ms
        if (currentTime - lastUpdateTime < 500 && !event.results[event.results.length - 1].isFinal) {
          return;
        }
        
        lastUpdateTime = currentTime;
        
        let finalTranscript = '';
        let interimTranscript = '';
        
        // Only process the last 3 results to improve performance
        const startIndex = Math.max(0, event.results.length - 3);
        
        for (let i = startIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }
        
        setRealtimeTranscript(prev => {
          if (finalTranscript) {
            return prev + finalTranscript;
          }
          // Show interim results with ellipsis
          const baseText = prev.replace(/\.\.\.$/, '').trim();
          return baseText + (baseText ? ' ' : '') + interimTranscript;
        });
      };
      
      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        setIsRealTimeTranscribing(false);
        
        // Handle different types of errors
        switch (event.error) {
          case 'network':
            // Retry with exponential backoff
            if (retryCount < maxRetries && isRecording) {
              const delay = retryDelay * Math.pow(2, retryCount);
              retryCount++;
              console.log(`Retrying speech recognition in ${delay}ms (attempt ${retryCount}/${maxRetries})`);
              
              setTimeout(() => {
                if (isRecording && !recognitionRef.current) {
                  try {
                    startRealTimeTranscription();
                  } catch (e) {
                    console.error('Failed to restart recognition:', e);
                  }
                }
              }, delay);
            }
            break;
            
          case 'not-allowed':
          case 'service-not-allowed':
            // Permission denied or service not available
            console.error('Speech recognition permission denied or service not available');
            break;
            
          case 'aborted':
            // User or system aborted - no need to retry
            break;
            
          default:
            // For other errors, try one immediate retry
            if (isRecording && !recognitionRef.current) {
              setTimeout(() => {
                try {
                  startRealTimeTranscription();
                } catch (e) {
                  console.error('Failed to restart recognition:', e);
                }
              }, 100);
            }
            break;
        }
      };
      
      recognition.onend = () => {
        setIsRealTimeTranscribing(false);
        
        // Only restart if we're still recording and haven't exceeded retry attempts
        if (isRecording && recognitionRef.current && retryCount < maxRetries) {
          try {
            recognition.start();
          } catch (e) {
            console.error('Failed to restart recognition:', e);
            // If start fails, try again after a delay
            setTimeout(() => {
              if (isRecording && !recognitionRef.current) {
                startRealTimeTranscription();
              }
            }, 1000);
          }
        }
      };
      
      try {
        recognition.start();
        recognitionRef.current = recognition;
      } catch (e) {
        console.error('Failed to start recognition:', e);
        // If initial start fails, try again once after a delay
        setTimeout(() => {
          if (isRecording && !recognitionRef.current) {
            startRealTimeTranscription();
          }
        }, 1000);
      }
      
    } catch (error) {
      console.error('Error initializing speech recognition:', error);
    }
  };
  
  const stopRealTimeTranscription = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
      setIsRealTimeTranscribing(false);
    }
  };

  // Set up audio ended event handler
  useEffect(() => {
    if (audioRef.current) {
      const handleEnded = () => setIsPlaying(false);
      audioRef.current.addEventListener('ended', handleEnded);
      
      return () => {
        audioRef.current?.removeEventListener('ended', handleEnded);
      };
    }
  }, [audioUrl]);

  return (
    <Paper 
      elevation={3} 
      className="voice-recorder-container"
      sx={{ 
        p: { xs: 2, sm: 3 }, 
        borderRadius: 2,
        bgcolor: theme.palette.mode === 'dark' 
          ? alpha(theme.palette.background.paper, 0.9) 
          : theme.palette.background.paper,
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        maxWidth: '100%',
        width: '100%'
      }}
    >
      {error ? (
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Typography 
            variant="body1" 
            color="error" 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              gap: 1,
              mb: 2 
            }}
          >
            <ErrorIcon fontSize="small" />
            {error}
          </Typography>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => {
              setError(null);
              startRecording();
            }}
            startIcon={<RefreshIcon />}
          >
            Try Again
          </Button>
        </Box>
      ) : (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <Box 
              className="voice-visualizer"
              sx={{ 
                display: 'flex', 
                alignItems: 'flex-end', 
                height: { xs: 40, sm: 60 }, 
                width: '100%', 
                maxWidth: { xs: 200, sm: 300 },
                gap: 0.5
              }}
            >
              {visualizerValues.map((value, index) => (
                <Box 
                  key={index} 
                  sx={{ 
                    width: '100%',
                    height: `${value}px`,
                    bgcolor: isRecording 
                      ? theme.palette.primary.main 
                      : alpha(theme.palette.primary.main, 0.3),
                    borderRadius: 1,
                    transition: 'height 0.1s ease-in-out'
                  }} 
                />
              ))}
            </Box>
          </Box>
          
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <Typography variant="h6" color={isRecording ? 'error.main' : 'text.primary'} fontWeight={600}>
              {isRecording ? 'Recording...' : audioUrl ? 'Ready to Process' : 'Ready to Record'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {isRecording ? formatTime(recordingTime) : audioUrl ? 'Recording complete' : 'Click the microphone to start'}
            </Typography>
          </Box>
          
          {/* Real-time transcript display */}
          {(realtimeTranscript || isRealTimeTranscribing) && (
            <Box sx={{ 
              mb: 3, 
              p: 2, 
              bgcolor: alpha(theme.palette.primary.main, 0.05), 
              borderRadius: 2, 
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              position: 'relative'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <RecordVoiceOverIcon sx={{ color: theme.palette.primary.main, fontSize: 20 }} />
                <Typography variant="body2" color="primary" fontWeight={600}>
                  Real-time Transcript
                </Typography>
                {isRealTimeTranscribing && (
                  <Chip 
                    label="Listening..." 
                    size="small" 
                    color="primary" 
                    sx={{ 
                      height: 20,
                      fontSize: '0.75rem',
                      animation: 'pulse 1.5s infinite',
                      '@keyframes pulse': {
                        '0%': { opacity: 1 },
                        '50%': { opacity: 0.5 },
                        '100%': { opacity: 1 }
                      }
                    }}
                  />
                )}
              </Box>
              <Typography 
                variant="body1" 
                sx={{ 
                  fontStyle: realtimeTranscript.endsWith('...') ? 'italic' : 'normal',
                  minHeight: '1.5em',
                  color: theme.palette.text.primary
                }}
              >
                {realtimeTranscript || 'Waiting for speech...'}
              </Typography>
            </Box>
          )}
          
          <Box className="voice-controls" sx={{ display: 'flex', justifyContent: 'center', gap: { xs: 1, sm: 2 }, mb: 2, flexWrap: 'wrap' }}>
            <Tooltip title={isRecording ? "Stop recording" : "Start recording"}>
              <IconButton 
                color={isRecording ? "error" : "primary"}
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isProcessing}
                size="large"
                className="voice-button"
                sx={{ 
                  p: { xs: 1.5, sm: 2 },
                  width: { xs: 56, sm: 64 },
                  height: { xs: 56, sm: 64 },
                  bgcolor: isRecording 
                    ? alpha(theme.palette.error.main, 0.1) 
                    : alpha(theme.palette.primary.main, 0.1),
                  boxShadow: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: 4,
                    transform: 'scale(1.05)',
                  },
                  animation: isRecording ? 'pulse 1.5s infinite' : 'none',
                  '@keyframes pulse': {
                    '0%': {
                      boxShadow: `0 0 0 0 ${alpha(theme.palette.error.main, 0.4)}`
                    },
                    '70%': {
                      boxShadow: `0 0 0 10px ${alpha(theme.palette.error.main, 0)}`
                    },
                    '100%': {
                      boxShadow: `0 0 0 0 ${alpha(theme.palette.error.main, 0)}`
                    }
                  }
                }}
              >
                {isRecording ? <StopIcon fontSize="large" /> : <MicIcon fontSize="large" />}
              </IconButton>
            </Tooltip>
          </Box>
          
          {isProcessing && (
            <Box sx={{ width: '100%', mt: 2 }}>
              <Typography variant="body2" align="center" gutterBottom fontWeight={500}>
                Processing audio with AI...
              </Typography>
              <LinearProgress color="primary" />
            </Box>
          )}
        </>
      )}
    </Paper>
  );
} 