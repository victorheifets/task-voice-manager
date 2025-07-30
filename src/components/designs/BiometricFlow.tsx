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
  Avatar,
  LinearProgress,
  CircularProgress
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import MicIcon from '@mui/icons-material/Mic';
import FavoriteIcon from '@mui/icons-material/Favorite';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import BrainIcon from '@mui/icons-material/Psychology';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import BloodtypeIcon from '@mui/icons-material/Bloodtype';
import WavesIcon from '@mui/icons-material/Waves';
import VoiceRecorder from '../voice/VoiceRecorder';

const heartbeat = keyframes`
  0% { transform: scale(1); opacity: 1; }
  14% { transform: scale(1.3); opacity: 0.8; }
  28% { transform: scale(1); opacity: 1; }
  42% { transform: scale(1.3); opacity: 0.8; }
  70% { transform: scale(1); opacity: 1; }
`;

const pulseWave = keyframes`
  0% { transform: scaleY(0.5); opacity: 0.5; }
  50% { transform: scaleY(1.2); opacity: 1; }
  100% { transform: scaleY(0.5); opacity: 0.5; }
`;

const biometricScan = keyframes`
  0% { transform: translateY(100%); opacity: 0; }
  50% { opacity: 1; }
  100% { transform: translateY(-100%); opacity: 0; }
`;

const neuralActivity = keyframes`
  0% { fill: #ff6b6b; }
  25% { fill: #4ecdc4; }
  50% { fill: #45b7d1; }
  75% { fill: #96ceb4; }
  100% { fill: #ff6b6b; }
`;

const BiometricCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, rgba(139, 0, 0, 0.1) 0%, rgba(0, 0, 139, 0.1) 100%)',
  backdropFilter: 'blur(20px) saturate(180%)',
  border: '1px solid rgba(255, 107, 107, 0.2)',
  borderRadius: '20px',
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.4s ease',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '2px',
    background: 'linear-gradient(90deg, transparent, #ff6b6b, transparent)',
    animation: `${biometricScan} 3s linear infinite`,
  },
  '&:hover': {
    transform: 'translateY(-5px)',
    border: '1px solid rgba(255, 107, 107, 0.4)',
    boxShadow: '0 15px 50px rgba(255, 107, 107, 0.3)',
  },
}));

const HeartBeat = styled(Box)(({ theme }) => ({
  animation: `${heartbeat} 1.2s ease-in-out infinite`,
}));

const PulseBar = styled(Box)(({ theme }) => ({
  width: 4,
  height: 60,
  background: 'linear-gradient(180deg, #ff6b6b 0%, #4ecdc4 100%)',
  borderRadius: 2,
  animation: `${pulseWave} 1s ease-in-out infinite`,
  margin: '0 2px',
}));

const BiometricFlow: React.FC<{ onTranscript: (text: string) => void; transcriptionService?: string }> = ({
  onTranscript,
  transcriptionService
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [isRecording, setIsRecording] = useState(false);
  const [heartRate, setHeartRate] = useState(72);
  const [oxygenLevel, setOxygenLevel] = useState(98);
  const [stressLevel, setStressLevel] = useState(25);
  const [brainActivity, setBrainActivity] = useState(85);

  useEffect(() => {
    const interval = setInterval(() => {
      setHeartRate(prev => Math.max(60, Math.min(100, prev + (Math.random() - 0.5) * 4)));
      setOxygenLevel(prev => Math.max(95, Math.min(100, prev + (Math.random() - 0.5) * 1)));
      setStressLevel(prev => Math.max(0, Math.min(100, prev + (Math.random() - 0.5) * 10)));
      setBrainActivity(prev => Math.max(70, Math.min(100, prev + (Math.random() - 0.5) * 8)));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const biometricData = [
    {
      label: 'Heart Rate',
      value: `${heartRate.toFixed(0)} BPM`,
      icon: <FavoriteIcon />,
      color: '#ff6b6b',
      progress: (heartRate - 60) / 40 * 100,
      description: 'Cardiovascular health'
    },
    {
      label: 'Blood Oxygen',
      value: `${oxygenLevel.toFixed(1)}%`,
      icon: <BloodtypeIcon />,
      color: '#4ecdc4',
      progress: oxygenLevel,
      description: 'Oxygen saturation'
    },
    {
      label: 'Stress Level',
      value: `${stressLevel.toFixed(0)}%`,
      icon: <MonitorHeartIcon />,
      color: '#45b7d1',
      progress: 100 - stressLevel,
      description: 'Mental wellness index'
    },
    {
      label: 'Brain Activity',
      value: `${brainActivity.toFixed(0)}%`,
      icon: <BrainIcon />,
      color: '#96ceb4',
      progress: brainActivity,
      description: 'Cognitive performance'
    },
  ];

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at center, #1a0d0d 0%, #000000 100%)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Biometric Field Background */}
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `
          radial-gradient(circle at 20% 20%, rgba(255, 107, 107, 0.05) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(78, 205, 196, 0.05) 0%, transparent 50%),
          radial-gradient(circle at 40% 60%, rgba(69, 183, 209, 0.03) 0%, transparent 70%)
        `,
      }} />

      <Box sx={{ p: 4, position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h2" sx={{
            fontWeight: 900,
            background: 'linear-gradient(45deg, #ff6b6b 0%, #4ecdc4 50%, #45b7d1 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 2,
            textShadow: '0 0 30px rgba(255, 107, 107, 0.5)',
          }}>
            BIOMETRIC FLOW
          </Typography>
          <Typography variant="h6" sx={{
            color: alpha('#ffffff', 0.8),
            letterSpacing: '0.15em',
            mb: 3,
          }}>
            💗 HUMAN-CENTERED PRODUCTIVITY INTELLIGENCE 💗
          </Typography>
          
          <Stack direction="row" justifyContent="center" spacing={2} flexWrap="wrap">
            <Chip
              icon={<HeartBeat><FavoriteIcon /></HeartBeat>}
              label={`❤️ ${heartRate.toFixed(0)} BPM`}
              sx={{
                background: 'linear-gradient(45deg, #ff6b6b, #ff8a80)',
                color: '#fff',
                fontWeight: 700,
                fontSize: '1rem',
              }}
            />
            <Chip
              icon={<BloodtypeIcon />}
              label={`🫁 ${oxygenLevel.toFixed(1)}% O₂`}
              sx={{
                background: 'linear-gradient(45deg, #4ecdc4, #80cbc4)',
                color: '#fff',
                fontWeight: 700,
              }}
            />
          </Stack>
        </Box>

        {/* Biometric Metrics Grid */}
        <Grid container spacing={4} sx={{ mb: 6 }}>
          {biometricData.map((metric, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <BiometricCard sx={{ height: '100%' }}>
                <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                    <Box sx={{
                      width: 50,
                      height: 50,
                      borderRadius: '50%',
                      background: `linear-gradient(45deg, ${metric.color}, ${alpha(metric.color, 0.6)})`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontSize: 24,
                      boxShadow: `0 0 20px ${alpha(metric.color, 0.5)}`,
                    }}>
                      {metric.icon}
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{
                        color: '#fff',
                        fontWeight: 700,
                      }}>
                        {metric.label}
                      </Typography>
                      <Typography variant="caption" sx={{
                        color: alpha('#fff', 0.6),
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
                    mb: 2,
                  }}>
                    {metric.value}
                  </Typography>
                  
                  <Box sx={{ mt: 'auto' }}>
                    <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                      <Typography variant="caption" sx={{ color: alpha('#fff', 0.6) }}>
                        Status
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={metric.progress}
                        sx={{
                          flex: 1,
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: alpha(metric.color, 0.1),
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: metric.color,
                            boxShadow: `0 0 10px ${metric.color}`,
                          },
                        }}
                      />
                    </Stack>
                    <Typography variant="caption" sx={{
                      color: metric.progress > 70 ? '#4caf50' : metric.progress > 40 ? '#ff9800' : '#f44336',
                      fontWeight: 700,
                    }}>
                      {metric.progress > 70 ? 'OPTIMAL' : metric.progress > 40 ? 'MODERATE' : 'ATTENTION'}
                    </Typography>
                  </Box>
                </Box>
              </BiometricCard>
            </Grid>
          ))}
        </Grid>

        {/* Central Biometric Scanner */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 6 }}>
          <BiometricCard sx={{ maxWidth: 700, width: '100%' }}>
            <Box sx={{ p: 4 }}>
              <Typography variant="h4" sx={{
                color: '#fff',
                fontWeight: 700,
                textAlign: 'center',
                mb: 4,
              }}>
                🎙️ BIOMETRIC VOICE INTERFACE 🎙️
              </Typography>
              
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} md={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Box sx={{
                      position: 'relative',
                      display: 'inline-block',
                      mb: 3,
                    }}>
                      {/* Pulse Visualization */}
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'flex-end',
                        justifyContent: 'center',
                        height: 100,
                        mb: 2,
                      }}>
                        {Array.from({ length: 30 }).map((_, i) => (
                          <PulseBar
                            key={i}
                            sx={{
                              animationDelay: `${i * 0.1}s`,
                              height: `${30 + Math.sin(i * 0.5) * 30}px`,
                            }}
                          />
                        ))}
                      </Box>
                      
                      <Fab
                        size="large"
                        onClick={() => setIsRecording(!isRecording)}
                        sx={{
                          width: 100,
                          height: 100,
                          background: 'linear-gradient(45deg, #ff6b6b 0%, #4ecdc4 100%)',
                          boxShadow: '0 0 40px rgba(255, 107, 107, 0.6)',
                          '&:hover': {
                            transform: 'scale(1.1)',
                            boxShadow: '0 0 60px rgba(255, 107, 107, 0.8)',
                          }
                        }}
                      >
                        <MicIcon sx={{ fontSize: 50 }} />
                      </Fab>
                    </Box>
                    
                    <Typography variant="body1" sx={{
                      color: alpha('#fff', 0.8),
                      mb: 2,
                    }}>
                      Voice analysis integrated with real-time biometric monitoring
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Stack spacing={2}>
                    <BiometricCard sx={{ p: 2 }}>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <FingerprintIcon sx={{ color: '#ff6b6b', fontSize: 32 }} />
                        <Box>
                          <Typography variant="body2" sx={{ color: '#fff', fontWeight: 700 }}>
                            VOICE PRINT ANALYSIS
                          </Typography>
                          <Typography variant="caption" sx={{ color: alpha('#fff', 0.6) }}>
                            Unique vocal characteristics identified
                          </Typography>
                        </Box>
                      </Stack>
                    </BiometricCard>
                    
                    <BiometricCard sx={{ p: 2 }}>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <WavesIcon sx={{ color: '#4ecdc4', fontSize: 32 }} />
                        <Box>
                          <Typography variant="body2" sx={{ color: '#fff', fontWeight: 700 }}>
                            EMOTIONAL STATE DETECTION
                          </Typography>
                          <Typography variant="caption" sx={{ color: alpha('#fff', 0.6) }}>
                            Stress: {stressLevel.toFixed(0)}% | Engagement: High
                          </Typography>
                        </Box>
                      </Stack>
                    </BiometricCard>
                    
                    <BiometricCard sx={{ p: 2 }}>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <VisibilityIcon sx={{ color: '#45b7d1', fontSize: 32 }} />
                        <Box>
                          <Typography variant="body2" sx={{ color: '#fff', fontWeight: 700 }}>
                            ATTENTION TRACKING
                          </Typography>
                          <Typography variant="caption" sx={{ color: alpha('#fff', 0.6) }}>
                            Focus level: {brainActivity.toFixed(0)}% active
                          </Typography>
                        </Box>
                      </Stack>
                    </BiometricCard>
                  </Stack>
                </Grid>
              </Grid>
            </Box>
          </BiometricCard>
        </Box>

        {isRecording && (
          <Paper sx={{
            position: 'fixed',
            bottom: 40,
            left: '50%',
            transform: 'translateX(-50%)',
            p: 3,
            background: 'rgba(26, 13, 13, 0.95)',
            border: `2px solid #ff6b6b`,
            borderRadius: 3,
            boxShadow: '0 0 40px rgba(255, 107, 107, 0.6)',
            zIndex: 1000,
          }}>
            <Stack direction="row" alignItems="center" spacing={2} mb={2}>
              <HeartBeat>
                <FavoriteIcon sx={{ color: '#ff6b6b' }} />
              </HeartBeat>
              <Typography variant="body2" sx={{ color: '#fff' }}>
                Monitoring biometrics during voice input...
              </Typography>
            </Stack>
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

export default BiometricFlow;