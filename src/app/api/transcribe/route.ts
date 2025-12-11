import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/lib/rateLimit';
import { createClient } from '@/lib/supabase/server';

// File upload constraints
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB (Whisper API limit)
const ALLOWED_AUDIO_TYPES = [
  'audio/webm',
  'audio/wav',
  'audio/mpeg',
  'audio/mp3',
  'audio/mp4',
  'audio/ogg',
  'audio/flac',
  'audio/m4a',
  'audio/x-m4a',
];

// Valid language codes
const VALID_LANGUAGES = ['auto', 'en', 'he', 'es', 'fr', 'de', 'ar', 'zh', 'ja', 'ru', 'pt', 'it', 'ko'];
const VALID_SERVICES = ['whisper', 'groq'];

// Check if we're in demo mode
const DEMO_MODE = !process.env.NEXT_PUBLIC_SUPABASE_URL ||
                  !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
                  process.env.NEXT_PUBLIC_SUPABASE_URL.includes('demo.supabase.co');

// Sanitize error messages to prevent API key leakage
function sanitizeError(error: unknown): string {
  if (error instanceof Error) {
    // Remove any API key patterns from error messages
    return error.message.replace(/sk-[A-Za-z0-9]{20,}/g, '[REDACTED]')
                       .replace(/gsk_[A-Za-z0-9]{20,}/g, '[REDACTED]');
  }
  return 'Unknown error';
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting by IP first (applies to all requests)
    const clientIP = getClientIP(request);
    const ipRateLimit = checkRateLimit(`ip:${clientIP}`, RATE_LIMITS.TRANSCRIBE);

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
            'X-RateLimit-Remaining': '0',
          }
        }
      );
    }

    // Require authentication (except in demo mode)
    let userId: string | null = null;
    if (!DEMO_MODE) {
      try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
          return NextResponse.json(
            { error: 'Authentication required' },
            { status: 401 }
          );
        }

        userId = user.id;

        // User-based rate limiting
        const userRateLimit = checkRateLimit(`user:${user.id}:transcribe`, RATE_LIMITS.TRANSCRIBE);
        if (!userRateLimit.allowed) {
          return NextResponse.json(
            {
              error: 'Too many transcription requests. Please wait a moment.',
              retryAfter: Math.ceil((userRateLimit.resetTime - Date.now()) / 1000)
            },
            { status: 429 }
          );
        }
      } catch (authError) {
        console.error('Auth error:', sanitizeError(authError));
        return NextResponse.json(
          { error: 'Authentication service unavailable' },
          { status: 503 }
        );
      }
    }

    // Get form data with audio file
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File | null;
    const language = formData.get('language') as string || 'en';
    const service = formData.get('service') as string || 'whisper';

    // Validate audio file exists
    if (!audioFile) {
      return NextResponse.json(
        { error: 'Audio file is required' },
        { status: 400 }
      );
    }

    // Validate file size
    if (audioFile.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB` },
        { status: 413 }
      );
    }

    // Validate file type
    if (!ALLOWED_AUDIO_TYPES.includes(audioFile.type)) {
      return NextResponse.json(
        { error: `Invalid audio format. Allowed formats: ${ALLOWED_AUDIO_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate language parameter
    if (!VALID_LANGUAGES.includes(language)) {
      return NextResponse.json(
        { error: 'Invalid language parameter' },
        { status: 400 }
      );
    }

    // Validate service parameter
    if (!VALID_SERVICES.includes(service)) {
      return NextResponse.json(
        { error: 'Invalid service parameter' },
        { status: 400 }
      );
    }

    // BYOK (Bring Your Own Key) Pattern:
    // Users can provide their own API keys via the Settings tab (stored in localStorage).
    // The client sends the key securely over HTTPS for this single request.
    // Server uses the key for transcription but never stores or logs it.
    // Falls back to server-side environment variable if user hasn't configured their own key.
    const isGroq = service === 'groq';
    const clientApiKey = formData.get('apiKey') as string | null;
    const serverApiKey = isGroq ? process.env.GROQ_API_KEY : process.env.OPENAI_API_KEY;
    const apiKey = clientApiKey || serverApiKey;

    if (!apiKey) {
      const serviceName = isGroq ? 'Groq' : 'OpenAI';
      console.error(`No ${serviceName} API key available (neither BYOK nor server-side)`);
      return NextResponse.json(
        { error: `No ${serviceName} API key configured. Please add your key in Settings or contact administrator.` },
        { status: 503 }
      );
    }

    // Create OpenAI-compatible client (works for both OpenAI and Groq)
    const clientConfig: { apiKey: string; baseURL?: string; timeout?: number } = {
      apiKey,
      timeout: 60000, // 60 second timeout
    };
    if (isGroq) {
      clientConfig.baseURL = 'https://api.groq.com/openai/v1';
    }
    const client = new OpenAI(clientConfig);

    // Create a temporary file path
    const tempFilePath = path.join(os.tmpdir(), `audio-${Date.now()}-${Math.random().toString(36).slice(2)}.webm`);

    try {
      // Convert the file to a buffer and write to temp file
      const buffer = Buffer.from(await audioFile.arrayBuffer());
      fs.writeFileSync(tempFilePath, buffer);

      // Create a readable stream from the temp file
      const fileStream = fs.createReadStream(tempFilePath);

      // Map language codes to Whisper-supported codes
      const languageMap: Record<string, string | undefined> = {
        'auto': undefined,
        'en': 'en', 'en-US': 'en', 'en-GB': 'en',
        'he': 'he', 'he-IL': 'he',
        'ru': 'ru', 'ru-RU': 'ru',
        'es': 'es', 'fr': 'fr', 'de': 'de', 'ar': 'ar', 'zh': 'zh', 'ja': 'ja',
        'pt': 'pt', 'it': 'it', 'ko': 'ko'
      };
      const whisperLanguage = language === 'auto' ? undefined : (languageMap[language] || language);

      // Choose model based on service
      const model = isGroq ? 'whisper-large-v3-turbo' : 'whisper-1';

      // Transcribe using Whisper API (OpenAI or Groq)
      const transcription = await client.audio.transcriptions.create({
        file: fileStream,
        model: model,
        ...(whisperLanguage && { language: whisperLanguage }),
        response_format: 'text',
      });

      return NextResponse.json({
        text: transcription,
        rateLimit: {
          remaining: ipRateLimit.remaining,
          resetTime: ipRateLimit.resetTime
        }
      });
    } finally {
      // Always clean up temp file
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
    }
  } catch (error) {
    // Sanitize error to prevent API key leakage
    const safeError = sanitizeError(error);
    console.error('Transcription error:', safeError);

    // Check for specific error types
    if (error instanceof Error) {
      if (error.message.includes('timeout') || error.message.includes('ETIMEDOUT')) {
        return NextResponse.json(
          { error: 'Transcription request timed out. Please try again.' },
          { status: 504 }
        );
      }
      if (error.message.includes('rate limit') || error.message.includes('429')) {
        return NextResponse.json(
          { error: 'Service rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Error transcribing audio. Please try again.' },
      { status: 500 }
    );
  }
}

// Configure API route for larger file uploads
export const config = {
  api: {
    bodyParser: false,
    responseLimit: '10mb',
  },
};

// Next.js 15 route segment config for timeout
export const maxDuration = 60; // 60 seconds max
