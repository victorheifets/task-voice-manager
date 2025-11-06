'use client'

import { useState } from 'react'
import { 
  Box, 
  Card, 
  CardContent, 
  TextField, 
  Button, 
  Typography, 
  Alert,
  Tab,
  Tabs,
  CircularProgress,
  Divider
} from '@mui/material'
import GoogleIcon from '@mui/icons-material/Google'
import { useAuth } from './AuthProvider'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  )
}

export function LoginForm() {
  const { signIn, signUp, signInWithMagicLink } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [tabValue, setTabValue] = useState(0)

  const handleTabChange = (_: any, newValue: number) => {
    setTabValue(newValue)
    setMessage('')
    setError('')
  }

  const handleEmailPassword = async (isSignUp: boolean) => {
    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    setLoading(true)
    setError('')
    setMessage('')

    try {
      const { data, error } = isSignUp 
        ? await signUp(email, password)
        : await signIn(email, password)

      if (error) {
        // Better error messages
        if (error.message?.includes('fetch') || error.message?.includes('network')) {
          setError('Cannot connect to server. Please check your internet connection and try again.')
        } else {
          setError(error.message)
        }
      } else if (isSignUp) {
        setMessage('Check your email for a confirmation link!')
      } else {
        setMessage('Welcome back!')
      }
    } catch (err: any) {
      // Better error messages for network issues
      if (err.message?.includes('fetch') || err.message?.includes('Failed to fetch')) {
        setError('Cannot connect to authentication server. Please check your internet connection.')
      } else if (err.message?.includes('resolve')) {
        setError('Authentication service is currently unavailable. Please try again later.')
      } else {
        setError(err.message || 'An unexpected error occurred')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleMagicLink = async () => {
    if (!email) {
      setError('Please enter your email')
      return
    }

    setLoading(true)
    setError('')
    setMessage('')

    try {
      const { error } = await signInWithMagicLink(email)
      if (error) {
        if (error.message?.includes('fetch') || error.message?.includes('network')) {
          setError('Cannot connect to server. Please check your internet connection.')
        } else {
          setError(error.message)
        }
      } else {
        setMessage('Check your email for a magic link!')
      }
    } catch (err: any) {
      if (err.message?.includes('fetch') || err.message?.includes('Failed to fetch')) {
        setError('Cannot connect to authentication server. Please check your internet connection.')
      } else {
        setError(err.message || 'An unexpected error occurred')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true)
    setError('')
    setMessage('')

    try {
      const { supabase } = await import('../../lib/supabase/client')
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })
      if (error) {
        if (error.message?.includes('fetch') || error.message?.includes('network')) {
          setError('Cannot connect to Google authentication. Please check your internet connection.')
        } else {
          setError(error.message)
        }
      }
    } catch (err: any) {
      if (err.message?.includes('fetch') || err.message?.includes('Failed to fetch')) {
        setError('Cannot connect to authentication server. Please check your internet connection.')
      } else {
        setError(err.message || 'An unexpected error occurred')
      }
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        p: 2
      }}
    >
      <Card sx={{ width: '100%', maxWidth: 400 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" textAlign="center" mb={3}>
            TaskGPT
          </Typography>
          <Typography variant="subtitle1" textAlign="center" mb={3} color="text.secondary">
            Voice-powered task management with AI
          </Typography>

          <Button
            fullWidth
            variant="outlined"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            startIcon={googleLoading ? <CircularProgress size={20} /> : <GoogleIcon />}
            sx={{ 
              mb: 2,
              py: 1.5,
              borderColor: '#db4437',
              color: '#db4437',
              '&:hover': {
                borderColor: '#db4437',
                backgroundColor: 'rgba(219, 68, 55, 0.04)'
              }
            }}
          >
            {googleLoading ? 'Signing in...' : 'Continue with Google'}
          </Button>

          <Divider sx={{ my: 2 }}>
            <Typography variant="body2" color="text.secondary">
              or
            </Typography>
          </Divider>

          <Tabs value={tabValue} onChange={handleTabChange} centered>
            <Tab label="Sign In" />
            <Tab label="Sign Up" />
            <Tab label="Magic Link" />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <Box component="form" sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                margin="normal"
                required
                autoComplete="email"
              />
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                margin="normal"
                required
                autoComplete="current-password"
              />
              <Button
                fullWidth
                variant="contained"
                onClick={() => handleEmailPassword(false)}
                disabled={loading}
                sx={{ mt: 3, mb: 2 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Sign In'}
              </Button>
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Box component="form" sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                margin="normal"
                required
                autoComplete="email"
              />
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                margin="normal"
                required
                autoComplete="new-password"
                helperText="Password should be at least 6 characters"
              />
              <Button
                fullWidth
                variant="contained"
                onClick={() => handleEmailPassword(true)}
                disabled={loading}
                sx={{ mt: 3, mb: 2 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Sign Up'}
              </Button>
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Box component="form" sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                margin="normal"
                required
                autoComplete="email"
                helperText="We'll send you a magic link to sign in"
              />
              <Button
                fullWidth
                variant="contained"
                onClick={handleMagicLink}
                disabled={loading}
                sx={{ mt: 3, mb: 2 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Send Magic Link'}
              </Button>
            </Box>
          </TabPanel>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          {message && (
            <Alert severity="success" sx={{ mt: 2 }}>
              {message}
            </Alert>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}