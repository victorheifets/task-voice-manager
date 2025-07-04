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
      default: '#f5f5f5',
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
      main: '#2196F3',
      light: '#64B5F6',
      lighter: 'rgba(33, 150, 243, 0.08)',
      dark: '#1976D2',
    },
    error: {
      main: '#f44336',
      light: '#ef5350',
      lighter: 'rgba(244, 67, 54, 0.08)',
      dark: '#d32f2f',
    },
    secondary: {
      main: '#9c27b0',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          backgroundColor: '#1e1e1e',
          '& .MuiDialog-paper': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
          overflow: 'visible',
          borderRadius: 8,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          boxShadow: '0 0 4px rgba(0, 0, 0, 0.25)',
          fontWeight: 600,
          '&:hover': {
            boxShadow: '0 0 8px rgba(0, 0, 0, 0.35)',
            transform: 'translateY(-1px)',
          },
        },
        contained: {
          boxShadow: '0 0 4px rgba(144, 202, 249, 0.25)',
        },
        containedPrimary: {
          background: 'linear-gradient(180deg, #90caf9 0%, #42a5f5 100%)',
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
          background: 'linear-gradient(180deg, #90caf9 0%, #42a5f5 100%)',
          boxShadow: '0 2px 4px rgba(144, 202, 249, 0.25)',
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
          background: 'linear-gradient(180deg, #90caf9 0%, #42a5f5 100%)',
        },
        secondary: {
          background: 'linear-gradient(180deg, #ce93d8 0%, #ab47bc 100%)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e1e1e',
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
            '& fieldset': {
              borderColor: 'rgba(255,255,255,0.1)',
            },
          },
          '&.task-input': {
            borderRadius: 4,
            '& .MuiOutlinedInput-root': {
              borderRadius: 4,
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