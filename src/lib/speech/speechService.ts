import { SpeechConfig, TranscriptionResult, SpeechError } from './types';

export class SpeechService {
  private recognition: any = null;
  private azureClient: any | null = null;
  private config: SpeechConfig;
  private isRecording = false;
  private onResult: (result: TranscriptionResult) => void;
  private onError: (error: SpeechError) => void;

  constructor(
    config: SpeechConfig,
    onResult: (result: TranscriptionResult) => void,
    onError: (error: SpeechError) => void
  ) {
    this.config = config;
    this.onResult = onResult;
    this.onError = onError;
    this.initWebSpeech();
  }

  private async initWebSpeech() {
    const SpeechRecognitionImpl = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognitionImpl) {
      if (this.config.useAzureFallback) {
        await this.initAzure();
      } else {
        this.onError({
          code: 'NOT_SUPPORTED',
          message: 'Speech recognition is not supported in this browser',
          source: 'webSpeech'
        });
      }
      return;
    }

    try {
      // Check microphone permission first
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (error) {
        this.onError({
          code: 'PERMISSION_DENIED',
          message: 'Please allow microphone access to use voice recording',
          source: 'webSpeech'
        });
        return;
      }

      this.recognition = new SpeechRecognitionImpl();
      
      if (this.recognition) {
        // Configure recognition
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.maxAlternatives = 1;
        this.recognition.lang = this.config.defaultLanguage;

        // Variables for handling results
        let finalTranscript = '';
        let interimTranscript = '';
        let silenceTimer: NodeJS.Timeout | null = null;
        const silenceDelay = 1500; // Stop after 1.5s of silence

        // Handle start events
        this.recognition.onstart = () => {
          console.log('Speech recognition started');
          finalTranscript = '';
          interimTranscript = '';
        };

        // Handle results
        this.recognition.onresult = (event: SpeechRecognitionEvent) => {
          interimTranscript = '';
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            const transcript = result[0].transcript.trim();

            if (result.isFinal) {
              finalTranscript = transcript;
              // Stop recording after final result
              this.stopRecording();
            } else {
              interimTranscript = transcript;
            }
          }

          // Clear previous silence timer
          if (silenceTimer) clearTimeout(silenceTimer);

          // Set new silence timer
          silenceTimer = setTimeout(() => {
            if (interimTranscript) {
              finalTranscript = interimTranscript;
              this.stopRecording();
            }
          }, silenceDelay);

          // Send result
          const textToSend = finalTranscript || interimTranscript;
          if (textToSend) {
            this.onResult({
              text: textToSend,
              isFinal: !!finalTranscript,
              confidence: event.results[event.resultIndex][0].confidence,
              source: 'webSpeech'
            });
          }
        };

        // Handle errors
        this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          // Ignore aborted errors as they happen during normal operation
          if (event.error === 'aborted') return;

          let message = 'Speech recognition error';
          let shouldRetry = false;
          
          switch (event.error) {
            case 'not-allowed':
            case 'permission-denied':
              message = 'Please allow microphone access to use voice recording';
              break;
            case 'no-speech':
              message = 'No speech detected. Please try speaking again.';
              shouldRetry = true;
              break;
            case 'network':
              message = 'Network error. Please check your connection.';
              break;
            case 'audio-capture':
              message = 'Could not start recording. Please check your microphone.';
              break;
            case 'language-not-supported':
              message = 'Selected language is not supported';
              break;
            default:
              message = 'An error occurred. Please try again.';
              shouldRetry = true;
          }

          console.error('Speech recognition error:', event.error, message);

          this.onError({
            code: event.error,
            message,
            source: 'webSpeech'
          });
          
          if (!shouldRetry) {
            this.stopRecording();
            if (this.config.useAzureFallback && !this.azureClient) {
              this.initAzure();
            }
          }
        };

        // Handle end event
        this.recognition.onend = () => {
          console.log('Speech recognition ended');
          if (this.isRecording && this.recognition) {
            // Try to restart after a short delay
            setTimeout(() => {
              if (this.isRecording) {
                try {
                  console.log('Restarting speech recognition...');
                  this.recognition?.start();
                } catch (error) {
                  console.error('Failed to restart speech recognition:', error);
                  this.stopRecording();
                }
              }
            }, 250);
          }
        };

        // Handle audio start
        this.recognition.onaudiostart = () => {
          console.log('Audio capturing started');
        };

        // Handle speech start
        this.recognition.onspeechstart = () => {
          console.log('Speech detected');
        };
      }
    } catch (error) {
      this.onError({
        code: 'INIT_ERROR',
        message: error instanceof Error ? error.message : 'Failed to initialize speech recognition',
        source: 'webSpeech'
      });
    }
  }

  private async initAzure() {
    if (!this.config.azureKey || !this.config.azureRegion) {
      this.onError({
        code: 'NO_AZURE_CONFIG',
        message: 'Azure configuration is missing',
        source: 'azure'
      });
      return;
    }

    try {
      // Azure SDK would be imported and initialized here
      // This is a placeholder for the actual Azure implementation
      this.azureClient = {
        startRecording: async () => {
          // Azure specific implementation
        },
        stopRecording: async () => {
          // Azure specific implementation
        }
      };
    } catch (error) {
      this.onError({
        code: 'AZURE_INIT_ERROR',
        message: error instanceof Error ? error.message : 'Azure initialization failed',
        source: 'azure'
      });
    }
  }

  public async startRecording() {
    if (this.isRecording) {
      console.log('Already recording, stopping first...');
      await this.stopRecording();
    }
    
    try {
      // Check microphone permission
      try {
        console.log('Requesting microphone permission...');
        await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (error) {
        console.error('Microphone permission denied:', error);
        this.onError({
          code: 'PERMISSION_DENIED',
          message: 'Please allow microphone access to use voice recording',
          source: 'webSpeech'
        });
        return;
      }

      if (this.recognition) {
        console.log('Starting web speech recognition...');
        this.isRecording = true; // Set before starting to prevent race conditions
        try {
          await this.recognition.start();
          console.log('Web speech recognition started successfully');
        } catch (error) {
          console.error('Failed to start web speech recognition:', error);
          this.isRecording = false;
          throw error;
        }
      } else if (this.azureClient) {
        console.log('Starting Azure speech recognition...');
        this.isRecording = true;
        await this.azureClient.startRecording();
      } else {
        throw new Error('No speech recognition service available');
      }
    } catch (error) {
      this.isRecording = false;
      console.error('Error starting recording:', error);

      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          this.onError({
            code: 'PERMISSION_DENIED',
            message: 'Please allow microphone access to use voice recording',
            source: this.recognition ? 'webSpeech' : 'azure'
          });
        } else {
          this.onError({
            code: 'START_ERROR',
            message: `Could not start recording: ${error.message}`,
            source: this.recognition ? 'webSpeech' : 'azure'
          });
        }
      } else {
        this.onError({
          code: 'START_ERROR',
          message: 'Could not start recording. Please try again.',
          source: this.recognition ? 'webSpeech' : 'azure'
        });
      }
    }
  }

  public async stopRecording() {
    if (!this.isRecording) return;
    
    try {
      if (this.recognition) {
        this.recognition.stop();
      } else if (this.azureClient) {
        await this.azureClient.stopRecording();
      }
      this.isRecording = false;
    } catch (error) {
      this.onError({
        code: 'STOP_ERROR',
        message: error instanceof Error ? error.message : 'Failed to stop recording',
        source: this.recognition ? 'webSpeech' : 'azure'
      });
    }
  }

  public cleanup() {
    if (this.recognition) {
      this.recognition.abort();
    }
    if (this.azureClient) {
      // Cleanup Azure client
    }
    this.isRecording = false;
  }
}
