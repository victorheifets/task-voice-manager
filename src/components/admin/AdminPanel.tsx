'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Alert
} from '@mui/material';
import { supabase } from '@/lib/supabase/client';
import { useNotification } from '@/contexts/NotificationContext';

interface PendingUser {
  id: string;
  email: string;
  created_at: string;
  user_metadata: any;
}

export default function AdminPanel() {
  const { showInfo } = useNotification();
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
    
    // Only allow specific admin email (you can change this)
    if (user?.email !== 'victor.heifets@gmail.com') {
      setLoading(false);
      return;
    }
    
    loadPendingUsers();
  };

  const loadPendingUsers = async () => {
    try {
      // This requires admin privileges - you'll need to create a server function
      // For now, we'll show a placeholder
      setLoading(false);
    } catch (error) {
      console.error('Error loading pending users:', error);
      setLoading(false);
    }
  };

  const approveUser = async (userId: string) => {
    try {
      // This would need to be implemented as an admin API endpoint
      console.log('Approving user:', userId);
      // Placeholder for approval logic
      showInfo('User approval feature will be implemented on the server side');
    } catch (error) {
      console.error('Error approving user:', error);
    }
  };

  if (loading) {
    return <Box>Loading...</Box>;
  }

  if (!currentUser || currentUser.email !== 'victor.heifets@gmail.com') {
    return (
      <Alert severity="error">
        Access denied. Admin privileges required.
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Admin Panel
      </Typography>
      
      <Paper sx={{ mt: 2 }}>
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Pending User Approvals
          </Typography>
          
          <Alert severity="info" sx={{ mb: 2 }}>
            Admin approval system is set up! Users who sign up will be marked as "pending approval".
            You can approve them through the Supabase dashboard or we can add server-side approval functions.
          </Alert>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Email</TableCell>
                  <TableCell>Created At</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Typography color="textSecondary">
                      Pending users will appear here after signup
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Paper>
    </Box>
  );
}