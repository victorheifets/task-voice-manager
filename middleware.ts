import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Allowed origins for CSRF validation
const ALLOWED_ORIGINS = new Set([
  'http://localhost:3000',
  'http://localhost:3001',
  'https://task-voice-manager.vercel.app',
])

export async function middleware(request: NextRequest) {
  // Security: Validate origin for API routes with state-changing methods
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const method = request.method
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
      const origin = request.headers.get('origin')
      const referer = request.headers.get('referer')

      // Check origin or referer
      let isValidOrigin = false

      if (origin) {
        isValidOrigin = ALLOWED_ORIGINS.has(origin)
      } else if (referer) {
        try {
          const refererUrl = new URL(referer)
          isValidOrigin = ALLOWED_ORIGINS.has(refererUrl.origin)
        } catch {
          isValidOrigin = false
        }
      } else {
        // Same-origin requests from fetch() might not have origin header
        // Allow if host matches
        const host = request.headers.get('host')
        if (host) {
          const protocol = request.nextUrl.protocol
          const fullOrigin = `${protocol}//${host}`
          isValidOrigin = ALLOWED_ORIGINS.has(fullOrigin) ||
                          host.startsWith('localhost:') ||
                          host.includes('vercel.app')
        }
      }

      if (!isValidOrigin) {
        console.warn(`Blocked request from invalid origin: ${origin || referer || 'unknown'}`)
        return NextResponse.json(
          { error: 'Invalid request origin' },
          { status: 403 }
        )
      }
    }
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  // Only create Supabase client if configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (supabaseUrl && supabaseKey && !supabaseUrl.includes('demo.supabase.co')) {
    try {
      const supabase = createServerClient(
        supabaseUrl,
        supabaseKey,
        {
          cookies: {
            get(name: string) {
              return request.cookies.get(name)?.value
            },
            set(name: string, value: string, options: CookieOptions) {
              request.cookies.set({ name, value, ...options })
              supabaseResponse = NextResponse.next({
                request,
              })
              supabaseResponse.cookies.set({ name, value, ...options })
            },
            remove(name: string, options: CookieOptions) {
              request.cookies.set({ name, value: '', ...options })
              supabaseResponse = NextResponse.next({
                request,
              })
              supabaseResponse.cookies.set({ name, value: '', ...options })
            },
          },
        }
      )

      // Refresh session if expired
      await supabase.auth.getSession()
    } catch (error) {
      console.error('Supabase middleware error:', error)
      // Continue without session refresh on error
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|public/|.*\\.).*)',
  ],
}
