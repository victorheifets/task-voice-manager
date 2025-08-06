'use client';

import React, { useState, useEffect } from 'react';
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
  Delete,
  Info,
  MoreVert,
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

  useEffect(() => {
    loadTasks();
  }, [refreshTrigger]);

  const loadTasks = async () => {
    try {
      const fetchedTasks = await getTasks();
      setTasks(fetchedTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const handleSort = (field: SortField) => {
    const isCurrentField = sortField === field;
    const newDirection: SortDirection = isCurrentField && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(newDirection);
  };

  const sortedTasks = React.useMemo(() => {
    let filtered = tasks.filter(task => {
      const matchesSearch = searchFilter === '' || 
        task.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
        (task.assignee?.toLowerCase().includes(searchFilter.toLowerCase()) ?? false) ||
        (task.tags?.some(tag => tag.toLowerCase().includes(searchFilter.toLowerCase())) ?? false) ||
        (task.notes?.toLowerCase().includes(searchFilter.toLowerCase()) ?? false);
      
      if (statusFilter === 'completed') return task.completed && matchesSearch;
      if (statusFilter === 'all') return matchesSearch;
      if (task.completed) return false;
      
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
      case 'urgent': return theme.palette.mode === 'dark' ? '#ff7043' : '#d32f2f';
      case 'high': return theme.palette.warning.main;
      case 'medium': return theme.palette.info.main;
      case 'low': return theme.palette.success.main;
      default: return theme.palette.grey[500];
    }
  };

  // Mobile card layout
  if (isMobile) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 2, 
        p: 2,
        width: '100%',
        maxWidth: '100vw',
        overflow: 'hidden'
      }}>
        {sortedTasks.length === 0 ? (
          <Paper sx={{ 
            p: 3, 
            textAlign: 'center', 
            bgcolor: 'grey.50',
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <Typography variant="body2" color="text.secondary">
              No tasks found
            </Typography>
          </Paper>
        ) : (
          sortedTasks.map((task) => (
            <Paper 
              key={task.id}
              elevation={2}
              sx={{ 
                p: 2,
                borderRadius: 3,
                borderLeft: `4px solid ${getPriorityColor(task.priority)}`,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                  transform: 'translateY(-2px)'
                },
                opacity: task.completed ? 0.7 : 1,
                bgcolor: theme.palette.mode === 'dark' ? '#2a2a2a' : '#ffffff'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 2 }}>
                <Checkbox
                  size="small"
                  checked={task.completed}
                  onChange={() => handleToggleComplete(task)}
                  sx={{ 
                    p: 0.5,
                    color: 'primary.main',
                    '&.Mui-checked': { color: 'success.main' }
                  }}
                />
                
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      textDecoration: task.completed ? 'line-through' : 'none',
                      fontSize: '1rem',
                      fontWeight: 600,
                      lineHeight: 1.3,
                      color: task.completed ? 'text.secondary' : 'text.primary',
                      wordBreak: 'break-word',
                      mb: 0.5
                    }}
                  >
                    {task.title}
                  </Typography>
                  
                  {task.dueDate && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <CalendarToday fontSize="small" sx={{ color: 'action.active' }} />
                      {getDueDateChip(task.dueDate)}
                    </Box>
                  )}
                  
                  {task.assignee && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Assignee: {task.assignee}
                    </Typography>
                  )}
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip 
                      label={task.priority}
                      size="small"
                      sx={{ 
                        bgcolor: getPriorityColor(task.priority),
                        color: 'white',
                        textTransform: 'capitalize',
                        fontWeight: 600,
                        fontSize: '0.75rem'
                      }}
                    />
                  </Box>
                </Box>

                <IconButton 
                  size="small" 
                  onClick={(e) => {
                    setAnchorEl(e.currentTarget);
                    setSelectedTask(task);
                  }}
                  sx={{ p: 0.5 }}
                >
                  <MoreVert fontSize="small" />
                </IconButton>
              </Box>
            </Paper>
          ))
        )}
        
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
        >
          <MenuItem onClick={() => {
            if (selectedTask) {
              setSelectedTaskForInfo(selectedTask);
              setTaskNotes(selectedTask.notes || '');
              setInfoDialogOpen(true);
            }
            setAnchorEl(null);
          }}>
            <ListItemIcon><Info fontSize="small" /></ListItemIcon>
            <ListItemText>View Details</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => selectedTask && handleDelete(selectedTask.id)} sx={{ color: 'error.main' }}>
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
      </Box>
    );
  }

  // Desktop table layout
  return (
    <Paper sx={{ 
      width: '100%', 
      overflow: 'hidden',
      borderRadius: 2,
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
                bgcolor: theme.palette.mode === 'dark' ? '#2e2e2e' : '#2196F3',
                borderBottom: `2px solid ${theme.palette.primary.main}`,
                fontWeight: 600,
                color: '#fff'
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
              <TableCell sx={{ width: '15%' }}>
                <TableSortLabel
                  active={sortField === 'assignee'}
                  direction={sortField === 'assignee' ? sortDirection : 'asc'}
                  onClick={() => handleSort('assignee')}
                >
                  Assignee
                </TableSortLabel>
              </TableCell>
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
            {sortedTasks.map((task) => (
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
                  <Typography variant="body2" sx={{ textDecoration: task.completed ? 'line-through' : 'none' }}>
                    {task.title}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {task.assignee || '-'}
                  </Typography>
                </TableCell>
                <TableCell>
                  {getDueDateChip(task.dueDate)}
                </TableCell>
                <TableCell>
                  <Chip 
                    label={task.priority}
                    size="small"
                    sx={{ 
                      bgcolor: getPriorityColor(task.priority),
                      color: 'white',
                      textTransform: 'capitalize',
                      fontWeight: 600,
                      fontSize: '0.75rem'
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {task.tags?.map((tag, index) => (
                      <Chip 
                        key={index}
                        label={tag}
                        size="small"
                        sx={{ fontSize: '0.75rem' }}
                      />
                    )) || <Typography variant="body2" color="text.disabled">-</Typography>}
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
            ))}
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
            setTaskNotes(selectedTask.notes || '');
            setInfoDialogOpen(true);
          }
          setAnchorEl(null);
        }}>
          <ListItemIcon><Info fontSize="small" /></ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => selectedTask && handleDelete(selectedTask.id)} sx={{ color: 'error.main' }}>
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
      
      <Dialog
        open={infoDialogOpen}
        onClose={() => setInfoDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Task Details</DialogTitle>
        <DialogContent>
          {selectedTaskForInfo && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <Typography variant="h6">{selectedTaskForInfo.title}</Typography>
              <Typography>Due: {selectedTaskForInfo.dueDate ? format(parseISO(selectedTaskForInfo.dueDate), 'MMM d, yyyy') : 'Not set'}</Typography>
              <Typography>Assignee: {selectedTaskForInfo.assignee || 'Not assigned'}</Typography>
              <Typography>Priority: {selectedTaskForInfo.priority}</Typography>
              {selectedTaskForInfo.tags && selectedTaskForInfo.tags.length > 0 && (
                <Box>
                  <Typography variant="body2">Tags:</Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                    {selectedTaskForInfo.tags.map((tag, index) => (
                      <Chip key={index} label={tag} size="small" />
                    ))}
                  </Box>
                </Box>
              )}
              <TextField
                label="Notes"
                multiline
                rows={3}
                fullWidth
                value={taskNotes}
                onChange={(e) => setTaskNotes(e.target.value)}
                placeholder="Add notes..."
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInfoDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={() => {
              if (selectedTaskForInfo) {
                updateTask(selectedTaskForInfo.id, { notes: taskNotes }).then(() => {
                  loadTasks();
                  setSnackbar({ open: true, message: 'Notes saved', severity: 'success' });
                }).catch(() => {
                  setSnackbar({ open: true, message: 'Failed to save notes', severity: 'error' });
                });
              }
              setInfoDialogOpen(false);
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default EnhancedTaskList;