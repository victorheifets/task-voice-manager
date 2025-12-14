'use client';

import './suppressHydrationWarning';
import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  useMediaQuery,
  useTheme,
  Tooltip,
  Dialog,
  DialogContent,
  Divider,
  CircularProgress,
} from '@mui/material';
import TaskIcon from '@mui/icons-material/Task';
import NotesIcon from '@mui/icons-material/Notes';
import SettingsIcon from '@mui/icons-material/Settings';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import TaskInput from '@/features/tasks/TaskInput';
import { TasksTab, NotesTab, SettingsTab } from '@/features/tabs';
import { isInDemoMode } from '@/lib/supabase/client';
import Layout from '@/components/layout/Layout';
import { useTranslation } from 'react-i18next';
import DynamicFloatingMicButton from '@/features/voice/DynamicFloatingMicButton';
import { TranscriptionProvider, useTranscriptionConfig } from '@/contexts/TranscriptionContext';
import { ClientOnly } from '@/shared/ui';
import { useAuth } from '@/components/auth/AuthProvider';
import { LoginForm } from '@/components/auth/LoginForm';
import { LAYOUT } from '@/constants';
import VoiceDebugPanel from '@/components/debug/VoiceDebugPanel';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
      style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      {value === index && children}
    </div>
  );
}

function MainContent() {
  const { t } = useTranslation(['common', 'notes']);
  const {
    service: transcriptionService,
    setService: setTranscriptionService,
    language: voiceLanguage,
  } = useTranscriptionConfig();

  // Core state
  const [activeTab, setActiveTab] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showMobileTextInput, setShowMobileTextInput] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [isWideView, setIsWideView] = useState(true);
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [isVoiceProcessing, setIsVoiceProcessing] = useState(false);
  const [voiceError, setVoiceError] = useState<string | undefined>();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

  // Tab handlers
  const handleTabChange = useCallback((event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  }, []);

  const handleHeaderTabChange = useCallback((tabIndex: number) => {
    setActiveTab(tabIndex);
  }, []);

  const handleMenuClick = useCallback(() => {
    // Handle mobile menu click
  }, []);

  const handleViewToggle = useCallback(() => {
    setIsWideView(prev => !prev);
  }, []);

  // Task handlers
  const handleTaskAdded = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearchFilter(value);
  }, []);

  const handleStatusFilterClick = useCallback((status: string) => {
    setStatusFilter(status);
  }, []);

  const handleBulkDelete = useCallback(async () => {
    try {
      const { deleteTask } = await import('@/lib/supabase/client');
      const deletePromises = Array.from(selectedTasks).map(taskId => deleteTask(taskId));
      await Promise.all(deletePromises);
      setSelectedTasks(new Set());
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Failed to delete tasks:', error);
    }
  }, [selectedTasks]);

  // Voice handlers
  const handleFloatingMicTranscript = useCallback((text: string) => {
    console.log('🎤 page.tsx: Received transcript:', text);
    setCurrentTranscript(text);
    setVoiceError(undefined);
    // Keep dialog open - don't close it here, user can close after seeing transcript
  }, []);

  const handleRecordingStart = useCallback(() => {
    console.log('🎤 page.tsx: Recording started, isMobile:', isMobile);
    setIsVoiceRecording(true);
    setVoiceError(undefined);
    // Only open dialog on mobile - desktop doesn't need popup
    if (isMobile) {
      setShowMobileTextInput(true);
    }
  }, [isMobile]);

  const handleRecordingStop = useCallback(() => {
    console.log('🎤 page.tsx: Recording stopped');
    setIsVoiceRecording(false);
  }, []);

  const handleProcessingStart = useCallback(() => {
    console.log('🎤 page.tsx: Processing started');
    setIsVoiceProcessing(true);
  }, []);

  const handleProcessingEnd = useCallback(() => {
    console.log('🎤 page.tsx: Processing ended');
    setIsVoiceProcessing(false);
  }, []);

  const handleTranscriptionServiceChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setTranscriptionService(event.target.value as 'browser' | 'whisper' | 'groq' | 'azure' | 'hybrid');
  }, [setTranscriptionService]);

  return (
    <Layout
      onTabChange={handleHeaderTabChange}
      onMenuClick={handleMenuClick}
      isWideView={isWideView}
      onViewToggle={handleViewToggle}
      activeTab={activeTab}
    >
      <Box
        id="main-content"
        component="main"
        role="main"
        aria-label="Main content"
        sx={{
          flexGrow: 1,
          pb: isMobile ? 0 : 2,
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          height: isMobile ? `calc(100vh - ${LAYOUT.BOTTOM_NAV_HEIGHT}px)` : '100%',
          width: '100%',
          maxWidth: (isMobile || isTablet || isWideView) ? '100%' : `${LAYOUT.MAX_CONTENT_WIDTH}px`,
          mx: 'auto',
          transition: 'all 0.3s ease'
        }}
      >
        {/* Desktop Tabs */}
        {!isMobile && (
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="fullWidth"
            aria-label="Main navigation tabs"
            sx={{
              borderBottom: `1px solid ${theme.palette.divider}`,
              mb: 2,
              bgcolor: 'transparent',
              '& .MuiTab-root': {
                py: 1.5,
                px: 2,
                fontSize: '1rem',
                fontWeight: 500,
                textTransform: 'none',
                minHeight: 48,
                color: theme.palette.text.secondary,
                textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  color: theme.palette.text.primary,
                  bgcolor: theme.palette.action.hover,
                  textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
                },
                '&.Mui-selected': {
                  color: theme.palette.primary.main,
                  textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
                  fontWeight: 600
                }
              },
              '& .MuiTabs-indicator': {
                height: 2,
                borderRadius: '1px',
                backgroundColor: theme.palette.primary.main
              }
            }}
          >
            <Tab label={t('tabs.tasks')} id="tab-0" aria-controls="tabpanel-0" />
            <Tab label={t('tabs.notes')} id="tab-1" aria-controls="tabpanel-1" />
            <Tab label={t('tabs.config')} id="tab-2" aria-controls="tabpanel-2" />
          </Tabs>
        )}

        {/* Tasks Tab */}
        <TabPanel value={activeTab} index={0}>
          <TasksTab
            refreshTrigger={refreshTrigger}
            onTaskAdded={handleTaskAdded}
            currentTranscript={currentTranscript}
            searchFilter={searchFilter}
            statusFilter={statusFilter}
            onSearchChange={handleSearchChange}
            onStatusFilterChange={handleStatusFilterClick}
            selectedTasks={selectedTasks}
            onSelectedTasksChange={setSelectedTasks}
            onBulkDelete={handleBulkDelete}
          />
        </TabPanel>

        {/* Notes Tab */}
        <TabPanel value={activeTab} index={1}>
          <NotesTab isMobile={isMobile} />
        </TabPanel>

        {/* Settings Tab */}
        <TabPanel value={activeTab} index={2}>
          <SettingsTab
            transcriptionService={transcriptionService}
            onTranscriptionServiceChange={handleTranscriptionServiceChange}
          />
        </TabPanel>
      </Box>

      {/* Floating action buttons */}
      <ClientOnly>
        {isMobile ? (
          <Box sx={{
            position: 'fixed',
            bottom: 80,
            right: 16,
            // zIndex must be higher than MUI Dialog (1300) when dialog is open
            zIndex: showMobileTextInput ? 1400 : 1000
          }}>
            <Tooltip title="Add Task (Voice or Text)">
              <DynamicFloatingMicButton
                onTranscript={handleFloatingMicTranscript}
                transcriptionService={transcriptionService}
                language={voiceLanguage}
                showTextOption={true}
                onTextInput={() => setShowMobileTextInput(true)}
                onRecordingStart={handleRecordingStart}
                onRecordingStop={handleRecordingStop}
                onProcessingStart={handleProcessingStart}
                onProcessingEnd={handleProcessingEnd}
              />
            </Tooltip>
          </Box>
        ) : (
          activeTab === 0 && !isMobile && (
            <Box sx={{ position: 'fixed', bottom: 80, right: 80, zIndex: 1000 }}>
              <DynamicFloatingMicButton
                onTranscript={handleFloatingMicTranscript}
                transcriptionService={transcriptionService}
                language={voiceLanguage}
                onRecordingStart={handleRecordingStart}
                onRecordingStop={handleRecordingStop}
                onProcessingStart={handleProcessingStart}
                onProcessingEnd={handleProcessingEnd}
              />
            </Box>
          )
        )}
      </ClientOnly>

      {/* Mobile Voice Debug Panel */}
      {isMobile && (
        <ClientOnly>
          <VoiceDebugPanel
            isRecording={isVoiceRecording}
            isProcessing={isVoiceProcessing}
            transcriptionService={transcriptionService}
            transcript={currentTranscript}
            error={voiceError}
            language={voiceLanguage}
          />
        </ClientOnly>
      )}

      {/* Mobile Text Input Dialog */}
      <Dialog
        open={showMobileTextInput}
        onClose={() => {
          // Don't close while recording or processing
          if (!isVoiceRecording && !isVoiceProcessing) {
            setShowMobileTextInput(false);
            setCurrentTranscript('');
          }
        }}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 2,
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            m: 0,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
          }
        }}
      >
        <DialogContent sx={{ p: 2.5 }}>
          <Typography variant="h6" gutterBottom sx={{
            fontSize: '1.1rem',
            fontWeight: 600,
            color: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            {isVoiceRecording ? (
              <>
                <Box
                  component="span"
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    bgcolor: 'error.main',
                    animation: 'pulse 1s infinite',
                    '@keyframes pulse': {
                      '0%': { opacity: 1 },
                      '50%': { opacity: 0.5 },
                      '100%': { opacity: 1 },
                    }
                  }}
                />
                Recording...
              </>
            ) : isVoiceProcessing ? (
              <>
                <CircularProgress size={18} />
                Processing Voice...
              </>
            ) : (
              'Add Task'
            )}
          </Typography>
          <Divider sx={{ mb: 2.5 }} />
          {isVoiceProcessing && (
            <Box sx={{ textAlign: 'center', py: 2, color: 'text.secondary' }}>
              <Typography variant="body2">
                Transcribing your voice...
              </Typography>
            </Box>
          )}
          <TaskInput
            onTaskAdded={() => {
              handleTaskAdded();
              setShowMobileTextInput(false);
              setCurrentTranscript('');
            }}
            transcript={currentTranscript}
          />
        </DialogContent>
      </Dialog>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <BottomNavigation
          value={activeTab}
          onChange={handleTabChange}
          component="nav"
          aria-label="Mobile navigation"
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            bgcolor: theme.palette.background.paper,
            borderTop: '1px solid',
            borderColor: 'divider',
            boxShadow: '0 -2px 8px rgba(0,0,0,0.1)',
            '& .MuiBottomNavigationAction-root': {
              minWidth: 'auto',
              fontSize: '0.75rem',
              '&.Mui-selected': {
                color: theme.palette.primary.main,
                '& .MuiBottomNavigationAction-label': {
                  fontSize: '0.75rem',
                  fontWeight: 600
                }
              }
            }
          }}
        >
          <BottomNavigationAction
            label="Tasks"
            icon={<TaskIcon />}
            value={0}
          />
          <BottomNavigationAction
            label="Notes"
            icon={<NotesIcon />}
            value={1}
          />
          <BottomNavigationAction
            label="Config"
            icon={<SettingsIcon />}
            value={2}
          />
        </BottomNavigation>
      )}
    </Layout>
  );
}

export default function Home() {
  return (
    <TranscriptionProvider>
      <AuthenticatedApp />
    </TranscriptionProvider>
  );
}

function AuthenticatedApp() {
  const { user, loading } = useAuth();

  // Allow demo mode access without authentication
  if (isInDemoMode()) {
    return <MainContent />;
  }

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  return <MainContent />;
}
