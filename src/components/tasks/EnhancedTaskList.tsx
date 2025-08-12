'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Checkbox,
  IconButton,
  TextField,
  Chip,
  Box,
  Paper,
  useTheme,
  useMediaQuery,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Divider
} from '@mui/material';
import {
  Edit,
  Delete,
  Info,
  MoreVert,
  Save,
  Close,
  CalendarToday,
  ContentCopy
} from '@mui/icons-material';
import { format, parseISO, isToday, isTomorrow, isPast, isThisWeek, addWeeks } from 'date-fns';
import { Task } from '@/types/task';
import { getTasks, updateTask, deleteTask, createTask } from '@/lib/supabase/client';
import PrioritySelect, { Priority } from './PrioritySelect';

type SortField = 'title' | 'dueDate' | 'assignee' | 'priority' | 'createdAt';
type SortDirection = 'asc' | 'desc';

interface EditingState {
  taskId: string;
  field: 'title' | 'assignee' | 'dueDate' | 'priority';
  value: string;
}

interface EnhancedTaskListProps {
  refreshTrigger: number;
  searchFilter?: string;
  statusFilter?: string;
}

const EnhancedTaskList: React.FC<EnhancedTaskListProps> = ({
  refreshTrigger,
  searchFilter = '',
  statusFilter = 'all'
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [editing, setEditing] = useState<EditingState | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [selectedTaskForInfo, setSelectedTaskForInfo] = useState<Task | null>(null);
  const [taskNotes, setTaskNotes] = useState('');
  const [isNoteSaving, setIsNoteSaving] = useState(false);
  const [lastSavedNotes, setLastSavedNotes] = useState('');
  const notesDebounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadTasks();
  }, [refreshTrigger]);

  const loadTasks = async () => {
    try {
      console.log('🔄 EnhancedTaskList: Starting loadTasks...');
      const fetchedTasks = await getTasks();
      console.log('📋 EnhancedTaskList: getTasks returned:', fetchedTasks.length, 'tasks');
      console.log('🔍 EnhancedTaskList: First task from getTasks:', fetchedTasks?.[0] ? JSON.stringify(fetchedTasks[0], null, 2) : 'No tasks');
      setTasks(fetchedTasks);
      console.log('✅ EnhancedTaskList: Tasks set in component state');
    } catch (error) {
      console.error('❌ EnhancedTaskList: Error loading tasks:', error);
    }
  };

  const handleSort = (field: SortField) => {
    const isCurrentField = sortField === field;
    const newDirection: SortDirection = isCurrentField && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(newDirection);
  };

  const sortedTasks = React.useMemo(() => {
    console.log('🎯 EnhancedTaskList: Computing sortedTasks, input tasks:', tasks.length);
    console.log('🔍 EnhancedTaskList: First input task:', tasks?.[0] ? JSON.stringify(tasks[0], null, 2) : 'No input tasks');
    let filtered = tasks.filter(task => {
      // Enhanced search functionality
      const matchesSearch = searchFilter === '' || 
        task.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
        (task.assignee?.toLowerCase().includes(searchFilter.toLowerCase()) ?? false) ||
        (task.tags?.some(tag => tag.toLowerCase().includes(searchFilter.toLowerCase())) ?? false) ||
        (task.notes?.toLowerCase().includes(searchFilter.toLowerCase()) ?? false);
      
      // Enhanced status filtering
      if (statusFilter === 'completed') return task.completed && matchesSearch;
      if (statusFilter === 'all') return matchesSearch;
      if (task.completed) return false; // Exclude completed tasks for date-based filters
      
      // Date-based filtering
      if (!task.dueDate) return statusFilter === 'all' && matchesSearch;
      
      try {
        const dueDate = parseISO(task.dueDate);
        const now = new Date();
        
        switch (statusFilter) {
          case 'today':
            return isToday(dueDate) && matchesSearch;
          case 'tomorrow':
            return isTomorrow(dueDate) && matchesSearch;
          case 'thisweek':
            return isThisWeek(dueDate) && matchesSearch;
          case 'nextweek':
            const nextWeekStart = addWeeks(now, 1);
            const nextWeekEnd = addWeeks(now, 2);
            return dueDate >= nextWeekStart && dueDate < nextWeekEnd && matchesSearch;
          case 'overdue':
            return isPast(dueDate) && !isToday(dueDate) && matchesSearch;
          default:
            return matchesSearch;
        }
      } catch (error) {
        console.error('Error parsing date in filter:', task.dueDate, error);
        return statusFilter === 'all' && matchesSearch;
      }
    });

    return filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      if (sortField === 'dueDate') {
        aValue = aValue ? new Date(aValue).getTime() : 0;
        bValue = bValue ? new Date(bValue).getTime() : 0;
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue?.toLowerCase() || '';
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    
    console.log('📋 EnhancedTaskList: Final sortedTasks:', filtered.length);
    console.log('🔍 EnhancedTaskList: First final task:', filtered?.[0] ? JSON.stringify(filtered[0], null, 2) : 'No final tasks');
    return filtered;
  }, [tasks, sortField, sortDirection, searchFilter, statusFilter]);

  const handleToggleComplete = async (task: Task) => {
    try {
      await updateTask(task.id, { completed: !task.completed });
      loadTasks();
      setSnackbar({ open: true, message: `Task ${!task.completed ? 'completed' : 'uncompleted'}`, severity: 'success' });
    } catch (error) {
      console.error('Error updating task:', error);
      setSnackbar({ open: true, message: 'Failed to update task', severity: 'error' });
    }
  };

  const startEditing = (taskId: string, field: 'title' | 'assignee' | 'dueDate' | 'priority', currentValue: string) => {
    // Don't start editing if already editing this field
    if (editing?.taskId === taskId && editing?.field === field) {
      return;
    }
    setEditing({ taskId, field, value: currentValue });
  };

  const saveEdit = async () => {
    if (!editing) return;
    
    try {
      console.log('💾 Saving edit:', editing.field, '=', editing.value, 'for task:', editing.taskId);
      
      const updates: Partial<Task> = {};
      if (editing.field === 'dueDate') {
        updates.dueDate = editing.value || null;
      } else if (editing.field === 'priority') {
        updates.priority = editing.value as Priority;
      } else if (editing.field === 'assignee') {
        updates.assignee = editing.value.trim() || null;
      } else {
        updates[editing.field] = editing.value;
      }
      
      console.log('💾 Updates object:', updates);
      
      const result = await updateTask(editing.taskId, updates);
      console.log('✅ Update successful:', result);
      
      setEditing(null);
      loadTasks();
      setSnackbar({ open: true, message: 'Task updated successfully', severity: 'success' });
    } catch (error) {
      console.error('❌ Error updating task:', error);
      setSnackbar({ open: true, message: `Failed to update task: ${(error as Error).message || String(error)}`, severity: 'error' });
    }
  };

  const cancelEdit = () => {
    setEditing(null);
  };

  const saveNotes = useCallback(async (noteText: string, taskId: string) => {
    if (noteText === lastSavedNotes) return;
    
    console.log('💾 Auto-saving notes for task:', taskId, 'Text length:', noteText.length);
    setIsNoteSaving(true);
    try {
      await updateTask(taskId, { notes: noteText });
      setLastSavedNotes(noteText);
      console.log('✅ Notes saved successfully');
      loadTasks();
    } catch (error) {
      console.error('❌ Auto-save notes failed:', error);
      setSnackbar({ open: true, message: 'Failed to save notes', severity: 'error' });
    } finally {
      setIsNoteSaving(false);
    }
  }, [lastSavedNotes, loadTasks]);

  const debouncedSaveNotes = useCallback((noteText: string, taskId: string) => {
    console.log('⏰ Setting up debounced save for task:', taskId, 'in 2.5 seconds');
    if (notesDebounceRef.current) {
      clearTimeout(notesDebounceRef.current);
    }
    
    notesDebounceRef.current = setTimeout(() => {
      console.log('⏰ Debounce timer fired, saving notes...');
      saveNotes(noteText, taskId);
    }, 2500); // 2.5 second delay
  }, [saveNotes]);

  const handleNotesChange = (value: string) => {
    console.log('📝 Notes changed:', value.length, 'characters');
    setTaskNotes(value);
    if (selectedTaskForInfo) {
      debouncedSaveNotes(value, selectedTaskForInfo.id);
    }
  };

  const handleNotesBlur = () => {
    console.log('👁️ Notes field lost focus, checking if save needed...');
    if (notesDebounceRef.current) {
      clearTimeout(notesDebounceRef.current);
      console.log('⏰ Cleared debounce timer');
    }
    if (selectedTaskForInfo && taskNotes !== lastSavedNotes) {
      console.log('💾 Immediate save on blur');
      saveNotes(taskNotes, selectedTaskForInfo.id);
    } else {
      console.log('⚠️ No save needed - notes unchanged or no task selected');
    }
  };

  const handleDelete = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      loadTasks();
      setAnchorEl(null);
      setSnackbar({ open: true, message: 'Task deleted successfully', severity: 'success' });
    } catch (error) {
      console.error('Error deleting task:', error);
      setSnackbar({ open: true, message: 'Failed to delete task', severity: 'error' });
    }
  };

  const getDueDateChip = (dueDate: string | null) => {
    if (!dueDate) return null;
    
    const date = parseISO(dueDate);
    const today = isToday(date);
    const tomorrow = isTomorrow(date);
    const overdue = isPast(date) && !today;
    
    let color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' = 'default';
    let label = format(date, 'MMM dd');
    
    if (overdue) {
      color = 'error';
      label = 'Overdue';
    } else if (today) {
      color = 'warning';
      label = 'Today';
    } else if (tomorrow) {
      color = 'info';
      label = 'Tomorrow';
    }
    
    return <Chip label={label} color={color} size="small" />;
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'urgent': return theme.palette.mode === 'dark' ? '#ff7043' : '#d32f2f'; // Softer red
      case 'high': return theme.palette.warning.main;
      case 'medium': return theme.palette.info.main;
      case 'low': return theme.palette.success.main;
      default: return theme.palette.grey[500];
    }
  };

  const renderEditableCell = (task: Task, field: 'title' | 'assignee', value: string) => {
    const isEditing = editing?.taskId === task.id && editing?.field === field;
    
    if (isEditing) {
      return (
        <TextField
          value={editing.value}
          onChange={(e) => setEditing({ ...editing, value: e.target.value })}
          size="small"
          variant="standard"
          fullWidth
          sx={{ 
            '& .MuiInput-root': {
              fontSize: 'inherit',
              color: theme.palette.mode === 'dark' ? '#fff' : '#333',
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
              padding: '4px 8px',
              borderRadius: 1,
              border: theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
              '&:before': { display: 'none' },
              '&:after': { display: 'none' },
              '&:hover': {
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)'
              }
            }
          }}
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
          autoFocus
        />
      );
    }
    
    return (
      <Box 
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          startEditing(task.id, field, value);
        }}
        sx={{ 
          cursor: 'pointer',
          p: 0.5,
          borderRadius: 1,
          '&:hover': { bgcolor: 'action.hover' },
          minHeight: 32,
          display: 'flex',
          alignItems: 'center',
          userSelect: 'none' // Prevent text selection on fast clicks
        }}
      >
        {value || <span style={{ color: theme.palette.text.disabled }}>Click to edit</span>}
      </Box>
    );
  };

  const renderDateCell = (task: Task) => {
    const isEditing = editing?.taskId === task.id && editing?.field === 'dueDate';
    
    if (isEditing) {
      return (
        <TextField
          type="date"
          value={editing.value}
          onChange={(e) => setEditing({ ...editing, value: e.target.value })}
          size="small"
          variant="outlined"
          InputLabelProps={{ shrink: true }}
          sx={{ 
            '& .MuiOutlinedInput-root': {
              fontSize: 'inherit',
              color: theme.palette.mode === 'dark' ? '#fff' : '#333',
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
              borderRadius: 1,
              '& fieldset': {
                borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'
              },
              '& input': {
                cursor: 'pointer'
              }
            }
          }}
          onBlur={saveEdit}
          onMouseDown={(e) => {
            e.preventDefault();
            // Force date picker to open immediately
            const input = e.currentTarget as HTMLInputElement;
            setTimeout(() => {
              if ('showPicker' in input && typeof input.showPicker === 'function') {
                input.showPicker();
              } else {
                // Fallback for browsers without showPicker
                input.focus();
                input.click();
              }
            }, 0);
          }}
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
          autoFocus
        />
      );
    }
    
    return (
      <Box 
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          startEditing(task.id, 'dueDate', task.dueDate || '');
        }}
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
        {getDueDateChip(task.dueDate) || <span style={{ color: theme.palette.text.disabled }}>Set date</span>}
      </Box>
    );
  };

  const renderPriorityCell = (task: Task) => {
    const isEditing = editing?.taskId === task.id && editing?.field === 'priority';
    
    if (isEditing) {
      return (
        <Box sx={{ minWidth: 120 }}>
          <PrioritySelect
            value={editing.value as Priority}
            onChange={(value) => {
              setEditing({ ...editing, value });
              // Auto-save on selection change
              setTimeout(() => saveEdit(), 100);
            }}
            autoFocus
          />
        </Box>
      );
    }
    
    return (
      <Box 
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          startEditing(task.id, 'priority', task.priority);
        }}
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
        <Chip 
          label={task.priority}
          size="small"
          sx={{ 
            bgcolor: getPriorityColor(task.priority),
            color: 'white',
            textTransform: 'capitalize'
          }}
        />
      </Box>
    );
  };

  return (
    <Paper sx={{ 
      width: '100%', 
      overflow: 'hidden',
      borderRadius: 2, // Match task input borderRadius
      bgcolor: theme.palette.mode === 'dark' ? '#1a1a1a' : '#ffffff',
      border: theme.palette.mode === 'dark' ? '2px solid rgba(255,255,255,0.2)' : '2px solid rgba(0,0,0,0.1)',
      boxShadow: theme.palette.mode === 'dark' 
        ? '0 8px 32px rgba(0,0,0,0.6)' 
        : '0 4px 20px rgba(0,0,0,0.15)'
    }}>
      <TableContainer sx={{ maxHeight: 'calc(100vh - 300px)' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow sx={{ 
              '& .MuiTableCell-root': {
                bgcolor: theme.palette.mode === 'dark' ? '#2e2e2e' : '#2196F3', // Full blue header
                borderBottom: `2px solid ${theme.palette.primary.main}`,
                fontWeight: 600,
                color: '#fff' // White text for both themes
              }
            }}>
              <TableCell padding="checkbox">
                <Checkbox size="small" />
              </TableCell>
              <TableCell sx={{ width: '30%' }}>
                <TableSortLabel
                  active={sortField === 'title'}
                  direction={sortField === 'title' ? sortDirection : 'asc'}
                  onClick={() => handleSort('title')}
                >
                  Task
                </TableSortLabel>
              </TableCell>
              {!isMobile && (
                <TableCell sx={{ width: '15%' }}>
                  <TableSortLabel
                    active={sortField === 'assignee'}
                    direction={sortField === 'assignee' ? sortDirection : 'asc'}
                    onClick={() => handleSort('assignee')}
                  >
                    Assignee
                  </TableSortLabel>
                </TableCell>
              )}
              <TableCell sx={{ width: '12%' }}>
                <TableSortLabel
                  active={sortField === 'dueDate'}
                  direction={sortField === 'dueDate' ? sortDirection : 'asc'}
                  onClick={() => handleSort('dueDate')}
                >
                  Due Date
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ width: '10%' }}>
                <TableSortLabel
                  active={sortField === 'priority'}
                  direction={sortField === 'priority' ? sortDirection : 'asc'}
                  onClick={() => handleSort('priority')}
                >
                  Priority
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ width: '15%' }}>Tags</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(() => {
              console.log('🎨 EnhancedTaskList: About to render table rows, sortedTasks:', sortedTasks.length);
              console.log('🔍 EnhancedTaskList: First task to render:', sortedTasks?.[0] ? JSON.stringify(sortedTasks[0], null, 2) : 'No tasks to render');
              return null;
            })()}
            {sortedTasks.map((task) => {
              console.log('🏗️ EnhancedTaskList: Rendering row for task:', task.id, 'Title:', task.title);
              return (
              <TableRow
                key={task.id}
                hover
                sx={{ 
                  '&:hover': { bgcolor: 'action.hover' },
                  opacity: task.completed ? 0.6 : 1,
                  bgcolor: theme.palette.mode === 'dark' ? '#2a2a2a' : '#ffffff',
                  borderBottom: `1px solid ${theme.palette.mode === 'dark' ? '#333' : '#e0e0e0'}`
                }}
              >
                <TableCell padding="checkbox">
                  <Checkbox
                    size="small"
                    checked={task.completed}
                    onChange={() => handleToggleComplete(task)}
                  />
                </TableCell>
                <TableCell>
                  {renderEditableCell(task, 'title', task.title)}
                </TableCell>
                {!isMobile && (
                  <TableCell>
                    {renderEditableCell(task, 'assignee', task.assignee || '')}
                  </TableCell>
                )}
                <TableCell>
                  {renderDateCell(task)}
                </TableCell>
                <TableCell>
                  {renderPriorityCell(task)}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {task.tags?.map((tag, index) => (
                      <Chip 
                        key={index}
                        label={tag}
                        size="small"
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
                    )) || <span style={{ color: theme.palette.text.disabled, fontSize: '0.75rem' }}>No tags</span>}
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      setAnchorEl(e.currentTarget);
                      setSelectedTask(task);
                    }}
                  >
                    <MoreVert />
                  </IconButton>
                </TableCell>
              </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => {
          if (selectedTask) {
            setSelectedTaskForInfo(selectedTask);
            const initialNotes = selectedTask.notes || '';
            setTaskNotes(initialNotes);
            setLastSavedNotes(initialNotes);
            setInfoDialogOpen(true);
          }
          setAnchorEl(null);
        }}>
          <ListItemIcon><Info fontSize="small" /></ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          if (selectedTask) {
            // Create a duplicate task
            const duplicateTaskData = {
              title: `${selectedTask.title} (Copy)`,
              dueDate: selectedTask.dueDate,
              assignee: selectedTask.assignee,
              priority: selectedTask.priority,
              tags: selectedTask.tags || [],
              notes: selectedTask.notes,
              completed: false
            };
            createTask(duplicateTaskData).then(() => {
              loadTasks();
              setSnackbar({ open: true, message: 'Task duplicated successfully', severity: 'success' });
            }).catch(() => {
              setSnackbar({ open: true, message: 'Failed to duplicate task', severity: 'error' });
            });
          }
          setAnchorEl(null);
        }}>
          <ListItemIcon><ContentCopy fontSize="small" /></ListItemIcon>
          <ListItemText>Duplicate</ListItemText>
        </MenuItem>
        <MenuItem 
          onClick={() => selectedTask && handleDelete(selectedTask.id)}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon><Delete fontSize="small" color="error" /></ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      
      {/* Task Info Dialog */}
      <Dialog
        open={infoDialogOpen}
        onClose={() => setInfoDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            bgcolor: theme.palette.background.paper
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: `1px solid ${theme.palette.divider}`,
          fontWeight: 600,
          color: theme.palette.primary.main
        }}>
          Task Details
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedTaskForInfo && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="h6" gutterBottom>
                  {selectedTaskForInfo.title}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Created
                  </Typography>
                  <Typography variant="body1">
                    {selectedTaskForInfo.createdAt ? format(parseISO(selectedTaskForInfo.createdAt), 'MMM d, yyyy') : 'Not set'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Due Date
                  </Typography>
                  <Typography variant="body1">
                    {selectedTaskForInfo.dueDate ? format(parseISO(selectedTaskForInfo.dueDate), 'MMM d, yyyy') : 'Not set'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Assignee
                  </Typography>
                  <Typography variant="body1">
                    {selectedTaskForInfo.assignee || 'Not assigned'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Priority
                  </Typography>
                  <Chip 
                    label={selectedTaskForInfo.priority}
                    size="small"
                    sx={{ 
                      bgcolor: getPriorityColor(selectedTaskForInfo.priority),
                      color: 'white',
                      textTransform: 'capitalize'
                    }}
                  />
                </Box>
              </Box>
              
              {selectedTaskForInfo.tags && selectedTaskForInfo.tags.length > 0 && (
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Tags
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selectedTaskForInfo.tags.map((tag, index) => (
                      <Chip key={index} label={tag} size="small" />
                    ))}
                  </Box>
                </Box>
              )}
              
              <Divider />
              
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Notes
                  </Typography>
                  {isNoteSaving && (
                    <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                      Saving...
                    </Typography>
                  )}
                </Box>
                <TextField
                  multiline
                  rows={4}
                  fullWidth
                  variant="outlined"
                  value={taskNotes}
                  onChange={(e) => handleNotesChange(e.target.value)}
                  onBlur={handleNotesBlur}
                  placeholder="Add notes about this task..."
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'
                    }
                  }}
                />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setInfoDialogOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default EnhancedTaskList;