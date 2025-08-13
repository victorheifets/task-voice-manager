'use client';

import React, { ReactNode } from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import Header from './Header';

interface LayoutProps {
  children: ReactNode;
  onTabChange?: (tabIndex: number) => void;
  onMenuClick?: () => void;
  isWideView?: boolean;
  onViewToggle?: () => void;
  activeTab?: number;
}

export default function Layout({ children, onTabChange, onMenuClick, isWideView, onViewToggle, activeTab }: LayoutProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh',
      overflow: 'hidden',
      bgcolor: theme.palette.background.default
    }}>
      <Header 
        onTabChange={onTabChange} 
        onMenuClick={onMenuClick} 
        isWideView={isWideView}
        onViewToggle={onViewToggle}
      />
      <Box sx={{ 
        flexGrow: 1, 
        // CRITICAL: Allow shadows to render without clipping
        overflow: 'visible',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: theme.palette.background.default,
        // Smart padding: enough space for shadows but not cramped, except notes should be full width
        px: activeTab === 1 ? 0 : (isMobile ? 2 : 3), // No padding for notes tab, normal padding for others
        py: isMobile ? 0 : 2, // Remove padding on mobile for seamless nav bar effect
        width: '100%',
        minHeight: isMobile ? 'calc(100vh - 56px - 56px)' : 'auto'
      }}>
        {children}
      </Box>
    </Box>
  );
} 