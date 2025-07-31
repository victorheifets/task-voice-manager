'use client';

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Divider,
  Grid,
  IconButton,
  Card,
  CardContent,
  Avatar,
  useTheme
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';
import FlagIcon from '@mui/icons-material/Flag';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { Task } from '@/types/task';
import { format, isToday, isTomorrow, isPast, parseISO } from 'date-fns';

interface TaskDetailsDialogProps {
  open: boolean;
  task: Task | null;
  onClose: () => void;
  onEdit?: () => void;
}

const getPriorityColor = (priority: string) => {
  switch(priority) {
    case 'urgent': return '#d32f2f';
    case 'high': return '#f57c00';
    case 'medium': return '#1976d2';
    case 'low': return '#388e3c';
    default: return '#757575';
  }
};

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'No due date';
  
  const date = parseISO(dateString);
  if (isToday(date)) return `Today (${format(date, 'HH:mm')})`;
  if (isTomorrow(date)) return `Tomorrow (${format(date, 'HH:mm')})`;
  if (isPast(date)) return `${format(date, 'MMM d, yyyy')} (overdue)`;
  return format(date, 'MMM d, yyyy HH:mm');
};

const safeFormat = (dateString: string | null, formatStr: string) => {
  if (!dateString) return 'No date';
  try {
    return format(new Date(dateString), formatStr);
  } catch {
    return 'Invalid date';
  }
};

export default function TaskDetailsDialog({ 
  open, 
  task, 
  onClose, 
  onEdit 
}: TaskDetailsDialogProps) {
  const theme = useTheme();
  if (!task) return null;

  const priorityColor = getPriorityColor(task.priority);
  const isOverdue = task.dueDate && isPast(parseISO(task.dueDate)) && !task.completed;

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
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
        pb: 2,
        borderBottom: '1px solid #e0e0e0'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {task.completed ? (
            <CheckCircleIcon sx={{ color: 'success.main', fontSize: 28 }} />
          ) : (
            <RadioButtonUncheckedIcon sx={{ color: 'text.secondary', fontSize: 28 }} />
          )}
          <Typography component="div" variant="h6" fontWeight={600}>
            Task Details
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {onEdit && (
            <IconButton onClick={onEdit} size="small" color="primary">
              <EditIcon />
            </IconButton>
          )}
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        {/* Task Title */}
        <Box sx={{ mb: 3 }}>
          <Typography 
            variant="h5" 
            fontWeight={600}
            sx={{
              color: task.completed ? 'text.secondary' : 'text.primary',
              textDecoration: task.completed ? 'line-through' : 'none',
              mb: 1
            }}
          >
            {task.title}
          </Typography>
          
          {/* Status Indicator */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Chip
              label={task.completed ? 'Completed' : 'Pending'}
              color={task.completed ? 'success' : 'default'}
              size="small"
              sx={{ fontWeight: 600 }}
            />
            {isOverdue && (
              <Chip
                label="Overdue"
                color="error"
                size="small"
                sx={{ fontWeight: 600 }}
              />
            )}
          </Box>
        </Box>

        {/* Task Description */}
        {task.notes && (
          <Card sx={{ mb: 3, bgcolor: 'grey.50', border: '1px solid #e0e0e0' }}>
            <CardContent sx={{ py: 2 }}>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                {task.notes}
              </Typography>
            </CardContent>
          </Card>
        )}

        {/* Task Details Grid */}
        <Grid container spacing={3}>
          {/* Priority */}
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <FlagIcon sx={{ color: priorityColor, fontSize: 20 }} />
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Priority
                </Typography>
                <Typography variant="body1" fontWeight={500} sx={{ textTransform: 'capitalize' }}>
                  {task.priority}
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Due Date */}
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <CalendarTodayIcon sx={{ 
                color: theme.palette.mode === 'dark' ? '#94A3B8' : 'text.secondary', 
                fontSize: 20 
              }} />
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Due Date
                </Typography>
                <Typography 
                  variant="body1" 
                  fontWeight={500}
                  sx={{
                    color: isOverdue ? 'error.main' : 'text.primary'
                  }}
                >
                  {formatDate(task.dueDate)}
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Assignee */}
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              {task.assignee ? (
                <>
                  <Avatar sx={{ 
                    width: 24, 
                    height: 24, 
                    fontSize: '0.75rem', 
                    bgcolor: 'primary.main' 
                  }}>
                    {task.assignee.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Assigned to
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {task.assignee}
                    </Typography>
                  </Box>
                </>
              ) : (
                <>
                  <PersonIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Assigned to
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Unassigned
                    </Typography>
                  </Box>
                </>
              )}
            </Box>
          </Grid>

          {/* Created Date */}
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <AccessTimeIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Created
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {safeFormat(task.createdAt, 'MMM d, yyyy HH:mm')}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <LocalOfferIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
              <Typography variant="caption" color="text.secondary">
                Tags
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {task.tags.map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  size="small"
                  variant="outlined"
                  sx={{
                    borderRadius: 2,
                    bgcolor: 'primary.50',
                    borderColor: 'primary.200',
                    color: 'primary.700',
                    fontWeight: 500
                  }}
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Timestamps */}
        <Box sx={{ mt: 3 }}>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary" display="block">
                Created
              </Typography>
              <Typography variant="body2">
                {safeFormat(task.createdAt, 'MMM d, yyyy HH:mm')}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary" display="block">
                Last Updated
              </Typography>
              <Typography variant="body2">
                {safeFormat(task.updatedAt, 'MMM d, yyyy HH:mm')}
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 2 }}>
        <Button variant="outlined" onClick={onClose}>
          Close
        </Button>
        {onEdit && (
          <Button 
            variant="contained" 
            startIcon={<EditIcon />}
            onClick={onEdit}
            sx={{
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              color: 'white'
            }}
          >
            Edit Task
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}