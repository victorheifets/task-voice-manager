'use client';

import { Box, Typography, Button, Container, Paper } from '@mui/material';
import { useRouter } from 'next/navigation';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

export default function AuthCodeError() {
  const router = useRouter();

  const handleRetry = () => {
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
        <ErrorOutlineIcon 
          sx={{ 
            fontSize: 64, 
            color: 'error.main', 
            mb: 2 
          }} 
        />
        
        <Typography variant="h4" gutterBottom color="error">
          Authentication Error
        </Typography>
        
        <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
          There was an issue processing your authentication request. 
          This could be due to an expired or invalid link.
        </Typography>
        
        <Box sx={{ mt: 3 }}>
          <Button 
            variant="contained" 
            onClick={handleRetry}
            sx={{ 
              borderRadius: 2,
              px: 3,
              py: 1
            }}
          >
            Try Again
          </Button>
        </Box>
        
        <Typography variant="caption" sx={{ display: 'block', mt: 2, color: 'text.secondary' }}>
          If you continue to experience issues, please try requesting a new magic link.
        </Typography>
      </Paper>
    </Container>
  );
}