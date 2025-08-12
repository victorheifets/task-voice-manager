'use client';

import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Tooltip,
  ListItemIcon,
  ListItemText,
  Switch,
  Divider,
  useMediaQuery,
  useTheme,
  Avatar,
  Badge,
  Button
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import TranslateIcon from '@mui/icons-material/Translate';
import PersonIcon from '@mui/icons-material/Person';
import HelpIcon from '@mui/icons-material/Help';
import AssignmentIcon from '@mui/icons-material/Assignment';
import MenuIcon from '@mui/icons-material/Menu';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ViewStreamIcon from '@mui/icons-material/ViewStream';
import { useThemeContext } from '../../contexts/ThemeContext';
import { useLanguageContext } from '../../contexts/LanguageContext';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../auth/AuthProvider';
import { supabase } from '@/lib/supabase/client';
import LogoutIcon from '@mui/icons-material/Logout';

interface HeaderProps {
  onTabChange?: (tabIndex: number) => void;
  onMenuClick?: () => void;
  isWideView?: boolean;
  onViewToggle?: () => void;
}

export default function Header({ onTabChange, onMenuClick, isWideView = true, onViewToggle }: HeaderProps) {
  const { t } = useTranslation(['common']);
  const { mode, toggleTheme } = useThemeContext();
  const { language, changeLanguage } = useLanguageContext();
  const { user } = useAuth();
  const [langAnchorEl, setLangAnchorEl] = useState<null | HTMLElement>(null);
  const [avatarAnchorEl, setAvatarAnchorEl] = useState<null | HTMLElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Enhanced brightness for better visibility
  const PRIMARY_COLOR = theme.palette.mode === 'dark' ? '#ffffff' : '#ffffff'; // Pure white for both modes
  const ICON_COLOR = theme.palette.mode === 'dark' ? '#ffffff' : '#ffffff'; // Pure white for all icons
  const ICON_BG_COLOR = theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.2)';
  const ICON_BORDER_COLOR = theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.4)';

  const handleSettingsClick = (event: React.MouseEvent<HTMLElement>) => {
    if (onTabChange) {
      onTabChange(2); // Switch directly to config tab (index 2)
    }
  };

  const handleLangMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setLangAnchorEl(event.currentTarget);
  };

  const handleLangMenuClose = () => {
    setLangAnchorEl(null);
  };

  const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
    setAvatarAnchorEl(event.currentTarget);
  };

  const handleAvatarClose = () => {
    setAvatarAnchorEl(null);
  };

  const handleLogout = () => {
    supabase.auth.signOut();
    handleAvatarClose();
  };

  const handleLogoClick = () => {
    if (onTabChange) {
      onTabChange(0); // Switch to tasks tab (index 0)
    }
  };


  const handleProfileClick = () => {
    // Handle profile navigation
    handleAvatarClose();
  };

  const handleHelpClick = () => {
    // Handle help navigation
    handleAvatarClose();
  };

  const handleLanguageChange = (lang: 'en' | 'es' | 'fr') => {
    changeLanguage(lang);
    handleLangMenuClose();
  };

  return (
    <AppBar 
      position="static" 
      color={theme.palette.mode === 'dark' ? 'default' : 'primary'}
      elevation={mode === 'light' ? 1 : 0}
      sx={{
        background: theme.palette.mode === 'dark' ? 
          'linear-gradient(to bottom, #1a1a1a 0%, #2c2c2c 50%, #1e1e1e 100%)' : 
          'linear-gradient(to bottom, #1976d2 0%, #2196F3 50%, #42a5f5 100%)',
        borderBottom: `1px solid ${theme.palette.divider}`,
        color: '#ffffff !important', // Pure white for maximum contrast
        borderRadius: 0,
        boxShadow: theme.palette.mode === 'dark' ? 
          '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.15)',
        '& .MuiToolbar-root': {
          color: '#ffffff !important'
        }
      }}
    >
      <Toolbar sx={{ 
        justifyContent: 'space-between', 
        py: 1,
        width: '100%',
        px: { xs: 2, md: 3 } // Full width with padding
      }}>
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center',
            cursor: 'pointer',
            transition: 'transform 0.2s',
            '&:hover': {
              transform: 'scale(1.02)'
            }
          }}
          onClick={handleLogoClick}
        >
          <AssignmentIcon 
            sx={{ 
              mr: 2.5, 
              color: PRIMARY_COLOR,
              fontSize: '2.2rem'
            }} 
          />
          <Typography 
            variant="h6" 
            component="h1" 
            sx={{ 
              fontWeight: 600,
              color: PRIMARY_COLOR,
              letterSpacing: '0.5px',
              ml: 0.5,
              mr: 1
            }}
          >
            {t('app.title')}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {onViewToggle && (
            <Tooltip title={isWideView ? 'Switch to Narrow View' : 'Switch to Wide View'}>
              <IconButton 
                onClick={onViewToggle}
                color="inherit" 
                size={isMobile ? 'small' : 'medium'}
                sx={{ 
                  borderRadius: '50%',
                  padding: '8px',
                  backgroundColor: ICON_BG_COLOR,
                  border: `1px solid ${ICON_BORDER_COLOR}`,
                  transition: 'all 0.2s',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.25)',
                    borderColor: '#ffffff',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                  },
                  display: useMediaQuery(theme.breakpoints.down('lg')) ? 'none' : 'flex' // Only show on large screens
                }}
              >
                {isWideView 
                  ? <ViewStreamIcon sx={{ color: '#ffffff' }} />
                  : <ViewModuleIcon sx={{ color: '#ffffff' }} />
                }
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title={t('app.settings')}>
            <IconButton 
              onClick={handleSettingsClick} 
              color="inherit"
              size={isMobile ? 'small' : 'medium'}
              sx={{ 
                borderRadius: '50%',
                padding: '8px',
                backgroundColor: ICON_BG_COLOR,
                border: `1px solid ${ICON_BORDER_COLOR}`,
                transition: 'all 0.2s',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.25)',
                  borderColor: '#ffffff',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                },
                display: isMobile ? 'none' : 'flex' // Hide on mobile
              }}
            >
              <SettingsIcon sx={{ color: '#ffffff' }} />
            </IconButton>
          </Tooltip>
          <Tooltip title={mode === 'light' ? t('theme.dark') : t('theme.light')}>
            <IconButton 
              onClick={toggleTheme} 
              color="inherit" 
              size={isMobile ? 'small' : 'medium'}
              sx={{ 
                borderRadius: '50%', // Make it round like other controls
                padding: '8px',
                backgroundColor: ICON_BG_COLOR,
                border: `1px solid ${ICON_BORDER_COLOR}`,
                transition: 'all 0.2s',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.25)',
                  borderColor: '#ffffff',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                }
              }}
            >
              {mode === 'light' 
                ? <DarkModeIcon sx={{ color: '#ffffff' }} /> 
                : <LightModeIcon sx={{ color: '#FFB74D' }} />
              }
            </IconButton>
          </Tooltip>
          <Tooltip title={t('language.select')}>
            <IconButton 
              onClick={handleLangMenuOpen} 
              color="inherit"
              size={isMobile ? 'small' : 'medium'}
              sx={{ 
                borderRadius: '50%',
                padding: '8px',
                backgroundColor: ICON_BG_COLOR,
                transition: 'all 0.2s',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.25)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                }
              }}
            >
              <TranslateIcon sx={{ color: '#ffffff' }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Account">
            <Avatar 
              onClick={handleAvatarClick}
              sx={{ 
                ml: 1, 
                width: 36, 
                height: 36,
                border: '2px solid #ffffff',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                backgroundColor: theme.palette.mode === 'dark' ? '#9e9e9e' : '#1976d2',
                '&:hover': {
                  transform: 'scale(1.1)'
                }
              }}
            >
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </Avatar>
          </Tooltip>
        </Box>
        {/* Language Menu */}
        <Menu
          anchorEl={langAnchorEl}
          open={Boolean(langAnchorEl)}
          onClose={handleLangMenuClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          PaperProps={{
            elevation: 3,
            sx: { 
              mt: 1.5,
              overflow: 'visible',
              borderRadius: 0, // Sharp corners for page header menus
              border: `1px solid ${theme.palette.divider}`,
              boxShadow: mode === 'light' 
                ? '0 6px 16px rgba(0,0,0,0.1)'
                : '0 6px 16px rgba(0,0,0,0.3)',
              '&:before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: theme.palette.background.paper,
                transform: 'translateY(-50%) rotate(45deg)',
                zIndex: 0,
                borderLeft: `1px solid ${theme.palette.divider}`,
                borderTop: `1px solid ${theme.palette.divider}`,
              },
            }
          }}
        >
          <MenuItem 
            selected={language === 'en'} 
            onClick={() => handleLanguageChange('en')}
            sx={{
              borderRadius: 0, // Sharp corners for menu items
              mx: 0.5,
              my: 0.25,
              '&.Mui-selected': {
                backgroundColor: theme.palette.mode === 'dark' 
                  ? 'rgba(144, 202, 249, 0.2)'
                  : 'rgba(255, 255, 255, 0.2)',
              },
              '&:hover': {
                backgroundColor: theme.palette.mode === 'dark' 
                  ? 'rgba(144, 202, 249, 0.1)'
                  : 'rgba(255, 255, 255, 0.1)',
              }
            }}
          >
            <ListItemIcon>
              <span role="img" aria-label="english">🇺🇸</span>
            </ListItemIcon>
            <ListItemText>{t('language.en')}</ListItemText>
          </MenuItem>
          <MenuItem 
            selected={language === 'es'} 
            onClick={() => handleLanguageChange('es')}
            sx={{
              borderRadius: 0, // Sharp corners for menu items
              mx: 0.5,
              my: 0.25,
              '&.Mui-selected': {
                backgroundColor: theme.palette.mode === 'dark' 
                  ? 'rgba(144, 202, 249, 0.2)'
                  : 'rgba(255, 255, 255, 0.2)',
              },
              '&:hover': {
                backgroundColor: theme.palette.mode === 'dark' 
                  ? 'rgba(144, 202, 249, 0.1)'
                  : 'rgba(255, 255, 255, 0.1)',
              }
            }}
          >
            <ListItemIcon>
              <span role="img" aria-label="spanish">🇪🇸</span>
            </ListItemIcon>
            <ListItemText>{t('language.es')}</ListItemText>
          </MenuItem>
          <MenuItem 
            selected={language === 'fr'} 
            onClick={() => handleLanguageChange('fr')}
            sx={{
              borderRadius: 0, // Sharp corners for menu items
              mx: 0.5,
              my: 0.25,
              '&.Mui-selected': {
                backgroundColor: theme.palette.mode === 'dark' 
                  ? 'rgba(144, 202, 249, 0.2)'
                  : 'rgba(255, 255, 255, 0.2)',
              },
              '&:hover': {
                backgroundColor: theme.palette.mode === 'dark' 
                  ? 'rgba(144, 202, 249, 0.1)'
                  : 'rgba(255, 255, 255, 0.1)',
              }
            }}
          >
            <ListItemIcon>
              <span role="img" aria-label="french">🇫🇷</span>
            </ListItemIcon>
            <ListItemText>{t('language.fr')}</ListItemText>
          </MenuItem>
        </Menu>
        
        {/* Avatar Menu */}
        <Menu
          anchorEl={avatarAnchorEl}
          open={Boolean(avatarAnchorEl)}
          onClose={handleAvatarClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          PaperProps={{
            elevation: 3,
            sx: {
              mt: 1.5,
              minWidth: 200,
              overflow: 'visible',
              borderRadius: 0, // Sharp corners for avatar menu
              border: `1px solid ${theme.palette.divider}`,
              boxShadow: mode === 'light' 
                ? '0 8px 24px rgba(0,0,0,0.12)'
                : '0 8px 24px rgba(0,0,0,0.3)',
              '&:before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: theme.palette.background.paper,
                transform: 'translateY(-50%) rotate(45deg)',
                zIndex: 0,
                borderLeft: `1px solid ${theme.palette.divider}`,
                borderTop: `1px solid ${theme.palette.divider}`,
              },
            }
          }}
        >
          <MenuItem onClick={handleAvatarClose} sx={{ borderRadius: 0, mx: 0.5, my: 0.25 }}>
            <ListItemIcon>
              <PersonIcon fontSize="small" sx={{ color: PRIMARY_COLOR }} />
            </ListItemIcon>
            <ListItemText>
              <Box>
                <Typography variant="body2" fontWeight={600}>
                  {user?.email || 'User'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  View Profile
                </Typography>
              </Box>
            </ListItemText>
          </MenuItem>
          <Divider sx={{ my: 1 }} />
          <MenuItem onClick={handleProfileClick} sx={{ borderRadius: 0, mx: 0.5, my: 0.25 }}>
            <ListItemIcon>
              <PersonIcon fontSize="small" sx={{ color: PRIMARY_COLOR }} />
            </ListItemIcon>
            <ListItemText>Profile</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleHelpClick} sx={{ borderRadius: 0, mx: 0.5, my: 0.25 }}>
            <ListItemIcon>
              <HelpIcon fontSize="small" sx={{ color: PRIMARY_COLOR }} />
            </ListItemIcon>
            <ListItemText>Help & Support</ListItemText>
          </MenuItem>
          <Divider sx={{ my: 1 }} />
          <MenuItem onClick={handleLogout} sx={{ borderRadius: 0, mx: 0.5, my: 0.25, color: 'error.main' }}>
            <ListItemIcon>
              <LogoutIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>Sign Out</ListItemText>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
} 