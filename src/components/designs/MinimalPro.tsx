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
  InputAdornment,
  Paper,
  Avatar,
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
import SearchIcon from '@mui/icons-material/Search';
import WorkspacesIcon from '@mui/icons-material/Workspaces';
import ViewKanbanIcon from '@mui/icons-material/ViewKanban';
import ListIcon from '@mui/icons-material/List';
import CalendarViewDayIcon from '@mui/icons-material/CalendarViewDay';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SettingsIcon from '@mui/icons-material/Settings';
import FilterListIcon from '@mui/icons-material/FilterList';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';

interface MinimalProProps {
  onTranscript: (text: string) => void;
  transcriptionService?: 'browser' | 'whisper' | 'azure' | 'hybrid';
}

const mockTasks = [
  { 
    id: 1, 
    title: 'Quarterly Planning Session', 
    description: 'Prepare comprehensive quarterly planning documents and metrics',
    priority: 'high', 
    status: 'in-progress',
    assignee: 'Sarah Chen',
    dueDate: 'Today',
    team: ['SC', 'MK', 'DL'],
    tags: ['planning', 'quarterly'],
    progress: 75
  },
  { 
    id: 2, 
    title: 'Product Design System Update', 
    description: 'Modernize design components and establish new guidelines',
    priority: 'medium', 
    status: 'pending',
    assignee: 'Alex Kim',
    dueDate: '2 days',
    team: ['AK', 'JL'],
    tags: ['design', 'system'],
    progress: 30
  },
  { 
    id: 3, 
    title: 'API Documentation Review', 
    description: 'Complete technical documentation audit',
    priority: 'low', 
    status: 'completed',
    assignee: 'David Park',
    dueDate: 'Yesterday',
    team: ['DP', 'NK', 'TH'],
    tags: ['docs', 'api'],
    progress: 100
  },
  { 
    id: 4, 
    title: 'Customer Feedback Analysis', 
    description: 'Analyze Q4 customer feedback and prepare insights',
    priority: 'high', 
    status: 'pending',
    assignee: 'Emma Wilson',
    dueDate: '3 days',
    team: ['EW', 'RJ'],
    tags: ['customer', 'analysis'],
    progress: 0
  }
];

const MinimalPro: React.FC<MinimalProProps> = ({ onTranscript, transcriptionService }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('list');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'completed': return '#10b981';
      case 'in-progress': return '#3b82f6';
      case 'pending': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const TaskCard = ({ task, index }: { task: any, index: number }) => (
    <Card 
      sx={{
        background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
        border: '1px solid #e2e8f0',
        borderRadius: 3,
        boxShadow: 'none',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          transform: 'translateY(-2px)',
          border: '1px solid #cbd5e1'
        }
      }}
    >
      <CardContent sx={{ p: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton 
              size="small"
              sx={{ 
                color: task.status === 'completed' ? '#10b981' : '#6b7280',
                '&:hover': { bgcolor: 'rgba(16, 185, 129, 0.1)' }
              }}
            >
              {task.status === 'completed' ? <CheckCircleOutlineIcon /> : <RadioButtonUncheckedIcon />}
            </IconButton>
            <Box>
              <Typography variant="h6" fontWeight={600} sx={{ 
                color: '#0f172a',
                textDecoration: task.status === 'completed' ? 'line-through' : 'none'
              }}>
                {task.title}
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
                {task.description}
              </Typography>
            </Box>
          </Box>
          <IconButton size="small" sx={{ color: '#64748b' }}>
            <MoreHorizIcon />
          </IconButton>
        </Box>

        {/* Progress */}
        {task.progress > 0 && (
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.875rem' }}>
                Progress
              </Typography>
              <Typography variant="body2" fontWeight={600} sx={{ color: '#0f172a', fontSize: '0.875rem' }}>
                {task.progress}%
              </Typography>
            </Box>
            <Box sx={{ 
              height: 6, 
              bgcolor: '#f1f5f9', 
              borderRadius: 3,
              overflow: 'hidden'
            }}>
              <Box sx={{
                height: '100%',
                width: `${task.progress}%`,
                bgcolor: getPriorityColor(task.priority),
                borderRadius: 3,
                transition: 'width 0.3s ease'
              }} />
            </Box>
          </Box>
        )}

        {/* Meta Info */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip
              size="small"
              label={task.priority}
              sx={{
                bgcolor: `${getPriorityColor(task.priority)}15`,
                color: getPriorityColor(task.priority),
                fontWeight: 600,
                fontSize: '0.75rem',
                height: 24,
                textTransform: 'capitalize'
              }}
            />
            <Chip
              size="small"
              label={task.status}
              sx={{
                bgcolor: `${getStatusColor(task.status)}15`,
                color: getStatusColor(task.status),
                fontWeight: 600,
                fontSize: '0.75rem',
                height: 24,
                textTransform: 'capitalize'
              }}
            />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AccessTimeIcon sx={{ fontSize: 16, color: '#64748b' }} />
            <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.875rem' }}>
              {task.dueDate}
            </Typography>
          </Box>
        </Box>

        {/* Team & Tags */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {task.team.map((member: string, idx: number) => (
              <Avatar
                key={idx}
                sx={{
                  width: 32,
                  height: 32,
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  bgcolor: '#3b82f6',
                  color: 'white'
                }}
              >
                {member}
              </Avatar>
            ))}
          </Box>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {task.tags.map((tag: string, idx: number) => (
              <Chip
                key={idx}
                size="small"
                label={tag}
                variant="outlined"
                sx={{
                  fontSize: '0.7rem',
                  height: 20,
                  borderColor: '#cbd5e1',
                  color: '#64748b'
                }}
              />
            ))}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{
      minHeight: '100vh',
      width: '100vw',
      background: '#fafbfc',
      overflow: 'auto',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Top Navigation */}
      <AppBar 
        position="static" 
        elevation={0}
        sx={{
          background: '#ffffff',
          color: '#0f172a',
          borderBottom: '1px solid #e2e8f0'
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <WorkspacesIcon sx={{ fontSize: 28, color: '#3b82f6' }} />
              <Typography variant="h5" fontWeight={600} sx={{ color: '#0f172a' }}>
                Minimal Pro
              </Typography>
            </Box>
            
            {!isMobile && (
              <Box sx={{ display: 'flex', gap: 1, ml: 4 }}>
                {[
                  { icon: <ListIcon />, label: 'List', active: viewMode === 'list' },
                  { icon: <ViewKanbanIcon />, label: 'Board', active: viewMode === 'board' },
                  { icon: <CalendarViewDayIcon />, label: 'Timeline', active: false }
                ].map((item, index) => (
                  <Button
                    key={index}
                    startIcon={item.icon}
                    variant={item.active ? 'contained' : 'text'}
                    size="small"
                    onClick={() => item.label === 'List' && setViewMode('list')}
                    sx={{
                      minWidth: 'auto',
                      px: 2,
                      py: 1,
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      textTransform: 'none',
                      backgroundColor: item.active ? '#3b82f6' : 'transparent',
                      color: item.active ? 'white' : '#64748b',
                      '&:hover': {
                        backgroundColor: item.active ? '#2563eb' : '#f1f5f9'
                      }
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
              </Box>
            )}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <TextField
              placeholder="Search tasks..."
              size="small"
              variant="outlined"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 20, color: '#64748b' }} />
                  </InputAdornment>
                )
              }}
              sx={{
                width: 280,
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#f8fafc',
                  borderRadius: 2,
                  '& fieldset': {
                    borderColor: 'transparent'
                  },
                  '&:hover fieldset': {
                    borderColor: '#cbd5e1'
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#3b82f6'
                  }
                }
              }}
            />
            <IconButton sx={{ color: '#64748b' }}>
              <FilterListIcon />
            </IconButton>
            <Badge badgeContent={2} color="error">
              <IconButton sx={{ color: '#64748b' }}>
                <NotificationsIcon />
              </IconButton>
            </Badge>
            <IconButton sx={{ color: '#64748b' }}>
              <SettingsIcon />
            </IconButton>
            <Divider orientation="vertical" flexItem sx={{ bgcolor: '#e2e8f0', mx: 1 }} />
            <Avatar sx={{ 
              width: 36, 
              height: 36,
              bgcolor: '#3b82f6',
              fontWeight: 700,
              fontSize: '0.875rem'
            }}>
              MP
            </Avatar>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Quick Actions Bar */}
      <Box sx={{ 
        px: 4, 
        py: 2, 
        bgcolor: '#ffffff',
        borderBottom: '1px solid #f1f5f9',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            startIcon={<AddIcon />}
            variant="contained"
            size="small"
            sx={{
              bgcolor: '#3b82f6',
              '&:hover': { bgcolor: '#2563eb' },
              textTransform: 'none',
              fontWeight: 600,
              px: 3
            }}
          >
            New Task
          </Button>
          <Button
            startIcon={<MicIcon />}
            variant="outlined"
            size="small"
            sx={{
              borderColor: '#e2e8f0',
              color: '#64748b',
              textTransform: 'none',
              fontWeight: 500,
              px: 3,
              '&:hover': {
                borderColor: '#cbd5e1',
                bgcolor: '#f8fafc'
              }
            }}
          >
            Voice Input
          </Button>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          {['all', 'pending', 'in-progress', 'completed'].map((filter) => (
            <Chip
              key={filter}
              label={filter.replace('-', ' ')}
              variant={selectedFilter === filter ? 'filled' : 'outlined'}
              size="small"
              clickable
              onClick={() => setSelectedFilter(filter)}
              sx={{
                textTransform: 'capitalize',
                bgcolor: selectedFilter === filter ? '#3b82f6' : 'transparent',
                color: selectedFilter === filter ? 'white' : '#64748b',
                borderColor: '#e2e8f0',
                '&:hover': {
                  bgcolor: selectedFilter === filter ? '#2563eb' : '#f8fafc'
                }
              }}
            />
          ))}
        </Box>
      </Box>

      {/* Task Grid */}
      <Box sx={{ flex: 1, p: 4, overflow: 'auto', bgcolor: '#fafbfc' }}>
        <Grid container spacing={3}>
          {mockTasks.map((task, index) => (
            <Grid item xs={12} md={6} lg={4} key={task.id}>
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
          width: 64,
          height: 64,
          bgcolor: '#3b82f6',
          boxShadow: '0 10px 25px -3px rgba(59, 130, 246, 0.3), 0 4px 6px -2px rgba(59, 130, 246, 0.05)',
          '&:hover': {
            bgcolor: '#2563eb',
            transform: 'scale(1.05)',
            boxShadow: '0 20px 40px -3px rgba(59, 130, 246, 0.4), 0 8px 12px -2px rgba(59, 130, 246, 0.1)'
          }
        }}
      >
        <MicIcon sx={{ fontSize: 28, color: 'white' }} />
      </Fab>
    </Box>
  );
};

export default MinimalPro;