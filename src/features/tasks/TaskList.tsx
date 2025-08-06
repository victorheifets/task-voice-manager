'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Card,
  CardContent,
  CardActions,
  Button,
  useMediaQuery,
  useTheme,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Menu,
  MenuItem,
  Fade,
  Avatar,
  Badge,
  alpha
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';
import EditIcon from '@mui/icons-material/Edit';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import { format, isToday, isTomorrow, isPast, isThisWeek, parseISO, addWeeks } from 'date-fns';
import { Task } from '@/types/task';
import { getTasks, updateTask, deleteTask } from '@/lib/supabase/client';
import TodayIcon from '@mui/icons-material/Today';
import PrioritySelect, { Priority } from './PrioritySelect';

type SortDirection = 'asc' | 'desc';
type SortField = 'title' | 'dueDate' | 'assignee' | 'createdAt' | 'updatedAt';

interface TaskListProps {
  refreshTrigger: number;
  searchFilter?: string;
  statusFilter?: string;
}

// Helper function to check if a date is in the next week
const isNextWeek = (date: Date): boolean => {
  const today = new Date();
  const nextWeekStart = addWeeks(today, 1);
  const nextWeekEnd = addWeeks(today, 2);
  return date >= nextWeekStart && date < nextWeekEnd;
};

export default function TaskList({ refreshTrigger, searchFilter = '', statusFilter = 'all' }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sortField, setSortField] = useState<SortField>('updatedAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [editedTitle, setEditedTitle] = useState('');
  const [editedAssignee, setEditedAssignee] = useState('');
  const [editedDueDate, setEditedDueDate] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuTask, setMenuTask] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<{ id: string; field: 'title' | 'assignee' | 'dueDate' } | null>(null);
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [selectedTaskNotes, setSelectedTaskNotes] = useState('');
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md')); // Changed from 'sm' to 'md' for better mobile detection
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadTasks();
  }, [refreshTrigger]);

  useEffect(() => {
    if (titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, []);

  const loadTasks = async () => {
    try {
      const fetchedTasks = await getTasks();
      setTasks(fetchedTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const handleToggleComplete = async (task: Task) => {
    try {
      await updateTask(task.id, { completed: !task.completed });
      setTasks(tasks.map(t => 
        t.id === task.id ? { ...t, completed: !t.completed } : t
      ));
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      setTasks(tasks.filter(t => t.id !== taskId));
      setAnchorEl(null);
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleSort = (field: SortField) => {
    if (field !== 'dueDate') return; // Only allow sorting by date
    
    const isAsc = sortField === field && sortDirection === 'asc';
    setSortDirection(isAsc ? 'desc' : 'asc');
    setSortField(field);
  };

  const handleTitleChange = (taskId: string, newTitle: string) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, title: newTitle } : t));
  };

  const handleAssigneeChange = (taskId: string, newAssignee: string) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, assignee: newAssignee } : t));
  };

  const handleDueDateChange = (taskId: string, newDueDate: string) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, dueDate: newDueDate } : t));
  };

  const handleInfoClick = async (task: Task) => {
    setSelectedTask(task);
    setSelectedTaskNotes(task.notes || '');
    setNotesDialogOpen(true);
  };

  const handleNotesClose = async () => {
    if (selectedTask && selectedTaskNotes !== selectedTask.notes) {
      await updateTask(selectedTask.id, { notes: selectedTaskNotes });
      setTasks(tasks.map(t => 
        t.id === selectedTask.id 
          ? { ...t, notes: selectedTaskNotes }
          : t
      ));
    }
    setNotesDialogOpen(false);
    setSelectedTask(null);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, taskId: string) => {
    setAnchorEl(event.currentTarget);
    setMenuTask(taskId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuTask(null);
  };

  const handleFieldClick = (taskId: string, field: 'title' | 'assignee' | 'dueDate') => {
    setEditingField({ id: taskId, field });
  };

  const handleFieldBlur = () => {
    setEditingField(null);
  };

  const handlePriorityChange = async (taskId: string, newPriority: Priority) => {
    try {
      await updateTask(taskId, { priority: newPriority });
      setTasks(tasks.map(t => t.id === taskId ? { ...t, priority: newPriority } : t));
    } catch (error) {
      console.error('Error updating task priority:', error);
    }
  };

  const getFilteredTasks = () => {
    return tasks
      .filter(task => {
        // Text search filter
        if (searchFilter) {
          const query = searchFilter.toLowerCase();
          const matchesTitle = task.title.toLowerCase().includes(query);
          const matchesAssignee = task.assignee?.toLowerCase().includes(query);
          const matchesTags = task.tags.some(tag => tag.toLowerCase().includes(query));
          
          if (!(matchesTitle || matchesAssignee || matchesTags)) {
            return false;
          }
        }
        
        // Status filters
        if (statusFilter === 'completed') return task.completed;
        if (statusFilter === 'all') return true;
        if (task.completed) return false;
        
        // Date filters
        if (!task.dueDate) return statusFilter === 'all';
        
        try {
          const dueDate = parseISO(task.dueDate);
          
          switch (statusFilter) {
            case 'today':
              return isToday(dueDate);
            case 'tomorrow':
              return isTomorrow(dueDate);
            case 'nextweek':
              return isNextWeek(dueDate);
            case 'overdue':
              return isPast(dueDate) && !isToday(dueDate);
            default:
              return true;
          }
        } catch (error) {
          console.error('Error parsing date in filter:', task.dueDate, error);
          return statusFilter === 'all';
        }
      })
      .sort((a, b) => {
        // Sort logic
        if (sortField === 'dueDate') {
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return sortDirection === 'asc' ? 1 : -1;
          if (!b.dueDate) return sortDirection === 'asc' ? -1 : 1;
          return sortDirection === 'asc' 
            ? new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
            : new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
        }
        
        // Default sort by updatedAt
        const aDate = a.updatedAt || a.createdAt;
        const bDate = b.updatedAt || b.createdAt;
        return sortDirection === 'asc'
          ? new Date(aDate).getTime() - new Date(bDate).getTime()
          : new Date(bDate).getTime() - new Date(aDate).getTime();
      });
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    try {
      // First check if the date is valid
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return '-';
      }
      return format(parseISO(dateString), 'MMM d, yyyy');
    } catch (error) {
      console.error('Error formatting date:', dateString, error);
      return '-';
    }
  };

  const getDateColor = (dateString: string | null) => {
    if (!dateString) return 'inherit';
    
    try {
      // First check if the date is valid
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'inherit';
      }
      
      const parsedDate = parseISO(dateString);
      if (isPast(parsedDate) && !isToday(parsedDate)) return theme.palette.error.main;
      if (isToday(parsedDate)) return theme.palette.warning.main;
      if (isTomorrow(parsedDate)) return theme.palette.info.main;
      return 'inherit';
    } catch (error) {
      console.error('Error parsing date for color:', dateString, error);
      return 'inherit';
    }
  };

  const getPriorityLevel = (task: Task): number => {
    // For demo purposes, we'll determine priority based on due date
    if (!task.dueDate) return 0;
    
    try {
      // First check if the date is valid
      const date = new Date(task.dueDate);
      if (isNaN(date.getTime())) {
        return 0;
      }
      
      const dueDate = parseISO(task.dueDate);
      
      if (isPast(dueDate) && !isToday(dueDate)) {
        return 3; // High priority
      }
      
      if (isToday(dueDate)) {
        return 2; // Medium priority
      }
      
      if (isTomorrow(dueDate)) {
        return 1; // Low priority
      }
      
      return 0; // No priority
    } catch (error) {
      console.error('Error parsing date for priority:', task.dueDate, error);
      return 0;
    }
  };

  const renderPriority = (task: Task) => {
    const priority = getPriorityLevel(task);
    
    if (priority === 0) return null;
    
    const colors = {
      1: theme.palette.info.main,
      2: theme.palette.warning.main,
      3: theme.palette.error.main
    };
    
    return (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {Array(priority).fill(0).map((_, i) => (
          <PriorityHighIcon 
            key={i} 
            fontSize="small" 
            sx={{ color: colors[priority as keyof typeof colors] }} 
          />
        ))}
      </Box>
    );
  };

  const filteredTasks = getFilteredTasks();

  if (isMobile) {
    // Mobile card layout - fully responsive
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 2, 
        p: { xs: 1, sm: 2 },
        width: '100%',
        maxWidth: '100vw',
        overflow: 'hidden'
      }}>
        {filteredTasks.length === 0 ? (
          <Card sx={{ 
            p: 3, 
            textAlign: 'center', 
            bgcolor: 'grey.50',
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <Typography variant="body2" color="text.secondary">
              No tasks found
            </Typography>
          </Card>
        ) : (
          filteredTasks.map((task) => (
            <Card 
              key={task.id}
              sx={{ 
                boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                borderRadius: 3,
                borderLeft: `4px solid ${
                  task.priority === 'high' ? '#f44336' : 
                  task.priority === 'medium' ? '#ff9800' : 
                  task.priority === 'low' ? '#4caf50' : '#757575'
                }`,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden',
                '&:hover': {
                  boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                  transform: 'translateY(-2px)'
                },
                '&:active': {
                  transform: 'translateY(0px)'
                },
                opacity: task.completed ? 0.7 : 1,
                bgcolor: 'background.paper'
              }}
            >
              <CardContent sx={{ 
                p: { xs: 2, sm: 3 },
                pb: { xs: 1, sm: 2 },
                '&:last-child': { pb: { xs: 1, sm: 2 } }
              }}>
                {/* Header with checkbox, title and delete */}
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  gap: 1.5,
                  mb: 2
                }}>
                  <Checkbox
                    checked={task.completed}
                    onChange={() => handleToggleComplete(task)}
                    size="small"
                    sx={{ 
                      p: 0.5,
                      mt: -0.5,
                      color: 'primary.main',
                      '&.Mui-checked': {
                        color: 'success.main'
                      }
                    }}
                  />
                  
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        textDecoration: task.completed ? 'line-through' : 'none',
                        fontSize: { xs: '1rem', sm: '1.1rem' },
                        fontWeight: 600,
                        lineHeight: 1.3,
                        color: task.completed ? 'text.secondary' : 'text.primary',
                        wordBreak: 'break-word',
                        mb: 0.5
                      }}
                    >
                      {task.title}
                    </Typography>
                  </Box>

                  <IconButton 
                    size="small" 
                    onClick={() => handleDeleteTask(task.id)} 
                    color="error"
                    sx={{ 
                      p: 0.5,
                      mt: -0.5,
                      '&:hover': {
                        bgcolor: 'error.light',
                        color: 'white'
                      }
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>

                {/* Task details */}
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: 1.5,
                  pl: 4
                }}>
                  {/* Due date */}
                  {task.dueDate && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TodayIcon 
                        fontSize="small" 
                        sx={{ 
                          color: getDateColor(task.dueDate),
                          flexShrink: 0
                        }} 
                      />
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: getDateColor(task.dueDate), 
                          fontWeight: 500,
                          fontSize: '0.875rem'
                        }}
                      >
                        {formatDate(task.dueDate)}
                      </Typography>
                    </Box>
                  )}

                  {/* Assignee */}
                  {task.assignee && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ 
                        width: 20, 
                        height: 20, 
                        fontSize: '0.75rem',
                        bgcolor: 'primary.main',
                        flexShrink: 0
                      }}>
                        {task.assignee.charAt(0).toUpperCase()}
                      </Avatar>
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ 
                          fontSize: '0.875rem',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {task.assignee}
                      </Typography>
                    </Box>
                  )}

                  {/* Priority chip */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PriorityHighIcon 
                      fontSize="small" 
                      sx={{ 
                        color: task.priority === 'high' ? '#f44336' : 
                               task.priority === 'medium' ? '#ff9800' : 
                               task.priority === 'low' ? '#4caf50' : '#757575',
                        flexShrink: 0
                      }} 
                    />
                    <Chip
                      label={task.priority || 'none'}
                      size="small"
                      sx={{
                        bgcolor: task.priority === 'high' ? 'rgba(244, 67, 54, 0.1)' : 
                                 task.priority === 'medium' ? 'rgba(255, 152, 0, 0.1)' : 
                                 task.priority === 'low' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(117, 117, 117, 0.1)',
                        color: task.priority === 'high' ? '#f44336' : 
                               task.priority === 'medium' ? '#ff9800' : 
                               task.priority === 'low' ? '#4caf50' : '#757575',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        textTransform: 'capitalize',
                        height: 24
                      }}
                    />
                  </Box>

                  {/* Tags */}
                  {task.tags && task.tags.length > 0 && (
                    <Box sx={{ 
                      display: 'flex', 
                      flexWrap: 'wrap', 
                      gap: 0.75,
                      mt: 0.5
                    }}>
                      {task.tags.slice(0, 3).map((tag, index) => (
                        <Chip
                          key={index}
                          label={tag}
                          size="small"
                          variant="outlined"
                          sx={{ 
                            height: 22,
                            fontSize: '0.7rem',
                            color: 'text.secondary',
                            borderColor: 'divider',
                            '&:hover': {
                              bgcolor: 'action.hover'
                            }
                          }}
                        />
                      ))}
                      {task.tags.length > 3 && (
                        <Chip
                          label={`+${task.tags.length - 3}`}
                          size="small"
                          variant="outlined"
                          sx={{ 
                            height: 22,
                            fontSize: '0.7rem',
                            color: 'primary.main',
                            borderColor: 'primary.main'
                          }}
                        />
                      )}
                    </Box>
                  )}
                </Box>
              </CardContent>
              
              {/* Action buttons */}
              <CardActions sx={{ 
                pt: 0, 
                px: { xs: 2, sm: 3 }, 
                pb: { xs: 1.5, sm: 2 },
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <Button 
                  size="small" 
                  startIcon={<InfoIcon />}
                  onClick={() => handleInfoClick(task)}
                  sx={{ 
                    color: task.notes ? 'primary.main' : 'text.secondary',
                    fontSize: '0.8rem',
                    fontWeight: 500,
                    textTransform: 'none',
                    '&:hover': {
                      bgcolor: 'action.hover'
                    }
                  }}
                >
                  {task.notes ? 'View Notes' : 'Add Notes'}
                </Button>
                
                <Typography 
                  variant="caption" 
                  color="text.disabled"
                  sx={{ 
                    fontSize: '0.7rem',
                    ml: 'auto'
                  }}
                >
                  {formatDate(task.updatedAt)}
                </Typography>
              </CardActions>
            </Card>
          ))
        )}
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', mb: 4 }}>
      <TableContainer 
        component={Paper} 
        sx={{ 
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 0 12px rgba(0,0,0,0.15)',
          '& .MuiTableCell-root': {
            borderRadius: 0,
          }
        }}
      >
        <Table 
          aria-label="task list"
          className="task-table"
        >
          <TableHead>
            <TableRow sx={{ bgcolor: theme.palette.primary.main }}>
              <TableCell padding="checkbox" sx={{ borderBottom: `1px solid ${theme.palette.primary.main}`, color: 'white' }}></TableCell>
              <TableCell sx={{ borderBottom: `1px solid ${theme.palette.primary.main}`, fontWeight: 'bold', color: 'white', width: '30%' }}>
                Task
              </TableCell>
              <TableCell sx={{ borderBottom: `1px solid ${theme.palette.primary.main}`, fontWeight: 'bold', color: 'white', width: '12%' }}>
                <TableSortLabel
                  active={sortField === 'dueDate'}
                  direction={sortField === 'dueDate' ? sortDirection : 'asc'}
                  onClick={() => handleSort('dueDate')}
                  sx={{ color: 'white !important', '& .MuiTableSortLabel-icon': { color: 'white !important' } }}
                >
                  Due Date
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ borderBottom: `1px solid ${theme.palette.primary.main}`, fontWeight: 'bold', color: 'white', width: '12%' }}>
                Assignee
              </TableCell>
              <TableCell sx={{ borderBottom: `1px solid ${theme.palette.primary.main}`, fontWeight: 'bold', color: 'white', width: '10%' }}>
                Priority
              </TableCell>
              <TableCell sx={{ borderBottom: `1px solid ${theme.palette.primary.main}`, fontWeight: 'bold', color: 'white', width: '12%' }}>Tags</TableCell>
              <TableCell sx={{ borderBottom: `1px solid ${theme.palette.primary.main}`, fontWeight: 'bold', color: 'white', width: '13%' }}>
                Last Update
              </TableCell>
              <TableCell align="right" sx={{ borderBottom: `1px solid ${theme.palette.primary.main}`, fontWeight: 'bold', color: 'white', width: '13%' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                  No tasks found
                </TableCell>
              </TableRow>
            ) : (
              filteredTasks.map((task) => (
                <TableRow 
                  key={task.id}
                  sx={{ 
                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.08), textDecoration: 'none' },
                    bgcolor: '#ffffff',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                    height: '40px',
                    '& .MuiTableRow-root': {
                      height: '40px',
                    },
                  }}
                >
                  <TableCell padding="checkbox">
                    <Checkbox 
                      checked={task.completed}
                      onChange={() => handleToggleComplete(task)}
                      sx={{ 
                        color: theme.palette.primary.main,
                        '&.Mui-checked': {
                          color: theme.palette.success.main,
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      maxWidth: '300px',
                      textDecoration: task.completed ? 'line-through' : 'none',
                      color: task.completed ? 'text.secondary' : 'text.primary'
                    }}
                  >
                    <TextField
                      fullWidth
                      value={task.title}
                      onChange={(e) => handleTitleChange(task.id, e.target.value)}
                      onBlur={handleFieldBlur}
                      size="small"
                      variant="standard"
                      autoFocus
                      sx={{ mb: 1, '& .MuiInput-underline:before, & .MuiInput-underline:after': { borderBottom: 'none' }, '&:hover': { textDecoration: 'none' } }}
                    />
                  </TableCell>
                  <TableCell sx={{ color: getDateColor(task.dueDate), fontWeight: 500 }}>
                    <TextField
                      type="date"
                      value={task.dueDate ? task.dueDate.split('T')[0] : ''}
                      onChange={(e) => handleDueDateChange(task.id, e.target.value)}
                      size="small"
                      variant="standard"
                      InputProps={{
                        disableUnderline: true,
                      }}
                      sx={{ 
                        width: 'auto',
                        minWidth: '120px',
                        '& .MuiInputBase-input': {
                          color: '#2196F3',
                          fontWeight: 500,
                          py: 0.5,
                          pr: 0.5,
                          cursor: 'pointer',
                        },
                        '& .MuiInput-underline:before, & .MuiInput-underline:after': { 
                          borderBottom: 'none' 
                        },
                        '&:hover': { 
                          bgcolor: alpha(theme.palette.primary.main, 0.05),
                          borderRadius: 1,
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      fullWidth
                      value={task.assignee || ''}
                      onChange={(e) => handleAssigneeChange(task.id, e.target.value)}
                      onBlur={handleFieldBlur}
                      size="small"
                      variant="standard"
                      autoFocus
                      sx={{ mb: 1, '& .MuiInput-underline:before, & .MuiInput-underline:after': { borderBottom: 'none' }, '&:hover': { textDecoration: 'none' } }}
                    />
                  </TableCell>
                  <TableCell>
                    <PrioritySelect
                      value={task.priority}
                      onChange={(newPriority) => handlePriorityChange(task.id, newPriority)}
                      disabled={task.completed}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {task.tags.map((tag, index) => {
                        // Generate a consistent color for each tag
                        const tagColor = [
                          '#2196F3', // Blue
                          '#4CAF50', // Green
                          '#FF9800', // Orange
                          '#9C27B0', // Purple
                          '#F44336', // Red
                          '#009688'  // Teal
                        ][index % 6];
                        
                        return (
                          <Chip 
                            key={index} 
                            label={tag} 
                            size="small"
                            onDelete={() => {
                              const newTags = task.tags.filter((_, i) => i !== index);
                              updateTask(task.id, { tags: newTags });
                              setTasks(tasks.map(t => t.id === task.id ? { ...t, tags: newTags } : t));
                            }}
                            onClick={() => {
                              const newTag = window.prompt('Edit tag:', tag);
                              if (newTag) {
                                const newTags = [...task.tags];
                                newTags[index] = newTag;
                                updateTask(task.id, { tags: newTags });
                                setTasks(tasks.map(t => t.id === task.id ? { ...t, tags: newTags } : t));
                              }
                            }}
                            sx={{ 
                              fontSize: '0.75rem',
                              bgcolor: alpha(tagColor, 0.15),
                              color: tagColor,
                              borderColor: alpha(tagColor, 0.3),
                              '&:hover': {
                                bgcolor: alpha(tagColor, 0.25),
                              },
                              '& .MuiChip-deleteIcon': {
                                color: tagColor,
                                '&:hover': {
                                  color: alpha(tagColor, 0.7),
                                }
                              }
                            }}
                          />
                        );
                      })}
                    </Box>
                  </TableCell>
                  <TableCell>
                    {formatDate(task.updatedAt)}
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Tooltip title="Notes">
                        <IconButton 
                          size="small" 
                          onClick={() => handleInfoClick(task)}
                          sx={{ 
                            color: task.notes ? '#2196F3' : 'inherit',
                            '&:hover': {
                              color: '#2196F3'
                            }
                          }}
                        >
                          <InfoIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" onClick={() => handleDeleteTask(task.id)} color="error">
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Notes Dialog */}
      <Dialog 
        open={notesDialogOpen} 
        onClose={handleNotesClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            bgcolor: '#fff',
            backgroundImage: 'linear-gradient(#f5f5f5 1px, transparent 1px)',
            backgroundSize: '100% 24px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            '& .MuiDialogTitle-root': {
              borderBottom: '1px solid #e0e0e0',
              bgcolor: '#f5f5f5',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              '&:before': {
                content: '""',
                width: 4,
                height: 24,
                bgcolor: '#2196F3',
                borderRadius: 2,
              },
            },
          },
        }}
      >
        <DialogTitle>Task Notes</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            multiline
            minRows={4}
            maxRows={20}
            fullWidth
            placeholder="Add notes about this task..."
            value={selectedTaskNotes}
            onChange={(e) => setSelectedTaskNotes(e.target.value)}
            variant="outlined"
            sx={{
              mt: 1,
              '& .MuiOutlinedInput-root': {
                bgcolor: 'transparent',
                '& textarea': {
                  lineHeight: '24px',
                  resize: 'vertical',
                  minHeight: '96px',
                  maxHeight: '480px',
                },
                '& fieldset': {
                  borderColor: 'transparent',
                },
                '&:hover fieldset': {
                  borderColor: 'transparent',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'transparent',
                },
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid #e0e0e0', bgcolor: '#f5f5f5' }}>
          <Button onClick={handleNotesClose}>Close</Button>
          <Button onClick={handleNotesClose} color="primary" variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 