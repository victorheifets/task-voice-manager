'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  TextField, 
  Checkbox, 
  IconButton, 
  Menu, 
  MenuItem, 
  Tooltip, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Paper,
  Card,
  CardContent,
  Chip,
  useTheme,
  alpha,
  useMediaQuery,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
  Snackbar,
  Alert,
  Divider,
  CircularProgress,
  InputAdornment,
  OutlinedInput,
  FormControl,
  InputLabel,
  Select,
  Drawer,
  Fab,
  Badge,
  Avatar,
  Stack
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import FlagIcon from '@mui/icons-material/Flag';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import InfoIcon from '@mui/icons-material/Info';
import PersonIcon from '@mui/icons-material/Person';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { format, isToday, isTomorrow, isPast, parseISO } from 'date-fns';
import { Task } from '@/types/task';
import { Priority } from '@/components/tasks/PrioritySelect';
import { getTasks, createTask, updateTask, deleteTask } from '@/lib/supabase/client';
import TaskInput from '../tasks/TaskInput';
import TaskEditDialog from '../tasks/TaskEditDialog';
import TaskDetailsDialog from '../tasks/TaskDetailsDialog';
import TaskFilters from '../tasks/TaskFilters';
import { useThemeContext } from '../../contexts/ThemeContext';

interface EnhancedTaskManagerProps {
  onTranscript: (text: string) => void;
  transcriptionService?: string;
  transcript?: string;
}

const EnhancedTaskManager: React.FC<EnhancedTaskManagerProps> = ({
  onTranscript,
  transcriptionService,
  transcript
}) => {
  const theme = useTheme();
  const { mode } = useThemeContext();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('xs'));
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [taskToView, setTaskToView] = useState<Task | null>(null);
  const [snackbar, setSnackbar] = useState<{open: boolean, message: string, severity: 'success' | 'error'}>({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [currentTranscript, setCurrentTranscript] = useState<string>('');
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [datePickerTaskId, setDatePickerTaskId] = useState<string | null>(null);
  const [priorityMenuOpen, setPriorityMenuOpen] = useState(false);
  const [priorityAnchorEl, setPriorityAnchorEl] = useState<HTMLElement | null>(null);
  const [priorityTaskId, setPriorityTaskId] = useState<string | null>(null);

  useEffect(() => {
    loadTasks();
  }, []);

  // Update local transcript when prop changes
  useEffect(() => {
    if (transcript) {
      console.log('EnhancedTaskManager: Received transcript prop:', transcript);
      setCurrentTranscript(transcript);
    }
  }, [transcript]);

  const handleTranscript = (transcript: string) => {
    console.log('EnhancedTaskManager: handleTranscript called with:', transcript);
    setCurrentTranscript(transcript);
    console.log('EnhancedTaskManager: setCurrentTranscript called, new state should be:', transcript);
    onTranscript(transcript); // Pass it up to parent
  };

  const loadTasks = async () => {
    setLoading(true);
    try {
      const fetchedTasks = await getTasks();
      
      // Only add mock data if no real tasks exist
      if (fetchedTasks.length === 0) {
        // Generate some demo tasks for first time users
        const demoTasks = [
          {
            id: 'demo-1',
            title: 'Welcome to Task Voice Manager!',
            notes: 'This is a demo task. Try editing it or creating new ones with voice commands.',
            completed: false,
            dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            assignee: 'You',
            priority: 'medium' as any,
            tags: ['demo', 'welcome'],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'demo-2',
            title: 'Try voice commands',
            notes: 'Click the microphone and say something like "Create a task to review the quarterly report by next Friday"',
            completed: false,
            dueDate: null,
            assignee: null,
            priority: 'high' as any,
            tags: ['voice', 'demo'],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ];
        
        // Save demo tasks to localStorage immediately
        if (typeof window !== 'undefined' && (process.env.NODE_ENV === 'development' || window.location.search.includes('skipauth'))) {
          localStorage.setItem('dev_tasks', JSON.stringify(demoTasks));
        }
        
        setTasks(demoTasks);
      } else {
        setTasks(fetchedTasks);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
      setSnackbar({ open: true, message: 'Error loading tasks', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleTaskUpdate = async (taskId: string, updates: Partial<Task>) => {
    try {
      await updateTask(taskId, updates);
      await loadTasks();
      setSnackbar({ open: true, message: 'Task updated successfully', severity: 'success' });
    } catch (error) {
      console.error('Error updating task:', error);
      setSnackbar({ open: true, message: 'Error updating task', severity: 'error' });
    }
  };

  const handleTaskComplete = async (task: Task) => {
    await handleTaskUpdate(task.id, { completed: !task.completed });
  };

  const handleTaskDelete = async (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(taskId);
        await loadTasks();
        setSnackbar({ open: true, message: 'Task deleted successfully', severity: 'success' });
      } catch (error) {
        console.error('Error deleting task:', error);
        setSnackbar({ open: true, message: 'Error deleting task', severity: 'error' });
      }
    }
  };

  const startInlineEdit = (taskId: string, field: string, currentValue: string) => {
    setEditingTaskId(taskId);
    setEditingField(field);
    setEditValue(currentValue);
  };

  const saveInlineEdit = async () => {
    if (editingTaskId && editingField) {
      try {
        await handleTaskUpdate(editingTaskId, { [editingField]: editValue });
        setEditingTaskId(null);
        setEditingField(null);
        setEditValue('');
      } catch (error) {
        console.error('Error saving inline edit:', error);
      }
    }
  };

  const cancelInlineEdit = () => {
    setEditingTaskId(null);
    setEditingField(null);
    setEditValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveInlineEdit();
    } else if (e.key === 'Escape') {
      cancelInlineEdit();
    }
  };

  const isEditing = (taskId: string, field: string) => {
    return editingTaskId === taskId && editingField === field;
  };

  const handleDateChange = async (taskId: string, newDate: string) => {
    try {
      const isoDate = newDate ? new Date(newDate).toISOString() : null;
      await handleTaskUpdate(taskId, { dueDate: isoDate });
    } catch (error) {
      console.error('Error updating date:', error);
    }
  };

  const handlePriorityChange = async (taskId: string, newPriority: Priority) => {
    try {
      await handleTaskUpdate(taskId, { priority: newPriority });
      setPriorityMenuOpen(false);
      setPriorityAnchorEl(null);
      setPriorityTaskId(null);
    } catch (error) {
      console.error('Error updating priority:', error);
    }
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

  const filteredTasks = tasks.filter(task => {
    const searchLower = searchFilter.toLowerCase();
    const matchesSearch = searchFilter === '' || 
      task.title.toLowerCase().includes(searchLower) ||
      (task.notes && task.notes.toLowerCase().includes(searchLower)) ||
      (task.assignee && task.assignee.toLowerCase().includes(searchLower)) ||
      task.priority.toLowerCase().includes(searchLower) ||
      task.tags.some(tag => tag.toLowerCase().includes(searchLower));
      
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'today' && task.dueDate && isToday(parseISO(task.dueDate))) ||
      (statusFilter === 'tomorrow' && task.dueDate && isTomorrow(parseISO(task.dueDate))) ||
      (statusFilter === 'overdue' && task.dueDate && isPast(parseISO(task.dueDate)) && !task.completed) ||
      (statusFilter === 'completed' && task.completed);
    return matchesSearch && matchesStatus;
  });

  return (
    <Box sx={{ 
      bgcolor: theme.palette.background.default,
      color: theme.palette.text.primary,
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      maxWidth: '100%',
      px: { xs: 1, sm: 2, md: 3 },
      overflow: 'hidden',
      transition: 'background-color 0.3s ease, color 0.3s ease'
    }}>

      {/* Task Input Section */}
      <Box sx={{ 
        flexShrink: 0,
        mb: 1.5,
        mx: 2
      }}>
        {!isMobile && (
          <Box sx={{ 
            mb: 1.5
          }}>
            <TaskInput 
              onTaskAdded={loadTasks}
              transcript={currentTranscript}
            />
          </Box>
        )}

        {/* Filter Section */}
        <Box>
          <TaskFilters
            searchFilter={searchFilter}
            statusFilter={statusFilter}
            onSearchChange={setSearchFilter}
            onStatusFilterChange={setStatusFilter}
          />
        </Box>
      </Box>

      {/* Tasks Section */}
      <Box sx={{ 
        flex: 1,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
            <CircularProgress />
          </Box>
        ) : filteredTasks.length === 0 ? (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center', 
            alignItems: 'center', 
            flex: 1,
            gap: 2
          }}>
            <Typography variant="h6" color="text.secondary">
              No tasks found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchFilter || statusFilter !== 'all' 
                ? 'Try adjusting your filters or search term' 
                : 'Create your first task using the input above or voice commands'}
            </Typography>
          </Box>
        ) : (
          // Desktop Table View
          <Box sx={{ 
            mx: 2, 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column',
            borderRadius: '12px',
            border: '1px solid',
            borderColor: theme.palette.divider,
            bgcolor: theme.palette.background.paper,
            boxShadow: theme.palette.mode === 'dark' 
              ? '0 4px 20px rgba(0, 0, 0, 0.4), 0 1px 3px rgba(0, 0, 0, 0.6)' 
              : '0 4px 20px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.12)',
            overflow: 'hidden'
          }}>
            {/* Static Table Header */}
            <Table sx={{ tableLayout: 'fixed' }}>
              <TableHead>
                <TableRow>
                  <TableCell 
                    sx={{ 
                      bgcolor: mode === 'dark' ? '#1e1e1e' : theme.palette.primary.main,
                      color: mode === 'dark' ? theme.palette.text.primary : '#ffffff',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      width: '40%'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckIcon fontSize="small" />
                      Task
                    </Box>
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      bgcolor: mode === 'dark' ? '#1e1e1e' : theme.palette.primary.main,
                      color: mode === 'dark' ? theme.palette.text.primary : '#ffffff',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      width: '12%'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarTodayIcon fontSize="small" />
                      Due Date
                    </Box>
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      bgcolor: mode === 'dark' ? '#1e1e1e' : theme.palette.primary.main,
                      color: mode === 'dark' ? theme.palette.text.primary : '#ffffff',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      width: '12%'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PersonIcon fontSize="small" />
                      Assignee
                    </Box>
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      bgcolor: mode === 'dark' ? '#1e1e1e' : theme.palette.primary.main,
                      color: mode === 'dark' ? theme.palette.text.primary : '#ffffff',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      width: '10%'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <FlagIcon fontSize="small" />
                      Priority
                    </Box>
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      bgcolor: mode === 'dark' ? '#1e1e1e' : theme.palette.primary.main,
                      color: mode === 'dark' ? theme.palette.text.primary : '#ffffff',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      width: '12%'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocalOfferIcon fontSize="small" />
                      Tags
                    </Box>
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      bgcolor: mode === 'dark' ? '#1e1e1e' : theme.palette.primary.main,
                      color: mode === 'dark' ? theme.palette.text.primary : '#ffffff',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      width: '14%'
                    }}
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
            </Table>
            
            {/* Scrollable Table Body */}
            <Box sx={{ 
              flex: 1, 
              overflow: 'auto',
              '&::-webkit-scrollbar': {
                display: 'none'
              },
              '-ms-overflow-style': 'none',
              'scrollbar-width': 'none'
            }}>
              <Table sx={{ tableLayout: 'fixed' }}>
                <TableBody>
                {filteredTasks.map((task) => (
                  <TableRow 
                    key={task.id}
                    sx={{
                      bgcolor: task.completed 
                        ? alpha(theme.palette.success.main, 0.1)
                        : 'transparent',
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.05)
                      },
                      height: 56,
                    }}
                  >
                    <TableCell padding="checkbox" sx={{ width: '40%' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Checkbox
                          checked={task.completed}
                          onChange={() => handleTaskComplete(task)}
                          sx={{
                            color: 'text.secondary',
                            padding: '8px',
                            '&.Mui-checked': {
                              color: 'primary.main',
                            },
                            '& .MuiSvgIcon-root': {
                              fontSize: '1.3rem',
                            },
                          }}
                        />
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Typography
                            variant="h6"
                            sx={{
                              fontSize: { xs: '1rem', sm: '1.05rem' },
                              fontWeight: 600,
                              textDecoration: task.completed ? 'line-through' : 'none',
                              color: task.completed 
                                ? theme.palette.text.secondary
                                : theme.palette.text.primary,
                              opacity: task.completed ? 0.7 : 1,
                              wordBreak: 'break-word',
                              lineHeight: 1.4,
                              letterSpacing: '-0.01em',
                            }}
                          >
                            {task.title}
                          </Typography>
                          {task.notes && (
                            <Typography 
                              variant="caption" 
                              sx={{
                                display: 'block',
                                color: 'text.secondary',
                                mt: 0.5
                              }}
                            >
                              {task.notes.length > 60 ? task.notes.substring(0, 60) + '...' : task.notes}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ width: '12%' }}>
                      {task.dueDate ? (
                        <Chip
                          size="small"
                          label={formatDate(task.dueDate)}
                          color={isPast(parseISO(task.dueDate)) && !task.completed ? 'error' : 'default'}
                          sx={{ fontSize: '0.75rem' }}
                        />
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          No due date
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell sx={{ width: '12%' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar
                          sx={{ 
                            width: 24, 
                            height: 24, 
                            fontSize: '0.75rem',
                            bgcolor: theme.palette.primary.main 
                          }}
                        >
                          {task.assignee ? task.assignee.charAt(0).toUpperCase() : '?'}
                        </Avatar>
                        <Typography variant="caption" color="text.primary">
                          {task.assignee || 'Unassigned'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ width: '10%' }}>
                      <Chip
                        size="small"
                        icon={getPriorityIcon(task.priority)}
                        label={task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                        sx={{
                          bgcolor: alpha(getPriorityColor(task.priority), 0.1),
                          color: getPriorityColor(task.priority),
                          fontWeight: 500,
                          fontSize: '0.75rem'
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ width: '12%' }}>
                      <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap' }}>
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
                    <TableCell sx={{ width: '14%' }}>
                      <Stack direction="row" spacing={0.5}>
                        <Tooltip title="View Details">
                          <IconButton 
                            size="small" 
                            sx={{ color: 'text.secondary' }}
                            onClick={() => {
                              setTaskToView(task);
                              setDetailsDialogOpen(true);
                            }}
                          >
                            <InfoIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Task">
                          <IconButton 
                            size="small" 
                            sx={{ color: 'text.secondary' }}
                            onClick={() => {
                              setTaskToEdit(task);
                              setEditDialogOpen(true);
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Task">
                          <IconButton 
                            size="small" 
                            sx={{ color: 'error.main' }}
                            onClick={() => handleTaskDelete(task.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              </Table>
            </Box>
          </Box>
        )}
      </Box>

      {/* Edit Dialog */}
      <TaskEditDialog
        open={editDialogOpen}
        task={taskToEdit}
        onClose={() => {
          setEditDialogOpen(false);
          setTaskToEdit(null);
        }}
        onSave={async (updatedTask) => {
          if (taskToEdit) {
            await handleTaskUpdate(taskToEdit.id, updatedTask);
            setEditDialogOpen(false);
            setTaskToEdit(null);
          }
        }}
      />

      {/* Details Dialog */}
      <TaskDetailsDialog
        open={detailsDialogOpen}
        task={taskToView}
        onClose={() => {
          setDetailsDialogOpen(false);
          setTaskToView(null);
        }}
        onEdit={() => {
          setDetailsDialogOpen(false);
          setTaskToEdit(taskToView);
          setTaskToView(null);
          setEditDialogOpen(true);
        }}
      />

      {/* Priority Menu */}
      <Menu
        anchorEl={priorityAnchorEl}
        open={priorityMenuOpen}
        onClose={() => {
          setPriorityMenuOpen(false);
          setPriorityAnchorEl(null);
          setPriorityTaskId(null);
        }}
      >
        {['low', 'medium', 'high', 'urgent'].map((priority) => (
          <MenuItem
            key={priority}
            onClick={() => priorityTaskId && handlePriorityChange(priorityTaskId, priority as Priority)}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {getPriorityIcon(priority)}
              <Typography>{priority.charAt(0).toUpperCase() + priority.slice(1)}</Typography>
            </Box>
          </MenuItem>
        ))}
      </Menu>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Mobile FAB for adding tasks */}
      {isMobile && (
        <Fab
          color="primary"
          sx={{
            position: 'absolute',
            bottom: 16,
            right: 16,
            zIndex: 1000
          }}
          onClick={() => {
            // Handle mobile task creation
          }}
        >
          <AddIcon />
        </Fab>
      )}
    </Box>
  );
};

export default EnhancedTaskManager;