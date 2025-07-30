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
  Avatar,
  Chip,
  LinearProgress,
  IconButton,
  Paper,
  Grid,
  AppBar,
  Toolbar,
  Badge,
  Divider,
  Button
} from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import DashboardIcon from '@mui/icons-material/Dashboard';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PeopleIcon from '@mui/icons-material/People';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SearchIcon from '@mui/icons-material/Search';
import SettingsIcon from '@mui/icons-material/Settings';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import FlagIcon from '@mui/icons-material/Flag';
import StarIcon from '@mui/icons-material/Star';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

interface ExecutiveDashboardProps {
  onTranscript: (text: string) => void;
  transcriptionService?: 'browser' | 'whisper' | 'azure' | 'hybrid';
}

const mockTasks = [
  { 
    id: 1, 
    title: 'Q4 Strategic Planning Review', 
    priority: 'critical', 
    progress: 78,
    assignee: 'Sarah Chen',
    dueDate: 'Today',
    team: ['SC', 'MK', 'DL', 'RJ'],
    category: 'Strategy',
    urgency: 'high',
    impact: 'Revenue Impact: $2.5M'
  },
  { 
    id: 2, 
    title: 'Product Launch Campaign', 
    priority: 'high', 
    progress: 92,
    assignee: 'Alex Rodriguez',
    dueDate: '2 days',
    team: ['AR', 'JL', 'NK'],
    category: 'Marketing',
    urgency: 'medium',
    impact: 'User Growth: +40%'
  },
  { 
    id: 3, 
    title: 'Technology Infrastructure Upgrade', 
    priority: 'medium', 
    progress: 45,
    assignee: 'David Kim',
    dueDate: '1 week',
    team: ['DK', 'LS', 'PM', 'TH'],
    category: 'Technology',
    urgency: 'low',
    impact: 'Performance: +25%'
  },
  { 
    id: 4, 
    title: 'Customer Success Initiative', 
    priority: 'high', 
    progress: 63,
    assignee: 'Emily Watson',
    dueDate: '3 days',
    team: ['EW', 'GH', 'IJ'],
    category: 'Customer',
    urgency: 'high',
    impact: 'Satisfaction: +30%'
  }
];

const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({ onTranscript, transcriptionService }) => {
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
      case 'critical': return { main: '#ff4444', gradient: 'linear-gradient(135deg, #ff4444 0%, #cc1b1b 100%)', bg: '#fff5f5' };
      case 'high': return { main: '#ff8800', gradient: 'linear-gradient(135deg, #ff8800 0%, #e67700 100%)', bg: '#fff8f0' };
      case 'medium': return { main: '#2196f3', gradient: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)', bg: '#f3f9ff' };
      default: return { main: '#4caf50', gradient: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)', bg: '#f8fff8' };
    }
  };

  const TaskCard = ({ task, index }: { task: any, index: number }) => {
    const priority = getPriorityColor(task.priority);
    const isActive = activeCard === index;

    return (
      <Card
        onMouseEnter={() => setActiveCard(index)}
        onMouseLeave={() => setActiveCard(null)}
        sx={{
          background: `linear-gradient(145deg, ${priority.bg} 0%, #ffffff 100%)`,
          border: `2px solid ${isActive ? priority.main : 'transparent'}`,
          borderRadius: 4,
          boxShadow: isActive 
            ? `0 20px 60px rgba(0,0,0,0.15), 0 0 40px ${priority.main}20`
            : '0 8px 32px rgba(0,0,0,0.08)',
          transform: isActive ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
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
            height: 6,
            background: priority.gradient,
            borderRadius: '16px 16px 0 0'
          }
        }}
      >
        <CardContent sx={{ p: 4, pt: 5 }}>
          {/* Priority Badge */}
          <Box sx={{ 
            position: 'absolute', 
            top: 16, 
            right: 16,
            display: 'flex',
            gap: 1
          }}>
            <Chip
              icon={<FlagIcon sx={{ fontSize: 16 }} />}
              label={task.priority.toUpperCase()}
              size="small"
              sx={{
                background: priority.gradient,
                color: 'white',
                fontWeight: 700,
                fontSize: '0.75rem',
                boxShadow: `0 4px 12px ${priority.main}40`
              }}
            />
            {task.urgency === 'high' && (
              <Chip
                icon={<FlashOnIcon sx={{ fontSize: 14 }} />}
                label="URGENT"
                size="small"
                sx={{
                  background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '0.7rem',
                  animation: isActive ? 'pulse 1.5s ease-in-out infinite' : 'none'
                }}
              />
            )}
          </Box>

          {/* Task Title */}
          <Typography variant="h5" fontWeight={700} sx={{ 
            mb: 2,
            color: '#1a1a1a',
            lineHeight: 1.3,
            pr: 12
          }}>
            {task.title}
          </Typography>

          {/* Impact & Category */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
            <Chip
              label={task.category}
              variant="outlined"
              size="small"
              sx={{
                borderColor: priority.main,
                color: priority.main,
                fontWeight: 600,
                '& .MuiChip-label': { px: 2 }
              }}
            />
            <Typography variant="body2" sx={{ 
              color: '#666',
              fontWeight: 500,
              flex: 1
            }}>
              {task.impact}
            </Typography>
          </Box>

          {/* Progress */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" fontWeight={600} sx={{ color: '#333' }}>
                Progress
              </Typography>
              <Typography variant="body2" fontWeight={700} sx={{ color: priority.main }}>
                {task.progress}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={task.progress}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: '#f0f0f0',
                '& .MuiLinearProgress-bar': {
                  background: priority.gradient,
                  borderRadius: 4,
                  boxShadow: `0 0 10px ${priority.main}30`
                }
              }}
            />
          </Box>

          {/* Team & Due Date */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                {task.team.map((member: string, idx: number) => (
                  <Avatar
                    key={idx}
                    sx={{
                      width: 36,
                      height: 36,
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      background: priority.gradient,
                      boxShadow: `0 4px 12px ${priority.main}30`,
                      transform: isActive ? `translateY(-${idx * 2}px) scale(1.1)` : 'translateY(0) scale(1)',
                      transition: 'all 0.3s ease',
                      zIndex: task.team.length - idx
                    }}
                  >
                    {member}
                  </Avatar>
                ))}
              </Box>
              <Typography variant="body2" fontWeight={600} sx={{ color: '#555' }}>
                {task.assignee}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccessTimeIcon sx={{ fontSize: 16, color: '#666' }} />
              <Typography variant="body2" fontWeight={600} sx={{ 
                color: task.dueDate === 'Today' ? '#ff4444' : '#666'
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
      background: 'linear-gradient(135deg, #f8faff 0%, #ffffff 50%, #f0f4ff 100%)',
      overflow: 'auto',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Top Navigation */}
      <AppBar 
        position="static" 
        elevation={0}
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <DashboardIcon sx={{ fontSize: 32, color: 'white' }} />
              <Typography variant="h5" fontWeight={700} sx={{ color: 'white' }}>
                Executive Dashboard
              </Typography>
            </Box>
            
            {!isMobile && (
              <Box sx={{ display: 'flex', gap: 2, ml: 4 }}>
                {[
                  { icon: <AssignmentIcon />, label: 'Tasks', active: true },
                  { icon: <AnalyticsIcon />, label: 'Analytics', active: false },
                  { icon: <PeopleIcon />, label: 'Team', active: false },
                  { icon: <TrendingUpIcon />, label: 'Reports', active: false }
                ].map((item, index) => (
                  <Paper
                    key={index}
                    sx={{
                      px: 3,
                      py: 1.5,
                      background: item.active 
                        ? 'rgba(255,255,255,0.2)' 
                        : 'transparent',
                      backdropFilter: 'blur(10px)',
                      border: item.active 
                        ? '1px solid rgba(255,255,255,0.3)' 
                        : '1px solid transparent',
                      borderRadius: 3,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: 'rgba(255,255,255,0.15)',
                        border: '1px solid rgba(255,255,255,0.2)'
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
            <IconButton sx={{ color: 'white' }}>
              <SearchIcon />
            </IconButton>
            <Badge badgeContent={3} color="error">
              <IconButton sx={{ color: 'white' }}>
                <NotificationsIcon />
              </IconButton>
            </Badge>
            <IconButton sx={{ color: 'white' }}>
              <SettingsIcon />
            </IconButton>
            <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.2)', mx: 1 }} />
            <Avatar sx={{ 
              width: 40, 
              height: 40,
              background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
              fontWeight: 700
            }}>
              EC
            </Avatar>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Dashboard Stats */}
      <Box sx={{ 
        p: 4, 
        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)'
      }}>
        <Grid container spacing={3}>
          {[
            { title: 'Active Tasks', value: '12', change: '+8%', icon: <AssignmentIcon />, color: '#667eea' },
            { title: 'Completion Rate', value: '94%', change: '+12%', icon: <TrendingUpIcon />, color: '#f093fb' },
            { title: 'Team Members', value: '24', change: '+3', icon: <PeopleIcon />, color: '#4facfe' },
            { title: 'Revenue Impact', value: '$8.2M', change: '+23%', icon: <StarIcon />, color: '#43e97b' }
          ].map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Paper
                sx={{
                  p: 3,
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.6) 100%)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: 4,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 48px rgba(0,0,0,0.1)'
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ 
                    p: 2, 
                    borderRadius: 3,
                    background: `linear-gradient(135deg, ${stat.color}20 0%, ${stat.color}10 100%)`,
                    border: `1px solid ${stat.color}30`
                  }}>
                    {React.cloneElement(stat.icon, { sx: { fontSize: 24, color: stat.color } })}
                  </Box>
                  <Chip
                    label={stat.change}
                    size="small"
                    sx={{
                      background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '0.7rem'
                    }}
                  />
                </Box>
                <Typography variant="h4" fontWeight={700} sx={{ color: '#1a1a1a', mb: 1 }}>
                  {stat.value}
                </Typography>
                <Typography variant="body2" sx={{ color: '#666', fontWeight: 500 }}>
                  {stat.title}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Task Grid */}
      <Box sx={{ flex: 1, p: 4, overflow: 'auto' }}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" fontWeight={700} sx={{ color: '#1a1a1a' }}>
            Priority Tasks
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <CalendarTodayIcon sx={{ color: '#666' }} />
            <Typography variant="h6" fontWeight={600} sx={{ color: '#333' }}>
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
              <TaskCard task={task} index={index} />
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Voice Command Fab */}
      <Fab
        sx={{
          position: 'fixed',
          bottom: 32,
          right: 32,
          width: 72,
          height: 72,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          boxShadow: '0 12px 40px rgba(102, 126, 234, 0.4)',
          '&:hover': {
            transform: 'scale(1.1)',
            boxShadow: '0 16px 56px rgba(102, 126, 234, 0.6)'
          }
        }}
      >
        <MicIcon sx={{ fontSize: 32, color: 'white' }} />
      </Fab>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </Box>
  );
};

export default ExecutiveDashboard;