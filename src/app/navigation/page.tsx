'use client';

import { Box, Container, Typography, Card, CardContent, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, useMediaQuery, useTheme } from '@mui/material';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import ViewKanbanIcon from '@mui/icons-material/ViewKanban';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import BarChartIcon from '@mui/icons-material/BarChart';
import HomeIcon from '@mui/icons-material/Home';
import MicIcon from '@mui/icons-material/Mic';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const NavigationPage = () => {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const navigationItems = [
    { 
      title: 'Home', 
      description: 'Return to the main task input page',
      icon: <HomeIcon sx={{ fontSize: 28 }} />, 
      path: '/',
      color: '#4caf50'
    },
    { 
      title: 'Dashboard', 
      description: 'View task statistics and overview',
      icon: <DashboardIcon sx={{ fontSize: 28 }} />, 
      path: '/dashboard',
      color: '#2196f3'
    },
    { 
      title: 'Kanban Board', 
      description: 'Manage tasks in a kanban view',
      icon: <ViewKanbanIcon sx={{ fontSize: 28 }} />, 
      path: '/kanban',
      color: '#ff9800'
    },
    { 
      title: 'Calendar', 
      description: 'View tasks in calendar format',
      icon: <CalendarMonthIcon sx={{ fontSize: 28 }} />, 
      path: '/calendar',
      color: '#9c27b0'
    },
    { 
      title: 'Analytics', 
      description: 'View detailed task statistics',
      icon: <BarChartIcon sx={{ fontSize: 28 }} />, 
      path: '/analytics',
      color: '#f44336'
    },
    { 
      title: 'Voice Input', 
      description: 'Create tasks using voice commands',
      icon: <MicIcon sx={{ fontSize: 28 }} />, 
      path: '/',
      color: '#795548'
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 2 }}>
        Task Voice Manager
      </Typography>

      {isMobile ? (
        // Mobile view: Cards
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {navigationItems.map((item, index) => (
            <Box 
              key={index}
              sx={{ 
                width: '100%',
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
              }}
            >
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'row',
                  alignItems: 'center',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                  },
                  borderLeft: `4px solid ${item.color}`
                }}
              >
                <Box sx={{ 
                  p: 1.5, 
                  color: item.color,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  {item.icon}
                </Box>
                <CardContent sx={{ 
                  flexGrow: 1, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  py: 1.5,
                  px: 1.5
                }}>
                  <Typography variant="h6" component="h2" sx={{ fontSize: '1rem', mb: 0.5 }}>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                    {item.description}
                  </Typography>
                </CardContent>
                <Button 
                  component={Link} 
                  href={item.path}
                  sx={{ 
                    color: item.color,
                    mr: 1
                  }}
                >
                  <ArrowForwardIcon />
                </Button>
              </Card>
            </Box>
          ))}
        </Box>
      ) : (
        // Desktop view: Table
        <TableContainer component={Paper} sx={{ mt: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'rgba(0,0,0,0.03)' }}>
                <TableCell width="50px"></TableCell>
                <TableCell>View</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {navigationItems.map((item, index) => (
                <TableRow 
                  key={index}
                  sx={{ 
                    '&:hover': { 
                      bgcolor: 'rgba(0,0,0,0.02)',
                    },
                    borderLeft: `3px solid ${item.color}`
                  }}
                >
                  <TableCell>
                    <Box sx={{ color: item.color }}>
                      {item.icon}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle1">
                      {item.title}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {item.description}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      component={Link}
                      href={item.path}
                      variant="outlined"
                      size="small"
                      sx={{ 
                        borderColor: item.color, 
                        color: item.color,
                        '&:hover': {
                          borderColor: item.color,
                          backgroundColor: `${item.color}10`
                        }
                      }}
                    >
                      Open
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default NavigationPage; 