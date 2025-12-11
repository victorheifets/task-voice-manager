import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/lib/rateLimit'

const FREE_TIER_LIMIT = 100

// Check if we're in demo mode (Supabase not configured)
const DEMO_MODE = !process.env.NEXT_PUBLIC_SUPABASE_URL ||
                  !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
                  process.env.NEXT_PUBLIC_SUPABASE_URL.includes('demo.supabase.co')

export async function POST(request: NextRequest) {
  try {
    // Rate limiting by IP first
    const clientIP = getClientIP(request)
    const ipRateLimit = checkRateLimit(`ip:${clientIP}:parse`, RATE_LIMITS.PARSE)

    if (!ipRateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Too many requests. Please try again later.',
          retryAfter: Math.ceil((ipRateLimit.resetTime - Date.now()) / 1000)
        },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil((ipRateLimit.resetTime - Date.now()) / 1000).toString(),
          }
        }
      )
    }

    const { taskText, apiKey: clientApiKey } = await request.json()

    // BYOK (Bring Your Own Key) Pattern:
    // Users can provide their own OpenAI API key via the Settings tab (stored in localStorage).
    // The client sends the key securely over HTTPS for this single request.
    // Server uses the key for parsing but never stores or logs it.
    // Falls back to server-side environment variable if user hasn't configured their own key.
    const serverApiKey = process.env.OPENAI_API_KEY
    const apiKey = clientApiKey || serverApiKey

    if (!apiKey) {
      console.error('No OpenAI API key available (neither BYOK nor server-side)')
      return NextResponse.json(
        { error: 'No OpenAI API key configured. Please add your key in Settings or contact administrator.' },
        { status: 503 }
      )
    }

    const openai = new OpenAI({ apiKey })

    let user = null
    let supabase = null

    // Skip authentication check in demo mode
    if (!DEMO_MODE) {
      supabase = await createClient()
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
      if (authError || !authUser) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      user = authUser

      // User-specific rate limiting
      const userRateLimit = checkRateLimit(`user:${user.id}:parse`, RATE_LIMITS.PARSE)
      if (!userRateLimit.allowed) {
        return NextResponse.json(
          { error: 'Too many requests. Please wait a moment.' },
          { status: 429 }
        )
      }
    }

    if (!taskText || typeof taskText !== 'string') {
      return NextResponse.json({ error: 'Task text is required' }, { status: 400 })
    }

    // Validate input length to prevent abuse
    if (taskText.length > 1000) {
      return NextResponse.json({ error: 'Task text too long (max 1000 characters)' }, { status: 400 })
    }

    // Check monthly usage limits (skip in demo mode)
    let usage = null
    let currentCalls = 0
    const currentMonth = new Date().toISOString().substring(0, 7)

    if (!DEMO_MODE && supabase && user) {
      const { data: usageData } = await supabase
        .from('user_usage')
        .select('api_calls, tokens_used')
        .eq('user_id', user.id)
        .eq('month', currentMonth)
        .single()

      usage = usageData
      currentCalls = usage?.api_calls || 0
      if (currentCalls >= FREE_TIER_LIMIT) {
        return NextResponse.json({
          error: 'Monthly API limit exceeded. Please upgrade your plan.'
        }, { status: 429 })
      }
    }

    // Make OpenAI API call
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]
    const dayOfWeek = today.toLocaleDateString('en-US', { weekday: 'long' })

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a task parsing assistant. Parse the user's natural language input into structured task objects.

IMPORTANT: Today is ${dayOfWeek}, ${todayStr}. Use this to calculate all relative dates like "tomorrow", "this week", "next Friday", "end of month", etc.

If the input contains MULTIPLE tasks, return a JSON ARRAY of task objects.
If the input contains a SINGLE task, return a single JSON object.

Each task object has these fields:
- title: string (the main task)
- dueDate: string (YYYY-MM-DD format, null if no date mentioned)
- assignee: string (person mentioned, null if none)
- tags: array of strings (keywords/categories, max 3)
- priority: "low" | "medium" | "high"

Examples:
Input: "Call John tomorrow about the marketing campaign"
Output: {"title":"Call John about the marketing campaign","dueDate":"${new Date(Date.now() + 86400000).toISOString().split('T')[0]}","assignee":"John","tags":["marketing","call"],"priority":"medium"}

Input: "Buy milk and call mom tomorrow"
Output: [{"title":"Buy milk","dueDate":null,"assignee":null,"tags":["shopping"],"priority":"low"},{"title":"Call mom","dueDate":"${new Date(Date.now() + 86400000).toISOString().split('T')[0]}","assignee":"mom","tags":["call","family"],"priority":"medium"}]

Be precise with dates and conservative with priorities. Return ONLY valid JSON, no extra text.`
        },
        {
          role: "user",
          content: taskText
        }
      ],
      max_tokens: 500,
      temperature: 0.1
    })

    const result = completion.choices[0].message.content
    const tokensUsed = completion.usage?.total_tokens || 0

    // Track usage (skip in demo mode)
    if (!DEMO_MODE && supabase && user) {
      if (usage) {
        await supabase
          .from('user_usage')
          .update({
            api_calls: usage.api_calls + 1,
            tokens_used: usage.tokens_used + tokensUsed
          })
          .eq('user_id', user.id)
          .eq('month', currentMonth)
      } else {
        await supabase
          .from('user_usage')
          .insert({
            user_id: user.id,
            month: currentMonth,
            api_calls: 1,
            tokens_used: tokensUsed
          })
      }
    }

    // Parse the JSON response
    let parsedResult
    try {
      parsedResult = JSON.parse(result || '{}')
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', result)
      return NextResponse.json({
        error: 'Failed to parse task. Please try rephrasing.'
      }, { status: 500 })
    }

    // Normalize to array
    const tasks = Array.isArray(parsedResult) ? parsedResult : [parsedResult]

    return NextResponse.json({
      tasks,
      usage: {
        callsRemaining: FREE_TIER_LIMIT - (currentCalls + 1),
        tokensUsed
      },
      rateLimit: {
        remaining: ipRateLimit.remaining,
        resetTime: ipRateLimit.resetTime
      }
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
}
