'use client';

import React, { useState } from 'react';
import { Box, ToggleButton, ToggleButtonGroup, Typography, useTheme } from '@mui/material';
import EnhancedTaskManager from './EnhancedTaskManager';

const designs = [
  { id: 'enhanced', name: '✨ Enhanced Task Manager - Professional Edition', component: EnhancedTaskManager },
];

interface DesignSwitcherProps {
  onTranscript: (text: string) => void;
  transcriptionService?: 'browser' | 'whisper' | 'azure' | 'hybrid';
}

const DesignSwitcher: React.FC<DesignSwitcherProps> = ({ onTranscript, transcriptionService }) => {
  const [selectedDesign, setSelectedDesign] = useState('enhanced');
  const theme = useTheme();

  const handleDesignChange = (event: React.MouseEvent<HTMLElement>, newDesign: string) => {
    if (newDesign !== null) {
      setSelectedDesign(newDesign);
    }
  };

  const SelectedComponent = designs.find(d => d.id === selectedDesign)?.component || EnhancedTaskManager;

  return (
    <Box sx={{ width: '100%' }}>
      <SelectedComponent 
        onTranscript={onTranscript}
        transcriptionService={transcriptionService}
      />
    </Box>
  );
};

export default DesignSwitcher;