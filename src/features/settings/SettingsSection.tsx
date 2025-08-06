'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Divider,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Button,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import i18n from '@/i18n';
import { useTranscriptionConfig } from '@/contexts/TranscriptionContext';

export default function SettingsSection() {
  const { t } = useTranslation(['common']);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { service: transcriptionService, setService: setTranscriptionService } = useTranscriptionConfig();
  
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language || 'en');
  const [voiceRecognitionLanguage, setVoiceRecognitionLanguage] = useState('en');
  const [apiKey, setApiKey] = useState('');
  const [azureKey, setAzureKey] = useState('');
  const [azureRegion, setAzureRegion] = useState('');

  const handleTranscriptionServiceChange = (event: any) => {
    setTranscriptionService(event.target.value);
  };

  const handleLanguageChange = (event: any) => {
    setSelectedLanguage(event.target.value);
  };

  const handleVoiceLanguageChange = (event: any) => {
    setVoiceRecognitionLanguage(event.target.value);
  };

  const handleSaveSettings = () => {
    i18n.changeLanguage(selectedLanguage);
    localStorage.setItem('voiceRecognitionLanguage', voiceRecognitionLanguage);
    if (apiKey) localStorage.setItem('openaiApiKey', apiKey);
    if (azureKey) localStorage.setItem('azureApiKey', azureKey);
    if (azureRegion) localStorage.setItem('azureRegion', azureRegion);
    alert('Settings saved successfully!');
  };

  useEffect(() => {
    const savedApiKey = localStorage.getItem('openaiApiKey') || '';
    const savedAzureKey = localStorage.getItem('azureApiKey') || '';
    const savedAzureRegion = localStorage.getItem('azureRegion') || '';
    const savedVoiceLanguage = localStorage.getItem('voiceRecognitionLanguage') || 'en';
    
    setApiKey(savedApiKey);
    setAzureKey(savedAzureKey);
    setAzureRegion(savedAzureRegion);
    setVoiceRecognitionLanguage(savedVoiceLanguage);
    setSelectedLanguage(i18n.language || 'en');
  }, []);

  const cardStyles = {
    boxShadow: isMobile ? '0 2px 8px rgba(0,0,0,0.1)' : '0 0 8px rgba(0, 0, 0, 0.1)',
    borderRadius: 2,
    mx: isMobile ? 0 : 0,
    border: isMobile ? `1px solid ${theme.palette.divider}` : 'none',
    '&:hover': !isMobile ? {
      boxShadow: '0 0 12px rgba(0, 0, 0, 0.15)',
      transform: 'translateY(-1px)',
      transition: 'all 0.2s ease-in-out'
    } : {}
  };

  const settingsCards = [
    {
      title: 'API Configuration',
      content: (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            fullWidth
            label="OpenAI API Key"
            type="password"
            placeholder="sk-..."
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            helperText="Used for AI task parsing and voice transcription"
            variant="outlined"
            size="small"
          />
          <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 2 }}>
            <TextField
              fullWidth
              label="Azure Speech Key"
              type="password"
              placeholder="Azure API key..."
              value={azureKey}
              onChange={(e) => setAzureKey(e.target.value)}
              helperText="For Azure Speech Service"
              variant="outlined"
              size="small"
            />
            <TextField
              fullWidth
              label="Azure Region"
              placeholder="eastus, westus2, etc."
              value={azureRegion}
              onChange={(e) => setAzureRegion(e.target.value)}
              helperText="Azure service region"
              variant="outlined"
              size="small"
            />
          </Box>
        </Box>
      )
    },
    {
      title: 'Voice Recognition',
      content: (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Voice Recognition Language</InputLabel>
            <Select 
              value={voiceRecognitionLanguage} 
              label="Voice Recognition Language"
              onChange={handleVoiceLanguageChange}
            >
              <MenuItem value="en">English</MenuItem>
              <MenuItem value="he">Hebrew</MenuItem>
              <MenuItem value="es">Spanish</MenuItem>
              <MenuItem value="fr">French</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth size="small">
            <InputLabel>Transcription Service</InputLabel>
            <Select 
              value={transcriptionService} 
              label="Transcription Service"
              onChange={handleTranscriptionServiceChange}
            >
              <MenuItem value="browser">Browser Speech API (Real-time)</MenuItem>
              <MenuItem value="whisper">OpenAI Whisper (High Accuracy)</MenuItem>
              <MenuItem value="azure">Azure Speech Service</MenuItem>
              <MenuItem value="hybrid">Hybrid (Browser + Cloud Fallback)</MenuItem>
            </Select>
          </FormControl>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <FormControlLabel
              control={<Switch defaultChecked size="small" />}
              label={<Typography variant="body2">Real-time transcription</Typography>}
            />
            <FormControlLabel
              control={<Switch defaultChecked size="small" />}
              label={<Typography variant="body2">Auto-punctuation</Typography>}
            />
            <FormControlLabel
              control={<Switch size="small" />}
              label={<Typography variant="body2">Continuous listening</Typography>}
            />
          </Box>
        </Box>
      )
    },
    {
      title: 'Notifications',
      content: (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <FormControlLabel
            control={<Switch defaultChecked size="small" />}
            label={<Typography variant="body2">Task reminders</Typography>}
          />
          <FormControlLabel
            control={<Switch defaultChecked size="small" />}
            label={<Typography variant="body2">Sound alerts</Typography>}
          />
          <FormControlLabel
            control={<Switch size="small" />}
            label={<Typography variant="body2">Email notifications</Typography>}
          />
          <FormControlLabel
            control={<Switch size="small" />}
            label={<Typography variant="body2">Desktop notifications</Typography>}
          />
        </Box>
      )
    },
    {
      title: 'Appearance',
      content: (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Interface Language</InputLabel>
            <Select 
              value={selectedLanguage} 
              label="Interface Language"
              onChange={handleLanguageChange}
            >
              <MenuItem value="en">{t('language.en')}</MenuItem>
              <MenuItem value="he">{t('language.he')}</MenuItem>
              <MenuItem value="es">{t('language.es')}</MenuItem>
              <MenuItem value="fr">{t('language.fr')}</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth size="small">
            <InputLabel>Theme</InputLabel>
            <Select defaultValue="light" label="Theme">
              <MenuItem value="light">Light</MenuItem>
              <MenuItem value="dark">Dark</MenuItem>
              <MenuItem value="auto">Auto (System)</MenuItem>
            </Select>
          </FormControl>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <FormControlLabel
              control={<Switch size="small" />}
              label={<Typography variant="body2">Compact mode</Typography>}
            />
            <FormControlLabel
              control={<Switch defaultChecked size="small" />}
              label={<Typography variant="body2">Show animations</Typography>}
            />
          </Box>
        </Box>
      )
    }
  ];

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: 2, 
      maxWidth: 1200, 
      mx: 'auto',
      p: isMobile ? 2 : 0
    }}>
      <Box sx={{ 
        display: isMobile ? 'flex' : 'grid', 
        flexDirection: isMobile ? 'column' : undefined,
        gridTemplateColumns: isMobile ? undefined : { 
          sm: 'repeat(2, 1fr)', 
          lg: 'repeat(2, 1fr)', 
          xl: 'repeat(3, 1fr)' 
        }, 
        gap: 2
      }}>
        {settingsCards.map((card, index) => (
          <Card key={index} sx={cardStyles}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="h6" gutterBottom sx={{ 
                fontSize: '1.1rem', 
                fontWeight: 600, 
                color: 'primary.main' 
              }}>
                {card.title}
              </Typography>
              <Divider sx={{ mb: 2.5 }} />
              {card.content}
            </CardContent>
          </Card>
        ))}
      </Box>
      
      <Box sx={{ 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'flex-end', 
        gap: 2, 
        mt: 3
      }}>
        <Button variant="outlined" size="medium" fullWidth={isMobile}>
          {t('actions.cancel')}
        </Button>
        <Button 
          variant="contained" 
          size="medium"
          fullWidth={isMobile}
          onClick={handleSaveSettings}
          sx={{
            background: 'linear-gradient(180deg, #2196F3 0%, #1976D2 100%)',
            boxShadow: '0 2px 4px rgba(33, 150, 243, 0.25)',
          }}
        >
          {t('actions.save')}
        </Button>
      </Box>
    </Box>
  );
}