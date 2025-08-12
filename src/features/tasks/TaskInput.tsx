'use client';

import React, { useState, useEffect, useRef } from 'react';
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
      // Use AI to parse the tasks
      const parsedTasks = await parseMultipleTasks(input.trim());
      
      // Create all parsed tasks
      for (const taskData of parsedTasks) {
        await createTask({
          title: taskData.title,
          dueDate: taskData.dueDate,
          assignee: taskData.assignee,
          tags: taskData.tags,
          completed: false,
          priority: taskData.priority || 'medium'
        });
      }

      setInput('');
      previousTranscriptRef.current = '';
      onTaskAdded();
    } catch (error) {
      console.error('Error creating task:', error);
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
        sx={{
          borderRadius: 2,
          // Strong shadow around all sides
          boxShadow: '0 0 20px rgba(128, 128, 128, 0.12), 0 0 8px rgba(128, 128, 128, 0.08)',
          '& .MuiOutlinedInput-root': {
            minHeight: 48,
            pr: '80px',
            borderRadius: 2,
            backgroundColor: 'background.paper',
            // Additional shadow around the input container
            boxShadow: '0 0 12px rgba(128, 128, 128, 0.06)',
            transition: 'box-shadow 0.3s ease, transform 0.2s ease, border-color 0.3s ease',
            '&:hover': {
              boxShadow: '0 0 24px rgba(128, 128, 128, 0.1), 0 0 12px rgba(128, 128, 128, 0.06)',
              transform: 'translateY(-1px)',
            },
            '&.Mui-focused': {
              boxShadow: '0 0 32px rgba(128, 128, 128, 0.12), 0 0 16px rgba(128, 128, 128, 0.08)',
              transform: 'translateY(-2px)',
            },
            '& fieldset': {
              borderColor: 'rgba(0,0,0,0.23)',
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
                >
                  {isSubmitting ? (
                    <CircularProgress size={20} />
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