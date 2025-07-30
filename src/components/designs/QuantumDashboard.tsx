'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Fab,
  useTheme,
  Card,
  Stack,
  alpha,
  useMediaQuery,
  Paper,
  Chip,
  Grid,
  Avatar
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import MicIcon from '@mui/icons-material/Mic';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import ScatterPlotIcon from '@mui/icons-material/ScatterPlot';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import BoltIcon from '@mui/icons-material/Bolt';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import BlurOnIcon from '@mui/icons-material/BlurOn';
import VoiceRecorder from '../voice/VoiceRecorder';

const quantumFlicker = keyframes`
  0% { opacity: 1; transform: scale(1) rotate(0deg); }
  25% { opacity: 0.7; transform: scale(1.1) rotate(90deg); }
  50% { opacity: 1; transform: scale(0.9) rotate(180deg); }
  75% { opacity: 0.8; transform: scale(1.05) rotate(270deg); }
  100% { opacity: 1; transform: scale(1) rotate(360deg); }
`;

const quantumTunnel = keyframes`
  0% { transform: translateZ(0) scale(1); opacity: 0; }
  50% { opacity: 1; }
  100% { transform: translateZ(100px) scale(0.5); opacity: 0; }
`;

const particleFlow = keyframes`
  0% { transform: translateX(-50px) translateY(0) scale(0); opacity: 0; }
  50% { opacity: 1; transform: translateX(0) translateY(-20px) scale(1); }
  100% { transform: translateX(50px) translateY(0) scale(0); opacity: 0; }
`;

const superposition = keyframes`
  0% { transform: translate(0, 0); opacity: 0.8; }
  33% { transform: translate(20px, -10px); opacity: 0.4; }
  66% { transform: translate(-10px, 15px); opacity: 0.6; }
  100% { transform: translate(0, 0); opacity: 0.8; }
`;

const QuantumCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, rgba(16, 0, 43, 0.9) 0%, rgba(0, 16, 43, 0.9) 100%)',
  backdropFilter: 'blur(20px) saturate(180%)',
  border: '1px solid rgba(123, 31, 162, 0.3)',
  borderRadius: '24px',
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(45deg, transparent 30%, rgba(123, 31, 162, 0.1) 50%, transparent 70%)',
    animation: `${particleFlow} 3s ease-in-out infinite`,
  },
  '&:hover': {
    transform: 'translateY(-8px) rotateX(5deg)',
    border: '1px solid rgba(123, 31, 162, 0.6)',
    boxShadow: '0 20px 60px rgba(123, 31, 162, 0.4)',
  },
}));

const QuantumParticle = styled(Box)(({ theme }) => ({
  position: 'absolute',
  width: 6,
  height: 6,
  borderRadius: '50%',
  animation: `${superposition} 4s ease-in-out infinite`,
}));

const QuantumOrb = styled(Box)(({ theme }) => ({
  width: 40,
  height: 40,
  borderRadius: '50%',
  animation: `${quantumFlicker} 3s ease-in-out infinite`,
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: -10,
    left: -10,
    width: 60,
    height: 60,
    borderRadius: '50%',
    border: '2px solid currentColor',
    opacity: 0.3,
    animation: `${quantumTunnel} 2s linear infinite`,
  },
}));

const QuantumDashboard: React.FC<{ onTranscript: (text: string) => void; transcriptionService?: string }> = ({
  onTranscript,
  transcriptionService
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [isRecording, setIsRecording] = useState(false);
  const [quantumState, setQuantumState] = useState(0);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; velocity: { x: number; y: number } }>>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setQuantumState(prev => (prev + 1) % 8);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Generate quantum particles
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      velocity: {
        x: (Math.random() - 0.5) * 2,
        y: (Math.random() - 0.5) * 2,
      },
    }));
    setParticles(newParticles);

    const interval = setInterval(() => {
      setParticles(prev => prev.map(particle => ({
        ...particle,
        x: (particle.x + particle.velocity.x + window.innerWidth) % window.innerWidth,
        y: (particle.y + particle.velocity.y + window.innerHeight) % window.innerHeight,
      })));
    }, 50);

    return () => clearInterval(interval);
  }, []);

  const quantumMetrics = [
    { 
      label: 'Quantum Coherence', 
      value: '99.97%', 
      icon: <RadioButtonCheckedIcon />, 
      color: '#7c3aed',
      description: 'Superposition stability'
    },
    { 
      label: 'Entanglement Strength', 
      value: '847 qubits', 
      icon: <BlurOnIcon />, 
      color: '#06b6d4',
      description: 'Quantum correlation level'
    },
    { 
      label: 'Processing Power', 
      value: '∞ TFLOPS', 
      icon: <BoltIcon />, 
      color: '#10b981',
      description: 'Quantum advantage factor'
    },
    { 
      label: 'Error Correction', 
      value: '10⁻¹⁵', 
      icon: <ScatterPlotIcon />, 
      color: '#f59e0b',
      description: 'Fault tolerance rate'
    },
  ];

  const quantumStates = [
    '|0⟩ + |1⟩',
    '|+⟩ state',
    '|−⟩ state',
    '|i⟩ state',
    '|Bell⟩',
    '|GHZ⟩',
    '|W⟩ state',
    '|Cat⟩'
  ];

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at center, #10002b 0%, #000000 100%)',
      position: 'relative',
      overflow: 'hidden',
      perspective: '1200px',
    }}>
      {/* Quantum Field Background */}
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `
          radial-gradient(circle at 25% 25%, rgba(124, 58, 237, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 75% 75%, rgba(6, 182, 212, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.05) 0%, transparent 70%)
        `,
      }}>
        {particles.map(particle => (
          <QuantumParticle
            key={particle.id}
            sx={{
              left: particle.x,
              top: particle.y,
              background: `hsl(${(particle.id * 45) % 360}, 70%, 60%)`,
              boxShadow: `0 0 10px hsl(${(particle.id * 45) % 360}, 70%, 60%)`,
              animationDelay: `${particle.id * 0.2}s`,
            }}
          />
        ))}
      </Box>

      <Box sx={{ p: 4, position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h2" sx={{
            fontWeight: 900,
            background: 'linear-gradient(45deg, #7c3aed 0%, #06b6d4 50%, #10b981 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 2,
            textShadow: '0 0 40px rgba(124, 58, 237, 0.5)',
          }}>
            QUANTUM DASHBOARD
          </Typography>
          <Typography variant="h6" sx={{
            color: alpha('#ffffff', 0.8),
            letterSpacing: '0.15em',
            mb: 3,
          }}>
            ⚛️ HARNESSING QUANTUM SUPREMACY FOR PRODUCTIVITY ⚛️
          </Typography>
          
          <Stack direction="row" justifyContent="center" spacing={2} flexWrap="wrap">
            <Chip
              label={`Current State: ${quantumStates[quantumState]}`}
              sx={{
                background: 'linear-gradient(45deg, #7c3aed, #06b6d4)',
                color: '#fff',
                fontWeight: 700,
                fontSize: '1rem',
                animation: `${quantumFlicker} 2s ease-in-out infinite`,
              }}
            />
            <Chip
              label="Temperature: 15 mK"
              sx={{
                background: 'linear-gradient(45deg, #06b6d4, #10b981)',
                color: '#fff',
                fontWeight: 700,
              }}
            />
          </Stack>
        </Box>

        {/* Quantum Metrics Grid */}
        <Grid container spacing={4} sx={{ mb: 6 }}>
          {quantumMetrics.map((metric, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <QuantumCard sx={{ height: '100%' }}>
                <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                    <QuantumOrb sx={{ color: metric.color }}>
                      <Box sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        fontSize: 20,
                      }}>
                        {metric.icon}
                      </Box>
                    </QuantumOrb>
                    <Box>
                      <Typography variant="caption" sx={{
                        color: alpha('#fff', 0.6),
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        display: 'block',
                      }}>
                        {metric.label}
                      </Typography>
                      <Typography variant="body2" sx={{
                        color: alpha('#fff', 0.4),
                        fontSize: '0.75rem',
                      }}>
                        {metric.description}
                      </Typography>
                    </Box>
                  </Stack>
                  
                  <Typography variant="h4" sx={{
                    color: metric.color,
                    fontWeight: 900,
                    textShadow: `0 0 20px ${metric.color}`,
                    mt: 'auto',
                  }}>
                    {metric.value}
                  </Typography>
                </Box>
              </QuantumCard>
            </Grid>
          ))}
        </Grid>

        {/* Central Quantum Computer */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 6 }}>
          <QuantumCard sx={{ maxWidth: 600, width: '100%' }}>
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h4" sx={{
                color: '#fff',
                fontWeight: 700,
                mb: 3,
              }}>
                🎙️ QUANTUM VOICE PROCESSOR 🎙️
              </Typography>
              
              <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: 200,
                position: 'relative',
                mb: 3,
              }}>
                {/* Quantum Visualization */}
                <Box sx={{
                  width: 150,
                  height: 150,
                  position: 'relative',
                }}>
                  {Array.from({ length: 8 }).map((_, i) => (
                    <Box
                      key={i}
                      sx={{
                        position: 'absolute',
                        width: 150,
                        height: 150,
                        border: '2px solid',
                        borderColor: i % 2 === 0 ? '#7c3aed' : '#06b6d4',
                        borderRadius: '50%',
                        opacity: 0.3,
                        animation: `${quantumFlicker} ${3 + i * 0.5}s ease-in-out infinite`,
                        animationDelay: `${i * 0.2}s`,
                        transform: `scale(${1 - i * 0.1}) rotate(${i * 45}deg)`,
                      }}
                    />
                  ))}
                  <Fab
                    size="large"
                    onClick={() => setIsRecording(!isRecording)}
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: 80,
                      height: 80,
                      background: 'linear-gradient(45deg, #7c3aed 0%, #06b6d4 100%)',
                      boxShadow: '0 0 40px rgba(124, 58, 237, 0.8)',
                      '&:hover': {
                        transform: 'translate(-50%, -50%) scale(1.1)',
                        boxShadow: '0 0 60px rgba(124, 58, 237, 1)',
                      }
                    }}
                  >
                    <MicIcon sx={{ fontSize: 40 }} />
                  </Fab>
                </Box>
              </Box>
              
              <Typography variant="body1" sx={{
                color: alpha('#fff', 0.7),
                mb: 2,
              }}>
                Quantum entangled voice recognition with infinite parallel processing
              </Typography>
              
              <Stack direction="row" justifyContent="center" spacing={1} flexWrap="wrap">
                <Chip
                  icon={<FlashOnIcon />}
                  label="INSTANTANEOUS"
                  size="small"
                  sx={{
                    background: alpha('#7c3aed', 0.2),
                    color: '#7c3aed',
                    border: '1px solid #7c3aed',
                  }}
                />
                <Chip
                  icon={<TrendingUpIcon />}
                  label="QUANTUM ADVANTAGE"
                  size="small"
                  sx={{
                    background: alpha('#06b6d4', 0.2),
                    color: '#06b6d4',
                    border: '1px solid #06b6d4',
                  }}
                />
              </Stack>
            </Box>
          </QuantumCard>
        </Box>

        {isRecording && (
          <Paper sx={{
            position: 'fixed',
            bottom: 40,
            left: '50%',
            transform: 'translateX(-50%)',
            p: 3,
            background: 'rgba(16, 0, 43, 0.95)',
            border: '2px solid #7c3aed',
            borderRadius: 3,
            boxShadow: '0 0 50px rgba(124, 58, 237, 0.6)',
            zIndex: 1000,
          }}>
            <VoiceRecorder
              onTranscript={onTranscript}
              transcriptionService={transcriptionService as any}
              onRecordingStateChange={setIsRecording}
            />
          </Paper>
        )}
      </Box>
    </Box>
  );
};

export default QuantumDashboard;