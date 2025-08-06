'use client';

import dynamic from 'next/dynamic';
import { Box } from '@mui/material';

const FloatingMicButton = dynamic(
  () => import('./FloatingMicButton'),
  {
    ssr: false,
    loading: () => (
      <Box 
        sx={{ 
          position: 'fixed', 
          bottom: 24, 
          right: 24, 
          zIndex: 1000,
          width: 56,
          height: 56,
          borderRadius: '50%',
          bgcolor: 'primary.main',
          opacity: 0.3,
          animation: 'pulse 2s infinite',
          '@keyframes pulse': {
            '0%': { opacity: 0.3 },
            '50%': { opacity: 0.6 },
            '100%': { opacity: 0.3 },
          },
        }} 
      />
    ),
  }
);

export default FloatingMicButton;