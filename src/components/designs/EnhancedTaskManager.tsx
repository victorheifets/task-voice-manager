'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  IconButton,
  Chip,
  TableSortLabel,
  Tooltip,
  useMediaQuery,
  useTheme,
  TextField,
  InputAdornment,
  Button,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  Stack,
  alpha,
  Card
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';
import FlagIcon from '@mui/icons-material/Flag';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MicIcon from '@mui/icons-material/Mic';
import { format, isToday, isTomorrow, isPast, parseISO } from 'date-fns';
import { Task } from '@/types/task';
import { getTasks } from '@/lib/supabase/client';
import TaskInput from '../tasks/TaskInput';
import VoiceRecorder from '../voice/VoiceRecorder';

interface EnhancedTaskManagerProps {
  onTranscript: (text: string) => void;
  transcriptionService?: string;
}

const EnhancedTaskManager: React.FC<EnhancedTaskManagerProps> = ({
  onTranscript,
  transcriptionService
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('xs'));
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const fetchedTasks = await getTasks();
      
      // Generate 200 mock tasks for demonstration
      const mockTasks = Array.from({ length: 200 }, (_, index) => ({
        id: `mock-${index + 1}`,
        title: `Task ${index + 1}: ${['Complete project documentation', 'Review pull requests', 'Update user interface', 'Fix critical bugs', 'Write unit tests', 'Deploy to production', 'Analyze performance metrics', 'Refactor legacy code', 'Setup CI/CD pipeline', 'Create API documentation'][index % 10]}`,
        notes: `This is a sample note for task ${index + 1}`,
        completed: Math.random() > 0.7,
        dueDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000 - 15 * 24 * 60 * 60 * 1000).toISOString(),
        assignee: ['John Doe', 'Jane Smith', 'Bob Johnson', 'Alice Brown', 'Charlie Wilson', null][Math.floor(Math.random() * 6)],
        priority: ['low', 'medium', 'high', 'urgent'][Math.floor(Math.random() * 4)] as any,
        tags: [
          ['frontend', 'react'],
          ['backend', 'api'],
          ['documentation', 'urgent'],
          ['testing', 'qa'],
          ['deployment', 'devops'],
          ['bug', 'critical'],
          ['feature', 'enhancement'],
          ['refactor', 'technical-debt']
        ][Math.floor(Math.random() * 8)],
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - Math.random() * 2 * 24 * 60 * 60 * 1000).toISOString()
      }));
      
      setTasks([...fetchedTasks, ...mockTasks]);
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, task: Task) => {
    setAnchorEl(event.currentTarget);
    setSelectedTask(task);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTask(null);
  };

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'urgent': return '#d32f2f';
      case 'high': return '#f57c00';
      case 'medium': return '#1976d2';
      case 'low': return '#388e3c';
      default: return '#757575';
    }
  };

  const getPriorityIcon = (priority: string) => {
    const color = getPriorityColor(priority);
    return <FlagIcon sx={{ color, fontSize: 16 }} />;
  };

  const formatDate = (dateString: string) => {
    const date = parseISO(dateString);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    if (isPast(date)) return `${format(date, 'MMM d')} (overdue)`;
    return format(date, 'MMM d, yyyy');
  };

  const filterButtons = [
    { id: 'all', label: 'All', color: '#1976d2', count: tasks.length },
    { id: 'today', label: 'Today', color: '#2e7d32', count: tasks.filter(t => t.dueDate && isToday(parseISO(t.dueDate))).length },
    { id: 'tomorrow', label: 'Tomorrow', color: '#ed6c02', count: tasks.filter(t => t.dueDate && isTomorrow(parseISO(t.dueDate))).length },
    { id: 'overdue', label: 'Overdue', color: '#d32f2f', count: tasks.filter(t => t.dueDate && isPast(parseISO(t.dueDate)) && !t.completed).length },
    { id: 'completed', label: 'Completed', color: '#2e7d32', count: tasks.filter(t => t.completed).length },
  ];

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'today' && task.dueDate && isToday(parseISO(task.dueDate))) ||
      (statusFilter === 'tomorrow' && task.dueDate && isTomorrow(parseISO(task.dueDate))) ||
      (statusFilter === 'overdue' && task.dueDate && isPast(parseISO(task.dueDate)) && !task.completed) ||
      (statusFilter === 'completed' && task.completed);
    return matchesSearch && matchesStatus;
  });

  return (
    <Box sx={{ 
      bgcolor: '#ffffff',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      maxWidth: isMobile ? '100%' : '1400px',
      mx: 'auto',
      px: { xs: 0, sm: 2, md: 3 },
      overflow: 'hidden'
    }}>
      {/* Fixed Header Section */}
      <Box sx={{ 
        flexShrink: 0,
        bgcolor: '#ffffff',
        borderBottom: '1px solid',
        borderColor: alpha(theme.palette.divider, 0.1),
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        {!isMobile && (
          /* Desktop Task Input */
          <Box sx={{ 
            p: 1.5,
            mt: 2,
            mb: 2
          }}>
            <TaskInput 
              onTaskAdded={loadTasks}
              transcript=""
            />
          </Box>
        )}

        {/* Filter Section */}
        {isMobile ? (
          // Modern mobile filters with 2-row grid
          <Box sx={{ 
            p: 2,
            bgcolor: '#e2e8f0',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            {/* Search bar */}
            <TextField
              size="small"
              placeholder="Search tasks..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              fullWidth
              sx={{ 
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  bgcolor: '#ffffff',
                  height: 44,
                  fontSize: '0.9rem',
                  border: '1px solid #cbd5e1',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
                  '&:hover': {
                    borderColor: '#94a3b8'
                  },
                  '&.Mui-focused': {
                    borderColor: '#3b82f6',
                    boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
                  }
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 20, color: '#475569' }} />
                  </InputAdornment>
                ),
              }}
            />
            
            {/* Single row filters */}
            <Box sx={{ 
              display: 'flex',
              gap: 0.75,
              width: '100%',
              justifyContent: 'space-between'
            }}>
              {filterButtons.slice(0, 5).map((filter) => (
                <Button
                  key={filter.id}
                  variant={statusFilter === filter.id ? 'contained' : 'outlined'}
                  onClick={() => setStatusFilter(filter.id)}
                  size="small"
                  sx={{
                    borderRadius: 1.5,
                    px: 0.5,
                    py: 0.25,
                    fontSize: '0.6rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    border: '1px solid',
                    borderColor: statusFilter === filter.id ? filter.color : '#94a3b8',
                    bgcolor: statusFilter === filter.id ? filter.color : '#ffffff',
                    color: statusFilter === filter.id ? '#ffffff' : '#374151',
                    minWidth: 0,
                    flex: 1,
                    height: 26,
                    boxShadow: statusFilter === filter.id ? `0 1px 3px ${alpha(filter.color, 0.3)}` : '0 1px 2px rgba(0,0,0,0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 0.125,
                    '&:hover': {
                      borderColor: filter.color,
                      bgcolor: statusFilter === filter.id ? filter.color : '#f8fafc',
                      boxShadow: statusFilter === filter.id ? `0 2px 4px ${alpha(filter.color, 0.3)}` : '0 1px 3px rgba(0,0,0,0.12)'
                    },
                    transition: 'all 0.15s ease-in-out'
                  }}
                >
                  <Typography sx={{ 
                    fontSize: '0.55rem', 
                    fontWeight: 600, 
                    lineHeight: 1,
                    color: 'inherit'
                  }}>
                    {filter.label}
                  </Typography>
                  <Typography sx={{ 
                    fontSize: '0.5rem', 
                    fontWeight: 700,
                    lineHeight: 1,
                    opacity: statusFilter === filter.id ? 0.9 : 0.7,
                    color: 'inherit'
                  }}>
                    {filter.count}
                  </Typography>
                </Button>
              ))}
            </Box>
          </Box>
        ) : (
          // Desktop filters - original layout
          <Box sx={{ 
            p: 1.5,
            mb: 2, 
            display: 'flex', 
            flexDirection: 'row',
            gap: 2,
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {filterButtons.map((filter) => (
                <Button
                  key={filter.id}
                  variant={statusFilter === filter.id ? 'contained' : 'outlined'}
                  onClick={() => setStatusFilter(filter.id)}
                  size="small"
                  sx={{
                    borderRadius: 4,
                    px: 1.2,
                    py: 0.4,
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    border: '1px solid',
                    borderColor: statusFilter === filter.id ? filter.color : alpha(filter.color, 0.3),
                    bgcolor: statusFilter === filter.id ? filter.color : 'transparent',
                    color: statusFilter === filter.id ? '#fff' : filter.color,
                    '&:hover': {
                      bgcolor: statusFilter === filter.id ? filter.color : alpha(filter.color, 0.1),
                      borderColor: filter.color,
                    },
                    minWidth: 'auto',
                    height: 32,
                  }}
                >
                  {filter.label}
                  <Chip 
                    label={filter.count} 
                    size="small" 
                    sx={{ 
                      ml: 0.5,
                      height: 16,
                      fontSize: '0.7rem',
                      bgcolor: statusFilter === filter.id ? 'rgba(255,255,255,0.2)' : alpha(filter.color, 0.1),
                      color: statusFilter === filter.id ? '#fff' : filter.color,
                      fontWeight: 600
                    }} 
                  />
                </Button>
              ))}
            </Stack>

            <TextField
              size="small"
              placeholder="Search tasks..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              sx={{ 
                minWidth: 200,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: '#f8f9fa',
                  border: '1px solid',
                  borderColor: alpha(theme.palette.divider, 0.2),
                  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                  height: 36,
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 18 }} color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        )}
      </Box>

      {/* Scrollable Table Section */}
      <Box sx={{ 
        flex: 1,
        px: isMobile ? 0 : 1.5,
        pb: isMobile ? 2 : 1.5,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {!isMobile ? (
          // Desktop Table View
          <Card sx={{ 
            border: '1px solid',
            borderColor: alpha(theme.palette.divider, 0.2),
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            borderRadius: 2,
            overflow: 'hidden'
          }}>
            <TableContainer sx={{ 
              maxHeight: 'calc(100vh - 250px)',
              overflow: 'auto'
            }}>
              <Table stickyHeader>
            <TableHead>
              <TableRow sx={{ 
                bgcolor: theme.palette.primary.main,
                '& .MuiTableCell-head': {
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  py: 1.5,
                  borderBottom: 'none',
                  bgcolor: theme.palette.primary.main
                }
              }}>
                <TableCell padding="checkbox" sx={{ width: '60px' }}>
                  <Checkbox sx={{ color: 'rgba(255,255,255,0.7)' }} />
                </TableCell>
                <TableCell sx={{ width: '35%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocalOfferIcon sx={{ fontSize: 18 }} />
                    Task
                  </Box>
                </TableCell>
                <TableCell sx={{ width: '15%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarTodayIcon sx={{ fontSize: 18 }} />
                    Due Date
                  </Box>
                </TableCell>
                <TableCell sx={{ width: '15%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonIcon sx={{ fontSize: 18 }} />
                    Assignee
                  </Box>
                </TableCell>
                <TableCell sx={{ width: '12%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FlagIcon sx={{ fontSize: 18 }} />
                    Priority
                  </Box>
                </TableCell>
                <TableCell sx={{ width: '13%' }}>Tags</TableCell>
                <TableCell sx={{ width: '10%' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} sx={{ textAlign: 'center', py: 8 }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No tasks found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {searchFilter ? "Try adjusting your search terms" : "Add your first task to get started"}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTasks.map((task, index) => (
                  <TableRow
                    key={task.id}
                    sx={{
                      bgcolor: '#ffffff',
                      borderBottom: '1px solid',
                      borderColor: alpha(theme.palette.divider, 0.08),
                      '&:hover': {
                        bgcolor: '#ffffff',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      },
                      '&:last-child': {
                        borderBottom: 'none'
                      },
                      transition: 'all 0.2s ease-in-out',
                      height: 56,
                    }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={task.completed}
                        sx={{
                          color: alpha(theme.palette.primary.main, 0.6),
                          '&.Mui-checked': {
                            color: theme.palette.primary.main,
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography 
                          variant="subtitle1" 
                          sx={{ 
                            fontWeight: 600,
                            color: task.completed ? 'text.secondary' : 'text.primary',
                            textDecoration: task.completed ? 'line-through' : 'none',
                            mb: 0.5
                          }}
                        >
                          {task.title}
                        </Typography>
                        {task.notes && (
                          <Typography variant="caption" color="text.secondary">
                            {task.notes.substring(0, 60)}...
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {task.dueDate ? (
                        <Chip
                          size="small"
                          label={formatDate(task.dueDate)}
                          icon={<CalendarTodayIcon sx={{ fontSize: 14 }} />}
                          sx={{
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            bgcolor: isPast(parseISO(task.dueDate)) && !task.completed 
                              ? alpha('#d32f2f', 0.1) 
                              : alpha(theme.palette.primary.main, 0.1),
                            color: isPast(parseISO(task.dueDate)) && !task.completed 
                              ? '#d32f2f' 
                              : theme.palette.primary.main,
                            border: '1px solid',
                            borderColor: isPast(parseISO(task.dueDate)) && !task.completed 
                              ? alpha('#d32f2f', 0.3) 
                              : alpha(theme.palette.primary.main, 0.3),
                          }}
                        />
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No due date
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {task.assignee ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem', bgcolor: theme.palette.primary.main }}>
                            {task.assignee.charAt(0).toUpperCase()}
                          </Avatar>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {task.assignee}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Unassigned
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        icon={getPriorityIcon(task.priority)}
                        label={task.priority}
                        sx={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          textTransform: 'capitalize',
                          bgcolor: alpha(getPriorityColor(task.priority), 0.1),
                          color: getPriorityColor(task.priority),
                          border: '1px solid',
                          borderColor: alpha(getPriorityColor(task.priority), 0.3),
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5}>
                        {task.tags.slice(0, 2).map((tag, tagIndex) => (
                          <Chip
                            key={tagIndex}
                            size="small"
                            label={tag}
                            sx={{
                              fontSize: '0.7rem',
                              height: 20,
                              bgcolor: alpha(theme.palette.secondary.main, 0.1),
                              color: theme.palette.secondary.main,
                              '&:hover': {
                                bgcolor: alpha(theme.palette.secondary.main, 0.2),
                              }
                            }}
                          />
                        ))}
                        {task.tags.length > 2 && (
                          <Typography variant="caption" color="text.secondary">
                            +{task.tags.length - 2}
                          </Typography>
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5}>
                        <Tooltip title="View Details">
                          <IconButton size="small" sx={{ color: 'text.secondary' }}>
                            <InfoIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Task">
                          <IconButton size="small" sx={{ color: 'text.secondary' }}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="More Options">
                          <IconButton 
                            size="small" 
                            onClick={(e) => handleMenuClick(e, task)}
                            sx={{ color: 'text.secondary' }}
                          >
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
        ) : (
          // Modern Mobile Card View
          <Box sx={{ 
            flex: 1,
            height: 'calc(100vh - 240px)',
            overflowY: 'auto',
            overflowX: 'hidden',
            px: 3,
            py: 1,
            bgcolor: '#f1f5f9'
          }}>
            {filteredTasks.length === 0 ? (
              <Box sx={{ 
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 300,
                textAlign: 'center'
              }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No tasks found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {searchFilter ? "Try adjusting your search terms" : "Add your first task to get started"}
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                {filteredTasks.map((task, index) => (
                  <Card 
                    key={task.id}
                    elevation={2}
                    sx={{
                      bgcolor: '#ffffff',
                      borderRadius: 3,
                      border: '1px solid #d1d5db',
                      overflow: 'hidden',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      transition: 'all 0.2s ease-in-out',
                      minHeight: 140,
                      maxHeight: 140,
                      display: 'flex',
                      flexDirection: 'column',
                      '&:active': {
                        transform: 'translateY(1px)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        borderColor: '#3b82f6'
                      }
                    }}
                  >
                    {/* Priority indicator bar */}
                    <Box sx={{
                      height: 3,
                      bgcolor: getPriorityColor(task.priority),
                      opacity: 0.8
                    }} />

                    <Box sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      {/* Header */}
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'flex-start', 
                        gap: 2,
                        mb: 2
                      }}>
                        <Checkbox
                          checked={task.completed}
                          size="medium"
                          sx={{
                            p: 0,
                            color: '#94a3b8',
                            '&.Mui-checked': {
                              color: '#10b981',
                            }
                          }}
                        />
                        
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              fontWeight: 600,
                              color: task.completed ? '#94a3b8' : '#1e293b',
                              textDecoration: task.completed ? 'line-through' : 'none',
                              lineHeight: 1.2,
                              fontSize: '1.1rem',
                              mb: task.notes ? 0.5 : 0
                            }}
                          >
                            {task.title}
                          </Typography>
                          {task.notes && (
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: '#64748b',
                                fontSize: '0.85rem',
                                lineHeight: 1.3
                              }}
                            >
                              {task.notes.substring(0, 80)}...
                            </Typography>
                          )}
                        </Box>

                        <IconButton 
                          size="small" 
                          onClick={(e) => handleMenuClick(e, task)}
                          sx={{ 
                            color: '#94a3b8',
                            '&:hover': { 
                              bgcolor: '#f1f5f9',
                              color: '#64748b'
                            }
                          }}
                        >
                          <MoreVertIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Box>

                      {/* Task metadata */}
                      <Box sx={{ 
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 1.5,
                        alignItems: 'center'
                      }}>
                        {/* Due date */}
                        {task.dueDate && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Box sx={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              bgcolor: isPast(parseISO(task.dueDate)) && !task.completed 
                                ? '#ef4444' 
                                : '#3b82f6'
                            }} />
                            <Typography variant="body2" sx={{ 
                              fontSize: '0.8rem',
                              color: isPast(parseISO(task.dueDate)) && !task.completed 
                                ? '#ef4444' 
                                : '#64748b',
                              fontWeight: 500
                            }}>
                              {formatDate(task.dueDate)}
                            </Typography>
                          </Box>
                        )}
                        
                        {/* Assignee */}
                        {task.assignee && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                            <Avatar sx={{ 
                              width: 20, 
                              height: 20, 
                              fontSize: '0.7rem', 
                              bgcolor: '#3b82f6',
                              fontWeight: 600
                            }}>
                              {task.assignee.charAt(0).toUpperCase()}
                            </Avatar>
                            <Typography variant="body2" sx={{ 
                              fontSize: '0.8rem', 
                              color: '#64748b',
                              fontWeight: 500
                            }}>
                              {task.assignee.split(' ')[0]}
                            </Typography>
                          </Box>
                        )}

                        {/* Priority */}
                        <Box sx={{
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 2,
                          bgcolor: alpha(getPriorityColor(task.priority), 0.1),
                          border: `1px solid ${alpha(getPriorityColor(task.priority), 0.2)}`
                        }}>
                          <Typography sx={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            color: getPriorityColor(task.priority),
                            letterSpacing: '0.5px'
                          }}>
                            {task.priority}
                          </Typography>
                        </Box>

                        {/* Tags */}
                        {task.tags.length > 0 && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            {task.tags.slice(0, 2).map((tag, tagIndex) => (
                              <Box
                                key={tagIndex}
                                sx={{
                                  px: 1,
                                  py: 0.25,
                                  borderRadius: 1.5,
                                  bgcolor: '#f1f5f9',
                                  border: '1px solid #e2e8f0'
                                }}
                              >
                                <Typography sx={{
                                  fontSize: '0.7rem',
                                  color: '#64748b',
                                  fontWeight: 500
                                }}>
                                  {tag}
                                </Typography>
                              </Box>
                            ))}
                            {task.tags.length > 2 && (
                              <Typography variant="caption" sx={{ 
                                fontSize: '0.7rem', 
                                color: '#94a3b8',
                                fontWeight: 500
                              }}>
                                +{task.tags.length - 2}
                              </Typography>
                            )}
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </Card>
                ))}
              </Box>
            )}
          </Box>
        )}
      </Box>


      {/* Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleMenuClose}>
          <EditIcon sx={{ mr: 1, fontSize: 18 }} />
          Edit Task
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <InfoIcon sx={{ mr: 1, fontSize: 18 }} />
          View Details
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleMenuClose} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1, fontSize: 18 }} />
          Delete Task
        </MenuItem>
      </Menu>

      {/* Voice Recorder */}
      {isRecording && (
        <Paper sx={{
          position: 'fixed',
          bottom: 120,
          right: 32,
          p: 3,
          bgcolor: '#ffffff',
          border: '2px solid',
          borderColor: theme.palette.primary.main,
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          zIndex: 1000,
          minWidth: 300,
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

export default EnhancedTaskManager;