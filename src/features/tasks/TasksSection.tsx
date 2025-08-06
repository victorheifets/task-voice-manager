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
  List, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Chip, 
  alpha 
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
import { EnhancedTaskList } from './EnhancedTaskList';
import TaskFilters from './TaskFilters';

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

  const filterOptions = [
    { id: 'all', label: 'All', icon: <AllInclusiveIcon fontSize="small" />, color: '#2196F3' },
    { id: 'today', label: 'Today', icon: <TodayIcon fontSize="small" />, color: '#4CAF50' },
    { id: 'tomorrow', label: 'Tomorrow', icon: <EventIcon fontSize="small" />, color: '#FF9800' },
    { id: 'thisweek', label: 'This Week', icon: <DateRangeIcon fontSize="small" />, color: '#00BCD4' },
    { id: 'overdue', label: 'Overdue', icon: <ErrorOutlineIcon fontSize="small" />, color: '#FF5722' },
    { id: 'completed', label: 'Completed', icon: <CheckCircleOutlineIcon fontSize="small" />, color: '#4CAF50' }
  ];

  return (
    <Box sx={{ 
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
      height: '100%',
      flex: 1,
      p: isMobile ? 2 : 0
    }}>
      {!isMobile && (
        <TaskInput 
          onTaskAdded={handleTaskAdded}
          transcript={transcript}
        />
      )}
      {isMobile ? (
        <Box sx={{ mb: 2 }}>
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
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowMobileFilters(true)}
                    size="small"
                    sx={{
                      color: theme.palette.primary.main,
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                      }
                    }}
                  >
                    <FilterListIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '20px',
                '& fieldset': {
                  borderColor: 'rgba(0, 0, 0, 0.12)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(0, 0, 0, 0.25)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'primary.main',
                },
              },
            }}
          />
        </Box>
      ) : (
        <TaskFilters 
          searchFilter={searchFilter}
          statusFilter={statusFilter}
          onSearchChange={handleSearchChange}
          onStatusFilterChange={handleStatusFilterClick}
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
    </Box>
  );
}