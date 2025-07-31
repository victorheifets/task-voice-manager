import { createTheme, alpha } from '@mui/material/styles';

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2196F3',
      light: '#64B5F6',
      lighter: '#E3F2FD',
      dark: '#1976D2',
    },
    error: {
      main: '#f44336',
      light: '#ef5350',
      lighter: '#ffebee',
      dark: '#d32f2f',
    },
    secondary: {
      main: '#9c27b0',
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          backgroundImage: 'none',
        },
        elevation1: {
          boxShadow: '0 0 4px rgba(0, 0, 0, 0.1)',
        },
        elevation2: {
          boxShadow: '0 0 6px rgba(0, 0, 0, 0.12)',
        },
        elevation3: {
          boxShadow: '0 0 8px rgba(0, 0, 0, 0.14)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          overflow: 'visible',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          boxShadow: 'none',
          fontWeight: 600,
          '&:hover': {
            boxShadow: '0 0 8px rgba(0, 0, 0, 0.15)',
            transform: 'translateY(-1px)',
          },
        },
        contained: {
          boxShadow: '0 4px 12px rgba(33, 150, 243, 0.15)',
        },
        containedPrimary: {
          background: 'linear-gradient(180deg, #2196F3 0%, #1976D2 100%)',
        },
        outlined: {
          borderWidth: 1,
          '&:hover': {
            borderWidth: 1,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
        filledPrimary: {
          background: 'linear-gradient(180deg, #2196F3 0%, #1976D2 100%)',
          boxShadow: '0 2px 4px rgba(33, 150, 243, 0.25)',
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
          '&:hover': {
            boxShadow: '0 6px 12px rgba(0, 0, 0, 0.25)',
            transform: 'translateY(-2px)',
          },
          borderRadius: 8,
        },
        primary: {
          background: 'linear-gradient(180deg, #2196F3 0%, #1976D2 100%)',
        },
        secondary: {
          background: 'linear-gradient(180deg, #AB47BC 0%, #8E24AA 100%)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiInput-underline:hover:not(.Mui-disabled):before': {
            borderBottom: 'none',
          },
          '& .MuiInput-underline:before': {
            borderBottom: 'none',
          },
          '& .MuiInput-underline:after': {
            borderBottom: 'none',
          },
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#2196F3',
              borderWidth: 2,
            },
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          height: 48,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: '8px 16px',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          textTransform: 'uppercase',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
          backgroundImage: 'none',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: alpha('#2196F3', 0.1),
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 8,
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#818CF8', // Indigo 400
      light: '#A5B4FC', // Indigo 300
      lighter: 'rgba(129, 140, 248, 0.08)',
      dark: '#6366F1', // Indigo 500
    },
    error: {
      main: '#F87171', // Red 400
      light: '#FCA5A5', // Red 300
      lighter: 'rgba(248, 113, 113, 0.08)',
      dark: '#EF4444', // Red 500
    },
    secondary: {
      main: '#A78BFA', // Violet 400
    },
    background: {
      default: '#111827', // Slate 900 background
      paper: '#1F2937', // Slate 800 for containers
    },
    text: {
      primary: '#94A3B8', // Slate 400 - less bright text
      secondary: '#64748B', // Slate 500 - even more muted
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: ({ theme }) => ({
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          backgroundColor: theme.palette.mode === 'dark' ? '#1F2937 !important' : undefined, 
          backgroundImage: 'none',
          color: '#94A3B8', // Slate 400
          borderRadius: 8,
          border: '1px solid #374151', // Slate 700
          '& .MuiDialog-paper': {
            borderRadius: 8,
            backgroundColor: theme.palette.mode === 'dark' ? '#1F2937 !important' : undefined, 
          },
        }),
      },
    },
    MuiCard: {
      styleOverrides: {
        root: ({ theme }) => ({
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
          overflow: 'visible',
          borderRadius: 8,
          backgroundColor: theme.palette.mode === 'dark' ? '#1F2937 !important' : undefined, 
          border: '1px solid #374151', // Slate 700
        }),
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          boxShadow: '0 0 4px rgba(0, 0, 0, 0.25)',
          fontWeight: 500,
          '&:hover': {
            boxShadow: '0 0 8px rgba(0, 0, 0, 0.35)',
            transform: 'translateY(-1px)',
          },
        },
        contained: {
          boxShadow: '0 0 4px rgba(129, 140, 248, 0.25)',
        },
        containedPrimary: {
          background: 'linear-gradient(180deg, #818CF8 0%, #6366F1 100%)',
        },
        text: {
          color: '#94A3B8', // Slate 400
          backgroundColor: '#1F2937', // Slate 800
          '&:hover': {
            backgroundColor: '#374151', // Slate 700
          },
        },
        outlined: {
          borderColor: '#4B5563', // Slate 600
          color: '#94A3B8', // Slate 400
          '&:hover': {
            backgroundColor: '#374151', // Slate 700
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
          backgroundColor: '#374151', // Slate 700
          color: '#94A3B8', // Slate 400
          borderColor: '#4B5563', // Slate 600
        },
        filledPrimary: {
          background: 'linear-gradient(180deg, #818CF8 0%, #6366F1 100%)',
          boxShadow: '0 2px 4px rgba(129, 140, 248, 0.25)',
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.35)',
          '&:hover': {
            boxShadow: '0 6px 12px rgba(0, 0, 0, 0.45)',
            transform: 'translateY(-2px)',
          },
          borderRadius: 8,
        },
        primary: {
          background: 'linear-gradient(180deg, #818CF8 0%, #6366F1 100%)',
        },
        secondary: {
          background: 'linear-gradient(180deg, #A78BFA 0%, #8B5CF6 100%)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          backgroundColor: '#1F2937', // Slate 800
          borderRadius: 8,
          '& .MuiInput-underline:hover:not(.Mui-disabled):before': {
            borderBottom: 'none',
          },
          '& .MuiInput-underline:before': {
            borderBottom: 'none',
          },
          '& .MuiInput-underline:after': {
            borderBottom: 'none',
          },
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            backgroundColor: '#1F2937', // Slate 800
            color: '#94A3B8', // Slate 400
            '& fieldset': {
              borderColor: '#4B5563', // Slate 600
            },
            '&:hover fieldset': {
              borderColor: '#6366F1', // Indigo 500
            },
            '&.Mui-focused fieldset': {
              borderColor: '#818CF8', // Indigo 400
            },
          },
          '& .MuiInputLabel-root': {
            color: '#94A3B8', // Slate 400
          },
          '& .MuiInputBase-input::placeholder': {
            color: '#64748B', // Slate 500
            opacity: 1,
          },
          '&.task-input': {
            borderRadius: 4,
            '& .MuiOutlinedInput-root': {
              borderRadius: 4,
              backgroundColor: '#1F2937', // Slate 800
            },
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          height: 48,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: '8px 16px',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          textTransform: 'uppercase',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
          backgroundImage: 'none',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 2,
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 2,
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          borderRadius: 2,
        },
      },
    },
  },
}); 