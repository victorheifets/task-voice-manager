'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  AppBar,
  Toolbar,
  Button,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Chip,
  Divider,
  Avatar,
  useTheme
} from '@mui/material';
import { getTasks, updateTask } from '@/lib/supabase/client';
import { Task } from '@/types/task';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import TaskInput from '@/features/tasks/TaskInput';
import { teal, orange, grey } from '@mui/material/colors';
import Link from 'next/link';

// Define column types
type ColumnType = 'todo' | 'inProgress' | 'done';

export default function KanbanBoard() {
  const theme = useTheme();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showTaskInput, setShowTaskInput] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

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

  const handleMoveTask = async (taskId: string, completed: boolean) => {
    try {
      await updateTask(taskId, { completed });
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  // Filter tasks by status
  const todoTasks = tasks.filter(task => !task.completed && !task.dueDate);
  const inProgressTasks = tasks.filter(task => !task.completed && task.dueDate);
  const doneTasks = tasks.filter(task => task.completed);

  // Column component
  const KanbanColumn = ({ title, tasks, type, color }: { title: string, tasks: Task[], type: ColumnType, color: string }) => (
    <Paper 
      sx={{ 
        p: 2, 
        bgcolor: `${color}10`, 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        borderTop: `4px solid ${color}`
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ color: color }}>
          {title} ({tasks.length})
        </Typography>
      </Box>
      
      <Box sx={{ flexGrow: 1, overflowY: 'auto', pb: 2 }}>
        {tasks.map(task => (
          <Card key={task.id} sx={{ mb: 2 }}>
            <CardContent sx={{ pb: 1 }}>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {task.title}
              </Typography>
              
              {task.dueDate && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                  Due: {new Date(task.dueDate).toLocaleDateString()}
                </Typography>
              )}
              
              {task.assignee && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Avatar sx={{ width: 24, height: 24, fontSize: '0.8rem', mr: 1 }}>
                    {task.assignee.charAt(0).toUpperCase()}
                  </Avatar>
                  <Typography variant="caption">{task.assignee}</Typography>
                </Box>
              )}
              
              {task.tags && task.tags.length > 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                  {task.tags.map((tag, index) => (
                    <Chip 
                      key={index} 
                      label={tag} 
                      size="small" 
                      sx={{ bgcolor: `${color}20`, color: color }}
                    />
                  ))}
                </Box>
              )}
            </CardContent>
            
            <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
              {type === 'todo' && (
                <IconButton size="small" onClick={() => handleMoveTask(task.id!, false)}>
                  <CheckCircleOutlineIcon fontSize="small" color="action" />
                </IconButton>
              )}
              {type === 'inProgress' && (
                <IconButton size="small" onClick={() => handleMoveTask(task.id!, true)}>
                  <CheckCircleOutlineIcon fontSize="small" color="action" />
                </IconButton>
              )}
              {type === 'done' && (
                <IconButton size="small" onClick={() => handleMoveTask(task.id!, false)}>
                  <DeleteIcon fontSize="small" color="error" />
                </IconButton>
              )}
            </CardActions>
          </Card>
        ))}
        
        {tasks.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 2 }}>
            No tasks in this column
          </Typography>
        )}
      </Box>
    </Paper>
  );

  return (
      <Box sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <AppBar position="static" color="primary" elevation={0}>
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Kanban Task Board
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
        
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          {showTaskInput && (
            <Paper sx={{ p: 3, mb: 4 }}>
              <TaskInput onTaskAdded={handleTaskAdded} />
            </Paper>
          )}
          
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, 
            gap: 3,
            flexGrow: 1,
            mb: 4
          }}>
            <KanbanColumn 
              title="To Do" 
              tasks={todoTasks} 
              type="todo"
              color={grey[700]}
            />
            <KanbanColumn 
              title="In Progress" 
              tasks={inProgressTasks} 
              type="inProgress"
              color={orange[700]}
            />
            <KanbanColumn 
              title="Done" 
              tasks={doneTasks} 
              type="done"
              color={teal[700]}
            />
          </Box>
        </Container>
      </Box>
  );
} 