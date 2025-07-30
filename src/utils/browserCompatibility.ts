export interface BrowserInfo {
  name: string;
  version: string;
  isSupported: boolean;
  features: {
    speechRecognition: boolean;
    mediaRecorder: boolean;
    serviceWorker: boolean;
    pwa: boolean;
  };
  warnings: string[];
}

export function detectBrowserCapabilities(): BrowserInfo {
  const userAgent = navigator.userAgent.toLowerCase();
  
  // Browser detection
  const isChrome = /chrome/.test(userAgent) && !/edg/.test(userAgent);
  const isFirefox = /firefox/.test(userAgent);
  const isSafari = /safari/.test(userAgent) && !/chrome/.test(userAgent);
  const isEdge = /edg/.test(userAgent);
  const isIOS = /iphone|ipad|ipod/.test(userAgent);
  const isAndroid = /android/.test(userAgent);
  
  const browserName = isChrome ? 'Chrome' : 
                     isFirefox ? 'Firefox' : 
                     isSafari ? 'Safari' : 
                     isEdge ? 'Edge' : 'Unknown';
  
  // Feature detection
  const features = {
    speechRecognition: checkSpeechRecognition(),
    mediaRecorder: checkMediaRecorder(),
    serviceWorker: 'serviceWorker' in navigator,
    pwa: checkPWACapabilities()
  };
  
  // Warnings based on browser/device
  const warnings: string[] = [];
  
  // Check if localhost vs network access
  const isLocalhost = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1' ||
                     window.location.hostname.endsWith('.local');
  
  if (isIOS && isSafari) {
    warnings.push('iOS Safari has limited speech recognition support');
    warnings.push('Consider using the text input fallback on iOS');
  }
  
  if (isFirefox && !features.speechRecognition) {
    warnings.push('Firefox requires enabling speech recognition in about:config');
    warnings.push('Set media.webspeech.recognition.enable to true in about:config');
  }
  
  if (!window.isSecureContext && !isLocalhost) {
    warnings.push('Speech recognition requires HTTPS for non-localhost access');
    warnings.push('Try accessing via https:// or use localhost for development');
  }
  
  if (isAndroid && /chrome/.test(userAgent)) {
    warnings.push('Android Chrome may have intermittent speech recognition issues');
  }
  
  // Network access warnings
  if (!isLocalhost && window.location.protocol === 'http:') {
    warnings.push('HTTP access from network may block speech recognition features');
    warnings.push('Use HTTPS or access via localhost for full functionality');
  }
  
  // Overall support assessment
  const isSupported = features.speechRecognition || features.mediaRecorder;
  
  return {
    name: browserName,
    version: getBrowserVersion(userAgent),
    isSupported,
    features,
    warnings
  };
}

function checkSpeechRecognition(): boolean {
  try {
    return !!(
      (window as any).SpeechRecognition || 
      (window as any).webkitSpeechRecognition
    );
  } catch {
    return false;
  }
}

function checkMediaRecorder(): boolean {
  try {
    return !!(
      navigator.mediaDevices && 
      typeof navigator.mediaDevices.getUserMedia === 'function' &&
      window.MediaRecorder
    );
  } catch {
    return false;
  }
}

function checkPWACapabilities(): boolean {
  return (
    'serviceWorker' in navigator &&
    window.matchMedia('(display-mode: standalone)').matches
  );
}

function getBrowserVersion(userAgent: string): string {
  const patterns = [
    { name: 'chrome', pattern: /chrome\/(\d+\.\d+)/ },
    { name: 'firefox', pattern: /firefox\/(\d+\.\d+)/ },
    { name: 'safari', pattern: /version\/(\d+\.\d+)/ },
    { name: 'edge', pattern: /edg\/(\d+\.\d+)/ }
  ];
  
  for (const { pattern } of patterns) {
    const match = userAgent.match(pattern);
    if (match) {
      return match[1];
    }
  }
  
  return 'unknown';
}

export function logBrowserInfo(): void {
  const info = detectBrowserCapabilities();
  console.group('🔍 Browser Compatibility Report');
  console.log('Browser:', info.name, info.version);
  console.log('Supported:', info.isSupported);
  console.log('Features:', info.features);
  if (info.warnings.length > 0) {
    console.warn('Warnings:', info.warnings);
  }
  console.groupEnd();
}