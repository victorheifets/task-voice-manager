'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Fab,
  useMediaQuery,
  useTheme,
  TextField,
  AppBar,
  Toolbar,
  Badge,
  Divider,
  Button,
  Paper,
  Avatar,
  Grid,
  InputAdornment,
  FormControl,
  Select,
  MenuItem,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Checkbox
} from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import AddIcon from '@mui/icons-material/Add';
import HomeIcon from '@mui/icons-material/Home';
import TableViewIcon from '@mui/icons-material/TableView';
import TodayIcon from '@mui/icons-material/Today';
import StarIcon from '@mui/icons-material/Star';
import EditIcon from '@mui/icons-material/Edit';
import StickyNote2Icon from '@mui/icons-material/StickyNote2';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SettingsIcon from '@mui/icons-material/Settings';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PeopleIcon from '@mui/icons-material/People';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import LinearProgress from '@mui/material/LinearProgress';
import ArticleIcon from '@mui/icons-material/Article';

interface NotionInspiredProps {
  onTranscript: (text: string) => void;
  transcriptionService?: 'browser' | 'whisper' | 'azure' | 'hybrid';
}

const mockTasks = [
  { 
    id: 1, 
    title: 'Product Discovery Workshop', 
    description: 'Lead comprehensive product discovery session with stakeholders',
    dueDate: 'Today', 
    priority: 'high', 
    assignee: 'Sarah Chen', 
    completed: false, 
    progress: 75,
    tags: ['workshop', 'product'],
    team: ['SC', 'MK', 'DL'],
    category: 'Product Strategy',
    impact: 'High',
    estimatedHours: 8
  },
  { 
    id: 2, 
    title: 'Design System Documentation', 
    description: 'Create comprehensive documentation for the new design system',
    dueDate: '2 days', 
    priority: 'medium', 
    assignee: 'Alex Rodriguez', 
    completed: false, 
    progress: 45,
    tags: ['documentation', 'design'],
    team: ['AR', 'JL', 'NK'],
    category: 'Documentation',
    impact: 'Medium',
    estimatedHours: 12
  },
  { 
    id: 3, 
    title: 'User Research Analysis', 
    description: 'Analyze Q4 user research findings and create actionable insights',
    dueDate: '1 week', 
    priority: 'medium', 
    assignee: 'David Kim', 
    completed: false, 
    progress: 20,
    tags: ['research', 'analysis'],
    team: ['DK', 'LS', 'PM'],
    category: 'Research',
    impact: 'High',
    estimatedHours: 16
  },
  { 
    id: 4, 
    title: 'Sprint Planning Meeting', 
    description: 'Facilitate sprint planning for the upcoming development cycle',
    dueDate: 'Yesterday', 
    priority: 'low', 
    assignee: 'Emma Wilson', 
    completed: true, 
    progress: 100,
    tags: ['planning', 'agile'],
    team: ['EW', 'RJ', 'TH'],
    category: 'Project Management',
    impact: 'Medium',
    estimatedHours: 4
  }
];

const NotionInspired: React.FC<NotionInspiredProps> = ({ onTranscript, transcriptionService }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCard, setActiveCard] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const sidebarItems = [
    { label: 'Home', icon: <HomeIcon />, active: true },
    { label: 'Tasks', icon: <AssignmentIcon />, active: false },
    { label: 'Calendar', icon: <TodayIcon />, active: false },
    { label: 'Notes', icon: <StickyNote2Icon />, active: false },
    { label: 'Projects', icon: <TableViewIcon />, active: false },
    { label: 'Team', icon: <PeopleIcon />, active: false },
    { label: 'Analytics', icon: <TrendingUpIcon />, active: false },
  ];

  const recentItems = [
    'Sprint Planning Notes',
    'Product Roadmap Q1',
    'Team Meeting Minutes',
    'User Research Findings',
    'Design System v2.0'
  ];

  const templates = [
    'Project Plan',
    'Meeting Notes',
    'Task List',
    'User Story',
    'Bug Report'
  ];

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'high': return { main: '#e53e3e', bg: '#fed7d7', light: '#fc8181' };
      case 'medium': return { main: '#d69e2e', bg: '#faf089', light: '#f6e05e' };
      case 'low': return { main: '#38a169', bg: '#c6f6d5', light: '#68d391' };
      default: return { main: '#718096', bg: '#e2e8f0', light: '#a0aec0' };
    }
  };

  const getCategoryIcon = (category: string) => {
    switch(category) {
      case 'Product Strategy': return '🎯';
      case 'Documentation': return '📚';
      case 'Research': return '🔍';
      case 'Project Management': return '📋';
      default: return '📝';
    }
  };

  const NotionTaskCard = ({ task, index }: { task: any, index: number }) => {
    const priority = getPriorityColor(task.priority);
    const isActive = activeCard === index;

    return (
      <Card
        onMouseEnter={() => setActiveCard(index)}
        onMouseLeave={() => setActiveCard(null)}
        sx={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 3,
          boxShadow: isActive 
            ? '0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
            : '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          transform: isActive ? 'translateY(-2px)' : 'translateY(0)',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: priority.main,
            opacity: 0.8
          }
        }}
      >
        <CardContent sx={{ p: 4, pt: 3 }}>
          {/* Header with Status */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton 
                size="small"
                sx={{ 
                  color: task.completed ? '#38a169' : '#a0aec0',
                  p: 0
                }}
              >
                {task.completed ? <CheckCircleIcon /> : <RadioButtonUncheckedIcon />}
              </IconButton>
              <Box>
                <Typography variant="h6" fontWeight={600} sx={{ 
                  color: '#1a202c',
                  textDecoration: task.completed ? 'line-through' : 'none',
                  opacity: task.completed ? 0.6 : 1,
                  mb: 0.5
                }}>
                  {getCategoryIcon(task.category)} {task.title}
                </Typography>
                <Typography variant="body2" sx={{ color: '#718096', lineHeight: 1.5 }}>
                  {task.description}
                </Typography>
              </Box>
            </Box>
            
            <Chip
              label={task.priority}
              size="small"
              sx={{
                bgcolor: priority.bg,
                color: priority.main,
                fontWeight: 600,
                fontSize: '0.75rem',
                textTransform: 'capitalize',
                border: 'none'
              }}
            />
          </Box>

          {/* Progress Bar */}
          {task.progress > 0 && (
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ color: '#4a5568', fontWeight: 500 }}>
                  Progress
                </Typography>
                <Typography variant="body2" fontWeight={600} sx={{ color: priority.main }}>
                  {task.progress}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={task.progress}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  bgcolor: '#e2e8f0',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: priority.main,
                    borderRadius: 3
                  }
                }}
              />
            </Box>
          )}

          {/* Meta Information */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <AccessTimeIcon sx={{ fontSize: 16, color: '#718096' }} />
                <Typography variant="body2" sx={{ 
                  color: task.dueDate === 'Today' ? '#e53e3e' : '#718096',
                  fontWeight: task.dueDate === 'Today' ? 600 : 400
                }}>
                  {task.dueDate}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: '#718096' }}>
                • {task.estimatedHours}h
              </Typography>
            </Box>
            
            <Typography variant="body2" sx={{ 
              color: '#4a5568',
              fontWeight: 500
            }}>
              {task.assignee}
            </Typography>
          </Box>

          {/* Team Avatars */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              {task.team.map((member: string, idx: number) => (
                <Avatar
                  key={idx}
                  sx={{
                    width: 28,
                    height: 28,
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    bgcolor: '#4299e1',
                    color: 'white',
                    border: '2px solid white',
                    ml: idx > 0 ? -0.5 : 0
                  }}
                >
                  {member}
                </Avatar>
              ))}
            </Box>
            
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              {task.tags.slice(0, 2).map((tag: string, idx: number) => (
                <Chip
                  key={idx}
                  label={tag}
                  size="small"
                  variant="outlined"
                  sx={{
                    fontSize: '0.7rem',
                    height: 22,
                    borderColor: '#e2e8f0',
                    color: '#718096',
                    '& .MuiChip-label': { px: 1 }
                  }}
                />
              ))}
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      width: '100%', 
      display: 'flex',
      bgcolor: '#fafafa'
    }}>
      {/* Clean Sidebar */}
      <Box sx={{ 
        width: 240,
        bgcolor: 'white',
        borderRight: 1,
        borderColor: 'divider',
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 2
      }}>
        {/* Header */}
        <Box sx={{ p: 1 }}>
          <Typography variant="h6" fontWeight={500} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            🗂️ Task Voice Manager
          </Typography>
        </Box>

        {/* Navigation */}
        <Box>
          {sidebarItems.map((item, index) => (
            <Box 
              key={item.label}
              sx={{ 
                p: 1.5, 
                borderRadius: 1, 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                bgcolor: item.active ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                color: item.active ? 'primary.main' : 'text.secondary',
                '&:hover': { 
                  bgcolor: item.active ? alpha(theme.palette.primary.main, 0.1) : 'action.hover'
                }
              }}
            >
              {React.cloneElement(item.icon, { sx: { fontSize: '1.1rem' } })}
              <Typography variant="body2" fontWeight={item.active ? 500 : 400}>
                {item.label}
              </Typography>
            </Box>
          ))}
        </Box>

        <Divider />

        {/* Quick Actions */}
        <Box>
          <Box sx={{ 
            p: 1.5, 
            borderRadius: 1, 
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            color: 'text.secondary',
            '&:hover': { bgcolor: 'action.hover' }
          }}>
            <AddIcon sx={{ fontSize: '1.1rem' }} />
            <Typography variant="body2">New</Typography>
          </Box>
          <Box sx={{ 
            p: 1.5, 
            borderRadius: 1, 
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            color: 'text.secondary',
            '&:hover': { bgcolor: 'action.hover' }
          }}>
            <MicIcon sx={{ fontSize: '1.1rem' }} />
            <Typography variant="body2">Voice Note</Typography>
          </Box>
          <Box sx={{ 
            p: 1.5, 
            borderRadius: 1, 
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            color: 'text.secondary',
            '&:hover': { bgcolor: 'action.hover' }
          }}>
            <EditIcon sx={{ fontSize: '1.1rem' }} />
            <Typography variant="body2">Quick Note</Typography>
          </Box>
        </Box>

        <Divider />

        {/* Recent */}
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ px: 1.5, py: 0.5, display: 'block', fontWeight: 500 }}>
            Recent
          </Typography>
          {recentItems.map((item) => (
            <Box 
              key={item}
              sx={{ 
                p: 1.5, 
                borderRadius: 1, 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                color: 'text.secondary',
                '&:hover': { bgcolor: 'action.hover' }
              }}
            >
              <Typography variant="body2">• {item}</Typography>
            </Box>
          ))}
        </Box>

        <Divider />

        {/* Templates */}
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ px: 1.5, py: 0.5, display: 'block', fontWeight: 500 }}>
            Templates
          </Typography>
          {templates.map((template) => (
            <Box 
              key={template}
              sx={{ 
                p: 1.5, 
                borderRadius: 1, 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                color: 'text.secondary',
                '&:hover': { bgcolor: 'action.hover' }
              }}
            >
              <Typography variant="body2">• {template}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Database Header */}
        <Box sx={{ 
          bgcolor: 'white',
          p: 3,
          borderBottom: 1,
          borderColor: 'divider'
        }}>
          <Typography variant="h5" fontWeight={500} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            📋 Tasks Database
          </Typography>
          
          {/* Filters */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
              <Select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                displayEmpty
                startAdornment={<Typography variant="body2" sx={{ mr: 1, color: 'text.secondary' }}>Status</Typography>}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
              <Select 
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                displayEmpty
                startAdornment={<Typography variant="body2" sx={{ mr: 1, color: 'text.secondary' }}>Priority</Typography>}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="low">Low</MenuItem>
              </Select>
            </FormControl>

            <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
              <Select 
                value="date"
                displayEmpty
                startAdornment={<Typography variant="body2" sx={{ mr: 1, color: 'text.secondary' }}>Date</Typography>}
              >
                <MenuItem value="date">Recent</MenuItem>
                <MenuItem value="oldest">Oldest</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>

        {/* Clean Table */}
        <Box sx={{ flex: 1, overflow: 'auto', bgcolor: 'white' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                <TableCell padding="checkbox">
                  <Checkbox size="small" sx={{ color: 'text.secondary' }} />
                </TableCell>
                <TableCell sx={{ fontWeight: 500, color: 'text.secondary', py: 2 }}>Task</TableCell>
                <TableCell sx={{ fontWeight: 500, color: 'text.secondary', py: 2 }}>Due Date</TableCell>
                <TableCell sx={{ fontWeight: 500, color: 'text.secondary', py: 2 }}>Priority</TableCell>
                <TableCell sx={{ fontWeight: 500, color: 'text.secondary', py: 2 }}>Assignee</TableCell>
                <TableCell sx={{ fontWeight: 500, color: 'text.secondary', py: 2 }}>Tags</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mockTasks.map((task, index) => (
                <TableRow 
                  key={task.id}
                  sx={{ 
                    '&:hover': { bgcolor: '#f8f9fa' },
                    bgcolor: task.completed ? '#f0f9ff' : 'inherit',
                    borderBottom: index === mockTasks.length - 1 ? 'none' : '1px solid',
                    borderColor: 'divider'
                  }}
                >
                  <TableCell padding="checkbox">
                    <Checkbox 
                      checked={task.completed} 
                      size="small"
                      sx={{
                        color: 'text.secondary',
                        '&.Mui-checked': { color: theme.palette.success.main }
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ py: 2.5 }}>
                    <Typography 
                      variant="body2"
                      sx={{ 
                        textDecoration: task.completed ? 'line-through' : 'none',
                        color: task.completed ? 'text.secondary' : 'text.primary',
                        fontWeight: 400
                      }}
                    >
                      {task.title}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ py: 2.5 }}>
                    <Typography variant="body2" color="text.secondary">
                      {task.dueDate}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ py: 2.5 }}>
                    <Chip 
                      label={task.priority}
                      size="small"
                      variant="outlined"
                      sx={{ 
                        borderColor: getPriorityColor(task.priority),
                        color: getPriorityColor(task.priority),
                        fontWeight: 500,
                        textTransform: 'capitalize',
                        fontSize: '0.75rem'
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ py: 2.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar 
                        sx={{ 
                          width: 20, 
                          height: 20, 
                          bgcolor: theme.palette.grey[400],
                          fontSize: '0.7rem'
                        }}
                      >
                        {task.assignee[0]}
                      </Avatar>
                      <Typography variant="body2" color="text.secondary">
                        {task.assignee}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ py: 2.5 }}>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {task.tags.map((tag, tagIndex) => (
                        <Chip 
                          key={tagIndex}
                          label={tag}
                          size="small"
                          variant="outlined"
                          sx={{ 
                            fontSize: '0.7rem',
                            height: 20,
                            borderColor: 'divider',
                            color: 'text.secondary'
                          }}
                        />
                      ))}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>

        {/* Clean Voice Button */}
        <Fab
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            bgcolor: 'white',
            color: 'text.primary',
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            '&:hover': { 
              bgcolor: '#f8f9fa',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }
          }}
        >
          <MicIcon />
        </Fab>
      </Box>
    </Box>
  );
};

// Helper function
function alpha(color: string, opacity: number): string {
  return `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`;
}

export default NotionInspired;