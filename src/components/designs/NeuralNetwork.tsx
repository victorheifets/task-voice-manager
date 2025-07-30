'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  LinearProgress
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import MicIcon from '@mui/icons-material/Mic';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import BubbleChartIcon from '@mui/icons-material/BubbleChart';
import ScatterPlotIcon from '@mui/icons-material/ScatterPlot';
import VoiceRecorder from '../voice/VoiceRecorder';

const neuronPulse = keyframes`
  0% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
  100% { opacity: 0.3; transform: scale(1); }
`;

const synapseFlow = keyframes`
  0% { stroke-dashoffset: 100; opacity: 0; }
  50% { opacity: 1; }
  100% { stroke-dashoffset: 0; opacity: 0; }
`;

const brainWave = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
`;

const NeuralNode = styled(Box)(({ theme }) => ({
  width: 20,
  height: 20,
  borderRadius: '50%',
  position: 'absolute',
  animation: `${neuronPulse} 3s ease-in-out infinite`,
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.5)',
    zIndex: 10,
  },
}));

const NeuralCard = styled(Card)(({ theme }) => ({
  background: 'rgba(15, 23, 42, 0.8)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(139, 69, 19, 0.3)',
  borderRadius: '20px',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '2px',
    background: 'linear-gradient(90deg, transparent, #ff6b35, transparent)',
    animation: `${brainWave} 4s linear infinite`,
  },
}));

const NeuralNetwork: React.FC<{ onTranscript: (text: string) => void; transcriptionService?: string }> = ({
  onTranscript,
  transcriptionService
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [isRecording, setIsRecording] = useState(false);
  const [neurons, setNeurons] = useState<Array<{ id: number; x: number; y: number; active: boolean; layer: number }>>([]);
  const [connections, setConnections] = useState<Array<{ from: number; to: number; strength: number }>>([]);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    // Generate neural network structure
    const layers = [8, 12, 16, 12, 8, 4]; // Number of neurons per layer
    const newNeurons: Array<{ id: number; x: number; y: number; active: boolean; layer: number }> = [];
    const newConnections: Array<{ from: number; to: number; strength: number }> = [];
    
    let neuronId = 0;
    const layerPositions: Array<Array<{ id: number; x: number; y: number }>> = [];
    
    // Create neurons
    layers.forEach((layerSize, layerIndex) => {
      const layerNeurons: Array<{ id: number; x: number; y: number }> = [];
      const layerX = (window.innerWidth / (layers.length + 1)) * (layerIndex + 1);
      
      for (let i = 0; i < layerSize; i++) {
        const neuronY = (window.innerHeight / (layerSize + 1)) * (i + 1);
        const neuron = {
          id: neuronId++,
          x: layerX,
          y: neuronY,
          active: Math.random() > 0.7,
          layer: layerIndex
        };
        newNeurons.push(neuron);
        layerNeurons.push({ id: neuron.id, x: layerX, y: neuronY });
      }
      layerPositions.push(layerNeurons);
    });
    
    // Create connections between adjacent layers
    for (let layerIndex = 0; layerIndex < layerPositions.length - 1; layerIndex++) {
      const currentLayer = layerPositions[layerIndex];
      const nextLayer = layerPositions[layerIndex + 1];
      
      currentLayer.forEach(fromNeuron => {
        nextLayer.forEach(toNeuron => {
          if (Math.random() > 0.3) { // 70% chance of connection
            newConnections.push({
              from: fromNeuron.id,
              to: toNeuron.id,
              strength: Math.random()
            });
          }
        });
      });
    }
    
    setNeurons(newNeurons);
    setConnections(newConnections);
  }, []);

  useEffect(() => {
    // Animate neural activity
    const interval = setInterval(() => {
      setNeurons(prev => prev.map(neuron => ({
        ...neuron,
        active: Math.random() > 0.6
      })));
    }, 500);
    
    return () => clearInterval(interval);
  }, []);

  const networkStats = [
    { label: 'Active Neurons', value: neurons.filter(n => n.active).length },
    { label: 'Synaptic Connections', value: connections.length },
    { label: 'Learning Rate', value: '98.7%' },
    { label: 'Processing Speed', value: '2.4 THz' },
  ];

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at center, #0f172a 0%, #000000 100%)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Neural Network Visualization */}
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }}
      >
        {/* Draw connections */}
        {connections.map((connection, index) => {
          const fromNeuron = neurons.find(n => n.id === connection.from);
          const toNeuron = neurons.find(n => n.id === connection.to);
          
          if (!fromNeuron || !toNeuron) return null;
          
          return (
            <line
              key={index}
              x1={fromNeuron.x}
              y1={fromNeuron.y}
              x2={toNeuron.x}
              y2={toNeuron.y}
              stroke={`rgba(255, 107, 53, ${connection.strength * 0.5})`}
              strokeWidth={connection.strength * 2}
              strokeDasharray="5,5"
              style={{
                animation: fromNeuron.active && toNeuron.active ? `${synapseFlow} 2s ease-in-out infinite` : 'none'
              }}
            />
          );
        })}
      </svg>

      {/* Neural Nodes */}
      {neurons.map(neuron => (
        <NeuralNode
          key={neuron.id}
          sx={{
            left: neuron.x - 10,
            top: neuron.y - 10,
            background: neuron.active 
              ? 'radial-gradient(circle, #ff6b35 0%, #f7931e 100%)'
              : 'radial-gradient(circle, #4a5568 0%, #2d3748 100%)',
            boxShadow: neuron.active 
              ? '0 0 20px #ff6b35, 0 0 40px #ff6b35'
              : '0 0 10px rgba(74, 85, 104, 0.5)',
            animationDelay: `${neuron.id * 0.1}s`,
            zIndex: 2,
          }}
        />
      ))}

      {/* Header */}
      <Box sx={{ position: 'relative', zIndex: 3, p: 4 }}>
        <Typography variant="h3" sx={{
          fontWeight: 900,
          background: 'linear-gradient(45deg, #ff6b35 0%, #f7931e 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textAlign: 'center',
          mb: 1,
          textShadow: '0 0 30px rgba(255, 107, 53, 0.5)',
        }}>
          NEURAL NETWORK INTERFACE
        </Typography>
        <Typography variant="h6" sx={{
          color: alpha('#ffffff', 0.7),
          textAlign: 'center',
          letterSpacing: '0.1em',
        }}>
          DEEP LEARNING POWERED PRODUCTIVITY
        </Typography>
      </Box>

      {/* Network Statistics */}
      <Box sx={{
        position: 'absolute',
        bottom: 40,
        left: 40,
        right: 40,
        zIndex: 3,
      }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          {networkStats.map((stat, index) => (
            <NeuralCard key={index} sx={{ flex: 1, p: 2 }}>
              <Typography variant="caption" sx={{
                color: alpha('#fff', 0.6),
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}>
                {stat.label}
              </Typography>
              <Typography variant="h5" sx={{
                color: '#ff6b35',
                fontWeight: 900,
                textShadow: '0 0 20px rgba(255, 107, 53, 0.5)',
              }}>
                {stat.value}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={Math.random() * 100}
                sx={{
                  mt: 1,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: alpha('#ff6b35', 0.1),
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: '#ff6b35',
                    boxShadow: '0 0 10px #ff6b35',
                  },
                }}
              />
            </NeuralCard>
          ))}
        </Stack>
      </Box>

      {/* Central Command Interface */}
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 10,
      }}>
        <NeuralCard sx={{
          p: 4,
          textAlign: 'center',
          minWidth: 300,
        }}>
          <Stack alignItems="center" spacing={2}>
            <BubbleChartIcon sx={{ fontSize: 60, color: '#ff6b35' }} />
            <Typography variant="h5" sx={{
              color: '#fff',
              fontWeight: 700,
            }}>
              NEURAL PROCESSOR
            </Typography>
            <Typography variant="body2" sx={{
              color: alpha('#fff', 0.7),
            }}>
              {neurons.filter(n => n.active).length} neurons firing
            </Typography>
            <Fab
              size="large"
              onClick={() => setIsRecording(!isRecording)}
              sx={{
                background: 'linear-gradient(45deg, #ff6b35 0%, #f7931e 100%)',
                boxShadow: '0 0 30px rgba(255, 107, 53, 0.6)',
                mt: 2,
                '&:hover': {
                  transform: 'scale(1.1)',
                  boxShadow: '0 0 40px rgba(255, 107, 53, 0.8)',
                }
              }}
            >
              <MicIcon sx={{ fontSize: 32 }} />
            </Fab>
          </Stack>
        </NeuralCard>
      </Box>

      {/* Brain Activity Monitor */}
      <Box sx={{
        position: 'absolute',
        top: 40,
        right: 40,
        width: 300,
        zIndex: 3,
      }}>
        <NeuralCard sx={{ p: 3 }}>
          <Stack direction="row" alignItems="center" spacing={2} mb={2}>
            <AccountTreeIcon sx={{ color: '#ff6b35', fontSize: 32 }} />
            <Box>
              <Typography variant="h6" sx={{ color: '#fff' }}>
                NEURAL ACTIVITY
              </Typography>
              <Typography variant="caption" sx={{ color: alpha('#fff', 0.6) }}>
                Real-time brain simulation
              </Typography>
            </Box>
          </Stack>
          
          <Box sx={{
            height: 100,
            background: 'rgba(0, 0, 0, 0.5)',
            borderRadius: 2,
            mb: 2,
            position: 'relative',
            overflow: 'hidden',
          }}>
            <Box sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '60%',
              background: 'linear-gradient(180deg, transparent 0%, rgba(255, 107, 53, 0.3) 100%)',
              animation: `${brainWave} 3s ease-in-out infinite`,
            }} />
          </Box>
          
          <Typography variant="body2" sx={{
            color: '#00ff00',
            fontFamily: 'monospace',
            fontSize: '0.8rem',
          }}>
            STATUS: LEARNING | ACCURACY: 99.2% | EPOCH: 847
          </Typography>
        </NeuralCard>
      </Box>

      {isRecording && (
        <Paper sx={{
          position: 'fixed',
          bottom: 120,
          left: '50%',
          transform: 'translateX(-50%)',
          p: 3,
          background: 'rgba(15, 23, 42, 0.95)',
          border: '2px solid #ff6b35',
          borderRadius: 3,
          boxShadow: '0 0 40px rgba(255, 107, 53, 0.5)',
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
  );
};

export default NeuralNetwork;