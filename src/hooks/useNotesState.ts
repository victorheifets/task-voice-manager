'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase, getUserNotes, saveUserNote } from '@/lib/supabase/client';

export interface NoteTab {
  id: number;
  title: string;
  content: string;
}

export function useNotesState() {
  const { t } = useTranslation(['notes']);

  const [activeNoteTab, setActiveNoteTab] = useState(0);
  const [noteTabs, setNoteTabs] = useState<NoteTab[]>([
    { id: 0, title: t('notes:tabs.general', 'General'), content: '' },
    { id: 1, title: t('notes:tabs.work', 'Work'), content: '' },
    { id: 2, title: t('notes:tabs.personal', 'Personal'), content: '' }
  ]);
  const [isEditingNoteTitle, setIsEditingNoteTitle] = useState<number | null>(null);
  const [editedNoteTitle, setEditedNoteTitle] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tabToDelete, setTabToDelete] = useState<number | null>(null);
  const [lastSavedNotesState, setLastSavedNotesState] = useState<{ [key: number]: string }>({});
  const notesDebounceRefs = useRef<{ [key: number]: NodeJS.Timeout }>({});

  // Load saved notes on mount
  useEffect(() => {
    const loadNotes = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          // Load from localStorage when not authenticated
          const loadedNotesState: { [key: number]: string } = {};
          const updatedNoteTabs = noteTabs.map(tab => {
            const savedContent = localStorage.getItem(`note_tab_${tab.id}`) || '';
            loadedNotesState[tab.id] = savedContent;
            return { ...tab, content: savedContent };
          });

          setNoteTabs(updatedNoteTabs);
          setLastSavedNotesState(loadedNotesState);
          return;
        }

        const result = await getUserNotes();
        const notesFromDB = result.notes;
        const updatedNoteTabs = noteTabs.map(tab => {
          const content = notesFromDB[tab.id] || '';
          return { ...tab, content };
        });

        setNoteTabs(updatedNoteTabs);
        setLastSavedNotesState(notesFromDB);
      } catch (_error) {
        // Fallback to localStorage if database fails
        const loadedNotesState: { [key: number]: string } = {};
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

  const saveNotesToStorage = useCallback(async (tabId: number, content: string) => {
    const lastSavedContent = lastSavedNotesState[tabId];
    if (content === lastSavedContent) return;

    // Always save to localStorage first
    localStorage.setItem(`note_tab_${tabId}`, content);
    setLastSavedNotesState(prev => ({ ...prev, [tabId]: content }));

    // Also try to save to database if authenticated
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await saveUserNote(tabId, content);
      }
    } catch (_error) {
      console.log('Database save failed, using localStorage');
    }
  }, [lastSavedNotesState]);

  const debouncedSaveNotes = useCallback((tabId: number, content: string) => {
    if (notesDebounceRefs.current[tabId]) {
      clearTimeout(notesDebounceRefs.current[tabId]);
    }

    notesDebounceRefs.current[tabId] = setTimeout(() => {
      saveNotesToStorage(tabId, content);
    }, 2500);
  }, [saveNotesToStorage]);

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

  const handleNoteTabChange = useCallback((event: React.SyntheticEvent, newValue: number) => {
    setActiveNoteTab(newValue);
  }, []);

  const handleAddNoteTab = useCallback(() => {
    const newTabId = noteTabs.length > 0 ? Math.max(...noteTabs.map(tab => tab.id)) + 1 : 0;
    const newTab = { id: newTabId, title: t('notes:tabs.new', { number: newTabId + 1 }), content: '' };
    setNoteTabs(prev => [...prev, newTab]);
    setActiveNoteTab(newTabId);
  }, [noteTabs, t]);

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
      setNoteTabs(prev => {
        const updatedTabs = prev.filter(tab => tab.id !== tabToDelete);
        if (activeNoteTab === tabToDelete && updatedTabs.length > 0) {
          setActiveNoteTab(updatedTabs[0].id);
        }
        return updatedTabs;
      });

      setDeleteDialogOpen(false);
      setTabToDelete(null);
    }
  }, [tabToDelete, activeNoteTab]);

  const handleCloseDeleteDialog = useCallback(() => {
    setDeleteDialogOpen(false);
    setTabToDelete(null);
  }, []);

  return {
    // State
    activeNoteTab,
    noteTabs,
    isEditingNoteTitle,
    editedNoteTitle,
    deleteDialogOpen,
    tabToDelete,

    // Setters
    setEditedNoteTitle,

    // Handlers
    handleNoteTabChange,
    handleNoteContentChange,
    handleNotesBlur,
    handleAddNoteTab,
    handleEditNoteTitle,
    handleSaveNoteTitle,
    handleConfirmDeleteTab,
    handleDeleteTab,
    handleCloseDeleteDialog,
  };
}
