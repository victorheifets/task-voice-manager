'use client';

import React from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  useTheme,
  alpha,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTranslation } from 'react-i18next';
import { useNotesState, NoteTab } from '@/hooks/useNotesState';
import { SPACING, LAYOUT } from '@/constants';

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

interface NotesTabProps {
  isMobile?: boolean;
}

export default function NotesTab({ isMobile = false }: NotesTabProps) {
  const { t } = useTranslation(['common', 'notes']);
  const theme = useTheme();

  const {
    activeNoteTab,
    noteTabs,
    isEditingNoteTitle,
    editedNoteTitle,
    deleteDialogOpen,
    setEditedNoteTitle,
    handleNoteTabChange,
    handleNoteContentChange,
    handleNotesBlur,
    handleAddNoteTab,
    handleEditNoteTitle,
    handleSaveNoteTitle,
    handleConfirmDeleteTab,
    handleDeleteTab,
    handleCloseDeleteDialog,
  } = useNotesState();

  return (
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
              value={tab.id}
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
        pb: isMobile ? `${LAYOUT.MOBILE_BOTTOM_PADDING}px` : 0,
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
                placeholder={t('notes:placeholder', 'Start typing your notes...')}
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>{t('notes:deleteDialog.title', 'Delete Note Tab')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('notes:deleteDialog.message', 'Are you sure you want to delete this note tab? This action cannot be undone.')}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>
            {t('common:cancel', 'Cancel')}
          </Button>
          <Button onClick={handleDeleteTab} color="error" variant="contained">
            {t('common:delete', 'Delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
