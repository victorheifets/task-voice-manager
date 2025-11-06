import { NextRequest, NextResponse } from 'next/server';
import * as sdk from 'microsoft-cognitiveservices-speech-sdk';
import fs from 'fs';
import path from 'path';
import os from 'os';

export async function POST(request: NextRequest) {
  try {
    // Check if Azure credentials are configured
    if (!process.env.AZURE_SPEECH_KEY || !process.env.AZURE_SPEECH_REGION) {
      return NextResponse.json(
        { error: 'Azure Speech credentials not configured. Need AZURE_SPEECH_KEY and AZURE_SPEECH_REGION' },
        { status: 500 }
      );
    }

    // Get form data with audio file
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const language = formData.get('language') as string || 'auto';
    
    if (!audioFile) {
      return NextResponse.json(
        { error: 'Audio file is required' },
        { status: 400 }
      );
    }

    // Create a temporary file path
    const tempFilePath = path.join(os.tmpdir(), `azure-audio-${Date.now()}.wav`);
    
    try {
      // Convert the file to a buffer and write to temp file
      const buffer = Buffer.from(await audioFile.arrayBuffer());
      fs.writeFileSync(tempFilePath, buffer);

      // Configure Azure Speech
      const speechConfig = sdk.SpeechConfig.fromSubscription(
        process.env.AZURE_SPEECH_KEY!,
        process.env.AZURE_SPEECH_REGION!
      );

      // Set language - Azure supports auto-detection
      if (language === 'auto' || !language) {
        // Use auto-detect mode for multiple languages
        speechConfig.setProperty('SpeechServiceConnection_EnableMultiLanguageRecognition', 'true');
        speechConfig.setProperty('SpeechServiceConnection_LanguageIdMode', 'Continuous');
        // Set default language
        speechConfig.speechRecognitionLanguage = 'en-US';
      } else {
        // Map language codes to Azure format
        const languageMap: Record<string, string> = {
          'en': 'en-US',
          'he': 'he-IL', 
          'es': 'es-ES',
          'fr': 'fr-FR'
        };
        speechConfig.speechRecognitionLanguage = languageMap[language] || 'en-US';
      }

      // Configure output format
      speechConfig.outputFormat = sdk.OutputFormat.Detailed;
      speechConfig.requestWordLevelTimestamps();
      speechConfig.enableDictation();

      // Create audio config from file
      const audioConfig = sdk.AudioConfig.fromWavFileInput(fs.readFileSync(tempFilePath));
      
      // Create speech recognizer
      const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

      // Perform recognition
      const result = await new Promise<sdk.SpeechRecognitionResult>((resolve, reject) => {
        recognizer.recognizeOnceAsync(
          (result: sdk.SpeechRecognitionResult) => {
            resolve(result);
          },
          (error: string) => {
            reject(new Error(error));
          }
        );
      });

      // Clean up temp file
      fs.unlinkSync(tempFilePath);
      recognizer.close();

      // Process result
      if (result.reason === sdk.ResultReason.RecognizedSpeech) {
        const transcription = result.text;
        const detectedLanguage = result.properties?.getProperty(
          'SpeechServiceConnection_AutoDetectSourceLanguageResult'
        ) || 'unknown';
        
        console.log('Azure Speech transcription result:', transcription);
        console.log('Detected language:', detectedLanguage);
        
        return NextResponse.json({ 
          text: transcription.trim(),
          detectedLanguage: detectedLanguage,
          confidence: result.properties?.getProperty('Speech.Recognition.Confidence') || '0.9',
          service: 'azure'
        });
        
      } else if (result.reason === sdk.ResultReason.NoMatch) {
        return NextResponse.json(
          { error: 'No speech detected in audio file' },
          { status: 400 }
        );
      } else if (result.reason === sdk.ResultReason.Canceled) {
        const cancellation = sdk.CancellationDetails.fromResult(result);
        
        if (cancellation.reason === sdk.CancellationReason.Error) {
          console.error('Azure Speech error:', cancellation.errorDetails);
          
          // Handle common errors based on error message
          const errorDetails = cancellation.errorDetails || '';
          
          if (errorDetails.includes('401') || errorDetails.includes('Forbidden')) {
            return NextResponse.json(
              { error: 'Azure Speech API key is invalid or expired' },
              { status: 401 }
            );
          } else if (errorDetails.includes('429') || errorDetails.includes('quota')) {
            return NextResponse.json(
              { error: 'Azure Speech API quota exceeded' },
              { status: 429 }
            );
          } else if (errorDetails.includes('400') || errorDetails.includes('BadRequest')) {
            return NextResponse.json(
              { error: 'Invalid audio format for Azure Speech' },
              { status: 400 }
            );
          }
          
          throw new Error(`Azure Speech error: ${errorDetails}`);
        }
        
        throw new Error('Azure Speech recognition was cancelled');
      } else {
        throw new Error(`Azure Speech recognition failed with reason: ${result.reason}`);
      }
      
    } catch (azureError: any) {
      // Clean up temp file in case of error
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
      throw azureError;
    }
    
  } catch (error) {
    console.error('Azure transcription error:', error);
    
    // Return user-friendly error messages
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    if (errorMessage.includes('Invalid subscription key')) {
      return NextResponse.json(
        { error: 'Azure Speech API key is invalid' },
        { status: 401 }
      );
    } else if (errorMessage.includes('quota')) {
      return NextResponse.json(
        { error: 'Azure Speech API quota exceeded' },
        { status: 429 }
      );
    }
    
    return NextResponse.json(
      { error: 'Error transcribing audio with Azure Speech' },
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