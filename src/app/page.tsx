'use client';

import React, { useState, useEffect } from 'react';
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
import TaskInput from '@/components/tasks/TaskInput';
import TaskList from '@/components/tasks/TaskList';
import TaskFilters from '@/components/tasks/TaskFilters';
import { getTasks } from '@/lib/supabase/client';
import Layout from '@/components/layout/Layout';
import { useTranslation } from 'react-i18next';

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
      style={{ width: '100%' }}
    >
      {value === index && (
        <Box sx={{ pt: 2, width: '100%' }}>
          {children}
        </Box>
      )}
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

export default function Home() {
  const { t } = useTranslation(['common', 'notes']);
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
  const [isRecording, setIsRecording] = useState(false);
  const [triggerRecording, setTriggerRecording] = useState(false);
  const [showMobileTextInput, setShowMobileTextInput] = useState(false);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
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

  const handleNoteContentChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const updatedTabs = noteTabs.map(tab => 
      tab.id === activeNoteTab ? { ...tab, content: event.target.value } : tab
    );
    setNoteTabs(updatedTabs);
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

  const handleRecordingStateChange = (recordingState: boolean) => {
    setIsRecording(recordingState);
  };

  const handleFloatingMicClick = async () => {
    try {
      // Request microphone permission first
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setTriggerRecording(!isRecording);
    } catch (error) {
      // Handle permission denied
      console.error('Microphone permission denied:', error);
    }
  };

  return (
    <Layout>
      <Box sx={{ 
        flexGrow: 1, 
        p: isMobile ? 1 : 2, 
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {!isMobile && (
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange} 
            variant="fullWidth"
            sx={{ 
              borderBottom: 1, 
              borderColor: 'divider',
              '& .MuiTab-root': {
                py: 1.5
              }
            }}
          >
            <Tab label={t('tabs.tasks')} />
            <Tab label={t('tabs.notes')} />
            <Tab label={t('tabs.config')} />
          </Tabs>
        )}
        
        <TabPanel value={activeTab} index={0}>
          {/* Tasks Tab */}
          <Box sx={{ mb: 2 }}>
            {!isMobile && (
              <TaskInput 
                onTaskAdded={handleTaskAdded} 
                onRecordingStateChange={handleRecordingStateChange}
                externalRecordingTrigger={triggerRecording}
              />
            )}
            
            <TaskFilters
              searchFilter={searchFilter}
              statusFilter={statusFilter}
              onSearchChange={handleSearchChange}
              onStatusFilterChange={handleStatusFilterClick}
            />
            
            <TaskList 
              refreshTrigger={refreshTrigger}
              searchFilter={searchFilter}
              statusFilter={statusFilter}
            />
          </Box>
        </TabPanel>
        
        <TabPanel value={activeTab} index={1}>
          {/* Notes Tab */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            height: '100%'
          }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs 
                value={activeNoteTab} 
                onChange={handleNoteTabChange}
                variant="scrollable"
                scrollButtons="auto"
                sx={{ 
                  '& .MuiTab-root': {
                    minHeight: 48,
                    textTransform: 'none',
                    fontWeight: 500
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
            
            <Box sx={{ flexGrow: 1, overflow: 'auto', height: '100%' }}>
              {noteTabs.map(tab => (
                <NoteTabPanel key={tab.id} value={activeNoteTab} index={tab.id}>
                  <Box sx={{ 
                    height: '100%',
                    p: 2
                  }}>
                    <TextField
                      multiline
                      fullWidth
                      variant="standard"
                      placeholder={t('notes:placeholder')}
                      value={tab.content}
                      onChange={handleNoteContentChange}
                      InputProps={{
                        disableUnderline: true,
                        sx: {
                          fontSize: '1rem',
                          lineHeight: 1.8
                        }
                      }}
                      sx={{ 
                        '& .MuiInputBase-root': {
                          height: '100%',
                          alignItems: 'flex-start'
                        },
                        height: '100%'
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
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 1200, mx: 'auto' }}>
            <Typography variant="h5" fontWeight={600} sx={{ mb: 1 }}>
              Settings
            </Typography>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
              {/* API Configuration */}
              <Card sx={{ 
                boxShadow: '0 0 8px rgba(0, 0, 0, 0.1)', 
                borderRadius: 2,
                '&:hover': {
                  boxShadow: '0 0 12px rgba(0, 0, 0, 0.15)',
                  transform: 'translateY(-1px)',
                  transition: 'all 0.2s ease-in-out'
                }
              }}>
                <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
                  <Typography variant="h6" gutterBottom sx={{ fontSize: '1.1rem', fontWeight: 600, color: 'primary.main' }}>
                    API Configuration
                  </Typography>
                  <Divider sx={{ mb: 2.5 }} />
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    <TextField
                      fullWidth
                      label="OpenAI API Key"
                      type="password"
                      placeholder="sk-..."
                      defaultValue={process.env.NEXT_PUBLIC_OPENAI_API_KEY || ''}
                      helperText="Used for AI task parsing and voice transcription"
                      variant="outlined"
                      size="small"
                    />
                    <Box sx={{ display: 'flex', gap: 2 }}>
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
                boxShadow: '0 0 8px rgba(0, 0, 0, 0.1)', 
                borderRadius: 2,
                '&:hover': {
                  boxShadow: '0 0 12px rgba(0, 0, 0, 0.15)',
                  transform: 'translateY(-1px)',
                  transition: 'all 0.2s ease-in-out'
                }
              }}>
                <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
                  <Typography variant="h6" gutterBottom sx={{ fontSize: '1.1rem', fontWeight: 600, color: 'primary.main' }}>
                    Voice Recognition
                  </Typography>
                  <Divider sx={{ mb: 2.5 }} />
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Recognition Language</InputLabel>
                      <Select defaultValue="en" label="Recognition Language">
                        <MenuItem value="en">English</MenuItem>
                        <MenuItem value="he">Hebrew</MenuItem>
                        <MenuItem value="es">Spanish</MenuItem>
                        <MenuItem value="fr">French</MenuItem>
                      </Select>
                    </FormControl>
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
                boxShadow: '0 0 8px rgba(0, 0, 0, 0.1)', 
                borderRadius: 2,
                '&:hover': {
                  boxShadow: '0 0 12px rgba(0, 0, 0, 0.15)',
                  transform: 'translateY(-1px)',
                  transition: 'all 0.2s ease-in-out'
                }
              }}>
                <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
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
              <Card sx={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)', borderRadius: 2 }}>
                <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
                  <Typography variant="h6" gutterBottom sx={{ fontSize: '1.1rem', fontWeight: 600, color: 'primary.main' }}>
                    Date & Time Format
                  </Typography>
                  <Divider sx={{ mb: 2.5 }} />
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
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
              <Card sx={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)', borderRadius: 2 }}>
                <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
                  <Typography variant="h6" gutterBottom sx={{ fontSize: '1.1rem', fontWeight: 600, color: 'primary.main' }}>
                    Appearance
                  </Typography>
                  <Divider sx={{ mb: 2.5 }} />
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
              <Card sx={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)', borderRadius: 2 }}>
                <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
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
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
              <Button variant="outlined" size="medium">
                Cancel
              </Button>
              <Button 
                variant="contained" 
                size="medium"
                sx={{
                  background: 'linear-gradient(180deg, #2196F3 0%, #1976D2 100%)',
                  boxShadow: '0 2px 4px rgba(33, 150, 243, 0.25)',
                }}
              >
                Save Changes
              </Button>
            </Box>
          </Box>
        </TabPanel>
      </Box>

      {/* Floating action buttons */}
      {isMobile ? (
        <>
          <Fab 
            color="primary"
            aria-label="add task" 
            sx={{ 
              position: 'fixed', 
              bottom: 80, 
              right: 24,
              background: 'linear-gradient(180deg, #2196F3 0%, #1976D2 100%)',
              boxShadow: '0 4px 8px rgba(33, 150, 243, 0.25)',
              '&:hover': {
                boxShadow: '0 6px 12px rgba(33, 150, 243, 0.3)',
                transform: 'translateY(-2px)',
              }
            }}
            onClick={() => {
              setShowMobileTextInput(true);
            }}
          >
            <AddIcon />
          </Fab>
          <Tooltip title={isRecording ? 'Stop Recording' : 'Start Recording'}>
            <Fab 
              color={isRecording ? "error" : "primary"}
              aria-label="record" 
              sx={{ 
                position: 'fixed', 
                bottom: 24, 
                right: 24,
                width: 64,
                height: 64,
                borderRadius: '50%',
                bgcolor: '#fff',
                color: isRecording ? 'error.main' : 'primary.main',
                border: '2px solid',
                borderColor: isRecording ? 'error.main' : 'primary.main',
                boxShadow: isRecording ?
                  '0 0 0 0 rgba(244, 67, 54, 0.4)' :
                  '0 4px 8px rgba(0, 0, 0, 0.1)',
                animation: isRecording ? 'pulse 2s infinite' : 'none',
                '@keyframes pulse': {
                  '0%': { 
                    boxShadow: '0 0 0 0 rgba(244, 67, 54, 0.4)',
                    transform: 'scale(1)'
                  },
                  '70%': { 
                    boxShadow: '0 0 0 10px rgba(244, 67, 54, 0)',
                    transform: 'scale(1.05)'
                  },
                  '100%': { 
                    boxShadow: '0 0 0 0 rgba(244, 67, 54, 0)',
                    transform: 'scale(1)'
                  },
                },
                '&:hover': {
                  bgcolor: '#fff',
                  boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.2s ease-in-out'
              }}
              onClick={handleFloatingMicClick}
            >
              {isRecording ? 
                <StopIcon sx={{ fontSize: 28 }} /> : 
                <MicIcon sx={{ fontSize: 28 }} />
              }
            </Fab>
          </Tooltip>
        </>
      ) : (
        activeTab === 0 && (
          <Tooltip title={isRecording ? 'Stop Recording' : 'Start Recording'}>
            <Fab 
              color={isRecording ? "error" : "primary"}
              aria-label="record" 
              sx={{ 
                position: 'fixed', 
                bottom: 24, 
                right: 24,
                width: 64,
                height: 64,
                borderRadius: '50%',
                bgcolor: '#fff',
                color: isRecording ? 'error.main' : 'primary.main',
                border: '2px solid',
                borderColor: isRecording ? 'error.main' : 'primary.main',
                boxShadow: isRecording ?
                  '0 0 0 0 rgba(244, 67, 54, 0.4)' :
                  '0 4px 8px rgba(0, 0, 0, 0.1)',
                animation: isRecording ? 'pulse 2s infinite' : 'none',
                '@keyframes pulse': {
                  '0%': { 
                    boxShadow: '0 0 0 0 rgba(244, 67, 54, 0.4)',
                    transform: 'scale(1)'
                  },
                  '70%': { 
                    boxShadow: '0 0 0 10px rgba(244, 67, 54, 0)',
                    transform: 'scale(1.05)'
                  },
                  '100%': { 
                    boxShadow: '0 0 0 0 rgba(244, 67, 54, 0)',
                    transform: 'scale(1)'
                  },
                },
                '&:hover': {
                  bgcolor: '#fff',
                  boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.2s ease-in-out'
              }}
              onClick={handleFloatingMicClick}
            >
              {isRecording ? 
                <StopIcon sx={{ fontSize: 28 }} /> : 
                <MicIcon sx={{ fontSize: 28 }} />
              }
            </Fab>
          </Tooltip>
        )
      )}

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
            bottom: 0,
            m: 0,
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
            boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.15)',
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
          Add Task
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <TaskInput 
            onTaskAdded={() => {
              handleTaskAdded();
              setShowMobileTextInput(false);
            }} 
            onRecordingStateChange={handleRecordingStateChange}
          />
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
