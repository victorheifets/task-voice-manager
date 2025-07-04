import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import os from 'os';

// Initialize the OpenAI client with server-side API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export async function POST(request: NextRequest) {
  try {
    // Get form data with audio file
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const language = formData.get('language') as string || 'en';
    
    if (!audioFile) {
      return NextResponse.json(
        { error: 'Audio file is required' },
        { status: 400 }
      );
    }

    // Create a temporary file path
    const tempFilePath = path.join(os.tmpdir(), `audio-${Date.now()}.webm`);
    
    // Convert the file to a buffer and write to temp file
    const buffer = Buffer.from(await audioFile.arrayBuffer());
    fs.writeFileSync(tempFilePath, buffer);
    
    // Create a readable stream from the temp file
    const fileStream = fs.createReadStream(tempFilePath);
    
    // Determine language for Whisper API (supports Hebrew)
    const whisperLanguage = language === 'he' ? 'he' : 'en';
    
    try {
      // Transcribe using OpenAI Whisper API
      const transcription = await openai.audio.transcriptions.create({
        file: fileStream,
        model: 'whisper-1',
        language: whisperLanguage,
        response_format: 'text',
      });

      // Clean up temp file
      fs.unlinkSync(tempFilePath);
      
      console.log('Transcription result:', transcription);
      return NextResponse.json({ text: transcription });
    } catch (error) {
      // Clean up temp file in case of error
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
      throw error;
    }
  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json(
      { error: 'Error transcribing audio' },
      { status: 500 }
    );
  }
}

// Increase the limit for the API route to handle larger audio files
export const config = {
  api: {
    bodyParser: false,
    responseLimit: '10mb',
  },
}; 