'use client';

import React, { ReactNode } from 'react';
import { Box, useTheme } from '@mui/material';
import Header from './Header';

interface LayoutProps {
  children: ReactNode;
  onTabChange?: (tabIndex: number) => void;
  onMenuClick?: () => void;
}

export default function Layout({ children, onTabChange, onMenuClick }: LayoutProps) {
  const theme = useTheme();
  
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh',
      overflow: 'hidden',
      bgcolor: theme.palette.background.default
    }}>
      <Header onTabChange={onTabChange} onMenuClick={onMenuClick} />
      <Box sx={{ 
        flexGrow: 1, 
        overflow: 'hidden', // Remove outer scroll
        display: 'flex',
        flexDirection: 'column',
        bgcolor: theme.palette.background.default,
        px: { xs: 2, md: 4 }, // More padding on sides, responsive
        py: 2
      }}>
        {children}
      </Box>
    </Box>
  );
} 