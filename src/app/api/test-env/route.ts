import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({
    supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'missing',
    supabase_anon_key_present: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    supabase_anon_key_length: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0,
    openai_key_present: !!process.env.OPENAI_API_KEY,
    openai_key_length: process.env.OPENAI_API_KEY?.length || 0,
    env_debug: {
      supabase_anon_starts_with: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 10) || 'missing',
      openai_starts_with: process.env.OPENAI_API_KEY?.substring(0, 10) || 'missing'
    }
  });
}