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
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`auth-tabpanel-${index}`}
      aria-labelledby={`auth-tab-${index}`}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  )
}

// Validation helpers
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const validatePassword = (password: string): { valid: boolean; message: string } => {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' }
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' }
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' }
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' }
  }
  return { valid: true, message: '' }
}

export function LoginForm() {
  const { signIn, signUp, signInWithMagicLink } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [tabValue, setTabValue] = useState(0)
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
    setMessage('')
    setError('')
    setEmailError('')
    setPasswordError('')
  }

  const handleEmailPassword = async (isSignUp: boolean) => {
    // Clear previous errors
    setEmailError('')
    setPasswordError('')
    setError('')

    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    // Validate email format
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address')
      return
    }

    // For signup, validate password strength and confirmation
    if (isSignUp) {
      const passwordValidation = validatePassword(password)
      if (!passwordValidation.valid) {
        setPasswordError(passwordValidation.message)
        return
      }
      if (password !== confirmPassword) {
        setPasswordError('Passwords do not match')
        return
      }
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
    setEmailError('')
    setError('')

    if (!email) {
      setError('Please enter your email')
      return
    }

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address')
      return
    }

    setLoading(true)
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
          <Typography variant="subtitle1" textAlign="center" mb={2} color="text.secondary">
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

          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            centered
            aria-label="Authentication options"
          >
            <Tab label="Sign In" id="auth-tab-0" aria-controls="auth-tabpanel-0" />
            <Tab label="Sign Up" id="auth-tab-1" aria-controls="auth-tabpanel-1" />
            <Tab label="Magic Link" id="auth-tab-2" aria-controls="auth-tabpanel-2" />
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
                error={!!emailError}
                helperText={emailError}
                aria-describedby={emailError ? 'email-error' : undefined}
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
                aria-busy={loading}
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
                error={!!emailError}
                helperText={emailError}
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
                error={!!passwordError}
                helperText={passwordError || "Min 8 chars, uppercase, lowercase, and number required"}
              />
              <TextField
                fullWidth
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                margin="normal"
                required
                autoComplete="new-password"
                error={!!passwordError && password !== confirmPassword}
              />
              <Button
                fullWidth
                variant="contained"
                onClick={() => handleEmailPassword(true)}
                disabled={loading}
                sx={{ mt: 3, mb: 2 }}
                aria-busy={loading}
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
                error={!!emailError}
                helperText={emailError || "We'll send you a magic link to sign in"}
              />
              <Button
                fullWidth
                variant="contained"
                onClick={handleMagicLink}
                disabled={loading}
                sx={{ mt: 3, mb: 2 }}
                aria-busy={loading}
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