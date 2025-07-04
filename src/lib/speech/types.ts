export interface SpeechConfig {
  azureKey?: string;
  azureRegion?: string;
  defaultLanguage: string;
  useAzureFallback: boolean;
}

export interface TranscriptionResult {
  text: string;
  isFinal: boolean;
  confidence: number;
  source: 'webSpeech' | 'azure';
}

export interface SpeechError {
  code: string;
  message: string;
  source: 'webSpeech' | 'azure';
}
