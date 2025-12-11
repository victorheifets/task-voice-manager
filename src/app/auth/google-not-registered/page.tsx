'use client';

import { Box, Typography, Button, Container, Paper, Alert } from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation';
import PersonAddDisabledIcon from '@mui/icons-material/PersonAddDisabled';
import { Suspense } from 'react';

function GoogleNotRegisteredContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  const handleSignUp = () => {
    router.push('/');
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          textAlign: 'center',
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}
      >
        <PersonAddDisabledIcon
          sx={{
            fontSize: 64,
            color: 'warning.main',
            mb: 2
          }}
        />

        <Typography variant="h4" gutterBottom color="warning.main">
          Account Not Found
        </Typography>

        <Typography variant="body1" sx={{ mb: 2, color: 'text.secondary' }}>
          Google sign-in is only available for existing users.
        </Typography>

        {email && (
          <Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
            The email <strong>{email}</strong> is not registered in our system.
          </Alert>
        )}

        <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
          Please sign up with your email and password first, then you can link your Google account later.
        </Typography>

        <Box sx={{ mt: 3 }}>
          <Button
            variant="contained"
            onClick={handleSignUp}
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1
            }}
          >
            Sign Up with Email
          </Button>
        </Box>

        <Typography variant="caption" sx={{ display: 'block', mt: 3, color: 'text.secondary' }}>
          Already have an account? Sign in with your email and password instead.
        </Typography>
      </Paper>
    </Container>
  );
}

export default function GoogleNotRegistered() {
  return (
    <Suspense fallback={
      <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
        <Typography>Loading...</Typography>
      </Container>
    }>
      <GoogleNotRegisteredContent />
    </Suspense>
  );
}
