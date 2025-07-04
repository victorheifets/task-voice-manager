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
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import { getTasks } from '@/lib/supabase/client';
import { Task } from '@/types/task';
import { 
  format, 
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  parseISO,
  subDays,
  differenceInDays
} from 'date-fns';
import { blue, green, red, orange, grey } from '@mui/material/colors';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import ScheduleIcon from '@mui/icons-material/Schedule';
import Link from 'next/link';

// Create a blue theme
const analyticsTheme = createTheme({
  palette: {
    primary: {
      main: blue[700],
    },
    secondary: {
      main: orange[500],
    },
    success: {
      main: green[500],
    },
    error: {
      main: red[500],
    },
    background: {
      default: '#f8fafc',
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
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
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
});

export default function Analytics() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    overdue: 0,
    completionRate: 0,
    avgCompletionTime: 0,
    tasksThisWeek: 0,
    completedThisWeek: 0,
  });
  const [weeklyData, setWeeklyData] = useState<{day: string, completed: number, added: number}[]>([]);
  const [topTags, setTopTags] = useState<{tag: string, count: number}[]>([]);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setIsLoading(true);
      const loadedTasks = await getTasks();
      setTasks(loadedTasks);
      calculateStats(loadedTasks);
      calculateWeeklyData(loadedTasks);
      calculateTopTags(loadedTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (tasks: Task[]) => {
    const now = new Date();
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    const pending = total - completed;
    
    // Calculate overdue tasks (due date in the past but not completed)
    const overdue = tasks.filter(task => {
      if (!task.dueDate || task.completed) return false;
      return new Date(task.dueDate) < now;
    }).length;
    
    // Calculate completion rate
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    // Calculate average completion time in days
    let totalCompletionTime = 0;
    let completedTasksWithDates = 0;
    
    tasks.forEach(task => {
      if (task.completed && task.createdAt && task.updatedAt) {
        const createdDate = new Date(task.createdAt);
        const completedDate = new Date(task.updatedAt);
        const days = differenceInDays(completedDate, createdDate);
        totalCompletionTime += days;
        completedTasksWithDates++;
      }
    });
    
    const avgCompletionTime = completedTasksWithDates > 0 ? 
      Math.round(totalCompletionTime / completedTasksWithDates) : 0;
    
    // Calculate tasks this week
    const startOfCurrentWeek = startOfWeek(now);
    const endOfCurrentWeek = endOfWeek(now);
    
    const tasksThisWeek = tasks.filter(task => {
      if (!task.createdAt) return false;
      const createdDate = new Date(task.createdAt);
      return createdDate >= startOfCurrentWeek && createdDate <= endOfCurrentWeek;
    }).length;
    
    const completedThisWeek = tasks.filter(task => {
      if (!task.completed || !task.updatedAt) return false;
      const completedDate = new Date(task.updatedAt);
      return completedDate >= startOfCurrentWeek && completedDate <= endOfCurrentWeek;
    }).length;
    
    setStats({
      total,
      completed,
      pending,
      overdue,
      completionRate,
      avgCompletionTime,
      tasksThisWeek,
      completedThisWeek
    });
  };

  const calculateWeeklyData = (tasks: Task[]) => {
    const today = new Date();
    const lastWeek = eachDayOfInterval({
      start: subDays(today, 6),
      end: today
    });
    
    const weekData = lastWeek.map(date => {
      const dayString = format(date, 'EEE');
      
      const added = tasks.filter(task => {
        if (!task.createdAt) return false;
        return isSameDay(parseISO(task.createdAt), date);
      }).length;
      
      const completed = tasks.filter(task => {
        if (!task.completed || !task.updatedAt) return false;
        return isSameDay(parseISO(task.updatedAt), date);
      }).length;
      
      return {
        day: dayString,
        added,
        completed
      };
    });
    
    setWeeklyData(weekData);
  };

  const calculateTopTags = (tasks: Task[]) => {
    const tagCounts: Record<string, number> = {};
    
    tasks.forEach(task => {
      if (task.tags && task.tags.length > 0) {
        task.tags.forEach(tag => {
          if (tagCounts[tag]) {
            tagCounts[tag]++;
          } else {
            tagCounts[tag] = 1;
          }
        });
      }
    });
    
    const sortedTags = Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    setTopTags(sortedTags);
  };

  // Create a simple bar chart component
  const BarChart = ({ data }: { data: {day: string, completed: number, added: number}[] }) => {
    const maxValue = Math.max(...data.flatMap(item => [item.completed, item.added])) || 10;
    
    return (
      <Box sx={{ height: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        {data.map((item, index) => (
          <Box key={index} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
            <Box sx={{ display: 'flex', height: '100%', alignItems: 'flex-end', mb: 1 }}>
              <Box 
                sx={{ 
                  width: 12, 
                  height: `${(item.added / maxValue) * 100}%`, 
                  bgcolor: blue[300],
                  borderRadius: '4px 0 0 4px',
                  mr: 0.5
                }} 
              />
              <Box 
                sx={{ 
                  width: 12, 
                  height: `${(item.completed / maxValue) * 100}%`, 
                  bgcolor: green[400],
                  borderRadius: '0 4px 4px 0'
                }} 
              />
            </Box>
            <Typography variant="caption" color="text.secondary">
              {item.day}
            </Typography>
          </Box>
        ))}
      </Box>
    );
  };

  // Create a simple progress circle component
  const ProgressCircle = ({ value, color }: { value: number, color: string }) => {
    const circumference = 2 * Math.PI * 45;
    const strokeDashoffset = circumference * (1 - value / 100);
    
    return (
      <Box sx={{ position: 'relative', width: 120, height: 120, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <svg width="120" height="120" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r="45"
            fill="none"
            stroke={grey[200]}
            strokeWidth="10"
          />
          <circle
            cx="60"
            cy="60"
            r="45"
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform="rotate(-90 60 60)"
          />
        </svg>
        <Typography 
          variant="h5" 
          sx={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)',
            fontWeight: 'bold'
          }}
        >
          {value}%
        </Typography>
      </Box>
    );
  };

  return (
    <ThemeProvider theme={analyticsTheme}>
      <Box sx={{ 
        minHeight: '100vh', 
        bgcolor: 'background.default',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <AppBar position="static" color="primary" elevation={0}>
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Task Analytics
            </Typography>
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
        
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Task Analytics Dashboard
          </Typography>
          
          {/* Key Metrics */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 45%', md: '1 1 22%' } }}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography color="text.secondary" gutterBottom>
                    Completion Rate
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                    <ProgressCircle value={stats.completionRate} color={blue[500]} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Tasks
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="h4">{stats.total}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total
                      </Typography>
                    </Box>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', color: 'success.main' }}>
                        <CheckCircleIcon fontSize="small" sx={{ mr: 0.5 }} />
                        <Typography variant="body2">{stats.completed}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', color: 'warning.main' }}>
                        <PendingIcon fontSize="small" sx={{ mr: 0.5 }} />
                        <Typography variant="body2">{stats.pending}</Typography>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    This Week
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="h4">{stats.tasksThisWeek}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        New Tasks
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="h4">{stats.completedThisWeek}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Completed
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Average Completion
                  </Typography>
                  <Typography variant="h4">{stats.avgCompletionTime}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Days per task
                  </Typography>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mt: 1,
                    color: stats.avgCompletionTime < 3 ? 'success.main' : 'error.main'
                  }}>
                    {stats.avgCompletionTime < 3 ? (
                      <TrendingDownIcon fontSize="small" sx={{ mr: 0.5 }} />
                    ) : (
                      <TrendingUpIcon fontSize="small" sx={{ mr: 0.5 }} />
                    )}
                    <Typography variant="body2">
                      {stats.avgCompletionTime < 3 ? 'Good pace' : 'Needs improvement'}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          {/* Charts and Lists */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Card sx={{ height: '100%' }}>
                <CardHeader title="Weekly Activity" />
                <Divider />
                <CardContent>
                  <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mr: 3 }}>
                      <Box sx={{ width: 12, height: 12, bgcolor: blue[300], mr: 1 }} />
                      <Typography variant="body2">Added</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ width: 12, height: 12, bgcolor: green[400], mr: 1 }} />
                      <Typography variant="body2">Completed</Typography>
                    </Box>
                  </Box>
                  <BarChart data={weeklyData} />
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardHeader title="Top Tags" />
                <Divider />
                <CardContent>
                  {topTags.length > 0 ? (
                    <List>
                      {topTags.map((tag, index) => (
                        <ListItem key={index} sx={{ px: 0 }}>
                          <ListItemText 
                            primary={tag.tag} 
                            secondary={`${tag.count} task${tag.count !== 1 ? 's' : ''}`} 
                          />
                          <Box 
                            sx={{ 
                              height: 8, 
                              width: 100, 
                              bgcolor: grey[200], 
                              borderRadius: 4,
                              overflow: 'hidden'
                            }}
                          >
                            <Box 
                              sx={{ 
                                height: '100%', 
                                width: `${(tag.count / topTags[0].count) * 100}%`,
                                bgcolor: blue[500],
                                borderRadius: 4
                              }} 
                            />
                          </Box>
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                      No tags found
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Card>
                <CardHeader title="Overdue Tasks" />
                <Divider />
                <CardContent>
                  {stats.overdue > 0 ? (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <ScheduleIcon color="error" sx={{ mr: 1 }} />
                      <Typography>
                        You have <strong>{stats.overdue}</strong> overdue task{stats.overdue !== 1 ? 's' : ''}
                      </Typography>
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                      <Typography>No overdue tasks!</Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </ThemeProvider>
  );
} 