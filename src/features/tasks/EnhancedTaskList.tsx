'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
  Checkbox,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Typography,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Snackbar,
  Alert,
  useTheme,
  useMediaQuery,
  Tooltip,
  Fab,
  Card,
  CardContent,
  CardActions,
  FormControl,
  InputLabel,
  Select,
  Grid,
  Divider,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import {
  MoreVert,
  Delete,
  Edit,
  Info,
  ContentCopy,
  Add,
  Assignment as TaskIcon,
  Event as EventIcon,
  Person as PersonIcon,
  PriorityHigh as PriorityIcon,
  LocalOffer as TagIcon,
} from '@mui/icons-material';
import { format, parseISO, isToday, isTomorrow, isThisWeek } from 'date-fns';
import { getTasks, updateTask, deleteTask } from '@/lib/supabase/client';
import { Task } from '@/types/task';
import { Priority } from '@/components/tasks/PrioritySelect';

// Types

interface Props {
  refreshTrigger?: number;
  searchFilter?: string;
  statusFilter?: string;
  selectedTasks?: Set<string>;
  onSelectedTasksChange?: (tasks: Set<string>) => void;
  onBulkDelete?: () => Promise<void>;
}

export function EnhancedTaskList({
  refreshTrigger,
  searchFilter = '',
  statusFilter = 'all',
  selectedTasks,
  onSelectedTasksChange,
  onBulkDelete,
}: Props) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<keyof Task>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [priorityMenuAnchor, setPriorityMenuAnchor] = useState<null | HTMLElement>(null);
  const [priorityEditingTask, setPriorityEditingTask] = useState<Task | null>(null);

  // Load tasks from Supabase
  const loadTasks = async () => {
    try {
      setLoading(true);
      const data = await getTasks();
      setTasks(data);
    } catch (error: any) {
      console.error('Failed to load tasks:', error);
      // Don't show error for unauthenticated users
      if (!error?.message?.includes('not authenticated')) {
        setSnackbar({ open: true, message: 'Failed to load tasks', severity: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  // Real API handlers
  const onTaskToggle = async (taskId: string, completed: boolean) => {
    try {
      await updateTask(taskId, { completed });
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId ? { ...task, completed } : task
        )
      );
    } catch (error) {
      console.error('Failed to toggle task:', error);
      setSnackbar({ open: true, message: 'Failed to update task', severity: 'error' });
    }
  };

  const onTaskUpdate = async (taskId: string, updates: Partial<Task>) => {
    try {
      await updateTask(taskId, updates);
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId ? { ...task, ...updates } : task
        )
      );
    } catch (error) {
      console.error('Failed to update task:', error);
      setSnackbar({ open: true, message: 'Failed to update task', severity: 'error' });
    }
  };

  const onTaskDelete = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
    } catch (error) {
      console.error('Failed to delete task:', error);
      setSnackbar({ open: true, message: 'Failed to delete task', severity: 'error' });
    }
  };

  const onTaskCreate = (newTask: Omit<Task, 'id'>) => {
    // This will be handled by TaskInput component
    loadTasks(); // Refresh tasks after creation
  };
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // State
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editing, setEditing] = useState<{
    taskId: string;
    field: 'title' | 'dueDate' | 'assignee' | 'tags';
    value: string;
  } | null>(null);
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [selectedTaskForInfo, setSelectedTaskForInfo] = useState<Task | null>(null);
  const [taskNotes, setTaskNotes] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    dueDate: '',
    assignee: '',
    priority: 'medium',
    notes: '',
    tags: [] as string[]
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  // Load tasks on mount and refresh
  useEffect(() => {
    loadTasks();
  }, [refreshTrigger]);

  // Filter and search logic
  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasks;

    // Apply search filter
    if (searchFilter?.trim()) {
      const query = searchFilter.toLowerCase();
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(query) ||
        task.assignee?.toLowerCase().includes(query) ||
        task.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Apply status filter
    if (statusFilter && statusFilter !== 'all') {
      filtered = filtered.filter(task => {
        if (statusFilter === 'completed') return task.completed;
        if (statusFilter === 'pending') return !task.completed;
        if (statusFilter === 'today' && task.dueDate) {
          return isToday(parseISO(task.dueDate)) && !task.completed;
        }
        if (statusFilter === 'tomorrow' && task.dueDate) {
          return isTomorrow(parseISO(task.dueDate)) && !task.completed;
        }
        if (statusFilter === 'thisWeek' && task.dueDate) {
          return isThisWeek(parseISO(task.dueDate)) && !task.completed;
        }
        if (statusFilter === 'overdue' && task.dueDate) {
          const dueDate = parseISO(task.dueDate);
          return dueDate < new Date() && !task.completed;
        }
        return true;
      });
    }

    // Sort by selected column and order
    return filtered.sort((a, b) => {
      // Always show completed tasks at bottom unless sorting by completed status
      if (sortBy !== 'completed' && a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }

      let aValue: any = a[sortBy];
      let bValue: any = b[sortBy];

      // Handle different data types
      if (sortBy === 'dueDate') {
        aValue = aValue ? parseISO(aValue).getTime() : 0;
        bValue = bValue ? parseISO(bValue).getTime() : 0;
      } else if (sortBy === 'priority') {
        const priorityOrder: Record<string, number> = { urgent: 4, high: 3, medium: 2, low: 1 };
        aValue = priorityOrder[aValue] || 0;
        bValue = priorityOrder[bValue] || 0;
      } else if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
        aValue = aValue ? new Date(aValue).getTime() : 0;
        bValue = bValue ? new Date(bValue).getTime() : 0;
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = (bValue || '').toLowerCase();
      }

      // Apply sort order
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [tasks, statusFilter, searchFilter, sortBy, sortOrder]);

  // Handlers
  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, task: Task) => {
    setAnchorEl(event.currentTarget);
    setSelectedTask(task);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTask(null);
  };

  const startEditing = (taskId: string, field: 'title' | 'dueDate' | 'assignee' | 'tags', value: string) => {
    setEditing({ taskId, field, value });
  };

  const handlePriorityClick = (event: React.MouseEvent<HTMLElement>, task: Task) => {
    setPriorityMenuAnchor(event.currentTarget);
    setPriorityEditingTask(task);
  };

  const handlePriorityMenuClose = () => {
    setPriorityMenuAnchor(null);
    setPriorityEditingTask(null);
  };

  const handlePriorityChange = (newPriority: Priority) => {
    if (priorityEditingTask) {
      onTaskUpdate(priorityEditingTask.id, { priority: newPriority });
    }
    handlePriorityMenuClose();
  };

  const saveEdit = () => {
    if (!editing) return;
    
    let updateValue: any = editing.value;
    
    // Handle tags - convert comma-separated string to array
    if (editing.field === 'tags') {
      updateValue = editing.value
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
    }
    
    onTaskUpdate(editing.taskId, {
      [editing.field]: updateValue
    });
    setEditing(null);
  };

  const cancelEdit = () => {
    setEditing(null);
  };

  const handleInfoDialogSave = () => {
    if (selectedTaskForInfo) {
      onTaskUpdate(selectedTaskForInfo.id, { notes: taskNotes });
      setInfoDialogOpen(false);
      setSnackbar({ open: true, message: 'Task notes updated', severity: 'success' });
    }
  };

  const handleCardClick = (task: Task, event: React.MouseEvent) => {
    // Don't open edit dialog if clicking on checkbox or menu button
    const target = event.target as HTMLElement;
    if (target.closest('.MuiCheckbox-root') || target.closest('.MuiIconButton-root')) {
      return;
    }
    
    setEditingTask(task);
    setEditForm({
      title: task.title,
      dueDate: task.dueDate || '',
      assignee: task.assignee || '',
      priority: task.priority,
      notes: task.notes || '',
      tags: task.tags || []
    });
    setEditDialogOpen(true);
  };

  const handleEditDialogSave = () => {
    if (editingTask) {
      onTaskUpdate(editingTask.id, {
        title: editForm.title,
        dueDate: editForm.dueDate || undefined,
        assignee: editForm.assignee || undefined,
        priority: editForm.priority as Priority,
        notes: editForm.notes,
        tags: editForm.tags.filter(tag => tag.trim() !== '')
      });
      setEditDialogOpen(false);
      setSnackbar({ open: true, message: 'Task updated successfully', severity: 'success' });
    }
  };

  const handleEditDialogClose = () => {
    setEditDialogOpen(false);
    setEditingTask(null);
  };

  // Selection handlers
  const handleSelectTask = (taskId: string, checked: boolean) => {
    if (!onSelectedTasksChange || !selectedTasks) return;
    
    const newSelected = new Set(selectedTasks);
    if (checked) {
      newSelected.add(taskId);
    } else {
      newSelected.delete(taskId);
    }
    onSelectedTasksChange(newSelected);
  };

  const handleSelectAllTasks = (checked: boolean) => {
    if (!onSelectedTasksChange) return;
    
    if (checked) {
      const allTaskIds = new Set(filteredAndSortedTasks.map(task => task.id));
      onSelectedTasksChange(allTaskIds);
    } else {
      onSelectedTasksChange(new Set());
    }
  };

  const handleBulkDeleteInternal = async () => {
    if (!selectedTasks || !onSelectedTasksChange) return;
    
    try {
      const deletePromises = Array.from(selectedTasks).map(taskId => onTaskDelete(taskId));
      await Promise.all(deletePromises);
      onSelectedTasksChange(new Set());
      setSnackbar({ open: true, message: `${selectedTasks.size} tasks deleted`, severity: 'success' });
    } catch (error) {
      console.error('Failed to delete tasks:', error);
      setSnackbar({ open: true, message: 'Failed to delete some tasks', severity: 'error' });
    }
  };

  const handleSort = (column: keyof Task) => {
    const isCurrentColumn = sortBy === column;
    const newOrder = isCurrentColumn && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortBy(column);
    setSortOrder(newOrder);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return '#d32f2f'; // Dark red for urgent
      case 'high': return theme.palette.error.main;
      case 'medium': return theme.palette.warning.main;
      case 'low': return theme.palette.success.main;
      default: return theme.palette.grey[500];
    }
  };

  const getDueDateChip = (dueDate?: string | null) => {
    if (!dueDate) return null;
    
    const date = parseISO(dueDate);
    const now = new Date();
    
    let color: 'default' | 'primary' | 'error' | 'warning' = 'default';
    let label = format(date, 'MMM dd');
    
    if (isToday(date)) {
      color = 'primary';
      label = 'Today';
    } else if (isTomorrow(date)) {
      color = 'primary';
      label = 'Tomorrow';
    } else if (date < now) {
      color = 'error';
      label = `${label} (Overdue)`;
    }
    
    return <Chip label={label} size="small" color={color} />;
  };


  // Mobile Card Layout
  if (isMobile) {

    return (
      <>
        <Box sx={{ px: 1 }}>
          {filteredAndSortedTasks.map((task, index) => (
            <React.Fragment key={task.id}>
              <Card 
                sx={{ 
                  mx: 0,
                  mb: 0.25,
                  minHeight: 140,
                  borderRadius: 3,
                  cursor: 'pointer',
                  bgcolor: 'background.paper',
                  boxShadow: theme.palette.mode === 'dark'
                    ? '0 2px 8px rgba(0,0,0,0.3)'
                    : '0 2px 8px rgba(0,0,0,0.1)',
                  border: theme.palette.mode === 'dark'
                    ? '1px solid rgba(255,255,255,0.12)'
                    : '1px solid rgba(0,0,0,0.08)',
                  position: 'relative',
                  transform: 'translateZ(0) scale(1)',
                  '&:hover': {
                    transform: 'translateY(-1px) translateZ(0)',
                    boxShadow: theme.palette.mode === 'dark'
                      ? '0 4px 12px rgba(0,0,0,0.4)'
                      : '0 4px 12px rgba(0,0,0,0.15)',
                  },
                  '&:active': {
                    transform: 'translateY(-1px) translateZ(0) scale(0.98)',
                    transition: 'all 0.1s ease'
                  },
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                onClick={(e) => handleCardClick(task, e)}
              >
                
                {/* Task Card Content */}
                <CardContent
                  sx={{
                    position: 'relative',
                    opacity: task.completed ? 0.65 : 1,
                    display: 'flex',
                    flexDirection: 'column',
                    p: 2.5,
                    '&:last-child': { pb: 2.5 }
                  }}
                >
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography
                            variant="h6"
                            sx={{
                              textDecoration: task.completed ? 'line-through' : 'none',
                              fontSize: '0.95rem',
                              fontWeight: 600,
                              lineHeight: 1.3,
                              color: theme.palette.mode === 'dark' ? '#ffffff' : '#1a1a1a',
                              flex: 1,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {task.title}
                          </Typography>
                          <Chip
                            label={task.priority}
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: '0.7rem',
                              fontWeight: 600,
                              bgcolor: getPriorityColor(task.priority),
                              color: 'white',
                              textTransform: 'uppercase',
                              '& .MuiChip-label': { px: 1 }
                            }}
                          />
                        </Box>
                        
                        {(task.dueDate || task.assignee) && (
                          <Box sx={{ mt: 0.75, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                            {task.dueDate && getDueDateChip(task.dueDate)}
                            {task.assignee && (
                              <Chip
                                icon={<PersonIcon sx={{ fontSize: '0.9rem' }} />}
                                label={task.assignee}
                                size="small"
                                variant="outlined"
                                sx={{
                                  height: 24,
                                  fontSize: '0.75rem',
                                  fontWeight: 500,
                                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                                  borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.12)',
                                  '& .MuiChip-label': { px: 1 }
                                }}
                              />
                            )}
                          </Box>
                        )}
                        
                        {task.tags && task.tags.length > 0 && (
                          <Box sx={{ mt: 0.75, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {task.tags.map((tag, index) => (
                              <Chip 
                                key={index} 
                                label={tag} 
                                size="small"
                                sx={{
                                  height: 24,
                                  fontSize: '0.7rem',
                                  fontWeight: 500,
                                  borderRadius: '12px',
                                  bgcolor: '#2196f3',
                                  color: 'white',
                                  '& .MuiChip-label': {
                                    px: 1.5
                                  }
                                }}
                              />
                            ))}
                          </Box>
                        )}
                      </Box>
              </CardContent>
              </Card>
              </React.Fragment>
            ))}
        </Box>

        {/* Edit Dialog */}
        <Dialog 
          open={editDialogOpen} 
          onClose={handleEditDialogClose} 
          maxWidth="sm" 
          fullWidth
          PaperProps={{
            sx: { 
              borderRadius: 2,
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              m: 0,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
            }
          }}
        >
          <DialogContent sx={{ p: 2.5 }}>
            <Typography variant="h6" gutterBottom sx={{ 
              fontSize: '1.1rem', 
              fontWeight: 600, 
              color: 'primary.main' 
            }}>
              Edit Task
            </Typography>
            <Divider sx={{ mb: 2.5 }} />
            {editingTask && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Title"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    variant="outlined"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Due Date"
                      value={editForm.dueDate ? dayjs(editForm.dueDate) : null}
                      onChange={(newValue) => {
                        const dateString = newValue ? newValue.format('YYYY-MM-DD') : '';
                        setEditForm({ ...editForm, dueDate: dateString });
                      }}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          variant: 'outlined'
                        }
                      }}
                    />
                  </LocalizationProvider>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Priority</InputLabel>
                    <Select
                      value={editForm.priority}
                      label="Priority"
                      onChange={(e) => setEditForm({ ...editForm, priority: e.target.value as any })}
                    >
                      <MenuItem value="low">Low</MenuItem>
                      <MenuItem value="medium">Medium</MenuItem>
                      <MenuItem value="high">High</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Assignee"
                    value={editForm.assignee}
                    onChange={(e) => setEditForm({ ...editForm, assignee: e.target.value })}
                    variant="outlined"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Tags (comma separated)"
                    value={editForm.tags.join(', ')}
                    onChange={(e) => {
                      const tags = e.target.value.split(',').map(tag => tag.trim());
                      setEditForm({ ...editForm, tags });
                    }}
                    variant="outlined"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Notes"
                    value={editForm.notes}
                    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                    variant="outlined"
                  />
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2.5, gap: 1 }}>
            <Button 
              onClick={handleEditDialogClose} 
              variant="outlined"
              sx={{
                color: theme.palette.text.primary,
                borderColor: theme.palette.mode === 'dark' ? '#616161' : 'primary.main',
                '&:hover': {
                  borderColor: theme.palette.mode === 'dark' ? '#757575' : 'primary.dark',
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(97, 97, 97, 0.1)' : 'rgba(25, 118, 210, 0.04)'
                }
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleEditDialogSave} 
              variant="contained" 
              disabled={!editForm.title.trim()}
              sx={{ 
                minWidth: 80,
                background: theme.palette.mode === 'dark'
                  ? 'linear-gradient(180deg, #616161 0%, #424242 100%)'
                  : 'linear-gradient(180deg, #2196F3 0%, #1976D2 100%)',
                color: '#ffffff',
                '&:hover': {
                  background: theme.palette.mode === 'dark'
                    ? 'linear-gradient(180deg, #757575 0%, #616161 100%)'
                    : 'linear-gradient(180deg, #1976D2 0%, #1565C0 100%)',
                },
                '&:disabled': {
                  background: theme.palette.mode === 'dark' ? '#2a2a2a' : '#e0e0e0',
                  color: theme.palette.mode === 'dark' ? '#666' : '#999'
                }
              }}
            >
              Save
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </>
    );
  }

  // Desktop Table Layout
  return (
    <>
      <TableContainer 
        component={Paper} 
        sx={{
          borderRadius: 2,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          borderLeft: '1px solid rgba(158, 158, 158, 0.3)',
          borderRight: '1px solid rgba(158, 158, 158, 0.3)', 
          // Stronger shadow around all sides like task input
          boxShadow: '0 0 32px rgba(128, 128, 128, 0.15), 0 0 16px rgba(128, 128, 128, 0.1)',
          elevation: 3,
          maxHeight: 'calc(100vh - 300px)',
          overflow: 'auto',
          transition: 'box-shadow 0.3s ease',
          '&:hover': {
            boxShadow: '0 0 40px rgba(128, 128, 128, 0.2), 0 0 20px rgba(128, 128, 128, 0.15)',
          }
        }}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow sx={{ 
              '& .MuiTableCell-root': {
                background: theme.palette.mode === 'dark' ? 
                  'linear-gradient(to bottom, #424242 0%, #616161 50%, #424242 100%)' : 
                  'linear-gradient(to bottom, #1976d2 0%, #2196F3 50%, #42a5f5 100%)',
                borderBottom: `2px solid ${theme.palette.primary.main}`,
                fontWeight: 600,
                color: '#ffffff', // Pure white for both modes
                '&:first-of-type': {
                  borderTopLeftRadius: 8 // Rounded corners
                },
                '&:last-of-type': {
                  borderTopRightRadius: 8 // Rounded corners
                }
              }
            }}>
              <TableCell padding="checkbox">
                <Checkbox 
                  indeterminate={(selectedTasks?.size || 0) > 0 && (selectedTasks?.size || 0) < filteredAndSortedTasks.length}
                  checked={filteredAndSortedTasks.length > 0 && (selectedTasks?.size || 0) === filteredAndSortedTasks.length}
                  onChange={(e) => handleSelectAllTasks(e.target.checked)}
                  sx={{ 
                    color: theme.palette.mode === 'dark' ? '#e0e0e0' : 'white',
                    '&.Mui-checked': {
                      color: theme.palette.mode === 'dark' ? '#e0e0e0' : 'white'
                    },
                    '&.MuiCheckbox-indeterminate': {
                      color: theme.palette.mode === 'dark' ? '#e0e0e0' : 'white'
                    }
                  }}
                />
              </TableCell>
              <TableCell sx={{ width: '40%' }}>
                <TableSortLabel
                  active={sortBy === 'title'}
                  direction={sortBy === 'title' ? sortOrder : 'asc'}
                  onClick={() => handleSort('title')}
                  sx={{ 
                    color: theme.palette.mode === 'dark' ? '#e0e0e0 !important' : 'white !important', 
                    '& .MuiTableSortLabel-icon': { 
                      color: theme.palette.mode === 'dark' ? '#e0e0e0 !important' : 'white !important' 
                    } 
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TaskIcon sx={{ fontSize: 18 }} />
                    Title
                  </Box>
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortBy === 'dueDate'}
                  direction={sortBy === 'dueDate' ? sortOrder : 'asc'}
                  onClick={() => handleSort('dueDate')}
                  sx={{ 
                    color: theme.palette.mode === 'dark' ? '#e0e0e0 !important' : 'white !important', 
                    '& .MuiTableSortLabel-icon': { 
                      color: theme.palette.mode === 'dark' ? '#e0e0e0 !important' : 'white !important' 
                    } 
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EventIcon sx={{ fontSize: 18 }} />
                    Due Date
                  </Box>
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortBy === 'assignee'}
                  direction={sortBy === 'assignee' ? sortOrder : 'asc'}
                  onClick={() => handleSort('assignee')}
                  sx={{ 
                    color: theme.palette.mode === 'dark' ? '#e0e0e0 !important' : 'white !important', 
                    '& .MuiTableSortLabel-icon': { 
                      color: theme.palette.mode === 'dark' ? '#e0e0e0 !important' : 'white !important' 
                    } 
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonIcon sx={{ fontSize: 18 }} />
                    Assignee
                  </Box>
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortBy === 'priority'}
                  direction={sortBy === 'priority' ? sortOrder : 'asc'}
                  onClick={() => handleSort('priority')}
                  sx={{ 
                    color: theme.palette.mode === 'dark' ? '#e0e0e0 !important' : 'white !important', 
                    '& .MuiTableSortLabel-icon': { 
                      color: theme.palette.mode === 'dark' ? '#e0e0e0 !important' : 'white !important' 
                    } 
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PriorityIcon sx={{ fontSize: 18 }} />
                    Priority
                  </Box>
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortBy === 'tags'}
                  direction={sortBy === 'tags' ? sortOrder : 'asc'}
                  onClick={() => handleSort('tags')}
                  sx={{ 
                    color: theme.palette.mode === 'dark' ? '#e0e0e0 !important' : 'white !important', 
                    '& .MuiTableSortLabel-icon': { 
                      color: theme.palette.mode === 'dark' ? '#e0e0e0 !important' : 'white !important' 
                    } 
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TagIcon sx={{ fontSize: 18 }} />
                    Tags
                  </Box>
                </TableSortLabel>
              </TableCell>
              <TableCell align="center" sx={{ pr: 3 }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAndSortedTasks.map((task) => (
              <TableRow
                key={task.id}
                selected={selectedTasks?.has(task.id) || false}
                sx={{
                  opacity: task.completed ? 0.6 : 1,
                  '&:hover': { 
                    bgcolor: theme.palette.mode === 'dark' 
                      ? 'rgba(128, 128, 128, 0.1)' 
                      : 'rgba(0,0,0,0.04)' 
                  },
                  bgcolor: selectedTasks?.has(task.id) 
                    ? theme.palette.mode === 'dark'
                      ? 'rgba(144, 202, 249, 0.15)'
                      : 'rgba(33, 150, 243, 0.08)'
                    : 'background.paper', // Theme-aware background
                  borderBottom: theme.palette.mode === 'dark' 
                    ? `1px solid rgba(128, 128, 128, 0.2)` 
                    : `1px solid rgba(0,0,0,0.08)` // Theme-aware divider
                }}
              >
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedTasks?.has(task.id) || false}
                    onChange={(e) => handleSelectTask(task.id, e.target.checked)}
                  />
                </TableCell>
                
                <TableCell>
                  <Typography
                    sx={{
                      textDecoration: task.completed ? 'line-through' : 'none',
                      fontWeight: task.completed ? 400 : 500,
                    }}
                  >
                    {editing?.taskId === task.id && editing?.field === 'title' ? (
                      <TextField
                        value={editing.value}
                        onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                        size="small"
                        variant="standard"
                        fullWidth
                        autoFocus
                        onBlur={saveEdit}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            saveEdit();
                          }
                          if (e.key === 'Escape') {
                            e.preventDefault();
                            cancelEdit();
                          }
                        }}
                      />
                    ) : (
                      <span
                        onClick={() => startEditing(task.id, 'title', task.title)}
                        style={{ cursor: 'pointer' }}
                      >
                        {task.title}
                      </span>
                    )}
                  </Typography>
                </TableCell>
                
                <TableCell>
                  {editing?.taskId === task.id && editing?.field === 'dueDate' ? (
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        value={editing.value ? dayjs(editing.value) : null}
                        onChange={(newValue: Dayjs | null) => {
                          const dateString = newValue ? newValue.format('YYYY-MM-DD') : '';
                          setEditing({ ...editing, value: dateString });
                          // Auto-save on date selection
                          setTimeout(() => saveEdit(), 100);
                        }}
                        open={true}
                        onClose={saveEdit}
                        slotProps={{
                          textField: {
                            size: 'small',
                            variant: 'standard',
                            sx: { width: 120 }
                          },
                          popper: {
                            placement: 'bottom-start'
                          }
                        }}
                      />
                    </LocalizationProvider>
                  ) : (
                    <Box 
                      onClick={() => startEditing(task.id, 'dueDate', task.dueDate || '')}
                      sx={{ 
                        cursor: 'pointer',
                        p: 0.5,
                        borderRadius: 1,
                        '&:hover': { bgcolor: 'action.hover' },
                        minHeight: 32,
                        display: 'flex',
                        alignItems: 'center',
                        userSelect: 'none'
                      }}
                    >
                      {getDueDateChip(task.dueDate) || (
                        <Typography variant="body2" color="text.disabled">
                          Set date
                        </Typography>
                      )}
                    </Box>
                  )}
                </TableCell>
                
                <TableCell>
                  {editing?.taskId === task.id && editing?.field === 'assignee' ? (
                    <TextField
                      value={editing.value}
                      onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                      size="small"
                      variant="standard"
                      fullWidth
                      autoFocus
                      onBlur={saveEdit}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          saveEdit();
                        }
                        if (e.key === 'Escape') {
                          e.preventDefault();
                          cancelEdit();
                        }
                      }}
                    />
                  ) : (
                    <span
                      onClick={() => startEditing(task.id, 'assignee', task.assignee || '')}
                      style={{ cursor: 'pointer' }}
                    >
                      {task.assignee || (
                        <Typography variant="body2" color="text.disabled">
                          Unassigned
                        </Typography>
                      )}
                    </span>
                  )}
                </TableCell>
                
                <TableCell>
                  <Box 
                    sx={{ 
                      p: 0.5,
                      borderRadius: 1,
                      minHeight: 32,
                      display: 'flex',
                      alignItems: 'center',
                      userSelect: 'none'
                    }}
                  >
                    <Chip
                      label={task.priority}
                      size="small"
                      onClick={(e) => handlePriorityClick(e, task)}
                      sx={{
                        backgroundColor: getPriorityColor(task.priority),
                        color: 'white',
                        textTransform: 'capitalize',
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: getPriorityColor(task.priority),
                          opacity: 0.8,
                        }
                      }}
                    />
                  </Box>
                </TableCell>
                
                <TableCell>
                  {editing?.taskId === task.id && editing?.field === 'tags' ? (
                    <TextField
                      value={editing.value}
                      onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                      size="small"
                      variant="standard"
                      fullWidth
                      placeholder="tag1, tag2, tag3"
                      autoFocus
                      onBlur={saveEdit}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          saveEdit();
                        }
                        if (e.key === 'Escape') {
                          e.preventDefault();
                          cancelEdit();
                        }
                      }}
                      sx={{
                        '& .MuiInput-root': {
                          fontSize: 'inherit',
                          color: theme.palette.mode === 'dark' ? '#fff' : '#333',
                          bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                          padding: '4px 8px',
                          borderRadius: 1,
                          border: theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
                          '&:before': { display: 'none' },
                          '&:after': { display: 'none' }
                        }
                      }}
                    />
                  ) : (
                    <Box 
                      onClick={() => startEditing(task.id, 'tags', task.tags?.join(', ') || '')}
                      sx={{ 
                        cursor: 'pointer',
                        p: 0.5,
                        borderRadius: 1,
                        '&:hover': { bgcolor: 'action.hover' },
                        minHeight: 32,
                        display: 'flex',
                        alignItems: 'center',
                        userSelect: 'none'
                      }}
                    >
                      {task.tags && task.tags.length > 0 ? (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {task.tags.map((tag, index) => (
                            <Chip 
                              key={index} 
                              label={tag} 
                              size="small" 
                              variant="outlined"
                              sx={{
                                fontSize: '0.75rem',
                                bgcolor: theme.palette.mode === 'dark' ? 'rgba(144, 202, 249, 0.2)' : 'rgba(33, 150, 243, 0.1)',
                                color: theme.palette.mode === 'dark' ? '#90caf9' : '#1976d2',
                                border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(144, 202, 249, 0.3)' : 'rgba(33, 150, 243, 0.2)'}`,
                                '&:hover': {
                                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(144, 202, 249, 0.3)' : 'rgba(33, 150, 243, 0.2)'
                                }
                              }}
                            />
                          ))}
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.disabled">
                          Add tags
                        </Typography>
                      )}
                    </Box>
                  )}
                </TableCell>
                
                <TableCell align="center" sx={{ pr: 3 }}>
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuClick(e, task)}
                    sx={{ mr: 1 }}
                  >
                    <MoreVert />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          if (selectedTask) {
            setSelectedTaskForInfo(selectedTask);
            setTaskNotes(selectedTask.notes || '');
            setInfoDialogOpen(true);
          }
          handleMenuClose();
        }}>
          <ListItemIcon><Info fontSize="small" /></ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={() => {
          if (selectedTask && onTaskCreate) {
            const duplicateTaskData = {
              title: `${selectedTask.title} (Copy)`,
              dueDate: selectedTask.dueDate,
              assignee: selectedTask.assignee,
              priority: selectedTask.priority,
              tags: selectedTask.tags || [],
              notes: selectedTask.notes,
              completed: false,
              createdAt: new Date().toISOString(),
              updatedAt: null
            };
            onTaskCreate(duplicateTaskData);
            setSnackbar({ open: true, message: 'Task duplicated successfully', severity: 'success' });
          }
          handleMenuClose();
        }}>
          <ListItemIcon><ContentCopy fontSize="small" /></ListItemIcon>
          <ListItemText>Duplicate</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={() => {
          if (selectedTask) {
            onTaskDelete(selectedTask.id);
            setSnackbar({ open: true, message: 'Task deleted', severity: 'success' });
          }
          handleMenuClose();
        }}>
          <ListItemIcon><Delete fontSize="small" /></ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* Priority Menu */}
      <Menu
        anchorEl={priorityMenuAnchor}
        open={Boolean(priorityMenuAnchor)}
        onClose={handlePriorityMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        PaperProps={{
          elevation: 3,
          sx: {
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 1,
            minWidth: 160,
            boxShadow: theme.palette.mode === 'dark' 
              ? '0 4px 20px rgba(0,0,0,0.4)'
              : '0 4px 20px rgba(0,0,0,0.15)'
          }
        }}
      >
        <MenuItem 
          onClick={() => handlePriorityChange('low')}
          sx={{
            color: getPriorityColor('low'),
            '&:hover': {
              backgroundColor: `${getPriorityColor('low')}20`,
            }
          }}
        >
          Low Priority
        </MenuItem>
        <MenuItem 
          onClick={() => handlePriorityChange('medium')}
          sx={{
            color: getPriorityColor('medium'),
            '&:hover': {
              backgroundColor: `${getPriorityColor('medium')}20`,
            }
          }}
        >
          Medium Priority
        </MenuItem>
        <MenuItem 
          onClick={() => handlePriorityChange('high')}
          sx={{
            color: getPriorityColor('high'),
            '&:hover': {
              backgroundColor: `${getPriorityColor('high')}20`,
            }
          }}
        >
          High Priority
        </MenuItem>
        <MenuItem 
          onClick={() => handlePriorityChange('urgent')}
          sx={{
            color: getPriorityColor('urgent'),
            '&:hover': {
              backgroundColor: `${getPriorityColor('urgent')}20`,
            }
          }}
        >
          Urgent Priority
        </MenuItem>
      </Menu>

      {/* Info Dialog */}
      <Dialog open={infoDialogOpen} onClose={() => setInfoDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Task Details</DialogTitle>
        <DialogContent>
          {selectedTaskForInfo && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="h6" gutterBottom>{selectedTaskForInfo.title}</Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">Priority: {selectedTaskForInfo.priority}</Typography>
                {selectedTaskForInfo.dueDate && (
                  <Typography variant="body2" color="text.secondary">
                    Due: {format(parseISO(selectedTaskForInfo.dueDate), 'PPP')}
                  </Typography>
                )}
                {selectedTaskForInfo.assignee && (
                  <Typography variant="body2" color="text.secondary">Assignee: {selectedTaskForInfo.assignee}</Typography>
                )}
              </Box>

              <TextField
                fullWidth
                multiline
                rows={4}
                label="Notes"
                value={taskNotes}
                onChange={(e) => setTaskNotes(e.target.value)}
                variant="outlined"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInfoDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleInfoDialogSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>


      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}

export default EnhancedTaskList;
