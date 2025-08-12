'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Tabs,
  Tab,
  TextField,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import { useTranslation } from 'react-i18next';
import NotesTabPanel from './NotesTabPanel';
import { getUserNotes, saveUserNote } from '@/lib/supabase/client';

interface NoteTab {
  id: number;
  title: string;
  content: string;
}

// Debounce hook for auto-save
function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function NotesSection() {
  const { t } = useTranslation(['common', 'notes']);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [activeNoteTab, setActiveNoteTab] = useState(0);
  const [noteTabs, setNoteTabs] = useState<NoteTab[]>([
    { id: 0, title: t('notes:tabs.general'), content: '' },
    { id: 1, title: t('notes:tabs.work'), content: '' },
    { id: 2, title: t('notes:tabs.personal'), content: '' }
  ]);
  const [isEditingNoteTitle, setIsEditingNoteTitle] = useState<number | null>(null);
  const [editedNoteTitle, setEditedNoteTitle] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tabToDelete, setTabToDelete] = useState<number | null>(null);
  
  // Database state
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  const [useLocalStorage, setUseLocalStorage] = useState(false);

  // Get current tab content for debouncing
  const currentTabContent = noteTabs.find(tab => tab.id === activeNoteTab)?.content || '';
  const debouncedContent = useDebounce(currentTabContent, 2000); // 2 second delay

  // Load notes from database or localStorage on mount
  useEffect(() => {
    loadNotes();
  }, []);

  // Save to database when content changes (debounced)
  useEffect(() => {
    if (!isLoading && debouncedContent !== '') {
      const activeTab = noteTabs.find(tab => tab.id === activeNoteTab);
      if (activeTab && activeTab.content === debouncedContent) {
        saveCurrentNote();
      }
    }
  }, [debouncedContent, activeNoteTab, isLoading]);

  // Load notes from database or localStorage
  const loadNotes = async () => {
    setIsLoading(true);
    setDbError(null);

    try {
      // Try to load from database first
      const { notes, error } = await getUserNotes();
      
      if (error) {
        console.warn('Database error, falling back to localStorage:', error);
        setDbError(error);
        setUseLocalStorage(true);
        loadFromLocalStorage();
      } else {
        // Load from database
        const updatedTabs = noteTabs.map(tab => ({
          ...tab,
          content: notes[tab.id] || ''
        }));
        setNoteTabs(updatedTabs);
        setUseLocalStorage(false);
      }
    } catch (error) {
      console.error('Error loading notes:', error);
      setDbError('Failed to load notes from database');
      setUseLocalStorage(true);
      loadFromLocalStorage();
    } finally {
      setIsLoading(false);
    }
  };

  // Load from localStorage fallback
  const loadFromLocalStorage = () => {
    try {
      const saved = localStorage.getItem('user-notes');
      if (saved) {
        const savedNotes = JSON.parse(saved);
        const updatedTabs = noteTabs.map(tab => ({
          ...tab,
          content: savedNotes[tab.id] || ''
        }));
        setNoteTabs(updatedTabs);
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
  };

  // Save current note to database or localStorage
  const saveCurrentNote = async () => {
    const activeTab = noteTabs.find(tab => tab.id === activeNoteTab);
    if (!activeTab) return;

    if (useLocalStorage) {
      saveToLocalStorage();
      return;
    }

    setIsSaving(true);
    try {
      await saveUserNote(activeNoteTab, activeTab.content);
    } catch (error) {
      console.error('Error saving note:', error);
      // Fallback to localStorage if database save fails
      setUseLocalStorage(true);
      saveToLocalStorage();
    } finally {
      setIsSaving(false);
    }
  };

  // Save to localStorage fallback
  const saveToLocalStorage = () => {
    try {
      const notesMap: { [key: number]: string } = {};
      noteTabs.forEach(tab => {
        notesMap[tab.id] = tab.content;
      });
      localStorage.setItem('user-notes', JSON.stringify(notesMap));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  const handleNoteTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveNoteTab(newValue);
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
      
      if (activeNoteTab === tabToDelete && updatedTabs.length > 0) {
        setActiveNoteTab(updatedTabs[0].id);
      }
      
      setDeleteDialogOpen(false);
      setTabToDelete(null);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
        <CircularProgress size={40} />
        <Typography sx={{ ml: 2 }}>Loading notes...</Typography>
      </Box>
    );
  }

  const StatusBar = () => (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: 1, 
      px: 2, 
      py: 0.5,
      bgcolor: useLocalStorage ? 'warning.light' : 'success.light',
      color: useLocalStorage ? 'warning.contrastText' : 'success.contrastText',
      fontSize: '0.75rem',
      borderRadius: 1,
      mb: 1
    }}>
      {useLocalStorage && <CloudOffIcon fontSize="small" />}
      {isSaving && <CircularProgress size={12} />}
      <Typography variant="caption">
        {useLocalStorage ? 'Using local storage' : isSaving ? 'Saving...' : 'Synced'}
      </Typography>
    </Box>
  );

  if (isMobile) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2 }}>
        <StatusBar />
        
        {dbError && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {dbError}
          </Alert>
        )}

        {noteTabs.map(tab => (
          <Card key={tab.id} sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600 }}>
                  {tab.title}
                </Typography>
                <Box>
                  <IconButton size="small" onClick={() => handleEditNoteTitle(tab.id, tab.title)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleConfirmDeleteTab(tab.id)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
              <TextField
                multiline
                fullWidth
                variant="outlined"
                placeholder={t('notes:placeholder')}
                value={tab.content}
                onChange={(e) => {
                  const updatedTabs = noteTabs.map(t => 
                    t.id === tab.id ? { ...t, content: e.target.value } : t
                  );
                  setNoteTabs(updatedTabs);
                }}
                minRows={4}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: theme.palette.background.default
                  }
                }}
              />
            </CardContent>
          </Card>
        ))}
        
        <Card sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <IconButton onClick={handleAddNoteTab} color="primary">
              <AddIcon />
            </IconButton>
            <Typography variant="body2" color="text.secondary">
              Add Note
            </Typography>
          </CardContent>
        </Card>

        {/* Delete Dialog */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>{t('notes:deleteConfirm.title')}</DialogTitle>
          <DialogContent>
            <Typography>{t('notes:deleteConfirm.message')}</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>
              {t('actions.cancel')}
            </Button>
            <Button onClick={handleDeleteTab} color="error">
              {t('actions.delete')}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  }

  // Desktop layout
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%',
      bgcolor: theme.palette.background.default
    }}>
      <Box sx={{ px: 2, pt: 1 }}>
        <StatusBar />
        
        {dbError && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {dbError}
          </Alert>
        )}
      </Box>

      <Box sx={{ 
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
            '& .MuiTabs-indicator': {
              display: 'none'
            },
            '& .MuiTab-root': {
              minHeight: 28,
              textTransform: 'none',
              fontWeight: 400,
              fontSize: '0.8rem',
              bgcolor: 'transparent',
              color: '#888',
              borderRadius: '6px 6px 0 0',
              border: 'none',
              mx: 0.5,
              px: 2,
              py: 0.5,
              minWidth: 90,
              '&.Mui-selected': {
                bgcolor: theme.palette.background.paper,
                color: theme.palette.text.primary,
                fontWeight: 600,
                boxShadow: theme.palette.mode === 'dark' ? '0 1px 3px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.1)',
                border: `1px solid ${theme.palette.divider}`,
                borderBottom: `1px solid ${theme.palette.background.paper}`,
                zIndex: 1,
                position: 'relative'
              },
              '&:hover:not(.Mui-selected)': {
                bgcolor: theme.palette.action.hover,
                color: theme.palette.text.secondary
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
        height: '100%',
        bgcolor: theme.palette.background.paper,
        borderTop: `1px solid ${theme.palette.divider}`,
        position: 'relative',
        zIndex: 0
      }}>
        {noteTabs.map(tab => (
          <NotesTabPanel key={tab.id} value={activeNoteTab} index={tab.id}>
            <Box sx={{ 
              height: '100%',
              width: '100%',
              bgcolor: theme.palette.background.paper,
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
          </NotesTabPanel>
        ))}
      </Box>

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
    </Box>
  );
}