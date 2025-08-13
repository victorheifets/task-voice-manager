import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  console.log('Auth callback:', { code: !!code, origin, next })

  if (code) {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      console.log('Exchange result:', { user: data?.user?.id, session: !!data?.session, error: error?.message })
      
      if (!error && data?.session) {
        const response = NextResponse.redirect(`${origin}${next}`)
        // Ensure cookies are properly set
        response.headers.set('Cache-Control', 'no-cache, no-store, max-age=0, must-revalidate')
        return response
      } else {
        console.error('Auth exchange failed:', error)
      }
    } catch (err) {
      console.error('Auth callback error:', err)
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}