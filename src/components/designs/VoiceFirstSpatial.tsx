'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Fab,
  useTheme,
  Card,
  Stack,
  Chip,
  alpha,
  useMediaQuery,
  IconButton,
  Tooltip
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import MicIcon from '@mui/icons-material/Mic';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import SpatialAudioIcon from '@mui/icons-material/SpatialAudio';
import TuneIcon from '@mui/icons-material/Tune';
import WavesIcon from '@mui/icons-material/Waves';
import VoiceRecorder from '../voice/VoiceRecorder';

const wave = keyframes`
  0% { transform: scale(0.8) rotate(0deg); opacity: 0.8; }
  50% { transform: scale(1.2) rotate(180deg); opacity: 0.4; }
  100% { transform: scale(0.8) rotate(360deg); opacity: 0.8; }
`;

const soundWave = keyframes`
  0% { height: 20px; }
  25% { height: 60px; }
  50% { height: 40px; }
  75% { height: 80px; }
  100% { height: 20px; }
`;

const orbit = keyframes`
  0% { transform: rotate(0deg) translateX(150px) rotate(0deg); }
  100% { transform: rotate(360deg) translateX(150px) rotate(-360deg); }
`;

const VoiceCanvas = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'radial-gradient(circle at center, rgba(139, 92, 246, 0.1) 0%, transparent 70%)',
  pointerEvents: 'none',
}));

const SoundWaveBar = styled(Box)(({ theme }) => ({
  width: '4px',
  background: 'linear-gradient(180deg, #8b5cf6 0%, #ec4899 100%)',
  borderRadius: '2px',
  animation: `${soundWave} 1s ease-in-out infinite`,
  boxShadow: '0 0 20px rgba(139, 92, 246, 0.5)',
}));

const OrbitingElement = styled(Box)(({ theme }) => ({
  position: 'absolute',
  animation: `${orbit} 10s linear infinite`,
  transformOrigin: 'center',
}));

const SpatialCard = styled(Card)(({ theme }) => ({
  background: 'rgba(0, 0, 0, 0.4)',
  backdropFilter: 'blur(20px) saturate(180%)',
  border: '1px solid rgba(139, 92, 246, 0.2)',
  borderRadius: '24px',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateZ(20px)',
    border: '1px solid rgba(139, 92, 246, 0.4)',
    boxShadow: '0 20px 60px rgba(139, 92, 246, 0.3)',
  },
}));

const VoiceFirstSpatial: React.FC<{ onTranscript: (text: string) => void; transcriptionService?: string }> = ({
  onTranscript,
  transcriptionService
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [isRecording, setIsRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [voiceCommands, setVoiceCommands] = useState<string[]>([]);
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setAudioLevel(Math.random() * 100);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isRecording) {
      const commands = [
        'Create new task...',
        'Schedule meeting...',
        'Set reminder...',
        'Open dashboard...',
        'Analyze data...'
      ];
      const interval = setInterval(() => {
        setVoiceCommands(prev => [...prev.slice(-4), commands[Math.floor(Math.random() * commands.length)]]);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isRecording]);

  const spatialNodes = [
    { icon: <RecordVoiceOverIcon />, label: 'Voice Engine', color: '#8b5cf6' },
    { icon: <SpatialAudioIcon />, label: 'Spatial Audio', color: '#ec4899' },
    { icon: <GraphicEqIcon />, label: 'Sound Analysis', color: '#3b82f6' },
    { icon: <TuneIcon />, label: 'Audio Tuning', color: '#10b981' },
  ];

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0f23 0%, #1a0f2e 100%)',
      position: 'relative',
      overflow: 'hidden',
      perspective: '1000px',
    }}>
      <VoiceCanvas ref={canvasRef} />
      
      {/* 3D Sound Wave Visualization */}
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '600px',
        height: '600px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {spatialNodes.map((node, index) => (
          <OrbitingElement
            key={index}
            sx={{
              animationDelay: `${index * 2.5}s`,
              animationDuration: `${10 + index * 2}s`,
            }}
          >
            <SpatialCard sx={{ p: 2 }}>
              <Stack alignItems="center" spacing={1}>
                <Box sx={{ color: node.color, fontSize: 40 }}>
                  {node.icon}
                </Box>
                <Typography variant="caption" sx={{ color: '#fff' }}>
                  {node.label}
                </Typography>
              </Stack>
            </SpatialCard>
          </OrbitingElement>
        ))}
        
        {/* Central Voice Hub */}
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 10,
        }}>
          <Box sx={{
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, transparent 70%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: `${wave} 4s ease-in-out infinite`,
          }}>
            <Fab
              size="large"
              onClick={() => setIsRecording(!isRecording)}
              sx={{
                width: 120,
                height: 120,
                background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                boxShadow: '0 0 60px rgba(139, 92, 246, 0.6)',
                '&:hover': {
                  transform: 'scale(1.1)',
                  boxShadow: '0 0 80px rgba(139, 92, 246, 0.8)',
                }
              }}
            >
              <MicIcon sx={{ fontSize: 60, color: '#fff' }} />
            </Fab>
          </Box>
        </Box>
      </Box>

      {/* Sound Wave Visualizer */}
      <Box sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 120,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        gap: 1,
        p: 2,
        background: 'linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.8) 100%)',
      }}>
        {Array.from({ length: 50 }).map((_, index) => (
          <SoundWaveBar
            key={index}
            sx={{
              animationDelay: `${index * 0.05}s`,
              height: isRecording ? `${20 + Math.random() * 60}px` : '20px',
              opacity: isRecording ? 1 : 0.3,
            }}
          />
        ))}
      </Box>

      {/* Voice Command History */}
      <Box sx={{
        position: 'absolute',
        top: 40,
        left: 40,
        maxWidth: 400,
      }}>
        <Typography variant="h4" sx={{
          color: '#fff',
          fontWeight: 700,
          mb: 2,
          textShadow: '0 0 30px rgba(139, 92, 246, 0.5)',
        }}>
          VOICE-FIRST SPATIAL UI
        </Typography>
        <Typography variant="body1" sx={{
          color: alpha('#fff', 0.7),
          mb: 3,
        }}>
          Experience the future of interaction with 3D spatial voice commands
        </Typography>
        
        {voiceCommands.length > 0 && (
          <Stack spacing={1}>
            <Typography variant="caption" sx={{ color: alpha('#fff', 0.5) }}>
              RECENT COMMANDS
            </Typography>
            {voiceCommands.map((command, index) => (
              <Chip
                key={index}
                icon={<WavesIcon />}
                label={command}
                sx={{
                  background: alpha('#8b5cf6', 0.2),
                  color: '#fff',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  animation: 'fadeIn 0.5s ease-in',
                }}
              />
            ))}
          </Stack>
        )}
      </Box>

      {/* Audio Level Indicator */}
      <Box sx={{
        position: 'absolute',
        top: 40,
        right: 40,
        width: 200,
      }}>
        <Stack spacing={2}>
          <SpatialCard sx={{ p: 2 }}>
            <Typography variant="caption" sx={{ color: alpha('#fff', 0.7) }}>
              AUDIO LEVEL
            </Typography>
            <Box sx={{
              mt: 1,
              height: 8,
              borderRadius: 4,
              background: alpha('#fff', 0.1),
              overflow: 'hidden',
            }}>
              <Box sx={{
                width: `${audioLevel}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #8b5cf6 0%, #ec4899 100%)',
                transition: 'width 0.1s ease-out',
                boxShadow: '0 0 10px rgba(236, 72, 153, 0.5)',
              }} />
            </Box>
          </SpatialCard>
          
          <SpatialCard sx={{ p: 2 }}>
            <Typography variant="caption" sx={{ color: alpha('#fff', 0.7) }}>
              SPATIAL MODE
            </Typography>
            <Typography variant="h6" sx={{ color: '#8b5cf6', fontWeight: 700 }}>
              3D SURROUND
            </Typography>
          </SpatialCard>
        </Stack>
      </Box>

      {isRecording && (
        <Box sx={{
          position: 'fixed',
          bottom: 160,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
        }}>
          <SpatialCard sx={{ p: 3, minWidth: 300 }}>
            <VoiceRecorder
              onTranscript={onTranscript}
              transcriptionService={transcriptionService as any}
              onRecordingStateChange={setIsRecording}
            />
          </SpatialCard>
        </Box>
      )}
    </Box>
  );
};

export default VoiceFirstSpatial;