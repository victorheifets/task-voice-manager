'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Fab,
  useMediaQuery,
  useTheme,
  TextField,
  LinearProgress,
  Paper,
  Avatar,
  CircularProgress,
  IconButton,
  Grid,
  AppBar,
  Toolbar,
  Badge,
  Divider,
  Chip,
  Button,
  Stack
} from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import AddIcon from '@mui/icons-material/Add';
import WorkIcon from '@mui/icons-material/Work';
import HomeIcon from '@mui/icons-material/Home';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import PersonIcon from '@mui/icons-material/Person';
import TodayIcon from '@mui/icons-material/Today';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SettingsIcon from '@mui/icons-material/Settings';
import PaletteIcon from '@mui/icons-material/Palette';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PeopleIcon from '@mui/icons-material/People';
import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import StarIcon from '@mui/icons-material/Star';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

interface ColorfulProductivityProps {
  onTranscript: (text: string) => void;
  transcriptionService?: 'browser' | 'whisper' | 'azure' | 'hybrid';
}

const mockTasks = [
  { 
    id: 1, 
    title: 'Creative Brand Strategy Workshop', 
    description: 'Develop innovative brand positioning and visual identity concepts',
    priority: 'high', 
    status: 'in-progress',
    assignee: 'Sarah Chen',
    dueDate: 'Today',
    team: ['SC', 'MK', 'DL'],
    category: 'creative',
    color: '#FF6B6B',
    progress: 85,
    energy: 'high'
  },
  { 
    id: 2, 
    title: 'Product Launch Campaign', 
    description: 'Multi-channel marketing campaign for Q4 product release',
    priority: 'critical', 
    status: 'pending',
    assignee: 'Alex Rodriguez',
    dueDate: '2 days',
    team: ['AR', 'JL', 'NK'],
    category: 'marketing',
    color: '#4ECDC4',
    progress: 60,
    energy: 'medium'
  },
  { 
    id: 3, 
    title: 'Innovation Lab Research', 
    description: 'Explore emerging technologies and market trends',
    priority: 'medium', 
    status: 'completed',
    assignee: 'David Kim',
    dueDate: 'Yesterday',
    team: ['DK', 'LS', 'PM'],
    category: 'research',
    color: '#45B7D1',
    progress: 100,
    energy: 'low'
  },
  { 
    id: 4, 
    title: 'Team Collaboration Platform', 
    description: 'Design and implement next-gen collaboration tools',
    priority: 'high', 
    status: 'pending',
    assignee: 'Emma Wilson',
    dueDate: '1 week',
    team: ['EW', 'RJ', 'TH'],
    category: 'technology',
    color: '#96CEB4',
    progress: 25,
    energy: 'high'
  }
];

const categories = [
  { name: 'Creative', count: 8, color: '#FF6B6B', icon: <PaletteIcon />, gradient: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%)' },
  { name: 'Marketing', count: 12, color: '#4ECDC4', icon: <TrendingUpIcon />, gradient: 'linear-gradient(135deg, #4ECDC4 0%, #6EE0D6 100%)' },
  { name: 'Research', count: 5, color: '#45B7D1', icon: <LightbulbIcon />, gradient: 'linear-gradient(135deg, #45B7D1 0%, #67C7E8 100%)' },
  { name: 'Technology', count: 9, color: '#96CEB4', icon: <WorkIcon />, gradient: 'linear-gradient(135deg, #96CEB4 0%, #B8E6C1 100%)' }
];

const ColorfulProductivity: React.FC<ColorfulProductivityProps> = ({ onTranscript, transcriptionService }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [activeCard, setActiveCard] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'critical': return '#FF1744';
      case 'high': return '#FF6B35';
      case 'medium': return '#FFC107';
      case 'low': return '#4CAF50';
      default: return '#9E9E9E';
    }
  };

  const getEnergyEmoji = (energy: string) => {
    switch(energy) {
      case 'high': return '🔥';
      case 'medium': return '⚡';
      case 'low': return '💡';
      default: return '⭐';
    }
  };

  const ColorfulTaskCard = ({ task, index }: { task: any, index: number }) => {
    const isActive = activeCard === index;

    return (
      <Card 
        onMouseEnter={() => setActiveCard(index)}
        onMouseLeave={() => setActiveCard(null)}
        sx={{
          background: `linear-gradient(145deg, ${task.color}15 0%, #ffffff 100%)`,
          border: `3px solid ${task.color}40`,
          borderRadius: 4,
          boxShadow: isActive 
            ? `0 20px 40px ${task.color}30, 0 0 60px ${task.color}20`
            : `0 8px 24px ${task.color}20`,
          transform: isActive ? 'translateY(-8px) scale(1.03)' : 'translateY(0) scale(1)',
          transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          cursor: 'pointer',
          position: 'relative',
          overflow: 'visible',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 8,
            background: `linear-gradient(90deg, ${task.color} 0%, ${task.color}80 100%)`,
            borderRadius: '16px 16px 0 0'
          }
        }}
      >
        <CardContent sx={{ p: 4, pt: 5 }}>
          {/* Header with Status */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Typography variant="h5" fontWeight={700} sx={{ 
                  color: '#1a1a1a',
                  textDecoration: task.status === 'completed' ? 'line-through' : 'none'
                }}>
                  {task.title}
                </Typography>
                <Box sx={{ fontSize: '1.5rem' }}>{getEnergyEmoji(task.energy)}</Box>
              </Box>
              <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
                {task.description}
              </Typography>
            </Box>
            
            <Stack direction="row" spacing={1}>
              <Chip
                label={task.priority}
                size="small"
                sx={{
                  background: `linear-gradient(135deg, ${getPriorityColor(task.priority)} 0%, ${getPriorityColor(task.priority)}CC 100%)`,
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  boxShadow: `0 4px 12px ${getPriorityColor(task.priority)}40`
                }}
              />
              <Chip
                label={task.status}
                size="small"
                variant="outlined"
                sx={{
                  borderColor: task.color,
                  color: task.color,
                  fontWeight: 600,
                  textTransform: 'capitalize'
                }}
              />
            </Stack>
          </Box>

          {/* Progress Bar */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" fontWeight={600} sx={{ color: '#333' }}>
                Progress
              </Typography>
              <Typography variant="body2" fontWeight={700} sx={{ color: task.color }}>
                {task.progress}%
              </Typography>
            </Box>
            <Box sx={{ 
              height: 10, 
              bgcolor: '#f0f0f0', 
              borderRadius: 5,
              overflow: 'hidden',
              position: 'relative'
            }}>
              <Box sx={{
                height: '100%',
                width: `${task.progress}%`,
                background: `linear-gradient(90deg, ${task.color} 0%, ${task.color}80 100%)`,
                borderRadius: 5,
                transition: 'width 0.8s ease',
                boxShadow: `0 0 10px ${task.color}40`
              }} />
            </Box>
          </Box>

          {/* Team & Due Date */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {task.team.map((member: string, idx: number) => (
                <Avatar
                  key={idx}
                  sx={{
                    width: 40,
                    height: 40,
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    background: `linear-gradient(135deg, ${task.color} 0%, ${task.color}80 100%)`,
                    boxShadow: `0 4px 12px ${task.color}30`,
                    transform: isActive ? 'scale(1.1)' : 'scale(1)',
                    transition: 'transform 0.3s ease'
                  }}
                >
                  {member}
                </Avatar>
              ))}
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccessTimeIcon sx={{ fontSize: 18, color: '#666' }} />
              <Typography variant="body2" fontWeight={600} sx={{ 
                color: task.dueDate === 'Today' ? '#FF1744' : '#666'
              }}>
                {task.dueDate}
              </Typography>
            </Box>
          </Box>

          {/* Category Badge */}
          <Box sx={{ textAlign: 'center' }}>
            <Chip
              label={`${task.category.toUpperCase()} PROJECT`}
              sx={{
                background: `linear-gradient(135deg, ${task.color}20 0%, ${task.color}10 100%)`,
                color: task.color,
                fontWeight: 700,
                fontSize: '0.8rem',
                px: 3,
                py: 1,
                height: 32
              }}
            />
          </Box>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      width: '100vw',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      overflow: 'auto',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Colorful Top Navigation */}
      <AppBar 
        position="static" 
        elevation={0}
        sx={{
          background: 'linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 25%, #45B7D1 50%, #96CEB4 75%, #FFEAA7 100%)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.2)'
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <PaletteIcon sx={{ fontSize: 32, color: 'white' }} />
              <Typography variant="h5" fontWeight={700} sx={{ color: 'white' }}>
                Colorful Productivity
              </Typography>
            </Box>
            
            {!isMobile && (
              <Box sx={{ display: 'flex', gap: 2, ml: 4 }}>
                {[
                  { icon: <AssignmentIcon />, label: 'Tasks', active: true, color: '#FF6B6B' },
                  { icon: <TrendingUpIcon />, label: 'Analytics', active: false, color: '#4ECDC4' },
                  { icon: <PeopleIcon />, label: 'Team', active: false, color: '#45B7D1' },
                  { icon: <EmojiEventsIcon />, label: 'Goals', active: false, color: '#96CEB4' }
                ].map((item, index) => (
                  <Paper
                    key={index}
                    sx={{
                      px: 3,
                      py: 1.5,
                      background: item.active 
                        ? 'rgba(255,255,255,0.25)' 
                        : 'rgba(255,255,255,0.1)',
                      backdropFilter: 'blur(15px)',
                      border: `2px solid ${item.active ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.2)'}`,
                      borderRadius: 4,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: 'rgba(255,255,255,0.2)',
                        border: '2px solid rgba(255,255,255,0.5)',
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {React.cloneElement(item.icon, { sx: { fontSize: 20, color: 'white' } })}
                      <Typography variant="button" sx={{ color: 'white', fontWeight: 600 }}>
                        {item.label}
                      </Typography>
                    </Box>
                  </Paper>
                ))}
              </Box>
            )}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <TextField
              placeholder="Search colorful tasks..."
              size="small"
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 20, color: 'rgba(255,255,255,0.8)' }} />
                  </InputAdornment>
                )
              }}
              sx={{
                width: 280,
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'rgba(255,255,255,0.15)',
                  color: 'white',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 3,
                  '& fieldset': {
                    borderColor: 'rgba(255,255,255,0.3)'
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255,255,255,0.5)'
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'rgba(255,255,255,0.8)'
                  }
                },
                '& .MuiInputBase-input::placeholder': { color: 'rgba(255,255,255,0.8)' }
              }}
            />
            <Badge badgeContent={5} sx={{ '& .MuiBadge-badge': { bgcolor: '#FF6B6B' } }}>
              <IconButton sx={{ color: 'white' }}>
                <NotificationsIcon />
              </IconButton>
            </Badge>
            <IconButton sx={{ color: 'white' }}>
              <SettingsIcon />
            </IconButton>
            <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.3)', mx: 1 }} />
            <Avatar sx={{ 
              width: 40, 
              height: 40,
              background: 'linear-gradient(135deg, #FFEAA7 0%, #FFD93D 100%)',
              color: '#333',
              fontWeight: 700
            }}>
              CP
            </Avatar>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Colorful Stats Dashboard */}
      <Box sx={{ 
        p: 4, 
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%)',
        backdropFilter: 'blur(10px)'
      }}>
        <Grid container spacing={3}>
          {categories.map((category, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Paper
                sx={{
                  p: 3,
                  background: category.gradient,
                  color: 'white',
                  borderRadius: 4,
                  boxShadow: `0 8px 32px ${category.color}30`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px) scale(1.02)',
                    boxShadow: `0 16px 64px ${category.color}40`
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ 
                    p: 2, 
                    borderRadius: 3,
                    background: 'rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(10px)'
                  }}>
                    {React.cloneElement(category.icon, { sx: { fontSize: 28, color: 'white' } })}
                  </Box>
                  <Typography variant="h4" fontWeight={900} sx={{ fontSize: '2.5rem' }}>
                    {category.count}
                  </Typography>
                </Box>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
                  {category.name}
                </Typography>
                <Box sx={{ 
                  height: 6, 
                  bgcolor: 'rgba(255,255,255,0.3)', 
                  borderRadius: 3,
                  overflow: 'hidden'
                }}>
                  <Box sx={{
                    height: '100%',
                    width: `${(category.count / 15) * 100}%`,
                    bgcolor: 'rgba(255,255,255,0.8)',
                    borderRadius: 3,
                    transition: 'width 0.8s ease'
                  }} />
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Main Task Grid */}
      <Box sx={{ flex: 1, p: 4, overflow: 'auto', bgcolor: 'rgba(255,255,255,0.1)' }}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" fontWeight={700} sx={{ color: 'white' }}>
            🎨 Creative Tasks
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <CalendarTodayIcon sx={{ color: 'white' }} />
            <Typography variant="h6" fontWeight={600} sx={{ color: 'white' }}>
              {currentTime.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={4}>
          {mockTasks.map((task, index) => (
            <Grid item xs={12} lg={6} key={task.id}>
              <ColorfulTaskCard task={task} index={index} />
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Colorful Voice Command Fab */}
      <Fab
        sx={{
          position: 'fixed',
          bottom: 32,
          right: 32,
          width: 80,
          height: 80,
          background: 'linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 25%, #45B7D1 50%, #96CEB4 75%, #FFEAA7 100%)',
          backgroundSize: '400% 400%',
          animation: 'rainbow 3s ease-in-out infinite',
          boxShadow: '0 12px 40px rgba(255, 107, 107, 0.4)',
          '&:hover': {
            transform: 'scale(1.1) rotate(10deg)',
            boxShadow: '0 16px 56px rgba(255, 107, 107, 0.6)',
            animation: 'rainbow 1s ease-in-out infinite'
          }
        }}
      >
        <MicIcon sx={{ fontSize: 36, color: 'white' }} />
      </Fab>

      <style jsx>{`
        @keyframes rainbow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </Box>
  );
};

export default ColorfulProductivity;