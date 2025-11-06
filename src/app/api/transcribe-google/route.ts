import { NextRequest, NextResponse } from 'next/server';
import { SpeechClient } from '@google-cloud/speech';

// Initialize Google Speech client
const speechClient = new SpeechClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
});

export async function POST(request: NextRequest) {
  try {
    // Check if Google credentials are configured
    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS || !process.env.GOOGLE_CLOUD_PROJECT_ID) {
      return NextResponse.json(
        { error: 'Google Cloud credentials not configured' },
        { status: 500 }
      );
    }

    // Get form data with audio file
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    
    if (!audioFile) {
      return NextResponse.json(
        { error: 'Audio file is required' },
        { status: 400 }
      );
    }

    // Convert audio file to base64
    const audioBuffer = Buffer.from(await audioFile.arrayBuffer());
    const audioBytes = audioBuffer.toString('base64');

    // Configure recognition request
    const request_config = {
      audio: {
        content: audioBytes,
      },
      config: {
        encoding: 'WEBM_OPUS' as const,
        sampleRateHertz: 48000,
        languageCode: 'auto', // Auto-detect language
        alternativeLanguageCodes: ['en-US', 'he-IL', 'es-ES', 'fr-FR'],
        enableAutomaticPunctuation: true,
        enableWordTimeOffsets: false,
        model: 'latest_long', // Best model for accuracy
        useEnhanced: true, // Use enhanced model if available
      },
    };

    try {
      // Perform speech recognition
      const [response] = await speechClient.recognize(request_config);
      
      if (!response.results || response.results.length === 0) {
        return NextResponse.json(
          { error: 'No speech detected in audio' },
          { status: 400 }
        );
      }

      // Get the transcript from the best alternative
      const transcription = response.results
        .map(result => result.alternatives?.[0]?.transcript || '')
        .join(' ')
        .trim();

      if (!transcription) {
        return NextResponse.json(
          { error: 'No transcription result' },
          { status: 400 }
        );
      }

      // Get detected language if available
      const detectedLanguage = response.results[0]?.languageCode || 'unknown';
      
      console.log('Google Speech transcription result:', transcription);
      console.log('Detected language:', detectedLanguage);
      
      return NextResponse.json({ 
        text: transcription,
        detectedLanguage: detectedLanguage,
        service: 'google'
      });
      
    } catch (speechError: any) {
      console.error('Google Speech API error:', speechError);
      
      // Handle specific Google Speech errors
      if (speechError.code === 3) {
        return NextResponse.json(
          { error: 'Invalid audio format or corrupted file' },
          { status: 400 }
        );
      } else if (speechError.code === 7) {
        return NextResponse.json(
          { error: 'Google Cloud authentication failed' },
          { status: 401 }
        );
      } else if (speechError.code === 8) {
        return NextResponse.json(
          { error: 'Google Speech quota exceeded' },
          { status: 429 }
        );
      }
      
      throw speechError;
    }
  } catch (error) {
    console.error('Google transcription error:', error);
    return NextResponse.json(
      { error: 'Error transcribing audio with Google Speech' },
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: false,
    responseLimit: '10mb',
  },
};