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
import { useTranslation } from 'react-i18next';

interface TaskFiltersProps {
  searchFilter: string;
  statusFilter: string;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (status: string) => void;
}

export default function TaskFilters({ 
  searchFilter, 
  statusFilter, 
  onSearchChange, 
  onStatusFilterChange 
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

  const isDarkMode = theme.palette.mode === 'dark';

  const filterOptions = [
    { 
      id: 'all', 
      label: t('filters.all'), 
      icon: <AllInclusiveIcon fontSize="small" />,
      color: isDarkMode ? '#818CF8' : '#2196F3', // Indigo 400 in dark mode
      bgColor: isDarkMode ? '#1F2937' : '#E3F2FD'
    },
    { 
      id: 'today', 
      label: t('filters.today'), 
      icon: <TodayIcon fontSize="small" />,
      color: isDarkMode ? '#34D399' : '#4CAF50', // Emerald 400 in dark mode
      bgColor: isDarkMode ? '#1F2937' : '#E8F5E9'
    },
    { 
      id: 'tomorrow', 
      label: t('filters.tomorrow'), 
      icon: <EventIcon fontSize="small" />,
      color: isDarkMode ? '#94A3B8' : '#FF9800', // Slate 400 in dark mode
      bgColor: isDarkMode ? '#1F2937' : '#FFF3E0'
    },
    { 
      id: 'nextweek', 
      label: t('filters.nextweek'), 
      icon: <DateRangeIcon fontSize="small" />,
      color: isDarkMode ? '#A78BFA' : '#9C27B0', // Violet 400 in dark mode
      bgColor: isDarkMode ? '#1F2937' : '#F3E5F5'
    },
    { 
      id: 'overdue', 
      label: t('filters.overdue'), 
      icon: <ErrorOutlineIcon fontSize="small" />,
      color: isDarkMode ? '#94A3B8' : '#F44336', // Slate 400 in dark mode
      bgColor: isDarkMode ? '#1F2937' : '#FFEBEE'
    },
    { 
      id: 'completed', 
      label: t('filters.completed'), 
      icon: <CheckCircleOutlineIcon fontSize="small" />,
      color: isDarkMode ? '#94A3B8' : '#4CAF50', // Slate 400 in dark mode
      bgColor: isDarkMode ? '#1F2937' : '#E8F5E9'
    }
  ];

  // Mobile layout
  if (isMobile) {
    return (
      <>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          gap: 1,
          mb: 2
        }}>
          <Paper
            elevation={1}
            sx={{
              p: '2px 4px',
              display: 'flex',
              alignItems: 'center',
              flex: 1,
              borderRadius: '20px',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)',
              border: `1px solid ${isDarkMode ? '#1E293B' : theme.palette.divider}`,
              bgcolor: isDarkMode ? '#1F2937 !important' : undefined,
              color: isDarkMode ? '#94A3B8' : undefined
            }}
          >
            <TextField
              placeholder="Search tasks..."
              size="small"
              value={searchFilter}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color={isDarkMode ? 'inherit' : 'action'} sx={{ color: isDarkMode ? '#64748B' : undefined }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                width: 300,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: isDarkMode ? '#1F2937 !important' : undefined,
                  color: isDarkMode ? '#94A3B8' : undefined,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: isDarkMode ? '#1E293B' : undefined,
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: isDarkMode ? '#4B5563' : undefined,
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: isDarkMode ? '#818CF8' : undefined,
                  }
                },
                '& .MuiInputBase-input::placeholder': {
                  color: isDarkMode ? '#64748B' : undefined,
                  opacity: isDarkMode ? 1 : undefined
                },
              }}
            />
          </Paper>
          
          <IconButton 
            onClick={toggleMobileFilter}
            sx={{
              bgcolor: isDarkMode ? '#38BDF8' : theme.palette.primary.main,
              color: isDarkMode ? '#111827' : '#fff',
              border: 'none',
              boxShadow: isDarkMode ? '0 0 8px rgba(56, 189, 248, 0.5)' : '0 0 8px rgba(0, 0, 0, 0.2)',
              '&:hover': {
                bgcolor: isDarkMode ? '#0EA5E9' : theme.palette.primary.dark,
                boxShadow: isDarkMode ? '0 0 12px rgba(56, 189, 248, 0.7)' : '0 0 12px rgba(0, 0, 0, 0.3)',
              }
            }}
          >
            <FilterListIcon />
          </IconButton>
        </Box>
        
        <Drawer
          anchor="bottom"
          open={mobileFilterOpen}
          onClose={() => setMobileFilterOpen(false)}
          PaperProps={{
            sx: {
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              maxHeight: '80vh',
              boxShadow: isDarkMode ? '0 -4px 20px rgba(0, 0, 0, 0.5)' : '0 -4px 12px rgba(0, 0, 0, 0.1)',
              bgcolor: isDarkMode ? '#111827 !important' : undefined,
              color: isDarkMode ? '#F9FAFB' : undefined,
              border: isDarkMode ? '1px solid #374151' : undefined
            }
          }}
        >
          <Box sx={{ 
            mb: 3,
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
            alignItems: { xs: 'stretch', sm: 'center' },
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 10,
            pt: 1,
            pb: 2,
            px: { xs: 1, sm: 0 },
            backdropFilter: 'blur(8px)',
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(17, 24, 39, 0.85)' : 'rgba(255, 255, 255, 0.85)',
            borderBottom: theme.palette.mode === 'dark' ? '1px solid rgba(75, 85, 99, 0.2)' : '1px solid rgba(0, 0, 0, 0.05)',
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
                    alpha(filter.color, isDarkMode ? 0.85 : 0.7),
                  bgcolor: isDarkMode ? '#1F2937' : undefined,
                  '&:hover': {
                    color: filter.color,
                    bgcolor: alpha(filter.color, isDarkMode ? 0.15 : 0.1)
                  },
                  '& .MuiButton-startIcon': {
                    color: 'inherit',
                    opacity: isDarkMode ? 0.85 : 1
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
    <Box sx={{ mb: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
              py: 0.5,
              height: '28px',
              borderRadius: '14px',
              color: statusFilter === filter.id ? '#FFFFFF' : (isDarkMode ? '#F9FAFB' : filter.color),
              bgcolor: statusFilter === filter.id ? filter.color : 'transparent',
              border: statusFilter === filter.id ? 'none' : `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
              boxShadow: 'none',
              fontWeight: statusFilter === filter.id ? 600 : 500,
              fontSize: '0.75rem',
              textTransform: 'capitalize',
              '&:hover': {
                bgcolor: statusFilter === filter.id ? filter.color : (isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)'),
                color: statusFilter === filter.id ? '#FFFFFF' : filter.color,
                transform: 'none',
                boxShadow: 'none',
              },
              '& .MuiButton-startIcon': {
                color: 'inherit',
                margin: 0,
                marginRight: 0.5,
                opacity: isDarkMode ? 0.85 : 1
              },
              transition: 'all 0.2s ease-in-out'
            }}
          >
            {filter.label}
          </Button>
        ))}
      </Box>
      <TextField
        placeholder={t('search.placeholder')}
        size="small"
        value={searchFilter}
        onChange={handleSearchChange}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color={isDarkMode ? 'inherit' : 'action'} sx={{ color: isDarkMode ? '#64748B' : undefined }} />
            </InputAdornment>
          ),
        }}
        sx={{
          width: 300,
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            bgcolor: isDarkMode ? '#1F2937 !important' : undefined,
            color: isDarkMode ? '#94A3B8' : undefined,
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: isDarkMode ? '#1E293B' : undefined,
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: isDarkMode ? '#4B5563' : undefined,
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: isDarkMode ? '#818CF8' : undefined,
            }
          },
          '& .MuiInputBase-input::placeholder': {
            color: isDarkMode ? '#64748B' : undefined,
            opacity: isDarkMode ? 1 : undefined
          },
        }}
      />
    </Box>
  );
} 