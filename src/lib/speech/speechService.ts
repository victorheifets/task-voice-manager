import { TranscriptionResult } from './types';
import { detectBrowserCapabilities, logBrowserInfo } from '../../utils/browserCompatibility';

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
  transcriptionService?: 'browser' | 'whisper' | 'azure' | 'hybrid';
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
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = this.config.defaultLanguage;
      this.recognition.maxAlternatives = 1;

      // Set up event handlers
      this.recognition.onstart = () => {
        console.log('Speech recognition started');
        this.isRecording = true;
        this.networkErrorCount = 0; // Reset error count on successful start
      };


      this.recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        // Build the full transcript by combining all final results
        for (let i = 0; i < event.results.length; i++) {
          const result = event.results[i];
          const transcript = result[0].transcript;

          if (result.isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript = transcript;
          }
        }

        // Update the full transcript with final results
        if (finalTranscript) {
          this.fullTranscript += finalTranscript;
        }

        // Send the current transcript (accumulated + interim)
        const textToSend = this.fullTranscript + interimTranscript;
        if (textToSend) {
          this.lastSpeechTime = Date.now();
          this.onResult({
            text: textToSend.trim(),
            isFinal: false, // Always send as interim to keep typing effect
            confidence: event.results[event.resultIndex][0].confidence || 0.8,
            source: 'webSpeech'
          });

          // Clear any existing silence timeout
          if (this.silenceTimeout) {
            clearTimeout(this.silenceTimeout);
          }

          // Set a new timeout for 5 seconds of silence
          this.silenceTimeout = setTimeout(() => {
            if (this.isRecording) {
              console.log('5 seconds of silence detected, stopping recording');
              this.stopRecording();
            }
          }, 5000);
        }
      };

      this.recognition.onerror = (event: any) => {
        this.isRecording = false;
        
        if (event.error !== 'aborted') {
          // Don't log common/expected errors
          const silentErrors = ['network', 'language-not-supported', 'no-speech', 'audio-capture'];
          if (!silentErrors.includes(event.error)) {
            console.error('Speech recognition error:', event.error);
          }
          
          this.networkErrorCount++;
          
          // Handle different error types - be more conservative with retries
          const retryableErrors = ['network'];
          
          if (retryableErrors.includes(event.error) && this.retryAttempts < 2) { // Reduced max retries
            console.log(`Retrying speech recognition (attempt ${this.retryAttempts + 1}/2)`);
            this.retryAttempts++;
            
            // Retry after a short delay
            setTimeout(() => {
              if (this.recognition && this.isRecording) {
                try {
                  this.recognition.start();
                } catch (retryError) {
                  console.error('Retry failed:', retryError);
                  this.notifyFallbackMode();
                }
              }
            }, 1000 * this.retryAttempts); // Exponential backoff
          } else {
            // For non-retryable errors or max retries reached, switch to fallback mode
            console.log('Speech recognition failed, switching to fallback mode');
            setTimeout(() => this.notifyFallbackMode(), 100);
          }
        }
      };

      this.recognition.onend = () => {
        console.log('Speech recognition ended');
        
        // Only restart if we're still supposed to be recording and haven't exceeded retries
        if (this.isRecording && this.retryAttempts < 2) {
          console.log(`Restarting speech recognition (attempt ${this.retryAttempts + 1}/2)`);
          this.retryAttempts++;
          setTimeout(() => {
            if (this.recognition && this.isRecording) {
              try {
                this.recognition.start();
              } catch (error) {
                console.error('Restart failed:', error);
                this.isRecording = false;
                this.notifyFallbackMode();
              }
            }
          }, 1500); // Slightly longer delay
        } else {
          this.isRecording = false;
          // Clean up the audio stream when completely done
          if (this.activeStream) {
            this.activeStream.getTracks().forEach(track => track.stop());
            this.activeStream = null;
          }
          
          // If we were trying to record but failed, notify fallback mode
          if (this.retryAttempts >= 2) {
            console.log('Max retries reached, switching to fallback mode');
            this.notifyFallbackMode();
          }
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
      let mimeType = 'audio/webm';
      if (!MediaRecorder.isTypeSupported('audio/webm')) {
        if (MediaRecorder.isTypeSupported('audio/mp4')) {
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
      
      console.log('Using audio format:', mimeType);
      this.mediaRecorder = new MediaRecorder(stream, { mimeType });
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = async () => {
        // Check if we should use Whisper for transcription
        if (this.config.transcriptionService === 'whisper' || this.config.transcriptionService === 'hybrid') {
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
      console.log(`Initializing transcription service: ${this.config.transcriptionService || 'browser'}`);
      
      // For browser and hybrid modes, try speech recognition first
      if (!this.config.transcriptionService || this.config.transcriptionService === 'browser' || this.config.transcriptionService === 'hybrid') {
        console.log('Attempting to initialize speech recognition...');
        
        // Check if speech recognition is supported
        const speechSupported = await this.checkSpeechRecognitionSupport();
        
        if (speechSupported) {
          // Try to initialize speech recognition
          const speechInitialized = await this.initSpeechRecognition();
          
          if (speechInitialized) {
            console.log('Speech recognition ready - using Web Speech API');
            // Start speech recognition
            if (this.recognition) {
              try {
                this.recognition.start();
                return;
              } catch (error) {
                console.error('Failed to start speech recognition:', error);
                // For hybrid mode, fall through to MediaRecorder
                if (this.config.transcriptionService !== 'hybrid') {
                  this.notifyFallbackMode();
                  return;
                }
              }
            }
          }
        }
      }
      
      // For whisper, azure, or hybrid fallback, use MediaRecorder
      if (this.config.transcriptionService === 'whisper' || this.config.transcriptionService === 'azure' || this.config.transcriptionService === 'hybrid') {
        console.log('Initializing MediaRecorder for cloud transcription...');
      } else {
        console.log('Speech recognition not available, trying MediaRecorder...');
      }
      
      const mediaRecorderReady = await this.initMediaRecorder();
      
      if (mediaRecorderReady && this.mediaRecorder) {
        this.isRecording = true;
        this.recordingStartTime = Date.now();
        this.mediaRecorder.start();
        console.log('Started audio recording with MediaRecorder');
        
        // Auto-stop after 5 seconds for better UX
        setTimeout(() => {
          if (this.isRecording) {
            this.stopRecording();
          }
        }, 5000);
        
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
      this.mediaRecorder.start();
      console.log('Started recording with existing MediaRecorder');
      
      // Auto-stop after 5 seconds
      setTimeout(() => {
        if (this.isRecording) {
          this.stopRecording();
        }
      }, 5000);
    }
  }

  public async stopRecording(): Promise<void> {
    if (!this.isRecording) {
      return;
    }

    this.isRecording = false;

    // Clear silence timeout
    if (this.silenceTimeout) {
      clearTimeout(this.silenceTimeout);
      this.silenceTimeout = null;
    }

    // Send final result with accumulated transcript
    if (this.fullTranscript.trim()) {
      this.onResult({
        text: this.fullTranscript.trim(),
        isFinal: true,
        confidence: 0.9,
        source: 'webSpeech'
      });
    }

    if (this.usingSpeechRecognition && this.recognition) {
      try {
        this.recognition.stop();
        console.log('Stopped speech recognition');
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
      }
    } else if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
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
    try {
      if (this.audioChunks.length === 0) {
        console.log('No audio data to transcribe');
        return;
      }

      // Create audio blob
      const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
      
      // Create form data
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('language', this.config.defaultLanguage.split('-')[0]); // Extract language code (e.g., 'en' from 'en-US')

      // Send to transcription API
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Transcription failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.text) {
        this.onResult({
          text: result.text.trim(),
          isFinal: true,
          confidence: 0.9,
          source: 'webSpeech'
        });
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
