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
}

export function EnhancedTaskList({
  refreshTrigger,
  searchFilter = '',
  statusFilter = 'all',
}: Props) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

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
    field: string;
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

    // Sort by priority and due date
    return filtered.sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      
      const priorityOrder: Record<string, number> = { high: 3, medium: 2, low: 1, none: 0, urgent: 4 };
      if (a.priority !== b.priority) {
        return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
      }

      if (a.dueDate && b.dueDate) {
        return parseISO(a.dueDate).getTime() - parseISO(b.dueDate).getTime();
      }

      return 0;
    });
  }, [tasks, statusFilter, searchFilter]);

  // Handlers
  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, task: Task) => {
    setAnchorEl(event.currentTarget);
    setSelectedTask(task);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTask(null);
  };

  const startEditing = (taskId: string, field: string, value: string) => {
    setEditing({ taskId, field, value });
  };

  const saveEdit = () => {
    if (!editing) return;
    
    onTaskUpdate(editing.taskId, {
      [editing.field]: editing.value
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
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
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2 }}>
        {filteredAndSortedTasks.map((task) => (
          <Paper
            key={task.id}
            elevation={3}
            onClick={(e) => handleCardClick(task, e)}
            sx={{
              p: 2,
              borderRadius: 2,
              borderLeft: `5px solid ${getPriorityColor(task.priority)}`,
              opacity: task.completed ? 0.65 : 1,
              bgcolor: theme.palette.mode === 'dark' ? '#2a2a2a' : '#ffffff',
              border: `1px solid ${theme.palette.mode === 'dark' ? '#404040' : '#e0e0e0'}`,
              boxShadow: theme.palette.mode === 'dark' 
                ? '0 4px 12px rgba(0, 0, 0, 0.3)' 
                : '0 2px 8px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.2s ease-in-out',
              cursor: 'pointer',
              '&:hover': { 
                elevation: 4,
                transform: 'translateY(-1px)',
                boxShadow: theme.palette.mode === 'dark' 
                  ? '0 6px 16px rgba(0, 0, 0, 0.4)' 
                  : '0 4px 12px rgba(0, 0, 0, 0.15)'
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, minHeight: 'auto' }}>
              <Checkbox
                checked={task.completed}
                onChange={(e) => onTaskToggle(task.id, e.target.checked)}
                sx={{ 
                  mt: -0.5, 
                  ml: -1, 
                  '& .MuiSvgIcon-root': { fontSize: 20 }
                }}
              />
              
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant="h6"
                  sx={{
                    textDecoration: task.completed ? 'line-through' : 'none',
                    wordBreak: 'break-word',
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    lineHeight: 1.3,
                    color: theme.palette.mode === 'dark' ? '#ffffff' : '#1a1a1a',
                    mb: 0.5
                  }}
                >
                  {task.title}
                </Typography>
                
                {(task.dueDate || task.assignee) && (
                  <Box sx={{ mt: 0.75, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                    {task.dueDate && getDueDateChip(task.dueDate)}
                    {task.assignee && (
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: theme.palette.text.secondary,
                          fontSize: '0.875rem',
                          fontWeight: 500
                        }}
                      >
                        👤 {task.assignee}
                      </Typography>
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
                        variant="outlined"
                        sx={{
                          height: 24,
                          fontSize: '0.75rem',
                          fontWeight: 500,
                          borderRadius: '12px',
                          '& .MuiChip-label': {
                            px: 1.5
                          }
                        }}
                      />
                    ))}
                  </Box>
                )}
              </Box>
              
              <IconButton
                size="small"
                onClick={(e) => handleMenuClick(e, task)}
              >
                <MoreVert />
              </IconButton>
            </Box>
          </Paper>
        ))}

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

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onClose={handleEditDialogClose} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>Edit Task</DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
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
            <Button onClick={handleEditDialogClose} color="inherit">Cancel</Button>
            <Button 
              onClick={handleEditDialogSave} 
              variant="contained" 
              disabled={!editForm.title.trim()}
              sx={{ minWidth: 80 }}
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
      </Box>
    );
  }

  // Desktop Table Layout
  return (
    <Box sx={{ position: 'relative' }}>
      <TableContainer component={Paper} elevation={2}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell 
                padding="checkbox"
                sx={{ 
                  backgroundColor: theme.palette.background.paper,
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  fontWeight: 600
                }}
              >
                <Checkbox disabled />
              </TableCell>
              <TableCell sx={{ 
                backgroundColor: theme.palette.background.paper,
                borderBottom: `1px solid ${theme.palette.divider}`,
                fontWeight: 600,
                color: theme.palette.text.primary
              }}>
                Title
              </TableCell>
              <TableCell sx={{ 
                backgroundColor: theme.palette.background.paper,
                borderBottom: `1px solid ${theme.palette.divider}`,
                fontWeight: 600,
                color: theme.palette.text.primary
              }}>
                Due Date
              </TableCell>
              <TableCell sx={{ 
                backgroundColor: theme.palette.background.paper,
                borderBottom: `1px solid ${theme.palette.divider}`,
                fontWeight: 600,
                color: theme.palette.text.primary
              }}>
                Assignee
              </TableCell>
              <TableCell sx={{ 
                backgroundColor: theme.palette.background.paper,
                borderBottom: `1px solid ${theme.palette.divider}`,
                fontWeight: 600,
                color: theme.palette.text.primary
              }}>
                Priority
              </TableCell>
              <TableCell sx={{ 
                backgroundColor: theme.palette.background.paper,
                borderBottom: `1px solid ${theme.palette.divider}`,
                fontWeight: 600,
                color: theme.palette.text.primary
              }}>
                Tags
              </TableCell>
              <TableCell 
                align="right" 
                sx={{ 
                  backgroundColor: theme.palette.background.paper,
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  fontWeight: 600,
                  color: theme.palette.text.primary
                }}
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAndSortedTasks.map((task) => (
              <TableRow
                key={task.id}
                sx={{
                  opacity: task.completed ? 0.6 : 1,
                  '&:hover': { backgroundColor: 'action.hover' },
                }}
              >
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={task.completed}
                    onChange={(e) => onTaskToggle(task.id, e.target.checked)}
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
                        }}
                        onClose={saveEdit}
                        slotProps={{
                          textField: {
                            size: 'small',
                            variant: 'standard',
                            autoFocus: true,
                            onKeyDown: (e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                saveEdit();
                              }
                              if (e.key === 'Escape') {
                                e.preventDefault();
                                cancelEdit();
                              }
                            }
                          }
                        }}
                      />
                    </LocalizationProvider>
                  ) : (
                    <span
                      onClick={() => startEditing(task.id, 'dueDate', task.dueDate || '')}
                      style={{ cursor: 'pointer' }}
                    >
                      {getDueDateChip(task.dueDate) || (
                        <Typography variant="body2" color="text.disabled">
                          Set date
                        </Typography>
                      )}
                    </span>
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
                  <Chip
                    label={task.priority}
                    size="small"
                    sx={{
                      backgroundColor: getPriorityColor(task.priority),
                      color: 'white',
                      '&:hover': {
                        backgroundColor: getPriorityColor(task.priority),
                        opacity: 0.8,
                      }
                    }}
                  />
                </TableCell>
                
                <TableCell>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {task.tags?.map((tag, index) => (
                      <Chip key={index} label={tag} size="small" variant="outlined" />
                    ))}
                  </Box>
                </TableCell>
                
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuClick(e, task)}
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
    </Box>
  );
}