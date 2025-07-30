'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  Fab,
  useTheme,
  Grid,
  Paper,
  LinearProgress,
  Chip,
  IconButton,
  Avatar,
  Badge,
  Stack,
  alpha,
  useMediaQuery
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import MicIcon from '@mui/icons-material/Mic';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import BrainIcon from '@mui/icons-material/Psychology';
import SpeedIcon from '@mui/icons-material/Speed';
import InsightsIcon from '@mui/icons-material/Insights';
import TuneIcon from '@mui/icons-material/Tune';
import SecurityIcon from '@mui/icons-material/Security';
import CloudSyncIcon from '@mui/icons-material/CloudSync';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import VoiceRecorder from '../voice/VoiceRecorder';

const scan = keyframes`
  0% { transform: translateY(-100%); opacity: 0; }
  50% { opacity: 1; }
  100% { transform: translateY(100%); opacity: 0; }
`;

const dataFlow = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
`;

const AICard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
  border: '1px solid rgba(0, 255, 255, 0.3)',
  borderRadius: '16px',
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '2px',
    background: 'linear-gradient(90deg, transparent, #00ffff, transparent)',
    animation: `${dataFlow} 3s linear infinite`,
  },
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 40px rgba(0, 255, 255, 0.3)',
    border: '1px solid rgba(0, 255, 255, 0.6)',
  },
}));

const NeuralGrid = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundImage: `
    linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)
  `,
  backgroundSize: '50px 50px',
  opacity: 0.3,
  pointerEvents: 'none',
}));

const ScanLine = styled(Box)(({ theme }) => ({
  position: 'absolute',
  left: 0,
  right: 0,
  height: '4px',
  background: 'linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.8), transparent)',
  animation: `${scan} 4s linear infinite`,
}));

const MetricBox = styled(Paper)(({ theme }) => ({
  background: 'rgba(0, 0, 0, 0.6)',
  border: '1px solid rgba(0, 255, 255, 0.2)',
  borderRadius: '12px',
  padding: theme.spacing(2),
  position: 'relative',
  overflow: 'hidden',
  backdropFilter: 'blur(10px)',
}));

const AICommandCenter: React.FC<{ onTranscript: (text: string) => void; transcriptionService?: string }> = ({
  onTranscript,
  transcriptionService
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [isRecording, setIsRecording] = useState(false);
  const [aiMetrics, setAiMetrics] = useState({
    accuracy: 98.7,
    speed: 0.023,
    tasks: 1247,
    efficiency: 99.2
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setAiMetrics(prev => ({
        accuracy: Math.min(100, prev.accuracy + (Math.random() - 0.5) * 0.5),
        speed: Math.max(0.01, prev.speed + (Math.random() - 0.5) * 0.005),
        tasks: prev.tasks + Math.floor(Math.random() * 3),
        efficiency: Math.min(100, prev.efficiency + (Math.random() - 0.5) * 0.3)
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const aiFeatures = [
    { icon: <BrainIcon />, title: 'Neural Processing', value: '12.5 TFLOPS', color: '#00ffff' },
    { icon: <SpeedIcon />, title: 'Response Time', value: `${aiMetrics.speed.toFixed(3)}s`, color: '#ff00ff' },
    { icon: <InsightsIcon />, title: 'Pattern Recognition', value: `${aiMetrics.accuracy.toFixed(1)}%`, color: '#00ff00' },
    { icon: <SecurityIcon />, title: 'Security Level', value: 'QUANTUM', color: '#ffaa00' },
  ];

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at top, #0f0f23 0%, #000000 100%)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <NeuralGrid />
      <ScanLine />

      <Box sx={{ p: 4, position: 'relative', zIndex: 1 }}>
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h3" sx={{
            fontWeight: 900,
            color: '#00ffff',
            textShadow: '0 0 30px rgba(0, 255, 255, 0.5)',
            letterSpacing: '0.05em',
            mb: 1,
          }}>
            AI COMMAND CENTER
          </Typography>
          <Typography variant="h6" sx={{
            color: alpha('#ffffff', 0.7),
            letterSpacing: '0.15em',
          }}>
            NEURAL NETWORK POWERED PRODUCTIVITY
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <AICard sx={{ height: '100%', p: 3 }}>
              <Stack direction="row" alignItems="center" spacing={2} mb={3}>
                <SmartToyIcon sx={{ fontSize: 40, color: '#00ffff' }} />
                <Box>
                  <Typography variant="h5" sx={{ color: '#fff', fontWeight: 700 }}>
                    QUANTUM AI ASSISTANT
                  </Typography>
                  <Typography variant="body2" sx={{ color: alpha('#fff', 0.6) }}>
                    Processing {aiMetrics.tasks} tasks with {aiMetrics.efficiency.toFixed(1)}% efficiency
                  </Typography>
                </Box>
              </Stack>

              <Grid container spacing={2}>
                {aiFeatures.map((feature, index) => (
                  <Grid item xs={6} key={index}>
                    <MetricBox>
                      <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                        <Box sx={{ color: feature.color, fontSize: 24 }}>
                          {feature.icon}
                        </Box>
                        <Typography variant="caption" sx={{ color: alpha('#fff', 0.6) }}>
                          {feature.title}
                        </Typography>
                      </Stack>
                      <Typography variant="h5" sx={{
                        color: feature.color,
                        fontWeight: 900,
                        textShadow: `0 0 20px ${feature.color}`,
                      }}>
                        {feature.value}
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={Math.random() * 100}
                        sx={{
                          mt: 1,
                          height: 4,
                          borderRadius: 2,
                          backgroundColor: alpha(feature.color, 0.1),
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: feature.color,
                            boxShadow: `0 0 10px ${feature.color}`,
                          },
                        }}
                      />
                    </MetricBox>
                  </Grid>
                ))}
              </Grid>

              <Box sx={{ mt: 3, p: 2, background: alpha('#000', 0.4), borderRadius: 2 }}>
                <Typography variant="body2" sx={{ color: '#00ff00', fontFamily: 'monospace' }}>
                  AI STATUS: ONLINE | LEARNING RATE: OPTIMAL | QUANTUM CORES: ACTIVE
                </Typography>
              </Box>
            </AICard>
          </Grid>

          <Grid item xs={12} md={4}>
            <Stack spacing={2}>
              <AICard sx={{ p: 2 }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{
                    background: 'linear-gradient(45deg, #00ffff, #ff00ff)',
                    width: 56,
                    height: 56,
                  }}>
                    <AutoGraphIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ color: '#fff' }}>
                      PREDICTIVE ANALYTICS
                    </Typography>
                    <Typography variant="body2" sx={{ color: alpha('#fff', 0.6) }}>
                      Next action probability: 94.2%
                    </Typography>
                  </Box>
                </Stack>
              </AICard>

              <AICard sx={{ p: 2 }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{
                    background: 'linear-gradient(45deg, #ff00ff, #ffaa00)',
                    width: 56,
                    height: 56,
                  }}>
                    <CloudSyncIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ color: '#fff' }}>
                      NEURAL SYNC
                    </Typography>
                    <Typography variant="body2" sx={{ color: alpha('#fff', 0.6) }}>
                      Connected to 12 quantum nodes
                    </Typography>
                  </Box>
                </Stack>
              </AICard>

              <AICard sx={{ p: 2 }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{
                    background: 'linear-gradient(45deg, #00ff00, #00ffff)',
                    width: 56,
                    height: 56,
                  }}>
                    <TuneIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ color: '#fff' }}>
                      AUTO-OPTIMIZATION
                    </Typography>
                    <Typography variant="body2" sx={{ color: alpha('#fff', 0.6) }}>
                      Performance boost: +47%
                    </Typography>
                  </Box>
                </Stack>
              </AICard>
            </Stack>
          </Grid>
        </Grid>

        <Box sx={{ position: 'fixed', bottom: 40, right: 40 }}>
          <Badge
            badgeContent="AI"
            color="primary"
            sx={{
              '& .MuiBadge-badge': {
                background: 'linear-gradient(45deg, #00ffff, #ff00ff)',
                animation: 'pulse 2s infinite',
              }
            }}
          >
            <Fab
              size="large"
              onClick={() => setIsRecording(!isRecording)}
              sx={{
                background: 'linear-gradient(45deg, #1a1a2e, #16213e)',
                border: '2px solid #00ffff',
                boxShadow: '0 0 30px rgba(0, 255, 255, 0.5)',
                '&:hover': {
                  transform: 'scale(1.1)',
                  boxShadow: '0 0 40px rgba(0, 255, 255, 0.8)',
                }
              }}
            >
              <MicIcon sx={{ color: '#00ffff', fontSize: 32 }} />
            </Fab>
          </Badge>
        </Box>

        {isRecording && (
          <Paper sx={{
            position: 'fixed',
            bottom: 120,
            right: 40,
            p: 2,
            background: 'rgba(16, 33, 62, 0.95)',
            border: '2px solid #00ffff',
            borderRadius: 2,
            boxShadow: '0 0 30px rgba(0, 255, 255, 0.5)',
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

export default AICommandCenter;