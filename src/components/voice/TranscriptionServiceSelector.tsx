'use client';

import React from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Box,
  Chip,
  Typography
} from '@mui/material';
import {
  Speed as SpeedIcon,
  HighQuality as AccuracyIcon,
  MonetizationOn as CostIcon,
  Language as LanguageIcon
} from '@mui/icons-material';

export type TranscriptionService = 'browser' | 'whisper' | 'google' | 'hybrid';

interface ServiceInfo {
  name: string;
  speed: 'Fast' | 'Medium' | 'Slow';
  accuracy: 'High' | 'Medium' | 'Low';
  cost: 'Free' | 'Low' | 'Medium';
  languages: number;
  description: string;
}

const serviceInfo: Record<TranscriptionService, ServiceInfo> = {
  browser: {
    name: 'Browser Speech API',
    speed: 'Fast',
    accuracy: 'Medium',
    cost: 'Free',
    languages: 50,
    description: 'Real-time transcription using your browser'
  },
  whisper: {
    name: 'OpenAI Whisper',
    speed: 'Slow',
    accuracy: 'High',
    cost: 'Low',
    languages: 99,
    description: 'Most accurate, supports 99+ languages'
  },
  google: {
    name: 'Google Speech-to-Text',
    speed: 'Fast',
    accuracy: 'High',
    cost: 'Free',
    languages: 125,
    description: 'Fast and accurate, 60 min/month free'
  },
  hybrid: {
    name: 'Hybrid Mode',
    speed: 'Fast',
    accuracy: 'High',
    cost: 'Free',
    languages: 125,
    description: 'Browser first, cloud fallback'
  }
};

interface TranscriptionServiceSelectorProps {
  value: TranscriptionService;
  onChange: (service: TranscriptionService) => void;
}

export const TranscriptionServiceSelector: React.FC<TranscriptionServiceSelectorProps> = ({
  value,
  onChange
}) => {
  const handleChange = (event: SelectChangeEvent<TranscriptionService>) => {
    onChange(event.target.value as TranscriptionService);
  };

  const getSpeedColor = (speed: string) => {
    switch (speed) {
      case 'Fast': return 'success';
      case 'Medium': return 'warning';
      case 'Slow': return 'error';
      default: return 'default';
    }
  };

  const getAccuracyColor = (accuracy: string) => {
    switch (accuracy) {
      case 'High': return 'success';
      case 'Medium': return 'warning';
      case 'Low': return 'error';
      default: return 'default';
    }
  };

  const getCostColor = (cost: string) => {
    switch (cost) {
      case 'Free': return 'success';
      case 'Low': return 'info';
      case 'Medium': return 'warning';
      default: return 'default';
    }
  };

  return (
    <FormControl fullWidth size="small">
      <InputLabel>Voice Service</InputLabel>
      <Select
        value={value}
        onChange={handleChange}
        label="Voice Service"
      >
        {Object.entries(serviceInfo).map(([key, info]) => (
          <MenuItem key={key} value={key}>
            <Box sx={{ width: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2" fontWeight="medium">
                  {info.name}
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Chip
                    icon={<SpeedIcon />}
                    label={info.speed}
                    size="small"
                    color={getSpeedColor(info.speed)}
                    variant="outlined"
                  />
                  <Chip
                    icon={<AccuracyIcon />}
                    label={info.accuracy}
                    size="small"
                    color={getAccuracyColor(info.accuracy)}
                    variant="outlined"
                  />
                  <Chip
                    icon={<CostIcon />}
                    label={info.cost}
                    size="small"
                    color={getCostColor(info.cost)}
                    variant="outlined"
                  />
                </Box>
              </Box>
              <Typography variant="caption" color="text.secondary">
                {info.description} • {info.languages}+ languages
              </Typography>
            </Box>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};