'use client';

import React from 'react';
import { 
  Box, 
  Paper, 
  IconButton, 
  InputBase,
  useTheme,
  useMediaQuery,
  Drawer,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Chip,
  alpha,
  TextField,
  InputAdornment,
  Button
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import TodayIcon from '@mui/icons-material/Today';
import EventIcon from '@mui/icons-material/Event';
import DateRangeIcon from '@mui/icons-material/DateRange';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AllInclusiveIcon from '@mui/icons-material/AllInclusive';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTranslation } from 'react-i18next';

interface TaskFiltersProps {
  searchFilter: string;
  statusFilter: string;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (status: string) => void;
  selectedTasks?: Set<string>;
  onBulkDelete?: () => void;
}

export default function TaskFilters({ 
  searchFilter, 
  statusFilter, 
  onSearchChange, 
  onStatusFilterChange,
  selectedTasks,
  onBulkDelete
}: TaskFiltersProps) {
  const { t } = useTranslation(['common']);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileFilterOpen, setMobileFilterOpen] = React.useState(false);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(event.target.value);
  };

  const handleStatusFilterClick = (status: string) => {
    onStatusFilterChange(status);
    if (isMobile) {
      setMobileFilterOpen(false);
    }
  };

  const toggleMobileFilter = () => {
    setMobileFilterOpen(!mobileFilterOpen);
  };

  const filterOptions = [
    { 
      id: 'all', 
      label: 'All', 
      icon: <AllInclusiveIcon fontSize="small" />,
      color: '#2196F3', // Blue
      bgColor: alpha('#2196F3', 0.1)
    },
    { 
      id: 'today', 
      label: 'Today', 
      icon: <TodayIcon fontSize="small" />,
      color: '#4CAF50', // Green
      bgColor: alpha('#4CAF50', 0.1)
    },
    { 
      id: 'tomorrow', 
      label: 'Tomorrow', 
      icon: <EventIcon fontSize="small" />,
      color: '#FF9800', // Orange
      bgColor: alpha('#FF9800', 0.1)
    },
    { 
      id: 'thisweek', 
      label: 'This Week', 
      icon: <DateRangeIcon fontSize="small" />,
      color: '#00BCD4', // Cyan
      bgColor: alpha('#00BCD4', 0.1)
    },
    { 
      id: 'nextweek', 
      label: 'Next Week', 
      icon: <DateRangeIcon fontSize="small" />,
      color: '#9C27B0', // Purple
      bgColor: alpha('#9C27B0', 0.1)
    },
    { 
      id: 'overdue', 
      label: 'Overdue', 
      icon: <ErrorOutlineIcon fontSize="small" />,
      color: '#FF5722', // Softer red
      bgColor: alpha('#FF5722', 0.1)
    },
    { 
      id: 'completed', 
      label: 'Completed', 
      icon: <CheckCircleOutlineIcon fontSize="small" />,
      color: '#4CAF50', // Green
      bgColor: alpha('#4CAF50', 0.1)
    }
  ];

  // Get current filter info
  const currentFilter = filterOptions.find(filter => filter.id === statusFilter) || filterOptions[0];

  // Mobile layout
  if (isMobile) {
    return (
      <>
        <Box sx={{ mb: 2 }}>
          <TextField
            placeholder="Search tasks, assignees, tags..."
            size="medium"
            value={searchFilter}
            onChange={handleSearchChange}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <Chip
                    label={currentFilter.label}
                    size="small"
                    icon={currentFilter.icon}
                    onClick={toggleMobileFilter}
                    sx={{
                      cursor: 'pointer',
                      bgcolor: currentFilter.bgColor,
                      color: currentFilter.color,
                      fontWeight: 500,
                      '& .MuiChip-icon': {
                        color: currentFilter.color
                      },
                      '&:hover': {
                        bgcolor: alpha(currentFilter.color, 0.2)
                      }
                    }}
                  />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                bgcolor: theme.palette.mode === 'dark' ? theme.palette.background.paper : '#ffffff',
                border: `2px solid ${theme.palette.mode === 'dark' ? theme.palette.divider : 'rgba(0,0,0,0.1)'}`,
                boxShadow: theme.palette.mode === 'dark' ? 
                  '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.15)',
                '& fieldset': {
                  border: 'none',
                },
                '&:hover': {
                  boxShadow: theme.palette.mode === 'dark' ? 
                    '0 6px 28px rgba(0,0,0,0.4)' : '0 6px 28px rgba(0,0,0,0.2)',
                  bgcolor: theme.palette.mode === 'dark' ? 
                    alpha(theme.palette.primary.main, 0.08) : '#ffffff',
                },
                '&.Mui-focused': {
                  boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
                  bgcolor: theme.palette.mode === 'dark' ? 
                    alpha(theme.palette.primary.main, 0.08) : '#ffffff',
                },
                '&.Mui-focused fieldset': {
                  border: 'none',
                }
              },
              '& .MuiInputBase-input': {
                color: theme.palette.text.primary,
              },
              '& input::placeholder': {
                color: theme.palette.text.secondary,
                opacity: 1,
              },
            }}
          />
        </Box>
        
        <Drawer
          anchor="bottom"
          open={mobileFilterOpen}
          onClose={() => setMobileFilterOpen(false)}
          PaperProps={{
            sx: {
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              maxHeight: '70vh',
              boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.1)'
            }
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            p: 2,
            borderBottom: `1px solid ${theme.palette.divider}`
          }}>
            <Box sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Filter Tasks</Box>
            <IconButton 
              onClick={() => setMobileFilterOpen(false)}
              sx={{ color: theme.palette.primary.main }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, p: 2 }}>
            {filterOptions.map((filter) => (
              <Button
                key={filter.id}
                variant="text"
                onClick={() => handleStatusFilterClick(filter.id)}
                startIcon={filter.icon}
                sx={{
                  color: statusFilter === filter.id ? 
                    filter.color : 
                    alpha(filter.color, 0.7),
                  '&:hover': {
                    color: filter.color,
                    bgcolor: alpha(filter.color, 0.1)
                  },
                  '& .MuiButton-startIcon': {
                    color: 'inherit'
                  }
                }}
              >
                {filter.label}
              </Button>
            ))}
          </Box>
        </Drawer>
      </>
    );
  }

  // Desktop layout
  return (
    <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          alignItems: 'center',
        }}
      >
        {filterOptions.map((filter) => (
          <Button
            key={filter.id}
            variant="outlined"
            size="small"
            onClick={() => handleStatusFilterClick(filter.id)}
            startIcon={filter.icon}
            sx={{
              minWidth: 'auto',
              px: 1.5,
              py: 0.25,
              fontSize: '0.8rem',
              borderRadius: 16,
              color: statusFilter === filter.id 
                ? '#fff' 
                : (theme.palette.mode === 'dark' ? filter.color : filter.color),
              bgcolor: statusFilter === filter.id 
                ? filter.color 
                : (theme.palette.mode === 'dark' ? 'transparent' : '#fff'),
              borderColor: filter.color,
              borderWidth: '1.5px',
              border: `1.5px solid ${filter.color}`,
              boxShadow: statusFilter === filter.id ? 
                `0 2px 8px ${alpha(filter.color, 0.4)}` : 
                'none',
              fontWeight: statusFilter === filter.id ? 600 : 400,
              '&:hover': {
                bgcolor: statusFilter === filter.id 
                  ? filter.color 
                  : (theme.palette.mode === 'dark' ? alpha(filter.color, 0.2) : alpha(filter.color, 0.1)),
                color: statusFilter === filter.id ? '#fff' : filter.color,
                borderColor: filter.color,
              },
              '& .MuiButton-startIcon': {
                color: 'inherit',
                margin: 0,
                marginRight: 0.5
              },
              transition: 'all 0.2s ease-in-out'
            }}
          >
            {filter.label}
          </Button>
        ))}
        
        {/* Bulk Delete Button - moved to left side with filters */}
        {selectedTasks && selectedTasks.size > 0 && onBulkDelete && (
          <Button
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={onBulkDelete}
            sx={{
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(244, 67, 54, 0.3)',
              ml: 1,
              '&:hover': {
                boxShadow: '0 6px 16px rgba(244, 67, 54, 0.4)',
                transform: 'translateY(-1px)'
              }
            }}
          >
            Delete {selectedTasks.size}
          </Button>
        )}
      </Box>
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <TextField
          placeholder="Search tasks... (e.g., 'John', 'urgent', 'meeting')"
          size="small"
          value={searchFilter}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
          sx={{
            width: 350,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              bgcolor: theme.palette.mode === 'dark' ? theme.palette.background.paper : '#ffffff',
              boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
              border: `1px solid ${theme.palette.mode === 'dark' ? theme.palette.divider : 'rgba(0,0,0,0.1)'}`,
              '& fieldset': {
                border: 'none',
              },
              '&:hover': {
                boxShadow: theme.palette.mode === 'dark' ? 
                  '0 6px 20px rgba(0,0,0,0.35)' : '0 6px 20px rgba(0,0,0,0.35)',
                borderColor: theme.palette.primary.main,
                bgcolor: theme.palette.mode === 'dark' ? 
                  alpha(theme.palette.primary.main, 0.08) : '#ffffff',
              },
              '&:hover fieldset': {
                border: 'none',
              },
              '&.Mui-focused': {
                boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
                bgcolor: theme.palette.mode === 'dark' ? 
                  alpha(theme.palette.primary.main, 0.08) : '#ffffff',
              },
              '&.Mui-focused fieldset': {
                border: 'none',
              }
            },
            '& .MuiInputBase-input': {
              color: theme.palette.text.primary
            },
            '& input::placeholder': {
              color: '#999999',
              opacity: 1
            }
          }}
        />
      </Box>
    </Box>
  );
} 