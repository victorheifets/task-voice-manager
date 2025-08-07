'use client';

import { useState } from 'react';
import { Button, Dialog, DialogContent, DialogTitle, Typography, Box } from '@mui/material';

export default function EnvDebug() {
  const [open, setOpen] = useState(false);
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'missing';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'missing';
  
  return (
    <>
      <Button 
        onClick={() => setOpen(true)}
        size="small"
        sx={{ position: 'fixed', top: 10, right: 10, zIndex: 9999 }}
      >
        🐛 Debug
      </Button>
      
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Environment Debug</DialogTitle>
        <DialogContent>
          <Box sx={{ fontFamily: 'monospace', fontSize: '12px' }}>
            <Typography variant="h6">Environment Variables:</Typography>
            <div><strong>NODE_ENV:</strong> {process.env.NODE_ENV || 'missing'}</div>
            <div><strong>VERCEL_ENV:</strong> {process.env.VERCEL_ENV || 'missing'}</div>
            <br />
            
            <Typography variant="h6">Supabase Configuration:</Typography>
            <div><strong>NEXT_PUBLIC_SUPABASE_URL:</strong> {supabaseUrl}</div>
            <div><strong>NEXT_PUBLIC_SUPABASE_ANON_KEY:</strong> {supabaseKey.length > 10 ? `${supabaseKey.substring(0, 20)}...` : supabaseKey}</div>
            <div><strong>Key Length:</strong> {supabaseKey.length}</div>
            <br />
            
            <Typography variant="h6">Client Test:</Typography>
            <div><strong>Current URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'server'}</div>
            <div><strong>User Agent:</strong> {typeof navigator !== 'undefined' ? navigator.userAgent.substring(0, 50) + '...' : 'server'}</div>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
}