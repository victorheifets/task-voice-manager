'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  Typography,
  IconButton,
  Autocomplete,
  Switch,
  FormControlLabel,
  Divider,
  Grid
} from '@mui/material';
// Removed MUI date picker imports to avoid dependency conflicts
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import FlagIcon from '@mui/icons-material/Flag';
import PersonIcon from '@mui/icons-material/Person';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import { Task } from '@/types/task';
import { format } from 'date-fns';

interface TaskEditDialogProps {
  open: boolean;
  task: Task | null;
  onClose: () => void;
  onSave: (task: Task) => Promise<void>;
  onDelete?: (taskId: string) => Promise<void>;
}

const priorityOptions = [
  { value: 'low', label: 'Low', color: '#388e3c' },
  { value: 'medium', label: 'Medium', color: '#1976d2' },
  { value: 'high', label: 'High', color: '#f57c00' },
  { value: 'urgent', label: 'Urgent', color: '#d32f2f' }
];

const commonAssignees = [
  'John Doe',
  'Jane Smith', 
  'Bob Johnson',
  'Alice Brown',
  'Charlie Wilson',
  'Yan'
];

const commonTags = [
  'frontend', 'backend', 'documentation', 'testing', 'bug', 'feature',
  'urgent', 'enhancement', 'refactor', 'technical-debt', 'api', 'ui/ux',
  'deployment', 'security', 'performance', 'meeting', 'review', 'research'
];

export default function TaskEditDialog({ 
  open, 
  task, 
  onClose, 
  onSave, 
  onDelete 
}: TaskEditDialogProps) {
  const [editedTask, setEditedTask] = useState<Task | null>(null);
  const [loading, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    if (task) {
      setEditedTask({ ...task });
    } else {
      // New task
      setEditedTask({
        id: '',
        title: '',
        notes: '',
        completed: false,
        dueDate: null,
        assignee: null,
        priority: 'medium',
        tags: [],
        createdAt: '',
        updatedAt: ''
      });
    }
    setDeleteConfirm(false);
  }, [task, open]);

  const handleSave = async () => {
    if (!editedTask || !editedTask.title.trim()) return;

    setSaving(true);
    try {
      await onSave(editedTask);
      onClose();
    } catch (error) {
      console.error('Error saving task:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!task || !onDelete) return;
    
    setSaving(true);
    try {
      await onDelete(task.id);
      onClose();
    } catch (error) {
      console.error('Error deleting task:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleFieldChange = (field: keyof Task, value: any) => {
    if (!editedTask) return;
    setEditedTask({
      ...editedTask,
      [field]: value
    });
  };

  const getPriorityColor = (priority: string) => {
    return priorityOptions.find(p => p.value === priority)?.color || '#757575';
  };

  if (!editedTask) return null;

  return (
    <Dialog 
        open={open} 
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          pb: 1,
          borderBottom: '1px solid #e0e0e0'
        }}>
          <Typography component="div" variant="h6" fontWeight={600}>
            {task ? 'Edit Task' : 'Create New Task'}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={3}>
            {/* Title */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Task Title"
                value={editedTask.title}
                onChange={(e) => handleFieldChange('title', e.target.value)}
                placeholder="Enter task title..."
                required
                autoFocus
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
              />
            </Grid>

            {/* Description/Notes */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={editedTask.notes || ''}
                onChange={(e) => handleFieldChange('notes', e.target.value)}
                placeholder="Add task description..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
              />
            </Grid>

            {/* Priority and Completed Status */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={editedTask.priority}
                  label="Priority"
                  onChange={(e) => handleFieldChange('priority', e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  {priorityOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <FlagIcon sx={{ color: option.color, fontSize: 18 }} />
                        {option.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={editedTask.completed}
                    onChange={(e) => handleFieldChange('completed', e.target.checked)}
                    color="success"
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography>Task Completed</Typography>
                    {editedTask.completed && (
                      <Chip 
                        label="Done" 
                        size="small" 
                        color="success" 
                        sx={{ height: 20, fontSize: '0.7rem' }}
                      />
                    )}
                  </Box>
                }
                sx={{ 
                  mt: 1.5,
                  '& .MuiFormControlLabel-label': {
                    fontSize: '0.875rem'
                  }
                }}
              />
            </Grid>

            {/* Due Date */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Due Date"
                type="datetime-local"
                value={editedTask.dueDate ? editedTask.dueDate.slice(0, 16) : ''}
                onChange={(e) => {
                  const value = e.target.value;
                  handleFieldChange('dueDate', value ? new Date(value).toISOString() : null);
                }}
                InputLabelProps={{
                  shrink: true,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
              />
            </Grid>

            {/* Assignee */}
            <Grid item xs={12} sm={6}>
              <Autocomplete
                freeSolo
                options={commonAssignees}
                value={editedTask.assignee || ''}
                onChange={(_, value) => handleFieldChange('assignee', value || null)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Assignee"
                    placeholder="Assign to someone..."
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: <PersonIcon sx={{ mr: 1, color: 'action.active' }} />
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2
                      }
                    }}
                  />
                )}
              />
            </Grid>

            {/* Tags */}
            <Grid item xs={12}>
              <Autocomplete
                multiple
                freeSolo
                options={commonTags}
                value={editedTask.tags || []}
                onChange={(_, value) => handleFieldChange('tags', value)}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      {...getTagProps({ index })}
                      key={option}
                      label={option}
                      size="small"
                      sx={{
                        borderRadius: 2,
                        bgcolor: 'primary.50',
                        color: 'primary.700',
                        border: '1px solid',
                        borderColor: 'primary.200'
                      }}
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Tags"
                    placeholder="Add tags..."
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <>
                          <LocalOfferIcon sx={{ mr: 1, color: 'action.active' }} />
                          {params.InputProps.startAdornment}
                        </>
                      )
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2
                      }
                    }}
                  />
                )}
              />
            </Grid>

            {/* Task Metadata (if editing existing task) */}
            {task && (
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Typography variant="caption" color="text.secondary">
                    Created: {task.createdAt ? format(new Date(task.createdAt), 'MMM d, yyyy HH:mm') : 'No date'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Updated: {task.updatedAt ? format(new Date(task.updatedAt), 'MMM d, yyyy HH:mm') : 'No date'}
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 2, gap: 1 }}>
          {/* Delete button (for existing tasks) */}
          {task && onDelete && (
            <Box sx={{ mr: 'auto' }}>
              {!deleteConfirm ? (
                <Button
                  color="error"
                  variant="outlined"
                  startIcon={<DeleteIcon />}
                  onClick={() => setDeleteConfirm(true)}
                >
                  Delete
                </Button>
              ) : (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    size="small"
                    variant="text"
                    onClick={() => setDeleteConfirm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    variant="contained"
                    onClick={handleDelete}
                    disabled={loading}
                  >
                    Confirm Delete
                  </Button>
                </Box>
              )}
            </Box>
          )}

          {/* Save/Cancel buttons */}
          <Button
            variant="outlined"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={loading || !editedTask.title.trim()}
            sx={{
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              color: 'white'
            }}
          >
            {loading ? 'Saving...' : task ? 'Save Changes' : 'Create Task'}
          </Button>
        </DialogActions>
      </Dialog>
  );
}