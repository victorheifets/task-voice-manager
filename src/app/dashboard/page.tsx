'use client';

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Paper, 
  Card, 
  CardContent, 
  ThemeProvider, 
  createTheme,
  Avatar,
  Divider,
  Button,
  IconButton,
  Stack
} from '@mui/material';
import TaskInput from '@/components/tasks/TaskInput';
import TaskList from '@/components/tasks/TaskList';
import { getTasks } from '@/lib/supabase/client';
import { Task } from '@/types/task';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ScheduleIcon from '@mui/icons-material/Schedule';
import HomeIcon from '@mui/icons-material/Home';
import Link from 'next/link';

// Create a dark theme
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#f48fb1',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e1e1e',
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
});

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [completedTasks, setCompletedTasks] = useState(0);
  const [pendingTasks, setPendingTasks] = useState(0);

  useEffect(() => {
    loadTasks();
  }, [refreshTrigger]);

  const loadTasks = async () => {
    try {
      setIsLoading(true);
      const loadedTasks = await getTasks();
      setTasks(loadedTasks);
      
      // Calculate stats
      const completed = loadedTasks.filter(task => task.completed).length;
      setCompletedTasks(completed);
      setPendingTasks(loadedTasks.length - completed);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTaskAdded = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <Box sx={{ 
        display: 'flex',
        minHeight: '100vh',
        bgcolor: 'background.default',
        color: 'text.primary'
      }}>
        {/* Sidebar */}
        <Box sx={{ 
          width: 200, 
          flexShrink: 0, 
          bgcolor: 'background.paper',
          borderRight: '1px solid rgba(255, 255, 255, 0.12)',
          p: 1.5,
          display: { xs: 'none', sm: 'block' }
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <DashboardIcon sx={{ mr: 1, fontSize: '1.2rem' }} />
            <Typography variant="subtitle1" component="div" sx={{ fontSize: '0.95rem' }}>
              Task Manager
            </Typography>
          </Box>
          
          <Box sx={{ mb: 1.5 }}>
            <Button 
              component={Link}
              href="/"
              startIcon={<HomeIcon sx={{ fontSize: '1.1rem' }} />}
              fullWidth
              size="small"
              sx={{ justifyContent: 'flex-start', mb: 0.5, py: 0.75, fontSize: '0.85rem' }}
            >
              Home
            </Button>
            <Button 
              variant="contained"
              startIcon={<DashboardIcon sx={{ fontSize: '1.1rem' }} />}
              fullWidth
              size="small"
              sx={{ justifyContent: 'flex-start', mb: 0.5, py: 0.75, fontSize: '0.85rem' }}
            >
              Dashboard
            </Button>
          </Box>
          
          <Divider sx={{ my: 1.5 }} />
          
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontSize: '0.8rem' }}>
              Quick Stats
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.75 }}>
              <CheckCircleIcon fontSize="small" color="success" sx={{ mr: 0.75, fontSize: '0.9rem' }} />
              <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                {completedTasks} Completed
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <ScheduleIcon fontSize="small" color="warning" sx={{ mr: 0.75, fontSize: '0.9rem' }} />
              <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                {pendingTasks} Pending
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Main content */}
        <Box component="main" sx={{ flexGrow: 1, p: 2 }}>
          <Container maxWidth="lg">
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32, fontSize: '0.9rem' }}>U</Avatar>
            </Box>

            {/* Stats Cards */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
              <Card sx={{ flex: 1, minWidth: 0 }}>
                <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                  <Typography color="text.secondary" variant="body2" gutterBottom>
                    Total Tasks
                  </Typography>
                  <Typography variant="h5">
                    {tasks.length}
                  </Typography>
                </CardContent>
              </Card>
              <Card sx={{ flex: 1, minWidth: 0 }}>
                <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                  <Typography color="text.secondary" variant="body2" gutterBottom>
                    Completed
                  </Typography>
                  <Typography variant="h5" color="success.main">
                    {completedTasks}
                  </Typography>
                </CardContent>
              </Card>
              <Card sx={{ flex: 1, minWidth: 0 }}>
                <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                  <Typography color="text.secondary" variant="body2" gutterBottom>
                    Pending
                  </Typography>
                  <Typography variant="h5" color="warning.main">
                    {pendingTasks}
                  </Typography>
                </CardContent>
              </Card>
              <Card sx={{ flex: 1, minWidth: 0 }}>
                <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                  <Typography color="text.secondary" variant="body2" gutterBottom>
                    Completion Rate
                  </Typography>
                  <Typography variant="h5">
                    {tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0}%
                  </Typography>
                </CardContent>
              </Card>
            </Stack>

            {/* Task Input */}
            <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }}>
              <TaskInput onTaskAdded={handleTaskAdded} />
            </Paper>

            {/* Task List */}
            <Paper sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                <AssignmentIcon sx={{ mr: 1, fontSize: '1.1rem' }} />
                Your Tasks
              </Typography>
              <TaskList refreshTrigger={refreshTrigger} />
            </Paper>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
} 