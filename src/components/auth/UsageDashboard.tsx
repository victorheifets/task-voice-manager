'use client'

import { useState, useEffect } from 'react'
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  LinearProgress,
  Chip,
  Grid
} from '@mui/material'
import { getUserUsage } from '@/lib/supabase/client'
import { useAuth } from './AuthProvider'

const FREE_TIER_LIMIT = 100

export function UsageDashboard() {
  const { user } = useAuth()
  const [usage, setUsage] = useState({ api_calls: 0, tokens_used: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadUsage()
    }
  }, [user])

  const loadUsage = async () => {
    try {
      const data = await getUserUsage()
      setUsage(data)
    } catch (error) {
      console.error('Error loading usage:', error)
    } finally {
      setLoading(false)
    }
  }

  const usagePercentage = (usage.api_calls / FREE_TIER_LIMIT) * 100
  const remainingCalls = Math.max(0, FREE_TIER_LIMIT - usage.api_calls)

  if (!user) return null

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Your Usage This Month
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  AI Requests
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {usage.api_calls} / {FREE_TIER_LIMIT}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={Math.min(usagePercentage, 100)}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: 'grey.200',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: usagePercentage > 90 ? 'error.main' : 
                             usagePercentage > 70 ? 'warning.main' : 'success.main'
                  }
                }}
              />
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip
                label={`${remainingCalls} calls left`}
                color={remainingCalls > 20 ? 'success' : remainingCalls > 5 ? 'warning' : 'error'}
                size="small"
              />
              <Chip
                label={`${usage.tokens_used.toLocaleString()} tokens used`}
                variant="outlined"
                size="small"
              />
            </Box>
          </Grid>
        </Grid>

        {usagePercentage > 80 && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'warning.light', borderRadius: 1 }}>
            <Typography variant="body2" color="warning.dark">
              You're approaching your monthly limit. Consider upgrading for unlimited usage!
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  )
}