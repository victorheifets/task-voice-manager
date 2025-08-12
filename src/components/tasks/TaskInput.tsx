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
      console.log('📋 Parsed tasks to create:', parsedTasks);
      
      // Create all parsed tasks
      for (const taskData of parsedTasks) {
        console.log('💾 Creating task:', taskData);
        
        const createdTask = await createTask({
          title: taskData.title,
          dueDate: taskData.dueDate,
          assignee: taskData.assignee,
          tags: taskData.tags,
          completed: false,
          priority: taskData.priority || 'medium'
        });
        
        console.log('✅ Task created successfully:', createdTask);
      }

      setInput('');
      previousTranscriptRef.current = '';
      onTaskAdded();
      console.log('🎉 All tasks created and UI updated');
    } catch (error: any) {
      console.error('❌ Error creating task:', error);
      console.error('Error details:', error?.message, error?.stack);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Paper elevation={0} sx={{ 
        p: 0, 
        borderRadius: 2, 
        mb: 2,
        boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
        border: `1px solid ${theme.palette.divider}`,
        '&:hover': {
          boxShadow: '0 6px 20px rgba(0,0,0,0.35)',
          borderColor: theme.palette.primary.main,
          transform: 'translateY(-1px)',
          transition: 'all 0.3s ease'
        }
      }}>
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
            '& .MuiOutlinedInput-root': {
              minHeight: 48,
              pr: '60px',
              borderRadius: 2,
              border: 'none',
              '& fieldset': {
                border: 'none',
              },
              '&:hover fieldset': {
                border: 'none',
              },
              '&.Mui-focused fieldset': {
                border: 'none',
              },
            },
          }}
          slotProps={{
          input: {
            endAdornment: (
              <Box sx={{ display: 'flex', gap: 0.5, mr: 1 }}>
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
    </>
  );
}