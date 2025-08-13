import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const next = searchParams.get('next') ?? '/'

  console.log('Auth callback received:', { 
    code: code?.substring(0, 10) + '...', 
    error, 
    origin,
    fullUrl: request.url 
  })

  if (error) {
    console.error('Auth callback error from Supabase:', error)
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
  }

  if (code) {
    try {
      const supabase = await createClient()
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
      
      console.log('Exchange result:', { 
        hasSession: !!data?.session, 
        hasUser: !!data?.user, 
        error: exchangeError?.message 
      })
      
      if (!exchangeError && data?.session) {
        console.log('Auth success, redirecting to:', `${origin}${next}`)
        const response = NextResponse.redirect(`${origin}${next}`)
        return response
      } else {
        console.error('Session exchange failed:', exchangeError)
      }
    } catch (err) {
      console.error('Auth callback exception:', err)
    }
  } else {
    console.error('No code parameter received')
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}