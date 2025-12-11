'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  useTheme,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { createTask } from '@/lib/supabase/client';
import { useNotification } from '@/contexts/NotificationContext';

import SendIcon from '@mui/icons-material/Send';

interface TaskInputProps {
  onTaskAdded: () => void;
  transcript?: string;
}

export default function TaskInput({ onTaskAdded, transcript }: TaskInputProps) {
  const [input, setInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const previousTranscriptRef = useRef('');
  const theme = useTheme();
  const { showError, showSuccess: _showSuccess } = useNotification();
  // Update input when transcript changes - simple direct update
  useEffect(() => {
    if (transcript) {
      setInput(transcript);
    }
  }, [transcript]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInput(newValue);
    // Reset the previous transcript when user manually types
    previousTranscriptRef.current = '';
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;

    setIsSubmitting(true);

    try {
      // Get API key from localStorage (saved in Settings)
      const apiKey = localStorage.getItem('openaiApiKey') || '';

      // Use server-side API to parse the task
      const response = await fetch('/api/tasks/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskText: input.trim(), apiKey })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to parse task');
      }

      const { tasks } = await response.json();

      // Create all parsed tasks
      for (const parsedTask of tasks) {
        await createTask({
          title: parsedTask.title,
          dueDate: parsedTask.dueDate,
          assignee: parsedTask.assignee,
          tags: parsedTask.tags || [],
          completed: false,
          priority: parsedTask.priority || 'medium'
        });
      }

      setInput('');
      previousTranscriptRef.current = '';
      onTaskAdded();
    } catch (error) {
      console.error('Error creating task:', error);
      // Show error to user
      showError(error instanceof Error ? error.message : 'Failed to create task');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
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
        size="medium"
        className="task-input"
        aria-label="Task input field"
        aria-describedby="task-input-help"
        inputProps={{
          'aria-busy': isSubmitting,
        }}
        sx={{
          borderRadius: 2,
          '& .MuiOutlinedInput-root': {
            minHeight: 48,
            pr: '80px',
            borderRadius: 2,
            backgroundColor: 'background.paper',
            // Match search box shadow styling
            boxShadow: '0 0 32px rgba(128, 128, 128, 0.15), 0 0 16px rgba(128, 128, 128, 0.1)',
            transition: 'box-shadow 0.3s ease, transform 0.2s ease, border-color 0.3s ease',
            '&:hover': {
              boxShadow: '0 0 40px rgba(128, 128, 128, 0.2), 0 0 20px rgba(128, 128, 128, 0.15)',
              transform: 'translateY(-1px)',
            },
            '&.Mui-focused': {
              boxShadow: '0 0 40px rgba(33, 150, 243, 0.3), 0 0 20px rgba(128, 128, 128, 0.1)',
              transform: 'translateY(-1px)',
            },
            '& fieldset': {
              borderColor: theme.palette.mode === 'dark'
                ? 'rgba(255, 255, 255, 0.23)'
                : 'rgba(0,0,0,0.23)',
            },
            '&:hover fieldset': {
              borderColor: theme.palette.mode === 'dark'
                ? 'rgba(255, 255, 255, 0.6)'
                : 'rgba(0,0,0,0.4)',
            },
            '&.Mui-focused fieldset': {
              borderColor: theme.palette.primary.main,
            }
          },
          mb: 2
        }}
        slotProps={{
          input: {
            endAdornment: (
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <IconButton
                  size="small"
                  color="primary"
                  onClick={handleSubmit}
                  disabled={!input.trim() || isSubmitting}
                  aria-label={isSubmitting ? "Submitting task" : "Submit task"}
                >
                  {isSubmitting ? (
                    <CircularProgress size={20} aria-label="Loading" />
                  ) : (
                    <SendIcon />
                  )}
                </IconButton>
              </Box>
            ),
          },
        }}
        />

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
    </>
  );
}