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
  selectedTasksCount?: number;
  onBulkDelete?: () => void;
}

export default function TaskFilters({ 
  searchFilter, 
  statusFilter, 
  onSearchChange, 
  onStatusFilterChange,
  selectedTasksCount = 0,
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
      bgColor: '#E3F2FD'
    },
    { 
      id: 'today', 
      label: 'Today', 
      icon: <TodayIcon fontSize="small" />,
      color: '#4CAF50', // Green
      bgColor: '#E8F5E9'
    },
    { 
      id: 'tomorrow', 
      label: 'Tomorrow', 
      icon: <EventIcon fontSize="small" />,
      color: '#FF9800', // Orange
      bgColor: '#FFF3E0'
    },
    { 
      id: 'thisweek', 
      label: 'This Week', 
      icon: <DateRangeIcon fontSize="small" />,
      color: '#00BCD4', // Cyan
      bgColor: '#E0F2F1'
    },
    { 
      id: 'nextweek', 
      label: 'Next Week', 
      icon: <DateRangeIcon fontSize="small" />,
      color: '#9C27B0', // Purple
      bgColor: '#F3E5F5'
    },
    { 
      id: 'overdue', 
      label: 'Overdue', 
      icon: <ErrorOutlineIcon fontSize="small" />,
      color: '#FF5722', // Softer red
      bgColor: '#FFEBEE'
    },
    { 
      id: 'completed', 
      label: 'Completed', 
      icon: <CheckCircleOutlineIcon fontSize="small" />,
      color: '#4CAF50', // Green
      bgColor: '#E8F5E9'
    }
  ];

  // Mobile layout
  if (isMobile) {
    return (
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        px: 0.5,
      }}>
        <TextField
          placeholder="Search tasks..."
          size="small"
          value={searchFilter}
          onChange={handleSearchChange}
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" sx={{ fontSize: 20 }} />
              </InputAdornment>
            ),
          }}
          sx={{
            flex: 1,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2, // Less oval, match desktop (8px)
              height: 40,
              bgcolor: 'background.paper',
              boxShadow: '0 0 16px rgba(128, 128, 128, 0.12), 0 0 8px rgba(128, 128, 128, 0.08)',
              '& fieldset': {
                borderColor: theme.palette.mode === 'dark'
                  ? 'rgba(255,255,255,0.12)'
                  : 'rgba(0,0,0,0.12)',
              },
              '&:hover fieldset': {
                borderColor: theme.palette.primary.main,
              },
              '&.Mui-focused fieldset': {
                borderColor: theme.palette.primary.main,
                borderWidth: 1,
              },
            },
            '& .MuiInputBase-input': {
              py: 1,
              fontSize: '0.9rem',
            }
          }}
        />

        <IconButton
          onClick={toggleMobileFilter}
          sx={{
            bgcolor: mobileFilterOpen ? theme.palette.primary.main : alpha(theme.palette.primary.main, 0.1),
            color: mobileFilterOpen ? 'white' : theme.palette.primary.main,
            transition: 'all 0.3s ease',
            '&:hover': {
              bgcolor: mobileFilterOpen ? theme.palette.primary.dark : alpha(theme.palette.primary.main, 0.2),
            }
          }}
        >
          <FilterListIcon />
        </IconButton>

        <Drawer
          anchor="bottom"
          open={mobileFilterOpen}
          onClose={() => setMobileFilterOpen(false)}
          SlideProps={{
            appear: true,
            timeout: 300,
          }}
          PaperProps={{
            sx: {
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              maxHeight: '70vh',
              boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.15)',
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
      </Box>
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
                : (theme.palette.mode === 'dark' ? 'transparent' : 'background.paper'),
              borderColor: filter.color,
              borderWidth: '1.5px',
              border: `1.5px solid ${filter.color}`,
              // Strong shadow for emphasis
              boxShadow: statusFilter === filter.id ? 
                `0 6px 20px ${alpha(filter.color, 0.4)}, 0 2px 8px ${alpha(filter.color, 0.3)}` : 
                '0 0 12px rgba(128, 128, 128, 0.08), 0 0 6px rgba(128, 128, 128, 0.06)',
              fontWeight: statusFilter === filter.id ? 600 : 400,
              '&:hover': {
                bgcolor: statusFilter === filter.id 
                  ? filter.color 
                  : (theme.palette.mode === 'dark' ? alpha(filter.color, 0.2) : alpha(filter.color, 0.1)),
                color: statusFilter === filter.id ? '#fff' : filter.color,
                borderColor: filter.color,
                // Enhanced hover shadow
                boxShadow: statusFilter === filter.id 
                  ? `0 8px 24px ${alpha(filter.color, 0.5)}, 0 3px 12px ${alpha(filter.color, 0.4)}` 
                  : `0 0 16px ${alpha(filter.color, 0.2)}, 0 0 8px rgba(128, 128, 128, 0.1)`,
                transform: 'translateY(-1px)',
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
      </Box>
      
      {/* Delete button for selected tasks */}
      {selectedTasksCount > 0 && onBulkDelete && (
        <Button
          variant="contained"
          color="error"
          size="small"
          startIcon={<DeleteIcon fontSize="small" />}
          onClick={onBulkDelete}
          sx={{ 
            ml: 2,
            mr: 2,
            px: 2,
            py: 0.5,
            fontSize: '0.8rem',
            fontWeight: 600,
            borderRadius: 2,
            textTransform: 'none',
            minWidth: 'auto',
            boxShadow: '0 2px 8px rgba(244, 67, 54, 0.3)',
            '&:hover': {
              boxShadow: '0 4px 12px rgba(244, 67, 54, 0.4)'
            }
          }}
        >
          Delete {selectedTasksCount}
        </Button>
      )}
      
       <TextField
        placeholder="Search tasks, assignees, tags..."
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
          width: 250, 
          // Stronger shadow around all sides like task input
          '& .MuiOutlinedInput-root': { 
            borderRadius: 2,
            backgroundColor: 'background.paper',
            boxShadow: '0 0 32px rgba(128, 128, 128, 0.15), 0 0 16px rgba(128, 128, 128, 0.1)',
            transition: 'box-shadow 0.3s ease, transform 0.2s ease',
            '&:hover': {
              boxShadow: '0 0 40px rgba(128, 128, 128, 0.2), 0 0 20px rgba(128, 128, 128, 0.15)',
              transform: 'translateY(-1px)',
            },
            '&.Mui-focused': {
              boxShadow: '0 0 40px rgba(33, 150, 243, 0.3), 0 0 20px rgba(128, 128, 128, 0.1)',
              transform: 'translateY(-1px)',
            }
          }
        }}
      />
    </Box>
  );
} 