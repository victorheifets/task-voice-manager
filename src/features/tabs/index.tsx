'use client';

import dynamic from 'next/dynamic';
import { CircularProgress, Box } from '@mui/material';

// TasksTab is loaded eagerly since it's the default tab
export { default as TasksTab } from './TasksTab';

// Lazy loading component
const LoadingFallback = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
    <CircularProgress size={24} />
  </Box>
);

// Lazy load NotesTab (only loaded when user clicks Notes tab)
export const NotesTab = dynamic(() => import('./NotesTab'), {
  loading: LoadingFallback,
  ssr: false,
});

// Lazy load SettingsTab (only loaded when user clicks Settings tab)
export const SettingsTab = dynamic(() => import('./SettingsTab'), {
  loading: LoadingFallback,
  ssr: false,
});
