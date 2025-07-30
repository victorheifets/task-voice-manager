import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@/lib/supabase/server'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

const FREE_TIER_LIMIT = 100

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { taskText } = await request.json()
    
    if (!taskText || typeof taskText !== 'string') {
      return NextResponse.json({ error: 'Task text is required' }, { status: 400 })
    }

    // Check usage limits
    const currentMonth = new Date().toISOString().substring(0, 7)
    const { data: usage } = await supabase
      .from('user_usage')
      .select('api_calls, tokens_used')
      .eq('user_id', user.id)
      .eq('month', currentMonth)
      .single()

    const currentCalls = usage?.api_calls || 0
    if (currentCalls >= FREE_TIER_LIMIT) {
      return NextResponse.json({ 
        error: 'Monthly API limit exceeded. Please upgrade your plan.' 
      }, { status: 429 })
    }

    // Make OpenAI API call
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Using cheaper model for MVP
      messages: [
        {
          role: "system",
          content: `You are a task parsing assistant. Parse the user's natural language input into a structured task object.

Return ONLY a valid JSON object with these fields:
- title: string (the main task)
- dueDate: string (YYYY-MM-DD format, null if no date mentioned)
- assignee: string (person mentioned, null if none)
- tags: array of strings (keywords/categories, max 3)
- priority: "low" | "medium" | "high"

Examples:
Input: "Call John tomorrow about the marketing campaign"
Output: {"title":"Call John about the marketing campaign","dueDate":"${new Date(Date.now() + 86400000).toISOString().split('T')[0]}","assignee":"John","tags":["marketing","call"],"priority":"medium"}

Input: "Finish the urgent report by Friday"
Output: {"title":"Finish the urgent report","dueDate":"${getNextFriday()}","assignee":null,"tags":["report","urgent"],"priority":"high"}

Be precise with dates and conservative with priorities.`
        },
        {
          role: "user",
          content: taskText
        }
      ],
      max_tokens: 200,
      temperature: 0.1
    })

    const result = completion.choices[0].message.content
    const tokensUsed = completion.usage?.total_tokens || 0

    // Track usage
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

    // Parse the JSON response
    let parsedTask
    try {
      parsedTask = JSON.parse(result || '{}')
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', result)
      return NextResponse.json({ 
        error: 'Failed to parse task. Please try rephrasing.' 
      }, { status: 500 })
    }

    return NextResponse.json({
      task: parsedTask,
      usage: {
        callsRemaining: FREE_TIER_LIMIT - (currentCalls + 1),
        tokensUsed
      }
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

function getNextFriday(): string {
  const today = new Date()
  const daysUntilFriday = (5 - today.getDay() + 7) % 7 || 7
  const nextFriday = new Date(today.getTime() + daysUntilFriday * 86400000)
  return nextFriday.toISOString().split('T')[0]
}