'use client';

import React from 'react';
import {
  Select,
  MenuItem,
  SelectChangeEvent,
  Box,
  Typography,
  useTheme,
  alpha
} from '@mui/material';
import FlagIcon from '@mui/icons-material/Flag';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import ErrorIcon from '@mui/icons-material/Error';
import RemoveDoneIcon from '@mui/icons-material/RemoveDone';

export type Priority = 'none' | 'low' | 'medium' | 'high' | 'urgent';

interface PrioritySelectProps {
  value: Priority;
  onChange: (value: Priority) => void;
  disabled?: boolean;
  autoFocus?: boolean;
}

const priorityOptions = [
  { value: 'none', label: 'No Priority', icon: <FlagIcon />, color: '#757575' },
  { value: 'low', label: 'Low Priority', icon: <FlagIcon />, color: '#4CAF50' },
  { value: 'medium', label: 'Medium Priority', icon: <PriorityHighIcon />, color: '#FF9800' },
  { value: 'high', label: 'High Priority', icon: <ErrorIcon />, color: '#f44336' },
  { value: 'urgent', label: 'Urgent', icon: <RemoveDoneIcon />, color: '#d32f2f' }
];

export default function PrioritySelect({ value, onChange, disabled = false, autoFocus = false }: PrioritySelectProps) {
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);
  const [hasInteracted, setHasInteracted] = React.useState(false);
  
  // Auto-open when component mounts with autoFocus
  React.useEffect(() => {
    if (autoFocus) {
      const timer = setTimeout(() => {
        setOpen(true);
        setHasInteracted(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [autoFocus]);

  const handleChange = (event: SelectChangeEvent<Priority>) => {
    onChange(event.target.value as Priority);
    setOpen(false);
  };

  const handleClick = () => {
    if (!hasInteracted) {
      setHasInteracted(true);
      setOpen(true);
    }
  };

  const selectedOption = priorityOptions.find(option => option.value === value) || priorityOptions[0];

  return (
    <Select
      value={value}
      onChange={handleChange}
      disabled={disabled}
      variant="standard"
      size="small"
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      onClick={handleClick}
      autoFocus={autoFocus}
      sx={{
        minWidth: 150,
        '& .MuiSelect-select': {
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          paddingY: 0
        },
        '&:before': {
          display: 'none'
        },
        '&:after': {
          display: 'none'
        }
      }}
      renderValue={() => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ color: selectedOption.color }}>
            {selectedOption.icon}
          </Box>
          <Typography variant="body2">
            {selectedOption.label}
          </Typography>
        </Box>
      )}
    >
      {priorityOptions.map((option) => (
        <MenuItem 
          key={option.value} 
          value={option.value}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            '&:hover': {
              bgcolor: alpha(option.color, 0.1)
            },
            '&.Mui-selected': {
              bgcolor: alpha(option.color, 0.1),
              '&:hover': {
                bgcolor: alpha(option.color, 0.2)
              }
            }
          }}
        >
          <Box sx={{ color: option.color }}>
            {option.icon}
          </Box>
          <Typography variant="body2">
            {option.label}
          </Typography>
        </MenuItem>
      ))}
    </Select>
  );
} 