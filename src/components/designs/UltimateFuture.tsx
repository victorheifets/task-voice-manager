'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  Typography,
  Fab,
  useMediaQuery,
  useTheme,
  Avatar,
  Chip,
  IconButton,
  Paper,
  Grid,
  Badge,
  Button,
  Container,
  Tooltip,
  Zoom,
  Fade,
  Slide,
  Grow,
  alpha
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import MicIcon from '@mui/icons-material/Mic';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt';
import PsychologyIcon from '@mui/icons-material/Psychology';
import ViewInArIcon from '@mui/icons-material/ViewInAr';
import BoltIcon from '@mui/icons-material/Bolt';
import StarIcon from '@mui/icons-material/Star';
import DiamondIcon from '@mui/icons-material/Diamond';
import AllInclusiveIcon from '@mui/icons-material/AllInclusive';
import VoiceRecorder from '../voice/VoiceRecorder';

const pulse = keyframes`
  0% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.05); opacity: 0.6; }
  100% { transform: scale(1); opacity: 0.8; }
`;

const glow = keyframes`
  0% { box-shadow: 0 0 20px #00ffff, 0 0 40px #00ffff, 0 0 80px #00ffff; }
  50% { box-shadow: 0 0 30px #ff00ff, 0 0 60px #ff00ff, 0 0 100px #ff00ff; }
  100% { box-shadow: 0 0 20px #00ffff, 0 0 40px #00ffff, 0 0 80px #00ffff; }
`;

const float = keyframes`
  0% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
  100% { transform: translateY(0px) rotate(360deg); }
`;

const neonPulse = keyframes`
  0%, 100% { 
    text-shadow: 
      0 0 10px #fff,
      0 0 20px #fff,
      0 0 30px #fff,
      0 0 40px #ff00de,
      0 0 70px #ff00de,
      0 0 80px #ff00de,
      0 0 100px #ff00de,
      0 0 150px #ff00de;
  }
  50% { 
    text-shadow: 
      0 0 5px #fff,
      0 0 10px #fff,
      0 0 15px #fff,
      0 0 20px #ff00de,
      0 0 35px #ff00de,
      0 0 40px #ff00de,
      0 0 50px #ff00de,
      0 0 75px #ff00de;
  }
`;

const HolographicCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, 
    ${alpha('#000000', 0.9)} 0%, 
    ${alpha('#1a0033', 0.8)} 25%, 
    ${alpha('#000033', 0.8)} 50%, 
    ${alpha('#330066', 0.8)} 75%, 
    ${alpha('#000000', 0.9)} 100%)`,
  backdropFilter: 'blur(20px) saturate(200%)',
  border: '2px solid transparent',
  borderImage: 'linear-gradient(45deg, #00ffff, #ff00ff, #ffff00, #00ff00, #00ffff) 1',
  borderRadius: '24px',
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s ease-in-out',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%)',
    transform: 'translateX(-100%)',
    transition: 'transform 0.6s',
  },
  '&:hover': {
    transform: 'translateY(-5px) scale(1.02)',
    animation: `${glow} 2s ease-in-out infinite`,
    '&::before': {
      transform: 'translateX(100%)',
    },
  },
}));

const NeonButton = styled(Fab)(({ theme }) => ({
  background: 'linear-gradient(45deg, #ff00de 0%, #00ffff 100%)',
  boxShadow: '0 0 30px #ff00de, 0 0 60px #00ffff',
  animation: `${pulse} 2s ease-in-out infinite`,
  '&:hover': {
    animation: `${glow} 1s ease-in-out infinite`,
    transform: 'scale(1.1)',
  },
}));

const FloatingElement = styled(Box)(({ theme }) => ({
  position: 'absolute',
  animation: `${float} 6s ease-in-out infinite`,
  opacity: 0.7,
}));

const UltimateFuture: React.FC<{ onTranscript: (text: string) => void; transcriptionService?: string }> = ({ 
  onTranscript, 
  transcriptionService 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [isRecording, setIsRecording] = useState(false);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setParticles(prev => [
        ...prev.filter(p => p.id > Date.now() - 3000),
        { id: Date.now(), x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight }
      ]);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const stats = [
    { icon: <RocketLaunchIcon />, label: 'Tasks Completed', value: '∞', color: '#00ffff' },
    { icon: <ElectricBoltIcon />, label: 'Productivity Boost', value: '999%', color: '#ff00de' },
    { icon: <PsychologyIcon />, label: 'AI Intelligence', value: 'MAX', color: '#ffff00' },
    { icon: <DiamondIcon />, label: 'Premium Features', value: 'ALL', color: '#00ff00' },
  ];

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: 'radial-gradient(ellipse at center, #0a0a0a 0%, #000000 100%)',
      position: 'relative',
      overflow: 'hidden',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255, 0, 222, 0.1) 0%, transparent 50%)`,
        pointerEvents: 'none',
      }
    }}>
      {particles.map(particle => (
        <FloatingElement
          key={particle.id}
          sx={{
            left: particle.x,
            top: particle.y,
            width: 4,
            height: 4,
            borderRadius: '50%',
            background: 'linear-gradient(45deg, #00ffff, #ff00de)',
            boxShadow: '0 0 10px #00ffff',
          }}
        />
      ))}

      <Container maxWidth="xl" sx={{ py: 4, position: 'relative', zIndex: 1 }}>
        <Fade in timeout={1000}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h1" sx={{
              fontSize: { xs: '3rem', md: '5rem' },
              fontWeight: 900,
              background: 'linear-gradient(45deg, #00ffff, #ff00de, #ffff00, #00ff00)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: `${neonPulse} 3s ease-in-out infinite`,
              mb: 2,
              letterSpacing: '0.1em',
            }}>
              ULTIMATE FUTURE
            </Typography>
            <Typography variant="h5" sx={{
              color: '#fff',
              textShadow: '0 0 20px rgba(255, 255, 255, 0.5)',
              mb: 4,
              fontWeight: 300,
              letterSpacing: '0.2em',
            }}>
              🌟 THE LEGENDARY AI-POWERED PRODUCTIVITY REVOLUTION 🌟
            </Typography>
          </Box>
        </Fade>

        <Grid container spacing={4}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Zoom in timeout={1000 + index * 200}>
                <HolographicCard>
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Box sx={{
                      fontSize: 48,
                      color: stat.color,
                      mb: 2,
                      filter: `drop-shadow(0 0 20px ${stat.color})`,
                    }}>
                      {stat.icon}
                    </Box>
                    <Typography variant="h3" sx={{
                      fontWeight: 900,
                      color: stat.color,
                      textShadow: `0 0 20px ${stat.color}`,
                      mb: 1,
                    }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" sx={{
                      color: '#fff',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                    }}>
                      {stat.label}
                    </Typography>
                  </Box>
                </HolographicCard>
              </Zoom>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: 6, textAlign: 'center' }}>
          <Slide direction="up" in timeout={1500}>
            <HolographicCard sx={{ maxWidth: 800, mx: 'auto', p: 4 }}>
              <Typography variant="h4" sx={{
                color: '#fff',
                mb: 3,
                textShadow: '0 0 20px rgba(255, 255, 255, 0.8)',
              }}>
                🎙️ QUANTUM VOICE COMMAND CENTER 🎙️
              </Typography>
              <Typography variant="body1" sx={{
                color: '#aaa',
                mb: 4,
                fontSize: '1.2rem',
              }}>
                Speak your thoughts into existence with our revolutionary AI that understands you better than you understand yourself
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Chip
                  icon={<AllInclusiveIcon />}
                  label="∞ LANGUAGES"
                  sx={{
                    background: 'linear-gradient(45deg, #ff00de, #00ffff)',
                    color: '#fff',
                    fontWeight: 900,
                  }}
                />
                <Chip
                  icon={<BoltIcon />}
                  label="INSTANT PROCESSING"
                  sx={{
                    background: 'linear-gradient(45deg, #ffff00, #00ff00)',
                    color: '#000',
                    fontWeight: 900,
                  }}
                />
                <Chip
                  icon={<ViewInArIcon />}
                  label="3D HOLOGRAPHIC UI"
                  sx={{
                    background: 'linear-gradient(45deg, #00ffff, #ff00de)',
                    color: '#fff',
                    fontWeight: 900,
                  }}
                />
              </Box>
            </HolographicCard>
          </Slide>
        </Box>

        <Box sx={{ position: 'fixed', bottom: 40, right: 40, zIndex: 1000 }}>
          <Tooltip title="🚀 ACTIVATE QUANTUM VOICE RECOGNITION 🚀" placement="left">
            <NeonButton
              color="primary"
              size="large"
              onClick={() => setIsRecording(!isRecording)}
            >
              <MicIcon sx={{ fontSize: 32 }} />
            </NeonButton>
          </Tooltip>
        </Box>

        {isRecording && (
          <Paper sx={{
            position: 'fixed',
            bottom: 120,
            right: 40,
            p: 2,
            background: 'rgba(0, 0, 0, 0.9)',
            border: '2px solid #00ffff',
            borderRadius: 2,
            boxShadow: '0 0 30px #00ffff',
          }}>
            <VoiceRecorder
              onTranscript={onTranscript}
              transcriptionService={transcriptionService as any}
              onRecordingStateChange={setIsRecording}
            />
          </Paper>
        )}
      </Container>
    </Box>
  );
};

export default UltimateFuture;