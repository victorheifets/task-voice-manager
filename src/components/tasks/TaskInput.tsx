'use client';

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Paper, 
  CircularProgress,
  useTheme,
  alpha,
  InputBase,
  Tooltip,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { createTask } from '@/lib/supabase/client';
import { ParsedTaskData } from '@/types/task';
import { parseMultipleTasks } from '@/lib/openai/parser';

import MicIcon from '@mui/icons-material/Mic';
import InfoIcon from '@mui/icons-material/Info';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import AddIcon from '@mui/icons-material/Add';
import SendIcon from '@mui/icons-material/Send';
import StopIcon from '@mui/icons-material/Stop';

interface TaskInputProps {
  onTaskAdded: () => void;
  onRecordingStateChange?: (isRecording: boolean) => void;
  externalRecordingTrigger?: boolean;
}

export default function TaskInput({ onTaskAdded, onRecordingStateChange, externalRecordingTrigger }: TaskInputProps) {
  const [input, setInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const theme = useTheme();

  // Handle external recording trigger
  useEffect(() => {
    if (externalRecordingTrigger !== undefined) {

    }
  }, [externalRecordingTrigger]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;

    setIsSubmitting(true);
    setIsAiProcessing(true);

    try {
      // Create a single task
      await createTask({
        title: input.trim(),
        dueDate: null,
        assignee: null,
        tags: [],
        completed: false,
        priority: 'none'
      });

      setInput('');
      onTaskAdded();
    } catch (error) {
      console.error('Error creating task:', error);
    } finally {
      setIsSubmitting(false);
      setIsAiProcessing(false);
    }
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Paper
        elevation={3}
        sx={{
          p: 2,
          minHeight: '48px',
          gap: 2,
          borderRadius: 2,
          boxShadow: theme.shadows[3],
          padding: '8px 12px',
          border: `1px solid ${theme.palette.divider}`
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, position: 'relative' }}>
          <TextField
            fullWidth
            placeholder="Add a task... (e.g., 'Call John tomorrow at 3pm')"
            value={input}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            variant="outlined"
            size="small"
            className="task-input"
            sx={{
              '& .MuiOutlinedInput-root': {
                minHeight: 40,
                pr: '80px', // Make space for controls
              },
            }}
            InputProps={{
              endAdornment: (
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={handleSubmit}
                    disabled={!input.trim()}
                  >
                    <SendIcon />
                  </IconButton>
                </Box>
              ),
            }}
          />
        </Box>
      </Paper>

      <Dialog
        open={showNotes}
        onClose={() => setShowNotes(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Task Notes</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            multiline
            rows={4}
            fullWidth
            variant="outlined"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes about this task..."
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowNotes(false)}>Close</Button>
          <Button 
            onClick={() => {
              // Here you can save the notes
              setShowNotes(false);
            }} 
            variant="contained"
            color="primary"
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}