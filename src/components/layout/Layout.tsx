'use client';

import React, { ReactNode, useState } from 'react';
import { Box, useTheme } from '@mui/material';
import Header from './Header';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const theme = useTheme();
  const [narrowMode, setNarrowMode] = useState(false);
  
  const toggleNarrowMode = () => {
    setNarrowMode(!narrowMode);
  };
  
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh',
      overflow: 'hidden'
    }}>
      <Header narrowMode={narrowMode} onToggleNarrowMode={toggleNarrowMode} />
      <Box sx={{ 
        flexGrow: 1, 
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: theme.palette.background.default,
        ...(narrowMode && {
          maxWidth: '2200px',
          mx: 'auto',
          width: '100%',
          px: 3,
          border: 'none',
          boxShadow: 'none'
        })
      }}>
        {children}
      </Box>
    </Box>
  );
} 