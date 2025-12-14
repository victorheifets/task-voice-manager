'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, IconButton, Collapse, Chip, Paper, alpha, useTheme } from '@mui/material';
import BugReportIcon from '@mui/icons-material/BugReport';
import CloseIcon from '@mui/icons-material/Close';
import ClearAllIcon from '@mui/icons-material/ClearAll';

interface DebugLog {
  id: number;
  timestamp: string;
  message: string;
  type: 'info' | 'error' | 'success' | 'warn';
}

interface VoiceDebugPanelProps {
  isRecording: boolean;
  isProcessing: boolean;
  transcriptionService: string;
  transcript: string;
  error?: string;
  language?: string;
}

// Global log storage for persistence across renders
let globalLogs: DebugLog[] = [];
let logIdCounter = 0;
let logListeners: ((logs: DebugLog[]) => void)[] = [];

// Global function to add logs from anywhere
export function addDebugLog(message: string, type: 'info' | 'error' | 'success' | 'warn' = 'info') {
  const log: DebugLog = {
    id: logIdCounter++,
    timestamp: new Date().toLocaleTimeString(),
    message,
    type
  };
  globalLogs = [...globalLogs.slice(-49), log]; // Keep last 50 logs
  logListeners.forEach(listener => listener(globalLogs));
}

// Hook original console methods to capture logs
if (typeof window !== 'undefined') {
  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;

  console.log = (...args) => {
    originalConsoleLog.apply(console, args);
    const msg = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
    if (msg.includes('🎤')) {
      addDebugLog(msg, 'info');
    }
  };

  console.error = (...args) => {
    originalConsoleError.apply(console, args);
    const msg = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
    addDebugLog(msg, 'error');
  };

  console.warn = (...args) => {
    originalConsoleWarn.apply(console, args);
    const msg = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
    addDebugLog(msg, 'warn');
  };
}

export default function VoiceDebugPanel({
  isRecording,
  isProcessing,
  transcriptionService,
  transcript,
  error,
  language = 'en'
}: VoiceDebugPanelProps) {
  const theme = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState<DebugLog[]>(globalLogs);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Subscribe to log updates
  useEffect(() => {
    const listener = (newLogs: DebugLog[]) => setLogs([...newLogs]);
    logListeners.push(listener);
    return () => {
      logListeners = logListeners.filter(l => l !== listener);
    };
  }, []);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (isOpen && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isOpen]);

  // Log state changes
  useEffect(() => {
    if (isRecording) {
      addDebugLog('🔴 Recording STARTED', 'success');
    }
  }, [isRecording]);

  useEffect(() => {
    if (isProcessing) {
      addDebugLog('⏳ Processing started...', 'info');
    }
  }, [isProcessing]);

  useEffect(() => {
    if (transcript) {
      addDebugLog(`📝 Transcript: "${transcript}"`, 'success');
    }
  }, [transcript]);

  useEffect(() => {
    if (error) {
      addDebugLog(`❌ Error: ${error}`, 'error');
    }
  }, [error]);

  const clearLogs = () => {
    globalLogs = [];
    setLogs([]);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'error': return theme.palette.error.main;
      case 'success': return theme.palette.success.main;
      case 'warn': return theme.palette.warning.main;
      default: return theme.palette.info.main;
    }
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 70,
        left: 16, // Move to LEFT side to not block mic button
        zIndex: 9999,
        pointerEvents: 'none', // Don't block clicks when not interacting
      }}
    >
      {/* Debug toggle button */}
      <IconButton
        onClick={() => setIsOpen(!isOpen)}
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: 32,
          height: 32,
          bgcolor: isOpen ? 'error.main' : alpha(theme.palette.grey[500], 0.7),
          color: 'white',
          boxShadow: 2,
          pointerEvents: 'auto', // Re-enable clicks for button
          '&:hover': {
            bgcolor: isOpen ? 'error.dark' : 'grey.600',
          }
        }}
      >
        {isOpen ? <CloseIcon fontSize="small" /> : <BugReportIcon fontSize="small" />}
      </IconButton>

      {/* Debug panel */}
      <Collapse in={isOpen}>
        <Paper
          elevation={6}
          sx={{
            position: 'absolute',
            bottom: 40,
            left: 0,
            width: 300,
            maxWidth: 'calc(100vw - 32px)',
            maxHeight: 350,
            overflow: 'hidden',
            bgcolor: alpha(theme.palette.background.paper, 0.95),
            backdropFilter: 'blur(8px)',
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
            pointerEvents: 'auto', // Re-enable clicks for panel
          }}
        >
          {/* Status header */}
          <Box sx={{ p: 1.5, borderBottom: `1px solid ${theme.palette.divider}`, bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              🔧 Voice Debug Panel
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              <Chip
                size="small"
                label={isRecording ? '🔴 Recording' : '⚪ Idle'}
                color={isRecording ? 'error' : 'default'}
                sx={{ fontSize: '0.7rem' }}
              />
              <Chip
                size="small"
                label={isProcessing ? '⏳ Processing' : '✓ Ready'}
                color={isProcessing ? 'warning' : 'success'}
                sx={{ fontSize: '0.7rem' }}
              />
              <Chip
                size="small"
                label={`🎙️ ${transcriptionService}`}
                variant="outlined"
                sx={{ fontSize: '0.7rem' }}
              />
              <Chip
                size="small"
                label={`🌐 ${language}`}
                variant="outlined"
                sx={{ fontSize: '0.7rem' }}
              />
            </Box>
            {transcript && (
              <Box sx={{ mt: 1, p: 1, bgcolor: alpha(theme.palette.success.main, 0.1), borderRadius: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 600 }}>Current Transcript:</Typography>
                <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                  "{transcript}"
                </Typography>
              </Box>
            )}
            {error && (
              <Box sx={{ mt: 1, p: 1, bgcolor: alpha(theme.palette.error.main, 0.1), borderRadius: 1 }}>
                <Typography variant="caption" color="error" sx={{ fontWeight: 600 }}>Error:</Typography>
                <Typography variant="body2" color="error" sx={{ fontSize: '0.75rem' }}>
                  {error}
                </Typography>
              </Box>
            )}
          </Box>

          {/* Clear button */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 0.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
            <IconButton size="small" onClick={clearLogs} title="Clear logs">
              <ClearAllIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Logs area */}
          <Box
            sx={{
              maxHeight: 200,
              overflow: 'auto',
              p: 1,
              fontFamily: 'monospace',
              fontSize: '0.65rem',
              lineHeight: 1.4,
            }}
          >
            {logs.length === 0 ? (
              <Typography variant="caption" color="text.secondary">
                No logs yet. Start recording to see debug output.
              </Typography>
            ) : (
              logs.map(log => (
                <Box key={log.id} sx={{ mb: 0.5, wordBreak: 'break-word' }}>
                  <Typography
                    component="span"
                    sx={{ color: 'text.secondary', fontSize: '0.6rem' }}
                  >
                    [{log.timestamp}]
                  </Typography>{' '}
                  <Typography
                    component="span"
                    sx={{ color: getTypeColor(log.type), fontSize: '0.65rem' }}
                  >
                    {log.message}
                  </Typography>
                </Box>
              ))
            )}
            <div ref={logsEndRef} />
          </Box>
        </Paper>
      </Collapse>
    </Box>
  );
}
