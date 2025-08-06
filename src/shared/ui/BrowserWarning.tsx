'use client';

import React, { useEffect, useState } from 'react';
import { Alert, AlertTitle, Box, Button, Collapse, Typography } from '@mui/material';
import { detectBrowserCapabilities, BrowserInfo } from '@/utils/browserCompatibility';
import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';

export default function BrowserWarning() {
  const [browserInfo, setBrowserInfo] = useState<BrowserInfo | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    setBrowserInfo(detectBrowserCapabilities());
  }, []);

  if (!browserInfo) return null;

  // Determine severity
  const getSeverity = () => {
    if (!browserInfo.isSupported) return 'error';
    if (browserInfo.warnings.length > 0) return 'warning';
    return 'info';
  };

  const getIcon = () => {
    const severity = getSeverity();
    switch (severity) {
      case 'error': return <ErrorIcon />;
      case 'warning': return <WarningIcon />;
      default: return <InfoIcon />;
    }
  };

  const getTitle = () => {
    if (!browserInfo.isSupported) {
      return 'Browser Not Supported';
    }
    if (browserInfo.warnings.length > 0) {
      return 'Browser Compatibility Issues';
    }
    return 'Browser Compatible';
  };

  const getRecommendations = () => {
    const recommendations = [];
    
    if (browserInfo.name === 'Firefox' && !browserInfo.features.speechRecognition) {
      recommendations.push('Enable speech recognition in Firefox: Type "about:config" in address bar, search for "media.webspeech.recognition.enable" and set to true');
    }
    
    if (browserInfo.name === 'Safari') {
      recommendations.push('Safari has limited speech recognition support. Consider using Chrome or Firefox for better experience');
    }
    
    if (!window.isSecureContext) {
      recommendations.push('This page requires HTTPS for speech recognition. Try accessing via https:// or use localhost');
    }
    
    if (!browserInfo.features.speechRecognition && !browserInfo.features.mediaRecorder) {
      recommendations.push('Switch to Chrome, Firefox, or Edge for full voice recognition support');
    }

    return recommendations;
  };

  // Don't show if everything is working fine
  if (browserInfo.isSupported && browserInfo.warnings.length === 0) {
    return null;
  }

  return (
    <Box sx={{ mb: 2 }}>
      <Alert 
        severity={getSeverity()} 
        icon={getIcon()}
        action={
          <Button
            color="inherit"
            size="small"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? 'Hide Details' : 'Show Details'}
          </Button>
        }
      >
        <AlertTitle>{getTitle()}</AlertTitle>
        <Typography variant="body2">
          {!browserInfo.isSupported 
            ? 'Voice recognition features may not work properly in this browser.'
            : 'Some features may have limited functionality.'
          }
        </Typography>
        
        <Collapse in={showDetails}>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Browser: {browserInfo.name} {browserInfo.version}
            </Typography>
            
            <Typography variant="subtitle2" gutterBottom>
              Feature Support:
            </Typography>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              <li>Speech Recognition: {browserInfo.features.speechRecognition ? '✅' : '❌'}</li>
              <li>Audio Recording: {browserInfo.features.mediaRecorder ? '✅' : '❌'}</li>
              <li>Service Worker: {browserInfo.features.serviceWorker ? '✅' : '❌'}</li>
            </ul>
            
            {browserInfo.warnings.length > 0 && (
              <>
                <Typography variant="subtitle2" gutterBottom sx={{ mt: 1 }}>
                  Warnings:
                </Typography>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  {browserInfo.warnings.map((warning, index) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>
              </>
            )}
            
            {getRecommendations().length > 0 && (
              <>
                <Typography variant="subtitle2" gutterBottom sx={{ mt: 1 }}>
                  Recommendations:
                </Typography>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  {getRecommendations().map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </>
            )}
          </Box>
        </Collapse>
      </Alert>
    </Box>
  );
}