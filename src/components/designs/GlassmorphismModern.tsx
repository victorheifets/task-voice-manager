'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Fab,
  useMediaQuery,
  useTheme,
  LinearProgress,
  Paper,
  Avatar,
  TextField,
  InputAdornment,
  AppBar,
  Toolbar,
  Badge,
  Divider,
  Button,
  Chip,
  Grid
} from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import AddIcon from '@mui/icons-material/Add';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import TodayIcon from '@mui/icons-material/Today';
import PersonIcon from '@mui/icons-material/Person';
import FilterListIcon from '@mui/icons-material/FilterList';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SearchIcon from '@mui/icons-material/Search';
import BlurOnIcon from '@mui/icons-material/BlurOn';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SettingsIcon from '@mui/icons-material/Settings';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PeopleIcon from '@mui/icons-material/People';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import LensBlurIcon from '@mui/icons-material/LensBlur';

interface GlassmorphismModernProps {
  onTranscript: (text: string) => void;
  transcriptionService?: 'browser' | 'whisper' | 'azure' | 'hybrid';
}

const mockTasks = [
  { 
    id: 1, 
    title: 'Neural Network Optimization', 
    description: 'Enhance AI model performance through advanced neural architecture',
    dueDate: 'Today', 
    priority: 'critical', 
    assignee: 'Dr. Chen', 
    completed: false, 
    progress: 85,
    category: 'AI Research',
    team: ['DC', 'AK', 'MS'],
    urgency: 'high',
    impact: 'Performance: +40%'
  },
  { 
    id: 2, 
    title: 'Quantum Computing Integration', 
    description: 'Implement quantum algorithms for cryptographic applications',
    dueDate: '2 days', 
    priority: 'high', 
    assignee: 'Dr. Kim', 
    completed: false, 
    progress: 60,
    category: 'Quantum Tech',
    team: ['DK', 'RL', 'TH'],
    urgency: 'medium',
    impact: 'Security: +60%'
  },
  { 
    id: 3, 
    title: 'Holographic Interface Design', 
    description: 'Develop next-generation 3D holographic user interfaces',
    dueDate: '1 week', 
    priority: 'medium', 
    assignee: 'Alex Nova', 
    completed: false, 
    progress: 30,
    category: 'Interface',
    team: ['AN', 'LM', 'JD'],
    urgency: 'low',
    impact: 'UX: Revolutionary'
  },
  { 
    id: 4, 
    title: 'Bio-Integrated Computing', 
    description: 'Research biological computing systems integration',
    dueDate: 'Yesterday', 
    priority: 'medium', 
    assignee: 'Dr. Sarah', 
    completed: true, 
    progress: 100,
    category: 'BioTech',
    team: ['DSL', 'NK', 'PM'],
    urgency: 'low',
    impact: 'Innovation: Breakthrough'
  }
];

const GlassmorphismModern: React.FC<GlassmorphismModernProps> = ({ onTranscript, transcriptionService }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCard, setActiveCard] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'critical': return { main: '#ff3366', gradient: 'linear-gradient(135deg, #ff3366 0%, #ff1744 100%)', glow: '#ff336650' };
      case 'high': return { main: '#ff6b35', gradient: 'linear-gradient(135deg, #ff6b35 0%, #f9844a 100%)', glow: '#ff6b3550' };
      case 'medium': return { main: '#4ecdc4', gradient: 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)', glow: '#4ecdc450' };
      case 'low': return { main: '#6bcf7f', gradient: 'linear-gradient(135deg, #6bcf7f 0%, #4caf50 100%)', glow: '#6bcf7f50' };
      default: return { main: '#a0a0a0', gradient: 'linear-gradient(135deg, #a0a0a0 0%, #9e9e9e 100%)', glow: '#a0a0a050' };
    }
  };

  const glassStyle = {
    background: 'rgba(255, 255, 255, 0.12)',
    backdropFilter: 'blur(25px)',
    border: '1px solid rgba(255, 255, 255, 0.25)',
    borderRadius: '20px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)'
  };

  const strongGlassStyle = {
    background: 'rgba(255, 255, 255, 0.18)',
    backdropFilter: 'blur(30px)',
    border: '1px solid rgba(255, 255, 255, 0.35)',
    borderRadius: '24px',
    boxShadow: '0 16px 64px rgba(0, 0, 0, 0.15)'
  };

  const GlassTaskCard = ({ task, index }: { task: any, index: number }) => {
    const priority = getPriorityColor(task.priority);
    const isActive = activeCard === index;

    return (
      <Card
        onMouseEnter={() => setActiveCard(index)}
        onMouseLeave={() => setActiveCard(null)}
        sx={{
          background: `linear-gradient(145deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.08) 100%)`,
          backdropFilter: 'blur(30px)',
          border: `2px solid ${isActive ? priority.main : 'rgba(255,255,255,0.2)'}`,
          borderRadius: 6,
          boxShadow: isActive 
            ? `0 25px 80px rgba(0,0,0,0.2), 0 0 60px ${priority.glow}`
            : '0 12px 40px rgba(0,0,0,0.12)',
          transform: isActive ? 'translateY(-12px) scale(1.02)' : 'translateY(0) scale(1)',
          transition: 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
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
            background: priority.gradient,
            borderRadius: '24px 24px 0 0',
            filter: 'blur(2px)'
          }
        }}
      >
        <CardContent sx={{ p: 4, pt: 5, color: 'white' }}>
          {/* Priority Badge */}
          <Box sx={{ 
            position: 'absolute', 
            top: 20, 
            right: 20,
            display: 'flex',
            gap: 1
          }}>
            <Chip
              icon={<AutoAwesomeIcon sx={{ fontSize: 16 }} />}
              label={task.priority.toUpperCase()}
              size="small"
              sx={{
                background: priority.gradient,
                color: 'white',
                fontWeight: 700,
                fontSize: '0.75rem',
                boxShadow: `0 8px 24px ${priority.glow}`,
                backdropFilter: 'blur(10px)'
              }}
            />
          </Box>

          {/* Task Title & Description */}
          <Typography variant="h5" fontWeight={700} sx={{ 
            mb: 2,
            color: 'white',
            lineHeight: 1.3,
            pr: 12
          }}>
            {task.title}
          </Typography>

          <Typography variant="body2" sx={{ 
            color: 'rgba(255,255,255,0.8)',
            mb: 3,
            lineHeight: 1.6
          }}>
            {task.description}
          </Typography>

          {/* Category & Impact */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
            <Chip
              label={task.category}
              variant="outlined"
              size="small"
              sx={{
                borderColor: 'rgba(255,255,255,0.4)',
                color: 'white',
                fontWeight: 600,
                backdropFilter: 'blur(10px)',
                background: 'rgba(255,255,255,0.1)'
              }}
            />
            <Typography variant="body2" sx={{ 
              color: 'rgba(255,255,255,0.7)',
              fontWeight: 500,
              flex: 1
            }}>
              {task.impact}
            </Typography>
          </Box>

          {/* Progress */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" fontWeight={600} sx={{ color: 'white' }}>
                Neural Progress
              </Typography>
              <Typography variant="body2" fontWeight={700} sx={{ color: priority.main }}>
                {task.progress}%
              </Typography>
            </Box>
            <Box sx={{ 
              height: 10, 
              bgcolor: 'rgba(255,255,255,0.2)', 
              borderRadius: 5,
              overflow: 'hidden',
              position: 'relative',
              backdropFilter: 'blur(10px)'
            }}>
              <Box sx={{
                height: '100%',
                width: `${task.progress}%`,
                background: priority.gradient,
                borderRadius: 5,
                transition: 'width 0.8s ease',
                boxShadow: `0 0 20px ${priority.glow}`,
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
                  animation: isActive ? 'shimmer 2s infinite' : 'none'
                }
              }} />
            </Box>
          </Box>

          {/* Team & Due Date */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                {task.team.map((member: string, idx: number) => (
                  <Avatar
                    key={idx}
                    sx={{
                      width: 40,
                      height: 40,
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      background: `linear-gradient(135deg, ${priority.main} 0%, rgba(255,255,255,0.3) 100%)`,
                      backdropFilter: 'blur(15px)',
                      border: '1px solid rgba(255,255,255,0.3)',
                      boxShadow: `0 8px 24px ${priority.glow}`,
                      transform: isActive ? `translateY(-${idx * 3}px) scale(1.1)` : 'translateY(0) scale(1)',
                      transition: 'all 0.4s ease',
                      zIndex: task.team.length - idx
                    }}
                  >
                    {member}
                  </Avatar>
                ))}
              </Box>
              <Typography variant="body2" fontWeight={600} sx={{ color: 'rgba(255,255,255,0.9)' }}>
                {task.assignee}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccessTimeIcon sx={{ fontSize: 18, color: 'rgba(255,255,255,0.7)' }} />
              <Typography variant="body2" fontWeight={600} sx={{ 
                color: task.dueDate === 'Today' ? priority.main : 'rgba(255,255,255,0.8)'
              }}>
                {task.dueDate}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      width: '100vw',
      background: 'linear-gradient(135deg, #1a1c29 0%, #2d1b69 25%, #11998e 50%, #38ef7d 75%, #667eea 100%)',
      overflow: 'auto',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative'
    }}>
      {/* Floating Glassmorphic Background Elements */}
      <Box sx={{
        position: 'absolute',
        top: '10%',
        left: '5%',
        width: 300,
        height: 300,
        borderRadius: '50%',
        background: 'rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(40px)',
        animation: 'float 15s ease-in-out infinite',
        filter: 'blur(20px)'
      }} />
      <Box sx={{
        position: 'absolute',
        bottom: '15%',
        right: '8%',
        width: 200,
        height: 200,
        borderRadius: '50%',
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(35px)',
        animation: 'float 20s ease-in-out infinite reverse',
        filter: 'blur(15px)'
      }} />
      <Box sx={{
        position: 'absolute',
        top: '40%',
        right: '20%',
        width: 150,
        height: 150,
        borderRadius: '50%',
        background: 'rgba(255, 255, 255, 0.06)',
        backdropFilter: 'blur(25px)',
        animation: 'float 12s ease-in-out infinite',
        filter: 'blur(10px)'
      }} />

      {/* Glassmorphic Top Navigation */}
      <AppBar 
        position="static" 
        elevation={0}
        sx={{
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(30px)',
          borderBottom: '1px solid rgba(255,255,255,0.2)',
          color: 'white'
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <LensBlurIcon sx={{ fontSize: 32, color: 'white', filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.5))' }} />
              <Typography variant="h5" fontWeight={700} sx={{ 
                color: 'white',
                textShadow: '0 0 20px rgba(255,255,255,0.5)'
              }}>
                Glassmorphism Modern
              </Typography>
            </Box>
            
            {!isMobile && (
              <Box sx={{ display: 'flex', gap: 2, ml: 4 }}>
                {[
                  { icon: <DashboardIcon />, label: 'Neural Tasks', active: true },
                  { icon: <AnalyticsIcon />, label: 'Analytics', active: false },
                  { icon: <PeopleIcon />, label: 'Quantum Team', active: false },
                  { icon: <TrendingUpIcon />, label: 'Bio Reports', active: false }
                ].map((item, index) => (
                  <Paper
                    key={index}
                    sx={{
                      px: 3,
                      py: 1.5,
                      background: item.active 
                        ? strongGlassStyle.background
                        : glassStyle.background,
                      backdropFilter: 'blur(25px)',
                      border: `1px solid ${item.active ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.2)'}`,
                      borderRadius: 4,
                      cursor: 'pointer',
                      transition: 'all 0.4s ease',
                      boxShadow: item.active ? '0 8px 32px rgba(255,255,255,0.1)' : 'none',
                      '&:hover': {
                        background: strongGlassStyle.background,
                        border: '1px solid rgba(255,255,255,0.5)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 12px 48px rgba(255,255,255,0.15)'
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
              placeholder="Search neural networks..."
              size="small"
              variant="outlined"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 20, color: 'rgba(255,255,255,0.8)' }} />
                  </InputAdornment>
                )
              }}
              sx={{
                width: 300,
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  backdropFilter: 'blur(20px)',
                  borderRadius: 4,
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
            <Badge badgeContent={7} sx={{ '& .MuiBadge-badge': { bgcolor: '#ff3366' } }}>
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
              background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: 'white',
              fontWeight: 700
            }}>
              GM
            </Avatar>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Glassmorphic Stats Dashboard */}
      <Box sx={{ 
        p: 4, 
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(15px)'
      }}>
        <Grid container spacing={3}>
          {[
            { title: 'Neural Tasks', value: '24', change: '+15%', icon: <BlurOnIcon />, gradient: 'linear-gradient(135deg, #ff3366 0%, #ff6b35 100%)' },
            { title: 'Quantum Progress', value: '89%', change: '+23%', icon: <AutoAwesomeIcon />, gradient: 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)' },
            { title: 'Bio Integrations', value: '12', change: '+8', icon: <LensBlurIcon />, gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
            { title: 'Holographic UI', value: '97%', change: '+31%', icon: <TrendingUpIcon />, gradient: 'linear-gradient(135deg, #6bcf7f 0%, #4caf50 100%)' }
          ].map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Paper
                sx={{
                  p: 3,
                  background: strongGlassStyle.background,
                  backdropFilter: 'blur(30px)',
                  border: '1px solid rgba(255,255,255,0.25)',
                  borderRadius: 5,
                  boxShadow: '0 12px 48px rgba(0,0,0,0.15)',
                  transition: 'all 0.4s ease',
                  '&:hover': {
                    transform: 'translateY(-8px) scale(1.02)',
                    boxShadow: '0 20px 80px rgba(0,0,0,0.2)',
                    background: 'rgba(255,255,255,0.2)'
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ 
                    p: 2, 
                    borderRadius: 4,
                    background: stat.gradient,
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
                  }}>
                    {React.cloneElement(stat.icon, { sx: { fontSize: 28, color: 'white' } })}
                  </Box>
                  <Chip
                    label={stat.change}
                    size="small"
                    sx={{
                      background: 'linear-gradient(135deg, #6bcf7f 0%, #4caf50 100%)',
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      boxShadow: '0 4px 16px rgba(107, 207, 127, 0.4)'
                    }}
                  />
                </Box>
                <Typography variant="h4" fontWeight={700} sx={{ color: 'white', mb: 1 }}>
                  {stat.value}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>
                  {stat.title}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Main Task Grid */}
      <Box sx={{ flex: 1, p: 4, overflow: 'auto', bgcolor: 'rgba(0,0,0,0.1)' }}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" fontWeight={700} sx={{ 
            color: 'white',
            textShadow: '0 0 20px rgba(255,255,255,0.3)'
          }}>
            🔮 Neural Glassmorphic Tasks
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <CalendarTodayIcon sx={{ color: 'rgba(255,255,255,0.8)' }} />
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
              <GlassTaskCard task={task} index={index} />
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Glassmorphic Voice Command Fab */}
      <Fab
        sx={{
          position: 'fixed',
          bottom: 32,
          right: 32,
          width: 80,
          height: 80,
          background: strongGlassStyle.background,
          backdropFilter: 'blur(40px)',
          border: '2px solid rgba(255,255,255,0.3)',
          boxShadow: '0 16px 64px rgba(0,0,0,0.2)',
          color: 'white',
          '&:hover': {
            transform: 'scale(1.1) rotate(5deg)',
            boxShadow: '0 24px 96px rgba(0,0,0,0.3)',
            background: 'rgba(255,255,255,0.25)',
            border: '2px solid rgba(255,255,255,0.5)'
          }
        }}
      >
        <MicIcon sx={{ fontSize: 36, color: 'white', filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.8))' }} />
      </Fab>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-30px) rotate(2deg); }
          66% { transform: translateY(-15px) rotate(-1deg); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </Box>
  );
};

export default GlassmorphismModern;