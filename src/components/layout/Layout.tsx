'use client';

import React, { ReactNode } from 'react';
import { Box, Typography, useTheme, useMediaQuery } from '@mui/material';
import Header from './Header';

// Import version from package.json
const APP_VERSION = '1.1.0';

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
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: theme.palette.background.default,
        // Consistent padding across all tabs
        px: isMobile ? 2 : 3,
        py: isMobile ? 0 : 2, // Remove padding on mobile for seamless nav bar effect
        width: '100%',
        minHeight: isMobile ? 'calc(100vh - 56px - 56px)' : 'auto'
      }}>
        {children}
      </Box>

      {/* Version indicator */}
      <Typography
        variant="caption"
        sx={{
          position: 'fixed',
          bottom: isMobile ? 62 : 8,
          left: 8,
          color: theme.palette.text.disabled,
          fontSize: '0.65rem',
          opacity: 0.6,
          zIndex: 10,
          userSelect: 'none',
        }}
      >
        v{APP_VERSION}
      </Typography>
    </Box>
  );
} 