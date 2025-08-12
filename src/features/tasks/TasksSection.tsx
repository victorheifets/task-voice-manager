'use client';

import React, { useState } from 'react';
import { 
  Box, 
  useTheme, 
  useMediaQuery, 
  TextField, 
  InputAdornment, 
  IconButton, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Button,
  List, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Chip, 
  alpha,
  Typography,
  Snackbar,
  Alert
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import TodayIcon from '@mui/icons-material/Today';
import EventIcon from '@mui/icons-material/Event';
import DateRangeIcon from '@mui/icons-material/DateRange';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AllInclusiveIcon from '@mui/icons-material/AllInclusive';
import TaskInput from './TaskInput';
import EnhancedTaskList from '../../components/tasks/EnhancedTaskList';
import TaskFilters from './TaskFilters';
import { deleteTask } from '@/lib/supabase/client';

export default function TasksSection({ 
  transcript, 
  onTaskAdded,
  mobileSearchFilter,
  mobileStatusFilter,
  onMobileSearchChange
}: { 
  transcript: string;
  onTaskAdded: () => void;
  mobileSearchFilter?: string;
  mobileStatusFilter?: string;
  onMobileSearchChange?: (value: string) => void;
}) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleTaskAdded = () => {
    setRefreshTrigger(prev => prev + 1);
    onTaskAdded();
  };

  const handleSearchChange = (value: string) => {
    setSearchFilter(value);
  };

  const handleStatusFilterClick = (status: string) => {
    setStatusFilter(status);
  };

  const handleMobileStatusFilterClick = (status: string) => {
    if (isMobile && onMobileSearchChange) {
      // Use the parent's handler if available
      setStatusFilter(status);
    } else {
      setStatusFilter(status);
    }
    setShowMobileFilters(false);
  };

  const handleBulkDelete = () => {
    setDeleteConfirmOpen(true);
  };

  const confirmBulkDelete = async () => {
    try {
      const deletePromises = Array.from(selectedTasks).map(taskId => deleteTask(taskId));
      await Promise.all(deletePromises);
      setSnackbar({ 
        open: true, 
        message: `${selectedTasks.size} tasks deleted successfully`, 
        severity: 'success' 
      });
      setDeleteConfirmOpen(false);
      setSelectedTasks(new Set()); // Clear selections after delete
      setRefreshTrigger(prev => prev + 1); // Refresh the task list
    } catch (error) {
      console.error('Failed to delete tasks:', error);
      setSnackbar({ 
        open: true, 
        message: 'Failed to delete some tasks', 
        severity: 'error' 
      });
      setDeleteConfirmOpen(false);
    }
  };

  const filterOptions = [
    { id: 'all', label: 'All', icon: <AllInclusiveIcon fontSize="small" />, color: '#2196F3' },
    { id: 'today', label: 'Today', icon: <TodayIcon fontSize="small" />, color: '#4CAF50' },
    { id: 'tomorrow', label: 'Tomorrow', icon: <EventIcon fontSize="small" />, color: '#FF9800' },
    { id: 'thisweek', label: 'This Week', icon: <DateRangeIcon fontSize="small" />, color: '#00BCD4' },
    { id: 'overdue', label: 'Overdue', icon: <ErrorOutlineIcon fontSize="small" />, color: '#FF5722' },
    { id: 'completed', label: 'Completed', icon: <CheckCircleOutlineIcon fontSize="small" />, color: '#4CAF50' }
  ];

  // Get current filter label for mobile display
  const currentFilter = filterOptions.find(f => f.id === (isMobile ? (mobileStatusFilter || statusFilter) : statusFilter));
  const filterDisplayText = currentFilter?.label || 'All';

  return (
    <Box sx={{ 
      display: 'flex',
      flexDirection: 'column',
      gap: 3,
      height: '100%',
      flex: 1,
      // Minimal container - let components handle their own spacing
      bgcolor: 'transparent'
    }}>
      {!isMobile && (
        <TaskInput 
          onTaskAdded={handleTaskAdded}
          transcript={transcript}
        />
      )}
      {isMobile ? (
          <TextField
            placeholder="Search tasks, assignees, tags..."
            size="small"
            value={isMobile ? (mobileSearchFilter || '') : searchFilter}
            onChange={(e) => {
              if (isMobile && onMobileSearchChange) {
                onMobileSearchChange(e.target.value);
              } else {
                handleSearchChange(e.target.value);
              }
            }}
            fullWidth
            style={{
              borderRadius: '20px'
            }}
            InputProps={{
              style: {
                borderRadius: '20px'
              },
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <Button
                    onClick={() => setShowMobileFilters(true)}
                    size="small"
                    variant="text"
                    startIcon={currentFilter?.icon}
                    sx={{
                      color: currentFilter?.color || theme.palette.primary.main,
                      fontWeight: filterDisplayText !== 'All' ? 600 : 400,
                      fontSize: '0.75rem',
                      minWidth: 'auto',
                      px: 1,
                      py: 0.5,
                      '&:hover': {
                        bgcolor: alpha(currentFilter?.color || theme.palette.primary.main, 0.1),
                      }
                    }}
                  >
                    {filterDisplayText}
                  </Button>
                </InputAdornment>
              ),
            }}
            sx={{
              // Stronger shadow around all sides like task input
              boxShadow: '0 0 32px rgba(128, 128, 128, 0.15), 0 0 16px rgba(128, 128, 128, 0.1)',
              borderRadius: '20px',
              transition: 'box-shadow 0.3s ease, transform 0.2s ease',
              '&:hover': {
                boxShadow: '0 0 40px rgba(128, 128, 128, 0.2), 0 0 20px rgba(128, 128, 128, 0.15)',
                transform: 'translateY(-1px)',
              },
              '& .MuiOutlinedInput-root': {
                borderRadius: '20px',
                backgroundColor: 'background.paper',
                // Additional shadow around the input itself
                boxShadow: '0 0 16px rgba(128, 128, 128, 0.1)',
                '& fieldset': {
                  borderColor: 'rgba(0, 0, 0, 0.12)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(0, 0, 0, 0.25)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'primary.main',
                },
                '&.Mui-focused': {
                  boxShadow: '0 0 16px rgba(128, 128, 128, 0.1)',
                },
              },
            }}
          />
      ) : (
        <TaskFilters 
          searchFilter={searchFilter}
          statusFilter={statusFilter}
          onSearchChange={handleSearchChange}
          onStatusFilterChange={handleStatusFilterClick}
          selectedTasksCount={selectedTasks.size}
          onBulkDelete={handleBulkDelete}
        />
      )}
      <EnhancedTaskList 
        refreshTrigger={refreshTrigger}
        searchFilter={isMobile ? (mobileSearchFilter || '') : searchFilter}
        statusFilter={isMobile ? (mobileStatusFilter || 'all') : statusFilter}
      />

      {/* Mobile Filter Dialog */}
      <Dialog
        open={showMobileFilters}
        onClose={() => setShowMobileFilters(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: { 
            borderRadius: 3,
            position: 'fixed',
            bottom: 0,
            m: 0,
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
            boxShadow: '0 -8px 32px rgba(0, 0, 0, 0.15)',
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: '1px solid',
          borderColor: 'divider',
          py: 2.5,
          fontWeight: 600,
          color: 'primary.main',
          fontSize: '1.1rem'
        }}>
          Filter Tasks
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <List sx={{ py: 1 }}>
            {filterOptions.map((filter) => (
              <ListItemButton
                key={filter.id}
                selected={statusFilter === filter.id}
                onClick={() => handleMobileStatusFilterClick(filter.id)}
                sx={{
                  py: 2.5,
                  px: 3,
                  mx: 1,
                  my: 0.5,
                  borderRadius: 2,
                  '&.Mui-selected': {
                    backgroundColor: alpha(filter.color, 0.15),
                    '&:hover': {
                      backgroundColor: alpha(filter.color, 0.2),
                    }
                  },
                  '&:hover': {
                    backgroundColor: alpha(filter.color, 0.08),
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: filter.color }}>
                  {filter.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={filter.label}
                  sx={{
                    '& .MuiListItemText-primary': {
                      fontWeight: statusFilter === filter.id ? 600 : 500,
                      fontSize: '1rem'
                    }
                  }}
                />
                {statusFilter === filter.id && (
                  <Chip 
                    label="Active"
                    size="small"
                    sx={{ 
                      ml: 1,
                      bgcolor: filter.color,
                      color: 'white',
                      fontWeight: 500
                    }}
                  />
                )}
              </ListItemButton>
            ))}
          </List>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ color: 'error.main', fontWeight: 600 }}>
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {selectedTasks.size} selected task{selectedTasks.size > 1 ? 's' : ''}? 
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button 
            onClick={() => setDeleteConfirmOpen(false)}
            color="inherit"
          >
            Cancel
          </Button>
          <Button 
            onClick={confirmBulkDelete}
            variant="contained" 
            color="error"
          >
            Delete {selectedTasks.size} Task{selectedTasks.size > 1 ? 's' : ''}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          severity={snackbar.severity} 
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}