'use client';

import './suppressHydrationWarning';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Fab,
  useMediaQuery,
  useTheme,
  IconButton,
  TextField,
  Tooltip,
  alpha,
  Card,
  CardContent,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import MenuIcon from '@mui/icons-material/Menu';
import SettingsIcon from '@mui/icons-material/Settings';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import TaskIcon from '@mui/icons-material/Task';
import NotesIcon from '@mui/icons-material/Notes';
import PaletteIcon from '@mui/icons-material/Palette';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import TaskInput from '@/features/tasks/TaskInput';
import EnhancedTaskList from '@/features/tasks/EnhancedTaskList';
import TaskFilters from '@/features/tasks/TaskFilters';
import { getTasks, supabase, getUserNotes, saveUserNote, isInDemoMode } from '@/lib/supabase/client';
import Layout from '@/components/layout/Layout';
import { useTranslation } from 'react-i18next';
import i18n from '@/i18n';
import DynamicFloatingMicButton from '@/features/voice/DynamicFloatingMicButton';
import { TranscriptionProvider, useTranscriptionConfig } from '@/contexts/TranscriptionContext';
import { ClientOnly, BrowserWarning } from '@/shared/ui';
import { useAuth } from '@/components/auth/AuthProvider';
import { LoginForm } from '@/components/auth/LoginForm';
import { UsageDashboard } from '@/components/auth/UsageDashboard';
import { SPACING, LAYOUT } from '@/constants';
import { useNotification } from '@/contexts/NotificationContext';
import dynamic from 'next/dynamic';

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

interface NoteTabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function NoteTabPanel(props: NoteTabPanelProps) {
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

function MainContent() {
  const { t } = useTranslation(['common', 'notes']);
  const { service: transcriptionService, setService: setTranscriptionService } = useTranscriptionConfig();
  const { showSuccess } = useNotification();
  const [activeTab, setActiveTab] = useState(0);
  const [activeNoteTab, setActiveNoteTab] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [noteTabs, setNoteTabs] = useState([
    { id: 0, title: t('notes:tabs.general'), content: '' },
    { id: 1, title: t('notes:tabs.work'), content: '' },
    { id: 2, title: t('notes:tabs.personal'), content: '' }
  ]);
  const [isEditingNoteTitle, setIsEditingNoteTitle] = useState<number | null>(null);
  const [editedNoteTitle, setEditedNoteTitle] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tabToDelete, setTabToDelete] = useState<number | null>(null);
  const [showMobileTextInput, setShowMobileTextInput] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language || 'en');
  const [voiceRecognitionLanguage, setVoiceRecognitionLanguage] = useState('en');
  const [apiKey, setApiKey] = useState('');
  const [azureKey, setAzureKey] = useState('');
  const [azureRegion, setAzureRegion] = useState('');
  const [lastSavedNotesState, setLastSavedNotesState] = useState<{[key: number]: string}>({});
  const notesDebounceRefs = useRef<{[key: number]: NodeJS.Timeout}>({});
  const [isWideView, setIsWideView] = useState(true);
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg')); // lg is ~1200px

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleHeaderTabChange = (tabIndex: number) => {
    setActiveTab(tabIndex);
  };

  const handleMenuClick = () => {
    // Handle mobile menu click - could open a drawer or show mobile navigation
  };

  const handleViewToggle = () => {
    setIsWideView(prev => !prev);
  };

  const handleBulkDelete = async () => {
    try {
      const { deleteTask } = await import('@/lib/supabase/client');
      const deletePromises = Array.from(selectedTasks).map(taskId => deleteTask(taskId));
      await Promise.all(deletePromises);
      setSelectedTasks(new Set());
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Failed to delete tasks:', error);
    }
  };

  const handleNoteTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveNoteTab(newValue);
  };

  const handleTaskAdded = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleSearchChange = (value: string) => {
    setSearchFilter(value);
  };

  const handleStatusFilterClick = (status: string) => {
    setStatusFilter(status);
  };

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
    // Save interface language setting
    i18n.changeLanguage(selectedLanguage);
    
    // Save voice recognition language
    localStorage.setItem('voiceRecognitionLanguage', voiceRecognitionLanguage);
    
    // Save API keys to localStorage
    if (apiKey) localStorage.setItem('openaiApiKey', apiKey);
    if (azureKey) localStorage.setItem('azureApiKey', azureKey);
    if (azureRegion) localStorage.setItem('azureRegion', azureRegion);
    
    // Show success notification
    showSuccess('Settings saved successfully!');
  };

  // Load saved settings and notes on component mount
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
    
    // Load saved notes from database
    const loadNotes = async () => {
      // Check if user is authenticated first
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        return;
      }

      try {
        const result = await getUserNotes();
        const notesFromDB = result.notes;
        const updatedNoteTabs = noteTabs.map(tab => {
          const content = notesFromDB[tab.id] || '';
          return { ...tab, content };
        });

        setNoteTabs(updatedNoteTabs);
        setLastSavedNotesState(notesFromDB);
      } catch (error) {
        // Fallback to localStorage if database fails
        const loadedNotesState: any = {};
        const updatedNoteTabs = noteTabs.map(tab => {
          const savedContent = localStorage.getItem(`note_tab_${tab.id}`) || '';
          loadedNotesState[tab.id] = savedContent;
          return { ...tab, content: savedContent };
        });
        
        setNoteTabs(updatedNoteTabs);
        setLastSavedNotesState(loadedNotesState);
      }
    };
    
    loadNotes();
  }, []);

  // Auto-save functionality for notes
  const saveNotesToStorage = useCallback(async (tabId: number, content: string) => {
    const lastSavedContent = lastSavedNotesState[tabId];
    
    if (content === lastSavedContent) return;
    
    try {
      await saveUserNote(tabId, content);
      setLastSavedNotesState(prev => ({ ...prev, [tabId]: content }));
    } catch (error) {
      // Fallback to localStorage if database fails
      localStorage.setItem(`note_tab_${tabId}`, content);
      setLastSavedNotesState(prev => ({ ...prev, [tabId]: content }));
    }
  }, [lastSavedNotesState]);

  const debouncedSaveNotes = useCallback((tabId: number, content: string) => {
    // Clear existing timeout for this tab
    if (notesDebounceRefs.current[tabId]) {
      clearTimeout(notesDebounceRefs.current[tabId]);
    }

    notesDebounceRefs.current[tabId] = setTimeout(() => {
      saveNotesToStorage(tabId, content);
    }, 2500);
  }, [saveNotesToStorage]);

  const handleNotesBlur = (tabId: number, content: string) => {
    // Clear debounce timer
    if (notesDebounceRefs.current[tabId]) {
      clearTimeout(notesDebounceRefs.current[tabId]);
    }

    // Immediate save on blur if content changed
    const lastSavedContent = lastSavedNotesState[tabId];
    if (content !== lastSavedContent) {
      saveNotesToStorage(tabId, content);
    }
  };

  const handleNoteContentChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = event.target.value;

    const updatedTabs = noteTabs.map(tab =>
      tab.id === activeNoteTab ? { ...tab, content: newContent } : tab
    );
    setNoteTabs(updatedTabs);

    // Trigger auto-save
    debouncedSaveNotes(activeNoteTab, newContent);
  };

  const handleAddNoteTab = () => {
    const newTabId = noteTabs.length > 0 ? Math.max(...noteTabs.map(tab => tab.id)) + 1 : 0;
    const newTab = { id: newTabId, title: t('notes:tabs.new', { number: newTabId + 1 }), content: '' };
    setNoteTabs([...noteTabs, newTab]);
    setActiveNoteTab(newTabId);
  };

  const handleEditNoteTitle = (tabId: number, currentTitle: string) => {
    setIsEditingNoteTitle(tabId);
    setEditedNoteTitle(currentTitle);
  };

  const handleSaveNoteTitle = () => {
    if (isEditingNoteTitle !== null && editedNoteTitle.trim()) {
      const updatedTabs = noteTabs.map(tab => 
        tab.id === isEditingNoteTitle ? { ...tab, title: editedNoteTitle } : tab
      );
      setNoteTabs(updatedTabs);
    }
    setIsEditingNoteTitle(null);
  };

  const handleConfirmDeleteTab = (tabId: number) => {
    setTabToDelete(tabId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteTab = () => {
    if (tabToDelete !== null) {
      const updatedTabs = noteTabs.filter(tab => tab.id !== tabToDelete);
      setNoteTabs(updatedTabs);
      
      // Set active tab to the first tab if the deleted tab was active
      if (activeNoteTab === tabToDelete && updatedTabs.length > 0) {
        setActiveNoteTab(updatedTabs[0].id);
      }
      
      setDeleteDialogOpen(false);
      setTabToDelete(null);
    }
  };

  const handleFloatingMicTranscript = (text: string) => {
    setCurrentTranscript(text);
  };



  return (
    <Layout 
      onTabChange={handleHeaderTabChange} 
      onMenuClick={handleMenuClick}
      isWideView={isWideView}
      onViewToggle={handleViewToggle}
      activeTab={activeTab}
    >
      <Box sx={{
        flexGrow: 1,
        pb: isMobile ? 0 : 2, // No bottom padding on mobile - handled by content containers
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        height: isMobile ? `calc(100vh - ${LAYOUT.BOTTOM_NAV_HEIGHT}px)` : '100%', // Account for bottom nav on mobile
        width: '100%',
        maxWidth: (isMobile || isTablet || isWideView) ? '100%' : `${LAYOUT.MAX_CONTENT_WIDTH}px`,
        mx: 'auto',
        transition: 'all 0.3s ease'
      }}>
        {!isMobile && (
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange} 
            variant="fullWidth"
            sx={{ 
              // Best Practice: Clean Professional Tabs
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
            <Tab label={t('tabs.tasks')} />
            <Tab label={t('tabs.notes')} />
            <Tab label={t('tabs.config')} />
          </Tabs>
        )}
        
        <TabPanel value={activeTab} index={0}>
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: { xs: SPACING.GAP_MD, sm: SPACING.GAP_LG },
            flex: 1,
            minHeight: 0,
            overflow: 'hidden',
            width: '100%',
            pt: SPACING.TAB_PANEL_PADDING,
            px: SPACING.TAB_PANEL_PADDING,
            pb: { xs: 0, sm: SPACING.TAB_PANEL_PADDING.sm },
            transition: 'all 0.3s ease'
          }}>
            {!isMobile && (
              <TaskInput 
                onTaskAdded={handleTaskAdded}
                transcript={currentTranscript}
              />
            )}
            <TaskFilters
              searchFilter={searchFilter}
              statusFilter={statusFilter}
              onSearchChange={handleSearchChange}
              onStatusFilterChange={handleStatusFilterClick}
              selectedTasksCount={selectedTasks.size}
              onBulkDelete={handleBulkDelete}
            />
            {!isMobile ? (
              <Paper sx={{
                boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                borderRadius: 2,
                border: `1px solid ${theme.palette.divider}`,
                overflow: 'hidden',
                '&:hover': {
                  boxShadow: '0 6px 20px rgba(0,0,0,0.35)',
                  transition: 'all 0.3s ease'
                }
              }}>
                <EnhancedTaskList 
                  refreshTrigger={refreshTrigger}
                  searchFilter={searchFilter}
                  statusFilter={statusFilter}
                  selectedTasks={selectedTasks}
                  onSelectedTasksChange={setSelectedTasks}
                  onBulkDelete={handleBulkDelete}
                />
              </Paper>
            ) : (
              <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                minHeight: 0,
                overflow: 'auto',
                borderTop: `1px solid ${theme.palette.divider}`,
                pb: `${LAYOUT.MOBILE_BOTTOM_PADDING}px`, // Space for bottom navigation
              }}>
                <EnhancedTaskList
                  refreshTrigger={refreshTrigger}
                  searchFilter={searchFilter}
                  statusFilter={statusFilter}
                  selectedTasks={selectedTasks}
                  onSelectedTasksChange={setSelectedTasks}
                  onBulkDelete={handleBulkDelete}
                />
              </Box>
            )}
          </Box>
        </TabPanel>
        
        <TabPanel value={activeTab} index={1}>
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            width: '100%',
            bgcolor: theme.palette.background.default,
            pt: SPACING.TAB_PANEL_PADDING,
            px: SPACING.TAB_PANEL_PADDING,
            transition: 'all 0.3s ease'
          }}>
            <Box sx={{
              width: '100%',
              borderBottom: 'none',
              bgcolor: 'transparent',
              px: 0,
              pt: 0
            }}>
              <Tabs 
                value={activeNoteTab} 
                onChange={handleNoteTabChange}
                variant="scrollable"
                scrollButtons="auto"
                sx={{ 
                  minHeight: 'auto',
                  width: '100%',
                  '& .MuiTabs-indicator': {
                    display: 'none'
                  },
                  '& .MuiTabs-scrollButtons': {
                    width: 'auto'
                  },
                  '& .MuiTabs-scroller': {
                    overflow: 'auto !important'
                  },
                  '& .MuiTab-root': {
                    minHeight: 32,
                    textTransform: 'none',
                    fontWeight: 500,
                    fontSize: '0.85rem',
                    bgcolor: 'transparent',
                    color: theme.palette.text.secondary,
                    borderRadius: '6px 6px 0 0',
                    border: `1px solid ${theme.palette.divider}`,
                    borderBottom: 'none',
                    mx: 0.25,
                    px: 2,
                    py: 0.5,
                    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                    minWidth: 80,
                    maxWidth: 150,
                    transition: 'all 0.2s ease',
                    '&.Mui-selected': {
                      bgcolor: theme.palette.background.paper,
                      color: theme.palette.primary.main,
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                      transform: 'translateY(-1px)',
                      border: `1px solid ${theme.palette.primary.main}`,
                      borderBottom: `1px solid ${theme.palette.background.paper}`,
                      zIndex: 1,
                      position: 'relative'
                    },
                    '&:hover:not(.Mui-selected)': {
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                      color: theme.palette.primary.main,
                      transform: 'translateY(-1px)',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                    }
                  }
                }}
              >
                {noteTabs.map(tab => (
                  <Tab 
                    key={tab.id} 
                    label={
                      isEditingNoteTitle === tab.id ? (
                        <TextField
                          size="small"
                          value={editedNoteTitle}
                          onChange={(e) => setEditedNoteTitle(e.target.value)}
                          onBlur={handleSaveNoteTitle}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleSaveNoteTitle();
                              e.preventDefault();
                            }
                          }}
                          autoFocus
                          sx={{ 
                            width: '120px',
                            '& .MuiInputBase-root': {
                              bgcolor: 'transparent',
                              fontSize: 'inherit'
                            }
                          }}
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {tab.title}
                          <Box sx={{ 
                            opacity: 0,
                            transition: 'opacity 0.2s',
                            '.MuiTab-root:hover &': { opacity: 1 },
                            display: 'flex',
                            ml: 1
                          }}>
                            <Box 
                              component="span"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditNoteTitle(tab.id, tab.title);
                              }}
                              sx={{ 
                                p: 0.5, 
                                cursor: 'pointer',
                                borderRadius: 1,
                                '&:hover': { bgcolor: 'action.hover' }
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </Box>
                            <Box 
                              component="span"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleConfirmDeleteTab(tab.id);
                              }}
                              sx={{ 
                                p: 0.5, 
                                cursor: 'pointer',
                                borderRadius: 1,
                                '&:hover': { bgcolor: 'action.hover' }
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </Box>
                          </Box>
                        </Box>
                      )
                    }
                  />
                ))}
                <Tab 
                  icon={<AddIcon />} 
                  aria-label="add tab" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddNoteTab();
                  }}
                  sx={{ minWidth: 'auto' }}
                />
              </Tabs>
            </Box>
            
            <Box sx={{
              flexGrow: 1,
              overflow: 'auto',
              flex: 1,
              minHeight: 0,
              width: '100%',
              pb: isMobile ? `${LAYOUT.MOBILE_BOTTOM_PADDING}px` : 0, // Space for bottom nav on mobile
              bgcolor: theme.palette.background.paper,
              borderTop: `1px solid ${theme.palette.divider}`,
              borderRadius: 1,
              position: 'relative',
              zIndex: 0
            }}>
              {noteTabs.map(tab => (
                <NoteTabPanel key={tab.id} value={activeNoteTab} index={tab.id}>
                  <Box sx={{
                    height: '100%',
                    width: '100%',
                    bgcolor: theme.palette.background.paper,
                    p: SPACING.TAB_PANEL_PADDING
                  }}>
                    <TextField
                      multiline
                      fullWidth
                      variant="standard"
                      placeholder={t('notes:placeholder')}
                      value={tab.content}
                      onChange={handleNoteContentChange}
                      onBlur={() => handleNotesBlur(tab.id, tab.content)}
                      InputProps={{
                        disableUnderline: true,
                        sx: {
                          fontSize: '1rem',
                          lineHeight: 1.6,
                          color: theme.palette.text.primary
                        }
                      }}
                      sx={{ 
                        height: '100%',
                        '& .MuiInputBase-root': {
                          height: '100%',
                          alignItems: 'flex-start',
                          bgcolor: theme.palette.background.paper
                        }
                      }}
                    />
                  </Box>
                </NoteTabPanel>
              ))}
            </Box>
          </Box>
        </TabPanel>
        
        <TabPanel value={activeTab} index={2}>
          {/* Config Tab */}
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
              {/* API Configuration */}
              <Card sx={{ 
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)', 
                borderRadius: { xs: 0, sm: 2 },
                mx: { xs: -2, sm: 0 },
                '&:hover': {
                  boxShadow: '0 6px 28px rgba(0, 0, 0, 0.35)',
                  transform: 'translateY(-1px)',
                  transition: 'all 0.2s ease-in-out'
                }
              }}>
                <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
                  <Typography variant="h6" gutterBottom sx={{ fontSize: '1.1rem', fontWeight: 600, color: 'primary.main' }}>
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
                      onChange={(e) => setApiKey(e.target.value)}
                      helperText="Used for AI task parsing and voice transcription"
                      variant="outlined"
                      size="small"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'transparent'
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
                      }}
                      FormHelperTextProps={{
                        sx: {
                          color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.6)' : 'text.secondary',
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
                        }
                      }}
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
                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'transparent'
                          }
                        }}
                        FormHelperTextProps={{
                          sx: {
                            color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.6)' : 'text.secondary',
                            bgcolor: 'transparent !important',
                            border: 'none !important',
                            boxShadow: 'none !important',
                            px: 0,
                            '&:before, &:after': {
                              display: 'none !important'
                            }
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
                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'transparent'
                          }
                        }}
                        FormHelperTextProps={{
                          sx: {
                            color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.6)' : 'text.secondary',
                            bgcolor: 'transparent !important',
                            border: 'none !important',
                            boxShadow: 'none !important',
                            px: 0,
                            '&:before, &:after': {
                              display: 'none !important'
                            }
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
              
              {/* Voice Recognition */}
              <Card sx={{ 
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)', 
                borderRadius: { xs: 0, sm: 2 },
                mx: { xs: -2, sm: 0 },
                '&:hover': {
                  boxShadow: '0 6px 28px rgba(0, 0, 0, 0.35)',
                  transform: 'translateY(-1px)',
                  transition: 'all 0.2s ease-in-out'
                }
              }}>
                <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
                  <Typography variant="h6" gutterBottom sx={{ fontSize: '1.1rem', fontWeight: 600, color: 'primary.main' }}>
                    Voice Recognition
                  </Typography>
                  <Divider sx={{ mb: 2.5 }} />
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
                    <FormControl fullWidth size="small" sx={{ mt: 1 }}>
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
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, fontSize: '0.75rem' }}>
                      {transcriptionService === 'browser' && 'Fast, real-time transcription using your browser. Works offline but may be less accurate.'}
                      {transcriptionService === 'whisper' && 'High-accuracy cloud transcription using OpenAI Whisper. Requires internet and API key.'}
                      {transcriptionService === 'azure' && 'Enterprise-grade transcription using Azure Speech Services. Requires Azure credentials.'}
                      {transcriptionService === 'hybrid' && 'Uses browser for real-time feedback, then sends to cloud for final accuracy.'}
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <FormControlLabel
                        control={
                          <Switch 
                            defaultChecked 
                            size="small" 
                            sx={{ 
                              '& .MuiSwitch-switchBase': { p: 0.3 },
                              '& .MuiSwitch-thumb': { width: 14, height: 14 },
                              '& .MuiSwitch-track': { borderRadius: 16 / 2 },
                              width: 36, 
                              height: 20 
                            }} 
                          />
                        }
                        label={<Typography variant="body2">Real-time transcription</Typography>}
                        sx={{ m: 0, py: 0.5 }}
                      />
                      <FormControlLabel
                        control={
                          <Switch 
                            defaultChecked 
                            size="small" 
                            sx={{ 
                              '& .MuiSwitch-switchBase': { p: 0.3 },
                              '& .MuiSwitch-thumb': { width: 14, height: 14 },
                              '& .MuiSwitch-track': { borderRadius: 16 / 2 },
                              width: 36, 
                              height: 20 
                            }} 
                          />
                        }
                        label={<Typography variant="body2">Auto-punctuation</Typography>}
                        sx={{ m: 0, py: 0.5 }}
                      />
                      <FormControlLabel
                        control={
                          <Switch 
                            size="small" 
                            sx={{ 
                              '& .MuiSwitch-switchBase': { p: 0.3 },
                              '& .MuiSwitch-thumb': { width: 14, height: 14 },
                              '& .MuiSwitch-track': { borderRadius: 16 / 2 },
                              width: 36, 
                              height: 20 
                            }} 
                          />
                        }
                        label={<Typography variant="body2">Continuous listening</Typography>}
                        sx={{ m: 0, py: 0.5 }}
                      />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
              
              {/* Notifications */}
              <Card sx={{ 
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)', 
                borderRadius: { xs: 0, sm: 2 },
                mx: { xs: -2, sm: 0 },
                '&:hover': {
                  boxShadow: '0 6px 28px rgba(0, 0, 0, 0.35)',
                  transform: 'translateY(-1px)',
                  transition: 'all 0.2s ease-in-out'
                }
              }}>
                <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
                  <Typography variant="h6" gutterBottom sx={{ fontSize: '1.1rem', fontWeight: 600, color: 'primary.main' }}>
                    {t('settings.notifications')}
                  </Typography>
                  <Divider sx={{ mb: 2.5 }} />
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <FormControlLabel
                        control={
                          <Switch 
                            defaultChecked 
                            size="small" 
                            sx={{ 
                              '& .MuiSwitch-switchBase': { p: 0.3 },
                              '& .MuiSwitch-thumb': { width: 14, height: 14 },
                              '& .MuiSwitch-track': { borderRadius: 16 / 2 },
                              width: 36, 
                              height: 20 
                            }} 
                          />
                        }
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
                        control={
                          <Switch 
                            defaultChecked 
                            size="small" 
                            sx={{ 
                              '& .MuiSwitch-switchBase': { p: 0.3 },
                              '& .MuiSwitch-thumb': { width: 14, height: 14 },
                              '& .MuiSwitch-track': { borderRadius: 16 / 2 },
                              width: 36, 
                              height: 20 
                            }} 
                          />
                        }
                        label={<Typography variant="body2">Sound alerts</Typography>}
                        sx={{ m: 0, py: 0.5 }}
                      />
                      <FormControlLabel
                        control={
                          <Switch 
                            size="small" 
                            sx={{ 
                              '& .MuiSwitch-switchBase': { p: 0.3 },
                              '& .MuiSwitch-thumb': { width: 14, height: 14 },
                              '& .MuiSwitch-track': { borderRadius: 16 / 2 },
                              width: 36, 
                              height: 20 
                            }} 
                          />
                        }
                        label={<Typography variant="body2">Email notifications</Typography>}
                        sx={{ m: 0, py: 0.5 }}
                      />
                      <FormControlLabel
                        control={
                          <Switch 
                            size="small" 
                            sx={{ 
                              '& .MuiSwitch-switchBase': { p: 0.3 },
                              '& .MuiSwitch-thumb': { width: 14, height: 14 },
                              '& .MuiSwitch-track': { borderRadius: 16 / 2 },
                              width: 36, 
                              height: 20 
                            }} 
                          />
                        }
                        label={<Typography variant="body2">Desktop notifications</Typography>}
                        sx={{ m: 0, py: 0.5 }}
                      />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
              
              {/* Date & Time */}
              <Card sx={{ 
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)', 
                borderRadius: { xs: 0, sm: 2 },
                mx: { xs: -2, sm: 0 }
              }}>
                <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
                  <Typography variant="h6" gutterBottom sx={{ fontSize: '1.1rem', fontWeight: 600, color: 'primary.main' }}>
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
              
              {/* Appearance */}
              <Card sx={{ 
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)', 
                borderRadius: { xs: 0, sm: 2 },
                mx: { xs: -2, sm: 0 }
              }}>
                <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
                  <Typography variant="h6" gutterBottom sx={{ fontSize: '1.1rem', fontWeight: 600, color: 'primary.main' }}>
                    Appearance
                  </Typography>
                  <Divider sx={{ mb: 2.5 }} />
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
                        control={
                          <Switch 
                            size="small" 
                            sx={{ 
                              '& .MuiSwitch-switchBase': { p: 0.3 },
                              '& .MuiSwitch-thumb': { width: 14, height: 14 },
                              '& .MuiSwitch-track': { borderRadius: 16 / 2 },
                              width: 36, 
                              height: 20 
                            }} 
                          />
                        }
                        label={<Typography variant="body2">Compact mode</Typography>}
                        sx={{ m: 0, py: 0.5 }}
                      />
                      <FormControlLabel
                        control={
                          <Switch 
                            defaultChecked 
                            size="small" 
                            sx={{ 
                              '& .MuiSwitch-switchBase': { p: 0.3 },
                              '& .MuiSwitch-thumb': { width: 14, height: 14 },
                              '& .MuiSwitch-track': { borderRadius: 16 / 2 },
                              width: 36, 
                              height: 20 
                            }} 
                          />
                        }
                        label={<Typography variant="body2">Show animations</Typography>}
                        sx={{ m: 0, py: 0.5 }}
                      />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
              
              {/* Advanced */}
              <Card sx={{ 
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)', 
                borderRadius: { xs: 0, sm: 2 },
                mx: { xs: -2, sm: 0 }
              }}>
                <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
                  <Typography variant="h6" gutterBottom sx={{ fontSize: '1.1rem', fontWeight: 600, color: 'primary.main' }}>
                    Advanced
                  </Typography>
                  <Divider sx={{ mb: 2.5 }} />
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <FormControlLabel
                        control={
                          <Switch 
                            size="small" 
                            sx={{ 
                              '& .MuiSwitch-switchBase': { p: 0.3 },
                              '& .MuiSwitch-thumb': { width: 14, height: 14 },
                              '& .MuiSwitch-track': { borderRadius: 16 / 2 },
                              width: 36, 
                              height: 20 
                            }} 
                          />
                        }
                        label={<Typography variant="body2">Developer mode</Typography>}
                        sx={{ m: 0, py: 0.5 }}
                      />
                      <FormControlLabel
                        control={
                          <Switch 
                            defaultChecked 
                            size="small" 
                            sx={{ 
                              '& .MuiSwitch-switchBase': { p: 0.3 },
                              '& .MuiSwitch-thumb': { width: 14, height: 14 },
                              '& .MuiSwitch-track': { borderRadius: 16 / 2 },
                              width: 36, 
                              height: 20 
                            }} 
                          />
                        }
                        label={<Typography variant="body2">Auto-save</Typography>}
                        sx={{ m: 0, py: 0.5 }}
                      />
                      <FormControlLabel
                        control={
                          <Switch 
                            size="small" 
                            sx={{ 
                              '& .MuiSwitch-switchBase': { p: 0.3 },
                              '& .MuiSwitch-thumb': { width: 14, height: 14 },
                              '& .MuiSwitch-track': { borderRadius: 16 / 2 },
                              width: 36, 
                              height: 20 
                            }} 
                          />
                        }
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
                {t('actions.cancel')}
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
                {t('actions.save')}
              </Button>
            </Box>
          </Box>
        </TabPanel>
        
      </Box>

      {/* Floating action buttons */}
      <ClientOnly>
        {isMobile ? (
          <Box sx={{ position: 'fixed', bottom: 80, right: 16, zIndex: 1000 }}>
            <Tooltip title="Add Task (Voice or Text)">
              <DynamicFloatingMicButton 
                onTranscript={handleFloatingMicTranscript} 
                transcriptionService={transcriptionService} 
                showTextOption={true}
                onTextInput={() => setShowMobileTextInput(true)}
              />
            </Tooltip>
          </Box>
        ) : (
          activeTab === 0 && !isMobile && (
            <Box sx={{ position: 'fixed', bottom: 80, right: 80, zIndex: 1000 }}>
              <DynamicFloatingMicButton onTranscript={handleFloatingMicTranscript} transcriptionService={transcriptionService} />
            </Box>
          )  
        )}
      </ClientOnly>

      {/* Delete Note Tab Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: { 
            borderRadius: 2,
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: '1px solid',
          borderColor: 'divider',
          py: 2,
          fontWeight: 600,
          color: 'primary.main'
        }}>
          {t('notes:deleteConfirm.title')}
        </DialogTitle>
        <DialogContent sx={{ pt: 3, pb: 2 }}>
          <Typography>
            {t('notes:deleteConfirm.message')}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={() => setDeleteDialogOpen(false)}
            variant="outlined"
            sx={{ borderRadius: 1 }}
          >
            {t('actions.cancel')}
          </Button>
          <Button 
            onClick={handleDeleteTab} 
            color="error"
            variant="contained"
            sx={{ 
              borderRadius: 1,
              boxShadow: '0 2px 4px rgba(211, 47, 47, 0.25)',
              background: 'linear-gradient(180deg, #f44336 0%, #d32f2f 100%)',
            }}
          >
            {t('actions.delete')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Mobile Text Input Dialog */}
      <Dialog
        open={showMobileTextInput}
        onClose={() => setShowMobileTextInput(false)}
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
            color: 'primary.main' 
          }}>
            Add Task
          </Typography>
          <Divider sx={{ mb: 2.5 }} />
          <TaskInput 
            onTaskAdded={() => {
              handleTaskAdded();
              setShowMobileTextInput(false);
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
  const { user, loading } = useAuth()

  // Allow demo mode access without authentication
  if (isInDemoMode()) {
    return <MainContent />
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
    )
  }

  if (!user) {
    return <LoginForm />
  }

  return <MainContent />
}
