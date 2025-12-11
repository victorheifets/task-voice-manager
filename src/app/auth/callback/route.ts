import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Whitelist of allowed redirect paths to prevent open redirect attacks
const ALLOWED_REDIRECTS = ['/', '/tasks', '/notes', '/settings', '/dashboard', '/calendar', '/kanban']

// Type for identity object from Supabase
interface Identity {
  provider: string
  id: string
}

// Validate redirect URL to prevent open redirect vulnerability
function validateRedirect(next: string | null): string {
  if (!next) return '/'

  // Ensure the redirect starts with / and doesn't have protocol
  if (!next.startsWith('/') || next.startsWith('//')) {
    return '/'
  }

  // Extract the path without query string
  const path = next.split('?')[0]

  // Check against whitelist
  if (ALLOWED_REDIRECTS.some(allowed => path === allowed || path.startsWith(`${allowed}/`))) {
    return next
  }

  return '/'
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const next = validateRedirect(searchParams.get('next'))

  // Only log in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Auth callback received:', {
      hasCode: !!code,
      error,
      origin
    })
  }

  if (error) {
    console.error('Auth callback error from Supabase:', error)
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
  }

  if (code) {
    try {
      const supabase = await createClient()
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

      if (!exchangeError && data?.session) {
        const user = data.user

        // Check if this is a Google OAuth login
        const isGoogleProvider = user?.app_metadata?.provider === 'google'

        if (isGoogleProvider) {
          // Check if user has email identity (signed up with email/password before)
          const identities: Identity[] = user?.identities || []
          const hasEmailIdentity = identities.some((id) => id.provider === 'email')

          // Check if user was created very recently (within last 30 seconds) - indicates new user
          const createdAt = new Date(user?.created_at || 0)
          const now = new Date()
          const NEW_USER_THRESHOLD_MS = 30000 // 30 seconds
          const isNewUser = (now.getTime() - createdAt.getTime()) < NEW_USER_THRESHOLD_MS

          // If this is a new Google-only user (no prior email signup), reject them
          if (isNewUser && !hasEmailIdentity) {
            if (process.env.NODE_ENV === 'development') {
              console.log('Rejecting new Google-only user - must sign up with email first')
            }

            // Sign them out
            await supabase.auth.signOut()

            // Redirect to error page without exposing email in URL
            return NextResponse.redirect(`${origin}/auth/google-not-registered`)
          }
        }

        return NextResponse.redirect(`${origin}${next}`)
      } else {
        console.error('Session exchange failed:', exchangeError?.message)
      }
    } catch (err) {
      console.error('Auth callback exception:', err instanceof Error ? err.message : 'Unknown error')
    }
  } else {
    console.error('No code parameter received in auth callback')
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
