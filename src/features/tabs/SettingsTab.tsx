'use client';

import React from 'react';
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
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useSettingsState } from '@/hooks/useSettingsState';
import { SPACING, LAYOUT } from '@/constants';

// Shared styles for settings cards
const cardSx = {
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
  borderRadius: { xs: 0, sm: 2 },
  mx: { xs: -2, sm: 0 },
  '&:hover': {
    boxShadow: '0 6px 28px rgba(0, 0, 0, 0.35)',
    transform: 'translateY(-1px)',
    transition: 'all 0.2s ease-in-out'
  }
};

const cardContentSx = { p: { xs: 2, sm: 2.5, md: 3 } };

const titleSx = { fontSize: '1.1rem', fontWeight: 600, color: 'primary.main' };

const switchSx = {
  '& .MuiSwitch-switchBase': { p: 0.3 },
  '& .MuiSwitch-thumb': { width: 14, height: 14 },
  '& .MuiSwitch-track': { borderRadius: 16 / 2 },
  width: 36,
  height: 20
};

// Helper text styles to prevent background issues
const getHelperTextSx = (isDark: boolean) => ({
  color: isDark ? 'rgba(255,255,255,0.6)' : 'text.secondary',
  bgcolor: 'transparent !important',
  background: 'transparent !important',
  backgroundImage: 'none !important',
  border: 'none !important',
  borderRadius: '0 !important',
  boxShadow: 'none !important',
  outline: 'none !important',
  mt: 0.5,
  px: 0,
  mx: 0,
  '&:before, &:after, &::before, &::after': {
    display: 'none !important'
  },
  '&:hover, &:focus, &:active': {
    bgcolor: 'transparent !important',
    background: 'transparent !important'
  }
});

interface APIConfigCardProps {
  apiKey: string;
  setApiKey: (key: string) => void;
  groqApiKey: string;
  setGroqApiKey: (key: string) => void;
  azureKey: string;
  setAzureKey: (key: string) => void;
  azureRegion: string;
  setAzureRegion: (region: string) => void;
}

function APIConfigCard({
  apiKey, setApiKey,
  groqApiKey, setGroqApiKey,
  azureKey, setAzureKey,
  azureRegion, setAzureRegion,
}: APIConfigCardProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const helperTextSx = getHelperTextSx(isDark);

  const inputSx = {
    '& .MuiOutlinedInput-root': {
      bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'transparent'
    },
    '& .MuiFormHelperText-root': {
      bgcolor: 'transparent !important',
      background: 'none !important',
      border: 'none !important',
      boxShadow: 'none !important',
      borderRadius: 0,
      padding: '3px 0px 0px !important',
      margin: '3px 0px 0px !important',
      '&:before, &:after': { display: 'none !important' },
      '&.MuiFormHelperText-contained': {
        marginLeft: '0px !important',
        marginRight: '0px !important'
      }
    }
  };

  return (
    <Card sx={cardSx}>
      <CardContent sx={cardContentSx}>
        <Typography variant="h6" gutterBottom sx={titleSx}>
          API Configuration
        </Typography>
        <Divider sx={{ mb: 2.5 }} />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, md: 2.5 } }}>
          <TextField
            fullWidth
            label="OpenAI API Key"
            type="password"
            placeholder="sk-..."
            value={apiKey}
            onChange={(e) => {
              const newKey = e.target.value;
              setApiKey(newKey);
              if (newKey) {
                localStorage.setItem('openaiApiKey', newKey);
              }
            }}
            helperText="Used for AI task parsing and voice transcription (auto-saves)"
            variant="outlined"
            size="small"
            sx={inputSx}
            FormHelperTextProps={{ sx: helperTextSx }}
          />
          <TextField
            fullWidth
            label="Groq API Key"
            type="password"
            placeholder="gsk_..."
            value={groqApiKey}
            onChange={(e) => {
              const newKey = e.target.value;
              setGroqApiKey(newKey);
              if (newKey) {
                localStorage.setItem('groqApiKey', newKey);
              }
            }}
            helperText="For Groq Whisper (216x faster, 9x cheaper than OpenAI)"
            variant="outlined"
            size="small"
            sx={inputSx}
            FormHelperTextProps={{ sx: helperTextSx }}
          />
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
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
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'transparent'
                }
              }}
              FormHelperTextProps={{
                sx: {
                  color: isDark ? 'rgba(255,255,255,0.6)' : 'text.secondary',
                  bgcolor: 'transparent !important',
                  border: 'none !important',
                  boxShadow: 'none !important',
                  px: 0,
                  '&:before, &:after': { display: 'none !important' }
                }
              }}
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
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'transparent'
                }
              }}
              FormHelperTextProps={{
                sx: {
                  color: isDark ? 'rgba(255,255,255,0.6)' : 'text.secondary',
                  bgcolor: 'transparent !important',
                  border: 'none !important',
                  boxShadow: 'none !important',
                  px: 0,
                  '&:before, &:after': { display: 'none !important' }
                }
              }}
            />
          </Box>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
            <TextField
              fullWidth
              label="Whisper Model"
              defaultValue="whisper-1"
              variant="outlined"
              disabled
              size="small"
            />
            <TextField
              fullWidth
              label="GPT Model"
              defaultValue="gpt-4o"
              variant="outlined"
              disabled
              size="small"
            />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

interface VoiceRecognitionCardProps {
  voiceRecognitionLanguage: string;
  onVoiceLanguageChange: (event: any) => void;
  transcriptionService: string;
  onTranscriptionServiceChange: (event: any) => void;
}

function VoiceRecognitionCard({
  voiceRecognitionLanguage,
  onVoiceLanguageChange,
  transcriptionService,
  onTranscriptionServiceChange,
}: VoiceRecognitionCardProps) {
  return (
    <Card sx={cardSx}>
      <CardContent sx={cardContentSx}>
        <Typography variant="h6" gutterBottom sx={titleSx}>
          Voice Recognition
        </Typography>
        <Divider sx={{ mb: 2.5 }} />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Voice Recognition Language</InputLabel>
            <Select
              value={voiceRecognitionLanguage}
              label="Voice Recognition Language"
              onChange={onVoiceLanguageChange}
            >
              <MenuItem value="auto">Auto-detect</MenuItem>
              <MenuItem value="en">English</MenuItem>
              <MenuItem value="he">Hebrew</MenuItem>
              <MenuItem value="ru">Russian</MenuItem>
              <MenuItem value="es">Spanish</MenuItem>
              <MenuItem value="fr">French</MenuItem>
              <MenuItem value="de">German</MenuItem>
              <MenuItem value="ar">Arabic</MenuItem>
              <MenuItem value="zh">Chinese</MenuItem>
              <MenuItem value="ja">Japanese</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth size="small" sx={{ mt: 1 }}>
            <InputLabel>Transcription Service</InputLabel>
            <Select
              value={transcriptionService}
              label="Transcription Service"
              onChange={onTranscriptionServiceChange}
            >
              <MenuItem value="browser">Browser Speech API (Real-time)</MenuItem>
              <MenuItem value="whisper">OpenAI Whisper (High Accuracy)</MenuItem>
              <MenuItem value="groq">Groq Whisper (Ultra-fast, Low Cost)</MenuItem>
              <MenuItem value="azure">Azure Speech Service</MenuItem>
              <MenuItem value="hybrid">Hybrid (Browser + Cloud Fallback)</MenuItem>
            </Select>
          </FormControl>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, fontSize: '0.75rem' }}>
            {transcriptionService === 'browser' && 'Fast, real-time transcription using your browser. Works offline but may be less accurate.'}
            {transcriptionService === 'whisper' && 'High-accuracy cloud transcription using OpenAI Whisper. Requires internet and API key.'}
            {transcriptionService === 'groq' && 'Ultra-fast (216x faster) and 9x cheaper than OpenAI. Uses Whisper model on Groq hardware.'}
            {transcriptionService === 'azure' && 'Enterprise-grade transcription using Azure Speech Services. Requires Azure credentials.'}
            {transcriptionService === 'hybrid' && 'Uses browser for real-time feedback, then sends to cloud for final accuracy.'}
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <FormControlLabel
              control={<Switch defaultChecked size="small" sx={switchSx} />}
              label={<Typography variant="body2">Real-time transcription</Typography>}
              sx={{ m: 0, py: 0.5 }}
            />
            <FormControlLabel
              control={<Switch defaultChecked size="small" sx={switchSx} />}
              label={<Typography variant="body2">Auto-punctuation</Typography>}
              sx={{ m: 0, py: 0.5 }}
            />
            <FormControlLabel
              control={<Switch size="small" sx={switchSx} />}
              label={<Typography variant="body2">Continuous listening</Typography>}
              sx={{ m: 0, py: 0.5 }}
            />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

function NotificationsCard() {
  const { t } = useTranslation(['settings']);

  return (
    <Card sx={cardSx}>
      <CardContent sx={cardContentSx}>
        <Typography variant="h6" gutterBottom sx={titleSx}>
          {t('settings.notifications', 'Notifications')}
        </Typography>
        <Divider sx={{ mb: 2.5 }} />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <FormControlLabel
              control={<Switch defaultChecked size="small" sx={switchSx} />}
              label={<Typography variant="body2">Task reminders</Typography>}
              sx={{ m: 0, py: 0.5 }}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, pl: 4, mt: 0.5 }}>
              <TextField
                type="number"
                label="Reminder time"
                defaultValue="15"
                variant="outlined"
                size="small"
                sx={{ width: 100 }}
                InputProps={{ inputProps: { min: 0, max: 60 } }}
              />
              <Typography variant="body2" color="text.secondary">
                minutes before
              </Typography>
            </Box>
            <FormControlLabel
              control={<Switch defaultChecked size="small" sx={switchSx} />}
              label={<Typography variant="body2">Sound alerts</Typography>}
              sx={{ m: 0, py: 0.5 }}
            />
            <FormControlLabel
              control={<Switch size="small" sx={switchSx} />}
              label={<Typography variant="body2">Email notifications</Typography>}
              sx={{ m: 0, py: 0.5 }}
            />
            <FormControlLabel
              control={<Switch size="small" sx={switchSx} />}
              label={<Typography variant="body2">Desktop notifications</Typography>}
              sx={{ m: 0, py: 0.5 }}
            />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

function DateTimeCard() {
  return (
    <Card sx={{ ...cardSx, '&:hover': undefined }}>
      <CardContent sx={cardContentSx}>
        <Typography variant="h6" gutterBottom sx={titleSx}>
          Date & Time Format
        </Typography>
        <Divider sx={{ mb: 2.5 }} />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, md: 2.5 } }}>
          <FormControl fullWidth size="small">
            <InputLabel>Date Format</InputLabel>
            <Select defaultValue="MM/DD/YYYY" label="Date Format">
              <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
              <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
              <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth size="small">
            <InputLabel>Time Format</InputLabel>
            <Select defaultValue="12h" label="Time Format">
              <MenuItem value="12h">12-hour (AM/PM)</MenuItem>
              <MenuItem value="24h">24-hour</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth size="small">
            <InputLabel>Timezone</InputLabel>
            <Select defaultValue="auto" label="Timezone">
              <MenuItem value="auto">Auto-detect</MenuItem>
              <MenuItem value="UTC">UTC</MenuItem>
              <MenuItem value="EST">Eastern Time</MenuItem>
              <MenuItem value="PST">Pacific Time</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </CardContent>
    </Card>
  );
}

interface AppearanceCardProps {
  selectedLanguage: string;
  onLanguageChange: (event: any) => void;
}

function AppearanceCard({ selectedLanguage, onLanguageChange }: AppearanceCardProps) {
  const { t } = useTranslation(['common']);

  return (
    <Card sx={{ ...cardSx, '&:hover': undefined }}>
      <CardContent sx={cardContentSx}>
        <Typography variant="h6" gutterBottom sx={titleSx}>
          Appearance
        </Typography>
        <Divider sx={{ mb: 2.5 }} />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Interface Language</InputLabel>
            <Select
              value={selectedLanguage}
              label="Interface Language"
              onChange={onLanguageChange}
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
              control={<Switch size="small" sx={switchSx} />}
              label={<Typography variant="body2">Compact mode</Typography>}
              sx={{ m: 0, py: 0.5 }}
            />
            <FormControlLabel
              control={<Switch defaultChecked size="small" sx={switchSx} />}
              label={<Typography variant="body2">Show animations</Typography>}
              sx={{ m: 0, py: 0.5 }}
            />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

function AdvancedCard() {
  return (
    <Card sx={{ ...cardSx, '&:hover': undefined }}>
      <CardContent sx={cardContentSx}>
        <Typography variant="h6" gutterBottom sx={titleSx}>
          Advanced
        </Typography>
        <Divider sx={{ mb: 2.5 }} />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <FormControlLabel
              control={<Switch size="small" sx={switchSx} />}
              label={<Typography variant="body2">Developer mode</Typography>}
              sx={{ m: 0, py: 0.5 }}
            />
            <FormControlLabel
              control={<Switch defaultChecked size="small" sx={switchSx} />}
              label={<Typography variant="body2">Auto-save</Typography>}
              sx={{ m: 0, py: 0.5 }}
            />
            <FormControlLabel
              control={<Switch size="small" sx={switchSx} />}
              label={<Typography variant="body2">Offline mode</Typography>}
              sx={{ m: 0, py: 0.5 }}
            />
          </Box>
          <Box sx={{ mt: 1 }}>
            <Button variant="outlined" size="small" color="error">
              Clear All Data
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

interface SettingsTabProps {
  transcriptionService: string;
  onTranscriptionServiceChange: (event: any) => void;
}

export default function SettingsTab({
  transcriptionService,
  onTranscriptionServiceChange,
}: SettingsTabProps) {
  const { t } = useTranslation(['common', 'actions']);

  const {
    selectedLanguage,
    voiceRecognitionLanguage,
    apiKey,
    groqApiKey,
    azureKey,
    azureRegion,
    setApiKey,
    setGroqApiKey,
    setAzureKey,
    setAzureRegion,
    handleLanguageChange,
    handleVoiceLanguageChange,
    handleSaveSettings,
  } = useSettingsState();

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      gap: { xs: SPACING.GAP_MD, md: SPACING.GAP_LG },
      width: '100%',
      pt: SPACING.TAB_PANEL_PADDING,
      px: SPACING.TAB_PANEL_PADDING,
      flex: 1,
      minHeight: 0,
      overflow: 'auto',
      pb: { xs: `${LAYOUT.MOBILE_BOTTOM_PADDING}px`, sm: SPACING.TAB_PANEL_PADDING.sm },
      transition: 'all 0.3s ease'
    }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: { xs: 2, md: 3 } }}>
        <APIConfigCard
          apiKey={apiKey}
          setApiKey={setApiKey}
          groqApiKey={groqApiKey}
          setGroqApiKey={setGroqApiKey}
          azureKey={azureKey}
          setAzureKey={setAzureKey}
          azureRegion={azureRegion}
          setAzureRegion={setAzureRegion}
        />

        <VoiceRecognitionCard
          voiceRecognitionLanguage={voiceRecognitionLanguage}
          onVoiceLanguageChange={handleVoiceLanguageChange}
          transcriptionService={transcriptionService}
          onTranscriptionServiceChange={onTranscriptionServiceChange}
        />

        <NotificationsCard />

        <DateTimeCard />

        <AppearanceCard
          selectedLanguage={selectedLanguage}
          onLanguageChange={handleLanguageChange}
        />

        <AdvancedCard />
      </Box>

      <Box sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'flex-end',
        gap: 2,
        mt: 3,
        '& .MuiButton-root': {
          minHeight: { xs: 48, sm: 'auto' }
        }
      }}>
        <Button variant="outlined" size="medium">
          {t('actions.cancel', 'Cancel')}
        </Button>
        <Button
          variant="contained"
          size="medium"
          onClick={handleSaveSettings}
          sx={{
            background: 'linear-gradient(180deg, #2196F3 0%, #1976D2 100%)',
            boxShadow: '0 2px 4px rgba(33, 150, 243, 0.25)',
          }}
        >
          {t('actions.save', 'Save')}
        </Button>
      </Box>
    </Box>
  );
}
