'use client';

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  ThemeProvider, 
  createTheme,
  AppBar,
  Toolbar,
  Button,
  IconButton,
  Grid,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { getTasks } from '@/lib/supabase/client';
import { Task } from '@/types/task';
import TaskInput from '@/features/tasks/TaskInput';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isToday,
  isSameDay,
  addMonths,
  subMonths
} from 'date-fns';
import { purple, deepPurple } from '@mui/material/colors';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import AddIcon from '@mui/icons-material/Add';
import Link from 'next/link';

// Create a purple theme
const calendarTheme = createTheme({
  palette: {
    primary: {
      main: deepPurple[500],
    },
    secondary: {
      main: purple[300],
    },
    background: {
      default: '#f9f7ff',
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          borderRadius: '12px',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          textTransform: 'none',
        },
      },
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
    },
    h6: {
      fontWeight: 600,
    },
  },
});

export default function CalendarView() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showTaskInput, setShowTaskInput] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedDayTasks, setSelectedDayTasks] = useState<Task[]>([]);

  useEffect(() => {
    loadTasks();
  }, [refreshTrigger]);

  const loadTasks = async () => {
    try {
      setIsLoading(true);
      const loadedTasks = await getTasks();
      setTasks(loadedTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTaskAdded = () => {
    setRefreshTrigger(prev => prev + 1);
    setShowTaskInput(false);
  };

  const handlePreviousMonth = () => {
    setCurrentDate(prevDate => subMonths(prevDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prevDate => addMonths(prevDate, 1));
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    
    // Filter tasks for the selected date
    const tasksForDay = tasks.filter(task => {
      if (!task.dueDate) return false;
      return isSameDay(new Date(task.dueDate), date);
    });
    
    setSelectedDayTasks(tasksForDay);
  };

  const handleCloseDialog = () => {
    setSelectedDate(null);
    setSelectedDayTasks([]);
  };

  // Generate calendar days
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get tasks for each day
  const getTasksForDay = (date: Date) => {
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      return isSameDay(new Date(task.dueDate), date);
    });
  };

  // Days of week header
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <ThemeProvider theme={calendarTheme}>
      <Box sx={{ 
        minHeight: '100vh', 
        bgcolor: 'background.default',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <AppBar position="static" color="primary" elevation={0}>
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Task Calendar
            </Typography>
            <Button 
              color="inherit" 
              onClick={() => setShowTaskInput(!showTaskInput)}
              startIcon={<AddIcon />}
            >
              Add Task
            </Button>
            <Button 
              color="inherit"
              component={Link}
              href="/"
              sx={{ ml: 2 }}
            >
              Home
            </Button>
          </Toolbar>
        </AppBar>
        
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
          {showTaskInput && (
            <Paper sx={{ p: 3, mb: 4 }}>
              <TaskInput onTaskAdded={handleTaskAdded} />
            </Paper>
          )}
          
          <Paper sx={{ p: 3, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <IconButton onClick={handlePreviousMonth}>
                <ChevronLeftIcon />
              </IconButton>
              
              <Typography variant="h4">
                {format(currentDate, 'MMMM yyyy')}
              </Typography>
              
              <IconButton onClick={handleNextMonth}>
                <ChevronRightIcon />
              </IconButton>
            </Box>
            
            {/* Calendar grid header - days of week */}
            <Grid container spacing={1} sx={{ mb: 1 }}>
              {daysOfWeek.map(day => (
                <Grid item xs key={day} sx={{ textAlign: 'center' }}>
                  <Typography variant="subtitle2" fontWeight={600}>
                    {day}
                  </Typography>
                </Grid>
              ))}
            </Grid>
            
            {/* Calendar grid */}
            <Grid container spacing={1}>
              {/* Empty cells for days before the start of month */}
              {Array.from({ length: monthStart.getDay() }).map((_, index) => (
                <Grid item xs key={`empty-start-${index}`}>
                  <Box sx={{ 
                    height: 100, 
                    bgcolor: 'background.paper', 
                    borderRadius: 2,
                    opacity: 0.3
                  }} />
                </Grid>
              ))}
              
              {/* Actual calendar days */}
              {calendarDays.map(day => {
                const tasksForDay = getTasksForDay(day);
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isCurrentDay = isToday(day);
                
                return (
                  <Grid item xs key={day.toString()}>
                    <Paper 
                      sx={{ 
                        height: 100, 
                        p: 1,
                        cursor: 'pointer',
                        border: isCurrentDay ? `2px solid ${deepPurple[500]}` : 'none',
                        bgcolor: isCurrentDay ? 'rgba(103, 58, 183, 0.05)' : 'background.paper',
                        display: 'flex',
                        flexDirection: 'column',
                        '&:hover': {
                          bgcolor: 'rgba(103, 58, 183, 0.1)',
                        }
                      }}
                      onClick={() => handleDateClick(day)}
                    >
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: isCurrentDay ? 700 : 400,
                          color: isCurrentDay ? 'primary.main' : 'text.primary',
                          mb: 0.5
                        }}
                      >
                        {format(day, 'd')}
                      </Typography>
                      
                      {tasksForDay.length > 0 && (
                        <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
                          {tasksForDay.slice(0, 2).map((task, index) => (
                            <Box 
                              key={task.id} 
                              sx={{ 
                                bgcolor: task.completed ? 'success.light' : 'primary.light',
                                color: 'white',
                                borderRadius: 1,
                                p: 0.5,
                                mb: 0.5,
                                fontSize: '0.7rem',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}
                            >
                              {task.title}
                            </Box>
                          ))}
                          
                          {tasksForDay.length > 2 && (
                            <Typography variant="caption" color="text.secondary">
                              +{tasksForDay.length - 2} more
                            </Typography>
                          )}
                        </Box>
                      )}
                    </Paper>
                  </Grid>
                );
              })}
              
              {/* Empty cells for days after the end of month */}
              {Array.from({ length: 6 - monthEnd.getDay() }).map((_, index) => (
                <Grid item xs key={`empty-end-${index}`}>
                  <Box sx={{ 
                    height: 100, 
                    bgcolor: 'background.paper', 
                    borderRadius: 2,
                    opacity: 0.3
                  }} />
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Container>
        
        {/* Dialog for selected day tasks */}
        <Dialog 
          open={selectedDate !== null} 
          onClose={handleCloseDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            {selectedDate && format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </DialogTitle>
          <DialogContent dividers>
            {selectedDayTasks.length > 0 ? (
              selectedDayTasks.map(task => (
                <Card key={task.id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6">{task.title}</Typography>
                    
                    {task.assignee && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Assigned to: {task.assignee}
                      </Typography>
                    )}
                    
                    {task.tags && task.tags.length > 0 && (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                        {task.tags.map((tag, index) => (
                          <Box 
                            key={index}
                            sx={{ 
                              bgcolor: 'primary.light',
                              color: 'white',
                              borderRadius: 1,
                              px: 1,
                              py: 0.5,
                              fontSize: '0.75rem'
                            }}
                          >
                            {tag}
                          </Box>
                        ))}
                      </Box>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <Typography color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                No tasks scheduled for this day
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Close</Button>
            <Button 
              variant="contained" 
              color="primary"
              onClick={() => {
                setShowTaskInput(true);
                handleCloseDialog();
              }}
            >
              Add Task
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
} 