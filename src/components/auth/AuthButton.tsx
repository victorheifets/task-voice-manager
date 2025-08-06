'use client';

import React, { useState } from 'react';
import { 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  TextField, 
  Box, 
  Typography,
  Tab,
  Tabs,
  Alert,
  CircularProgress,
  Snackbar
} from '@mui/material';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface AuthButtonProps {
  user: any;
}

export default function AuthButton({ user }: AuthButtonProps) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const router = useRouter();

  const handleSignUp = async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('Attempting signup with:', { email });
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            status: 'pending_approval' // Mark new users as pending
          }
        }
      });
      
      console.log('Signup response:', { data, error });
      
      if (error) {
        console.error('Signup error:', error);
        throw error;
      }
      
      setOpen(false);
      // Show success message with Snackbar
      setSuccessMessage('Account created! Please wait for admin approval before you can access the app.');
      setSnackbarOpen(true);
    } catch (error: any) {
      console.error('Signup failed:', error);
      setError(`Signup failed: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    setLoading(true);
    setError('');
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      // Check if user is approved
      if (data.user?.user_metadata?.status === 'pending_approval') {
        await supabase.auth.signOut();
        setError('Your account is pending admin approval. Please wait for approval.');
        return;
      }
      
      setOpen(false);
      router.refresh();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  if (user) {
    return (
      <Button 
        variant="outlined" 
        onClick={handleSignOut}
        size="small"
      >
        Sign Out ({user.email})
      </Button>
    );
  }

  return (
    <>
      <Button 
        variant="contained" 
        onClick={() => setOpen(true)}
        sx={{ ml: 2 }}
      >
        Sign In / Sign Up
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Tabs value={tab} onChange={(e, newValue) => setTab(newValue)}>
            <Tab label="Sign In" />
            <Tab label="Sign Up" />
          </Tabs>
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 2 }}
              disabled={loading}
            />
            
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 3 }}
              disabled={loading}
            />

            {tab === 1 && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                You'll receive a confirmation email after signing up.
              </Typography>
            )}
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button 
                onClick={() => setOpen(false)} 
                disabled={loading}
              >
                Cancel
              </Button>
              
              <Button
                variant="contained"
                onClick={tab === 0 ? handleSignIn : handleSignUp}
                disabled={loading || !email || !password}
                startIcon={loading ? <CircularProgress size={20} /> : null}
                sx={{ flex: 1 }}
              >
                {loading ? 'Please wait...' : (tab === 0 ? 'Sign In' : 'Sign Up')}
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
      
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity="success" 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </>
  );
}