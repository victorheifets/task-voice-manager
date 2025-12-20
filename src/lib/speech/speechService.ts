import { TranscriptionResult } from './types';
import { detectBrowserCapabilities } from '../../utils/browserCompatibility';

export interface SpeechError {
  code: string;
  message: string;
  source: 'webSpeech' | 'azure' | 'fallback';
}

export interface SpeechConfig {
  defaultLanguage: string;
  useAzureFallback: boolean;
  azureKey?: string;
  azureRegion?: string;
  transcriptionService?: 'browser' | 'whisper' | 'groq' | 'azure' | 'hybrid';
}

export class SpeechService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private recognition: any = null; // SpeechRecognition instance
  private config: SpeechConfig;
  private isRecording: boolean = false;
  private onResult: (result: TranscriptionResult) => void;
  private onError: (error: SpeechError) => void;
  private fallbackMode: boolean = false;
  private recordingStartTime: number = 0;
  private isInitialized: boolean = false;
  private usingSpeechRecognition: boolean = false;
  private networkErrorCount: number = 0;
  private retryAttempts: number = 0;
  private maxRetryAttempts: number = 3;
  private permissionGranted: boolean = false;
  private activeStream: MediaStream | null = null;
  private silenceTimeout: NodeJS.Timeout | null = null;
  private lastSpeechTime: number = 0;
  private fullTranscript: string = '';
  private audioMimeType: string = 'audio/webm'; // Track actual audio format used

  constructor(
    config: SpeechConfig,
    onResult: (result: TranscriptionResult) => void,
    onError: (error: SpeechError) => void
  ) {
    this.config = config;
    this.onResult = onResult;
    this.onError = onError;
    
    
  }

  private notifyFallbackMode(): void {
    this.fallbackMode = true;
    this.onError({
      code: 'FALLBACK_MODE',
      message: 'Voice recognition is not available. Please use the text input below.',
      source: 'fallback'
    });
  }

  private async checkSpeechRecognitionSupport(): Promise<boolean> {
    try {
      // Use the browser compatibility utility
      const browserInfo = detectBrowserCapabilities();
      
      // Check if we're on HTTPS or localhost
      const isSecureContext = window.isSecureContext || location.hostname === 'localhost';
      if (!isSecureContext) {
        console.log('Speech recognition requires HTTPS or localhost');
        return false;
      }

      // Use the detected speech recognition support
      if (!browserInfo.features.speechRecognition) {
        console.log('Speech recognition not supported in this browser');
        return false;
      }

      // Log any browser-specific warnings
      if (browserInfo.warnings.length > 0) {
        console.warn('Browser warnings:', browserInfo.warnings);
      }

      console.log('Speech recognition is supported');
      return true;
    } catch (error) {
      console.error('Error checking speech recognition support:', error);
      return false;
    }
  }

  private async initSpeechRecognition(): Promise<boolean> {
    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        console.log('Speech recognition not available');
        return false;
      }

      // Request microphone permission with proper handling
      console.log('Requesting microphone permission...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      // Store the stream for proper cleanup and mark permission as granted
      this.activeStream = stream;
      this.permissionGranted = true;
      console.log('Microphone permission granted');
      
      // Don't immediately stop the stream - keep it for speech recognition
      // We'll stop it when we're done with the recognition

      // Create and configure speech recognition
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false; // Auto-stops after silence - more reliable
      this.recognition.interimResults = true;

      // Map short language codes to BCP-47 format for Web Speech API
      // 'auto' means don't set language (browser will use default)
      const browserLanguageMap: Record<string, string> = {
        'en': 'en-US',
        'he': 'he-IL',
        'ru': 'ru-RU',
        'es': 'es-ES',
        'fr': 'fr-FR',
        'de': 'de-DE',
        'ar': 'ar-SA',
        'zh': 'zh-CN',
        'ja': 'ja-JP'
      };
      // For 'auto', don't set language - browser will auto-detect or use default
      if (this.config.defaultLanguage !== 'auto') {
        const browserLang = browserLanguageMap[this.config.defaultLanguage] || this.config.defaultLanguage;
        this.recognition.lang = browserLang;
      }
      this.recognition.maxAlternatives = 5; // Get more alternatives for better accuracy

      // Set up event handlers
      this.recognition.onstart = () => {
        console.log('');
        console.log('='.repeat(50));
        console.log('✅ SPEECH RECOGNITION STARTED');
        console.log('='.repeat(50));
        console.log('Language:', this.recognition?.lang, '(from:', this.config.defaultLanguage + ')');
        console.log('🎤 MICROPHONE IS ACTIVE - PLEASE SPEAK NOW');
        console.log('');

        this.isRecording = true;
        this.fullTranscript = ''; // Reset transcript at start
        this.networkErrorCount = 0;
      };


      this.recognition.onresult = (event: any) => {
        // Only process the latest result (not all accumulated results)
        const result = event.results[event.resultIndex];

        // Get the best alternative (highest confidence)
        let bestTranscript = result[0].transcript;
        let bestConfidence = result[0].confidence || 0.8;

        // Check all alternatives and pick the best one
        for (let j = 1; j < result.length; j++) {
          const altConfidence = result[j].confidence || 0;
          if (altConfidence > bestConfidence) {
            bestTranscript = result[j].transcript;
            bestConfidence = altConfidence;
          }
        }

        console.log(`🎤 Result [${result.isFinal ? 'FINAL' : 'interim'}]: "${bestTranscript}" (confidence: ${(bestConfidence * 100).toFixed(1)}%)`);

        if (result.isFinal) {
          // For final results, this IS the complete transcript
          this.fullTranscript = bestTranscript;
          this.onResult({
            text: bestTranscript.trim(),
            isFinal: true,
            confidence: bestConfidence,
            source: 'webSpeech'
          });
        } else {
          // For interim results, show what we're hearing
          this.onResult({
            text: bestTranscript.trim(),
            isFinal: false,
            confidence: bestConfidence,
            source: 'webSpeech'
          });
        }
      };

      this.recognition.onerror = (event: any) => {
        this.isRecording = false;
        console.error('Speech recognition error:', event.error);

        // Handle specific error types
        if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          this.onError({
            code: 'not-allowed',
            message: 'Microphone access denied. Please enable in browser settings.',
            source: 'webSpeech'
          });
        } else if (event.error === 'no-speech') {
          // No speech detected - this is normal, just log it
          console.log('No speech detected - this is normal if you paused');
        } else if (event.error === 'audio-capture') {
          this.onError({
            code: 'audio-capture',
            message: 'No microphone found. Please connect a microphone.',
            source: 'webSpeech'
          });
        } else if (event.error === 'network') {
          console.log('Network error - Chrome requires internet for speech recognition');
          console.log('Tip: Switch to Groq or Whisper in Settings for better reliability');
          this.onError({
            code: 'network',
            message: 'Browser speech unavailable. Switch to Groq or Whisper in Settings.',
            source: 'webSpeech'
          });
        } else if (event.error !== 'aborted') {
          this.onError({
            code: event.error,
            message: 'Speech recognition error: ' + event.error,
            source: 'webSpeech'
          });
        }
      };

      this.recognition.onend = () => {
        console.log('Speech recognition ended');
        // Final result was already sent in onresult when isFinal=true
        // Just clean up here
        this.isRecording = false;
        this.fullTranscript = '';

        // Clean up the audio stream
        if (this.activeStream) {
          this.activeStream.getTracks().forEach(track => track.stop());
          this.activeStream = null;
        }
      };

      console.log('Speech recognition initialized successfully');
      this.isInitialized = true;
      this.usingSpeechRecognition = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize speech recognition:', error);
      return false;
    }
  }

  private async initMediaRecorder(): Promise<boolean> {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.log('MediaRecorder not supported');
        return false;
      }

      // Use existing stream if available, otherwise request new one
      let stream = this.activeStream;
      if (!stream) {
        stream = await navigator.mediaDevices.getUserMedia({ 
          audio: { 
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          } 
        });
        this.activeStream = stream;
        this.permissionGranted = true;
      }
      
      // Check for supported audio formats with fallback
      // iOS Safari uses audio/mp4, Chrome/Firefox use audio/webm
      // Prefer codecs with good compression for faster uploads
      let mimeType = 'audio/webm;codecs=opus'; // Opus is smaller/faster
      if (!MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        if (MediaRecorder.isTypeSupported('audio/webm')) {
          mimeType = 'audio/webm';
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
          mimeType = 'audio/ogg';
        } else {
          console.log('No supported audio format found');
          if (this.activeStream) {
            this.activeStream.getTracks().forEach(track => track.stop());
            this.activeStream = null;
          }
          return false;
        }
      }

      // Store the actual mime type for use when creating blobs
      this.audioMimeType = mimeType.split(';')[0]; // Store base type for blob creation
      console.log('Using audio format:', mimeType);
      // Use lower bitrate for faster uploads (48kbps is sufficient for speech)
      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: 48000 // 48kbps - good quality for voice, small file size
      });
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        console.log('🎤 MediaRecorder ondataavailable:', { dataSize: event.data.size });
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
          console.log('🎤 Audio chunk added, total chunks:', this.audioChunks.length);
        }
      };

      this.mediaRecorder.onstop = async () => {
        console.log('🎤 MediaRecorder onstop triggered');
        console.log('🎤 Total audio chunks:', this.audioChunks.length);
        console.log('🎤 Transcription service:', this.config.transcriptionService);

        // Check if we should use cloud API for transcription
        if (this.config.transcriptionService === 'whisper' || this.config.transcriptionService === 'groq' || this.config.transcriptionService === 'hybrid') {
          console.log('🎤 Calling sendToWhisperAPI...');
          await this.sendToWhisperAPI();
        } else {
          // Provide a helpful message for other services
          const helpfulText = `Audio recorded successfully! Since speech-to-text is not available, please type your message in the text field below.`;
          
          this.onResult({
            text: helpfulText,
            isFinal: true,
            confidence: 0.5,
            source: 'webSpeech'
          });

          // Clean up and show text input
          this.audioChunks = [];
          if (this.activeStream) {
            this.activeStream.getTracks().forEach(track => track.stop());
            this.activeStream = null;
          }
          
          // Show text input after recording
          setTimeout(() => this.notifyFallbackMode(), 500);
        }
      };

      this.usingSpeechRecognition = false;
      return true;
    } catch (error) {
      console.error('Failed to initialize MediaRecorder:', error);
      return false;
    }
  }

  public async startRecording(): Promise<void> {
    if (this.isRecording) {
      console.log('Already recording');
      return;
    }

    // Reset transcript accumulation
    this.fullTranscript = '';
    this.lastSpeechTime = 0;
    
    // Clear any existing silence timeout
    if (this.silenceTimeout) {
      clearTimeout(this.silenceTimeout);
      this.silenceTimeout = null;
    }

    // If we're already in fallback mode, just notify
    if (this.fallbackMode) {
      console.log('In fallback mode - showing text input');
      this.onError({
        code: 'USE_TEXT_INPUT',
        message: 'Please use the text input field to type your message.',
        source: 'fallback'
      });
      return;
    }

    // First time initialization - choose service based on config
    if (!this.isInitialized) {
      const serviceToUse = this.config.transcriptionService || 'browser';
      console.log(`🎤 Initializing transcription service: ${serviceToUse}`);

      // For whisper/groq/azure, ALWAYS use MediaRecorder (skip Web Speech API)
      if (serviceToUse === 'whisper' || serviceToUse === 'groq' || serviceToUse === 'azure') {
        console.log(`🎤 Using cloud service (${serviceToUse}) - initializing MediaRecorder...`);
        const mediaRecorderReady = await this.initMediaRecorder();

        if (mediaRecorderReady && this.mediaRecorder) {
          this.isRecording = true;
          this.recordingStartTime = Date.now();
          this.audioChunks = []; // Clear previous chunks
          // Start with 1000ms timeslice to capture audio periodically
          this.mediaRecorder.start(1000);
          console.log('🎤 Started audio recording with MediaRecorder for cloud transcription (timeslice: 1000ms)');
          return;
        }

        console.error(`🎤 MediaRecorder failed for ${serviceToUse} service`);
        this.notifyFallbackMode();
        return;
      }

      // For browser and hybrid modes, try speech recognition first
      if (serviceToUse === 'browser' || serviceToUse === 'hybrid') {
        console.log('🎤 Attempting to initialize Web Speech API...');

        // Check if speech recognition is supported
        const speechSupported = await this.checkSpeechRecognitionSupport();

        if (speechSupported) {
          // Try to initialize speech recognition
          const speechInitialized = await this.initSpeechRecognition();

          if (speechInitialized) {
            console.log('🎤 Speech recognition ready - using Web Speech API');
            // Start speech recognition
            if (this.recognition) {
              try {
                this.recognition.start();
                return;
              } catch (error) {
                console.error('🎤 Failed to start speech recognition:', error);
                // For hybrid mode, fall through to MediaRecorder
                if (serviceToUse !== 'hybrid') {
                  this.notifyFallbackMode();
                  return;
                }
              }
            }
          }
        }
      }

      // Fallback: try MediaRecorder for hybrid mode or when speech recognition fails
      console.log('🎤 Falling back to MediaRecorder...');
      
      const mediaRecorderReady = await this.initMediaRecorder();

      if (mediaRecorderReady && this.mediaRecorder) {
        this.isRecording = true;
        this.recordingStartTime = Date.now();
        this.audioChunks = []; // Clear previous chunks
        this.mediaRecorder.start(1000); // 1000ms timeslice
        console.log('🎤 Started audio recording with MediaRecorder (timeslice: 1000ms)');

        // No auto-stop - user controls when to stop recording
        return;
      }
      
      // If both fail, enable fallback mode immediately
      console.log('Neither speech recognition nor MediaRecorder available - enabling fallback');
      this.notifyFallbackMode();
      return;
    }

    // If already initialized, start recording with the appropriate method
    if (this.usingSpeechRecognition && this.recognition) {
      try {
        this.recognition.start();
        console.log('Started speech recognition');
      } catch (error) {
        console.error('Failed to start speech recognition:', error);
        // Reset retry attempts and switch to fallback mode
        this.retryAttempts = 0;
        this.notifyFallbackMode();
      }
    } else if (this.mediaRecorder) {
      this.isRecording = true;
      this.recordingStartTime = Date.now();
      this.audioChunks = []; // Clear previous chunks
      this.mediaRecorder.start(1000); // 1000ms timeslice
      console.log('🎤 Started recording with existing MediaRecorder (timeslice: 1000ms)');
    }
  }

  public async stopRecording(): Promise<void> {
    if (!this.isRecording) {
      return;
    }

    // Note: Don't set isRecording = false here - let onend do it
    // This ensures the final result is sent properly

    if (this.usingSpeechRecognition && this.recognition) {
      try {
        this.recognition.stop();
        console.log('Stopped speech recognition');
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
        this.isRecording = false;
      }
    } else if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.isRecording = false;
      this.mediaRecorder.stop();
      console.log('Stopped audio recording');
    }
  }

  // Simple method to handle manual text input
  public handleManualInput(text: string): void {
    if (text.trim()) {
      console.log('Processing manual text input:', text);
      this.onResult({
        text: text.trim(),
        isFinal: true,
        confidence: 1.0,
        source: 'webSpeech'
      });
    }
  }

  public isInFallbackMode(): boolean {
    return this.fallbackMode;
  }

  private async sendToWhisperAPI(): Promise<void> {
    console.log('🎤 sendToWhisperAPI called');
    console.log('🎤 Audio chunks count:', this.audioChunks.length);

    try {
      if (this.audioChunks.length === 0) {
        console.error('🎤 ERROR: No audio data to transcribe!');
        this.onError({
          code: 'NO_AUDIO',
          message: 'No audio was recorded. Please try again.',
          source: 'webSpeech'
        });
        return;
      }

      // Create audio blob with the correct mime type (important for iOS which uses mp4)
      const audioBlob = new Blob(this.audioChunks, { type: this.audioMimeType });
      console.log('🎤 Audio blob created:', { size: audioBlob.size, type: audioBlob.type });

      if (audioBlob.size < 1000) {
        console.error('🎤 ERROR: Audio blob too small, likely no audio captured');
        this.onError({
          code: 'AUDIO_TOO_SHORT',
          message: 'Recording too short. Please hold the button and speak.',
          source: 'webSpeech'
        });
        return;
      }

      // Get correct file extension based on mime type
      const extensionMap: Record<string, string> = {
        'audio/webm': 'webm',
        'audio/webm;codecs=opus': 'webm',
        'audio/mp4': 'm4a',
        'audio/ogg': 'ogg',
        'audio/mpeg': 'mp3',
        'audio/wav': 'wav'
      };
      // Strip codec info for extension lookup
      const baseMimeType = this.audioMimeType.split(';')[0];
      const extension = extensionMap[this.audioMimeType] || extensionMap[baseMimeType] || 'webm';
      const filename = `recording.${extension}`;

      console.log('🎤 Preparing to send:', { mimeType: this.audioMimeType, filename, blobSize: audioBlob.size });

      // Create form data
      const formData = new FormData();
      formData.append('audio', audioBlob, filename);
      formData.append('language', this.config.defaultLanguage.split('-')[0]);

      const service = this.config.transcriptionService || 'whisper';
      formData.append('service', service);
      console.log('🎤 Using transcription service:', service);

      // Get user's API key from localStorage (BYOK)
      if (typeof window !== 'undefined') {
        const userGroqKey = localStorage.getItem('groqApiKey');
        const userOpenAiKey = localStorage.getItem('openaiApiKey');
        console.log('🎤 BYOK Keys:', { service, hasGroqKey: !!userGroqKey, hasOpenAiKey: !!userOpenAiKey });

        if (service === 'groq' && userGroqKey) {
          formData.append('apiKey', userGroqKey);
          console.log('🎤 Using Groq API key');
        } else if ((service === 'whisper' || service === 'hybrid') && userOpenAiKey) {
          formData.append('apiKey', userOpenAiKey);
          console.log('🎤 Using OpenAI API key');
        } else {
          console.warn('🎤 No API key found for service:', service);
        }
      }

      // Send to transcription API
      console.log('🎤 Sending request to /api/transcribe...');
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      console.log('🎤 API Response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('🎤 API Error response:', errorText);
        throw new Error(`Transcription failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('🎤 API Result:', result);

      if (result.text) {
        console.log('🎤 Transcription successful:', result.text);
        this.onResult({
          text: result.text.trim(),
          isFinal: true,
          confidence: 0.9,
          source: 'webSpeech'
        });
      } else if (result.error) {
        throw new Error(result.error);
      } else {
        throw new Error('No transcription result received');
      }
    } catch (error) {
      console.error('Whisper API transcription failed:', error);
      
      // Fallback to showing text input
      this.onResult({
        text: 'Transcription failed. Please type your message below.',
        isFinal: true,
        confidence: 0.1,
        source: 'webSpeech'
      });
      
      setTimeout(() => this.notifyFallbackMode(), 500);
    } finally {
      // Clean up
      this.audioChunks = [];
      if (this.activeStream) {
        this.activeStream.getTracks().forEach(track => track.stop());
        this.activeStream = null;
      }
    }
  }

  public cleanup(): void {
    this.stopRecording();
    
    // Clear silence timeout
    if (this.silenceTimeout) {
      clearTimeout(this.silenceTimeout);
      this.silenceTimeout = null;
    }
    
    if (this.recognition) {
      this.recognition.abort();
      this.recognition = null;
    }
    
    if (this.mediaRecorder) {
      this.mediaRecorder = null;
    }
    
    // Clean up active stream
    if (this.activeStream) {
      this.activeStream.getTracks().forEach(track => track.stop());
      this.activeStream = null;
    }
    
    this.audioChunks = [];
    this.isRecording = false;
    this.permissionGranted = false;
    this.retryAttempts = 0;
    this.fullTranscript = '';
    this.lastSpeechTime = 0;
  }
}
