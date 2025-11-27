'use client';

import React from 'react';
import { Box } from '@mui/material';

interface NoteTabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

export default function NoteTabPanel(props: NoteTabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`note-tabpanel-${index}`}
      aria-labelledby={`note-tab-${index}`}
      {...other}
      style={{ width: '100%', height: '100%' }}
    >
      {value === index && (
        <Box sx={{ p: 0, height: '100%' }}>
          {children}
        </Box>
      )}
    </div>
  );
}
