'use client';

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { lightTheme, darkTheme } from '../theme';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  mode: 'light',
  toggleTheme: () => {},
  setThemeMode: () => {},
});

export const useThemeContext = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  // Get theme from localStorage or use system preference
  const [mode, setMode] = useState<ThemeMode>('dark'); // Default to dark mode

  useEffect(() => {
    const storedTheme = localStorage.getItem('themeMode') as ThemeMode | null;
    
    if (storedTheme) {
      setMode(storedTheme);
    } else {
      // Check system preference
      const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setMode(prefersDarkMode ? 'dark' : 'light');
    }
  }, []);

  // Update localStorage and apply theme classes when theme changes
  useEffect(() => {
    localStorage.setItem('themeMode', mode);
    
    // Apply CSS class to HTML and body for direct CSS variable access
    const htmlElement = document.documentElement;
    
    if (mode === 'light') {
      document.body.classList.add('light-mode');
      document.body.classList.remove('dark-mode');
      htmlElement.classList.add('light-mode');
      htmlElement.classList.remove('dark-mode');
    } else {
      document.body.classList.add('dark-mode');
      document.body.classList.remove('light-mode');
      htmlElement.classList.add('dark-mode');
      htmlElement.classList.remove('light-mode');
    }
  }, [mode]);

  const toggleTheme = () => {
    setMode(prevMode => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const setThemeMode = (newMode: ThemeMode) => {
    setMode(newMode);
  };

  const theme = mode === 'light' ? lightTheme : darkTheme;

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme, setThemeMode }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}; 