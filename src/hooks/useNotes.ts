'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase, getUserNotes, saveUserNote } from '@/lib/supabase/client';

export interface NoteTab {
  id: number;
  title: string;
  content: string;
}

interface UseNotesOptions {
  defaultTabs: NoteTab[];
}

export function useNotes({ defaultTabs }: UseNotesOptions) {
  const [noteTabs, setNoteTabs] = useState<NoteTab[]>(defaultTabs);
  const [activeNoteTab, setActiveNoteTab] = useState(0);
  const [isEditingNoteTitle, setIsEditingNoteTitle] = useState<number | null>(null);
  const [editedNoteTitle, setEditedNoteTitle] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tabToDelete, setTabToDelete] = useState<number | null>(null);
  const [lastSavedNotesState, setLastSavedNotesState] = useState<{[key: number]: string}>({});
  const notesDebounceRefs = useRef<{[key: number]: NodeJS.Timeout}>({});

  // Load saved notes on mount
  useEffect(() => {
    const loadNotes = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return;
      }
      
      try {
        const result = await getUserNotes();
        const notesFromDB = result.notes;
        const updatedNoteTabs = noteTabs.map(tab => ({
          ...tab,
          content: notesFromDB[tab.id] || ''
        }));
        
        setNoteTabs(updatedNoteTabs);
        setLastSavedNotesState(notesFromDB);
      } catch {
        // Fallback to localStorage if database fails
        const loadedNotesState: Record<number, string> = {};
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

  // Save notes to storage
  const saveNotesToStorage = useCallback(async (tabId: number, content: string) => {
    const lastSavedContent = lastSavedNotesState[tabId];
    
    if (content === lastSavedContent) return;
    
    try {
      await saveUserNote(tabId, content);
      setLastSavedNotesState(prev => ({ ...prev, [tabId]: content }));
    } catch {
      localStorage.setItem(`note_tab_${tabId}`, content);
      setLastSavedNotesState(prev => ({ ...prev, [tabId]: content }));
    }
  }, [lastSavedNotesState]);

  // Debounced save
  const debouncedSaveNotes = useCallback((tabId: number, content: string) => {
    if (notesDebounceRefs.current[tabId]) {
      clearTimeout(notesDebounceRefs.current[tabId]);
    }
    
    notesDebounceRefs.current[tabId] = setTimeout(() => {
      saveNotesToStorage(tabId, content);
    }, 2500);
  }, [saveNotesToStorage]);

  // Handlers
  const handleNoteTabChange = useCallback((_event: React.SyntheticEvent, newValue: number) => {
    setActiveNoteTab(newValue);
  }, []);

  const handleNotesBlur = useCallback((tabId: number, content: string) => {
    if (notesDebounceRefs.current[tabId]) {
      clearTimeout(notesDebounceRefs.current[tabId]);
    }
    
    const lastSavedContent = lastSavedNotesState[tabId];
    if (content !== lastSavedContent) {
      saveNotesToStorage(tabId, content);
    }
  }, [lastSavedNotesState, saveNotesToStorage]);

  const handleNoteContentChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = event.target.value;
    
    setNoteTabs(prev => prev.map(tab => 
      tab.id === activeNoteTab ? { ...tab, content: newContent } : tab
    ));
    
    debouncedSaveNotes(activeNoteTab, newContent);
  }, [activeNoteTab, debouncedSaveNotes]);

  const handleAddNoteTab = useCallback((newTabTitle: string) => {
    const newTabId = noteTabs.length > 0 ? Math.max(...noteTabs.map(tab => tab.id)) + 1 : 0;
    const newTab = { id: newTabId, title: newTabTitle, content: '' };
    setNoteTabs(prev => [...prev, newTab]);
    setActiveNoteTab(newTabId);
  }, [noteTabs]);

  const handleEditNoteTitle = useCallback((tabId: number, currentTitle: string) => {
    setIsEditingNoteTitle(tabId);
    setEditedNoteTitle(currentTitle);
  }, []);

  const handleSaveNoteTitle = useCallback(() => {
    if (isEditingNoteTitle !== null && editedNoteTitle.trim()) {
      setNoteTabs(prev => prev.map(tab => 
        tab.id === isEditingNoteTitle ? { ...tab, title: editedNoteTitle } : tab
      ));
    }
    setIsEditingNoteTitle(null);
  }, [isEditingNoteTitle, editedNoteTitle]);

  const handleConfirmDeleteTab = useCallback((tabId: number) => {
    setTabToDelete(tabId);
    setDeleteDialogOpen(true);
  }, []);

  const handleDeleteTab = useCallback(() => {
    if (tabToDelete !== null) {
      const updatedTabs = noteTabs.filter(tab => tab.id !== tabToDelete);
      setNoteTabs(updatedTabs);
      
      if (activeNoteTab === tabToDelete && updatedTabs.length > 0) {
        setActiveNoteTab(updatedTabs[0].id);
      }
      
      setDeleteDialogOpen(false);
      setTabToDelete(null);
    }
  }, [tabToDelete, noteTabs, activeNoteTab]);

  const handleCloseDeleteDialog = useCallback(() => {
    setDeleteDialogOpen(false);
    setTabToDelete(null);
  }, []);

  return {
    // State
    noteTabs,
    activeNoteTab,
    isEditingNoteTitle,
    editedNoteTitle,
    deleteDialogOpen,
    
    // Setters
    setEditedNoteTitle,
    
    // Handlers
    handleNoteTabChange,
    handleNotesBlur,
    handleNoteContentChange,
    handleAddNoteTab,
    handleEditNoteTitle,
    handleSaveNoteTitle,
    handleConfirmDeleteTab,
    handleDeleteTab,
    handleCloseDeleteDialog,
  };
}
