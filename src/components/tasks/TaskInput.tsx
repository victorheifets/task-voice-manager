'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  DialogActions,
  Stack
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
  
  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
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
          priority: 'none'
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
  }, [input, onTaskAdded]);

  // Update input when transcript changes and auto-submit
  useEffect(() => {
    console.log('TaskInput: useEffect transcript changed to:', transcript);
    console.log('TaskInput: Current input value:', input);
    if (transcript && transcript !== previousTranscriptRef.current) {
      console.log('TaskInput: Setting input to transcript:', transcript);
      setInput(transcript);
      previousTranscriptRef.current = transcript;
      
      // Auto-submit the task after a short delay to allow user to see the transcript
      const autoSubmitTimer = setTimeout(() => {
        if (transcript.trim()) {
          console.log('TaskInput: Auto-submitting transcript:', transcript);
          handleSubmit();
        }
      }, 1000); // 1 second delay
      
      return () => clearTimeout(autoSubmitTimer);
    }
  }, [transcript, handleSubmit]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInput(newValue);
    // Reset the previous transcript when user manually types
    previousTranscriptRef.current = '';
  };

  return (
    <Box sx={{ my: 3 }}>
      <Paper
        elevation={2}
        sx={{
          px: 2,
          py: 1.5,
          borderRadius: '12px',
          boxShadow: theme.palette.mode === 'dark' 
            ? '0 4px 20px rgba(0, 0, 0, 0.4), 0 1px 3px rgba(0, 0, 0, 0.6)' 
            : '0 4px 20px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.12)',
          border: theme.palette.mode === 'dark' 
            ? '1px solid rgba(255, 255, 255, 0.2)' 
            : '1px solid rgba(0, 0, 0, 0.1)',
          bgcolor: theme.palette.mode === 'dark' 
            ? '#1F2937' 
            : '#FFFFFF',
          color: theme.palette.text.primary,
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: theme.palette.mode === 'dark' 
              ? '0 6px 24px rgba(0, 0, 0, 0.5), 0 2px 4px rgba(0, 0, 0, 0.7)' 
              : '0 6px 24px rgba(0, 0, 0, 0.12), 0 2px 4px rgba(0, 0, 0, 0.15)',
            borderColor: theme.palette.mode === 'dark' 
              ? 'rgba(255, 255, 255, 0.3)' 
              : 'rgba(0, 0, 0, 0.15)',
          }
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1.5, 
          position: 'relative',
          width: '100%'
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
            size="small"
            className="task-input"
            sx={{
              '& .MuiOutlinedInput-root': {
                minHeight: 40,
                pr: '80px', // Make space for controls
                bgcolor: 'transparent',
                color: theme.palette.text.primary,
                borderRadius: '8px',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: theme.palette.mode === 'dark'
                    ? alpha(theme.palette.primary.main, 0.05)
                    : alpha(theme.palette.primary.main, 0.02),
                },
                '&.Mui-focused': {
                  bgcolor: theme.palette.mode === 'dark'
                    ? alpha(theme.palette.primary.main, 0.08)
                    : alpha(theme.palette.primary.main, 0.04),
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  border: 'none',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  border: 'none',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  border: 'none',
                }
              },
              '& .MuiInputBase-input': {
                padding: '12px 14px',
                fontSize: '1rem',
                fontWeight: 600,
                color: theme.palette.mode === 'dark' 
                  ? '#FFFFFF' 
                  : '#000000',
                '&::placeholder': {
                  color: theme.palette.mode === 'dark' 
                    ? '#94A3B8' 
                    : '#475569',
                  opacity: 1,
                  fontWeight: 500
                }
              },
            }}
            slotProps={{
              input: {
                endAdornment: (
                  <Box sx={{ display: 'flex', gap: 0.5, mr: 0.5 }}>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={handleSubmit}
                      disabled={!input.trim() || isSubmitting}
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: '10px',
                        transition: 'all 0.2s ease',
                        color: input.trim() && !isSubmitting 
                          ? theme.palette.primary.main 
                          : theme.palette.mode === 'dark' 
                            ? alpha(theme.palette.text.secondary, 0.6) 
                            : alpha(theme.palette.text.secondary, 0.5),
                        bgcolor: input.trim() && !isSubmitting 
                          ? alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.15 : 0.08) 
                          : 'transparent',
                        '&:hover': {
                          bgcolor: input.trim() && !isSubmitting 
                            ? alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.25 : 0.15) 
                            : alpha(theme.palette.action.hover, 0.1),
                          transform: input.trim() && !isSubmitting ? 'scale(1.05)' : 'none'
                        },
                        '&:active': {
                          transform: input.trim() && !isSubmitting ? 'scale(0.95)' : 'none'
                        }
                      }}
                    >
                      {isSubmitting ? (
                        <CircularProgress size={20} thickness={4} />
                      ) : (
                        <SendIcon fontSize="small" />
                      )}
                    </IconButton>
                  </Box>
                ),
              },
            }}
          />
        </Box>
      </Paper>

      <Dialog
        open={showNotes}
        onClose={() => setShowNotes(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: theme.palette.mode === 'dark' 
              ? alpha(theme.palette.background.paper, 0.9) 
              : theme.palette.background.paper,
            color: theme.palette.text.primary,
            borderRadius: { xs: 3, sm: 4 },
            boxShadow: theme.palette.mode === 'dark' 
              ? '0 16px 48px rgba(0, 0, 0, 0.7)' 
              : '0 12px 40px rgba(0, 0, 0, 0.25)',
            border: theme.palette.mode === 'dark' 
              ? `1px solid ${alpha(theme.palette.divider, 0.7)}` 
              : `1px solid ${alpha(theme.palette.divider, 0.3)}`,
            backdropFilter: 'blur(10px)',
            maxWidth: { xs: '95%', sm: '80%', md: '600px' },
            width: '100%',
            mx: 'auto',
            p: { xs: 2, sm: 3 },
            '& .MuiDialogTitle-root': {
              color: theme.palette.text.primary,
              fontSize: { xs: '1.25rem', sm: '1.5rem' },
              fontWeight: 600,
              pb: 1
            },
            '& .MuiDialogContent-root': {
              p: { xs: 2, sm: 3 }
            }
          }
        }}
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
            sx={{
              mt: 1,
              '& .MuiOutlinedInput-root': {
                bgcolor: theme.palette.mode === 'dark' 
                  ? alpha(theme.palette.background.paper, 0.6) 
                  : alpha(theme.palette.background.paper, 0.8),
                borderRadius: '12px',
                transition: 'all 0.2s ease',
                '&:hover': {
                  boxShadow: theme.palette.mode === 'dark'
                    ? '0 0 0 2px rgba(99, 102, 241, 0.2)'
                    : '0 0 0 2px rgba(99, 102, 241, 0.1)',
                },
                '&.Mui-focused': {
                  boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.25)}`,
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  border: 'none',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  border: 'none',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  border: 'none',
                }
              },
              '& .MuiInputBase-input': {
                padding: '12px 14px',
                fontSize: '0.95rem',
                fontWeight: 400,
                color: theme.palette.text.primary,
                '&::placeholder': {
                  color: theme.palette.mode === 'dark' 
                    ? alpha(theme.palette.text.secondary, 0.7) 
                    : theme.palette.text.secondary,
                  opacity: 1
                }
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
          <Stack direction="row" spacing={2} sx={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button 
              onClick={() => setShowNotes(false)}
              variant="outlined"
              sx={{
                borderRadius: '10px',
                px: 3,
                py: 1,
                textTransform: 'none',
                fontWeight: 500,
                borderColor: theme.palette.mode === 'dark' 
                  ? alpha(theme.palette.divider, 0.7) 
                  : theme.palette.divider,
                '&:hover': {
                  borderColor: theme.palette.mode === 'dark' 
                    ? alpha(theme.palette.primary.main, 0.6) 
                    : alpha(theme.palette.primary.main, 0.5),
                  bgcolor: alpha(theme.palette.action.hover, 0.1)
                }
              }}
            >
              Close
            </Button>
            <Button 
              onClick={() => {
                // Here you can save the notes
                setShowNotes(false);
              }} 
              variant="contained"
              color="primary"
              sx={{
                borderRadius: '10px',
                px: 3,
                py: 1,
                textTransform: 'none',
                fontWeight: 500,
                boxShadow: theme.palette.mode === 'dark'
                  ? '0 4px 12px rgba(99, 102, 241, 0.3)' 
                  : '0 4px 12px rgba(99, 102, 241, 0.2)',
                '&:hover': {
                  boxShadow: theme.palette.mode === 'dark' 
                    ? '0 6px 16px rgba(99, 102, 241, 0.4)' 
                    : '0 6px 16px rgba(99, 102, 241, 0.25)'
                }
              }}
            >
              Save
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>
    </Box>
  );
}