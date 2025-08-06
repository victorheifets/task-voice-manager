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
import NotificationsIcon from '@mui/icons-material/Notifications';
import HelpIcon from '@mui/icons-material/Help';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import { useThemeContext } from '../../contexts/ThemeContext';
import { useLanguageContext } from '../../contexts/LanguageContext';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../auth/AuthProvider';
import { supabase } from '@/lib/supabase/client';
import LogoutIcon from '@mui/icons-material/Logout';

export default function Header() {
  const { t } = useTranslation(['common']);
  const { mode, toggleTheme } = useThemeContext();
  const { language, changeLanguage } = useLanguageContext();
  const { user } = useAuth();
  const [settingsAnchorEl, setSettingsAnchorEl] = useState<null | HTMLElement>(null);
  const [langAnchorEl, setLangAnchorEl] = useState<null | HTMLElement>(null);
  const [avatarAnchorEl, setAvatarAnchorEl] = useState<null | HTMLElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Theme-consistent colors - White text on blue background for light mode
  const PRIMARY_COLOR = theme.palette.mode === 'dark' ? '#9e9e9e' : '#ffffff'; // White for light mode
  const ICON_COLOR = theme.palette.mode === 'dark' ? '#9e9e9e' : '#ffffff'; // Ensure icons are white in light mode
  const ICON_BG_COLOR = theme.palette.mode === 'dark' ? 'rgba(77, 208, 225, 0.12)' : 'rgba(255, 255, 255, 0.15)';
  const ICON_BORDER_COLOR = theme.palette.mode === 'dark' ? 'rgba(77, 208, 225, 0.3)' : 'rgba(255, 255, 255, 0.3)';

  const handleSettingsClick = (event: React.MouseEvent<HTMLElement>) => {
    setSettingsAnchorEl(event.currentTarget);
  };

  const handleSettingsClose = () => {
    setSettingsAnchorEl(null);
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
        backgroundColor: theme.palette.mode === 'dark' ? '#1a1a1a !important' : '#2196F3 !important', // Force colors
        borderBottom: `1px solid ${theme.palette.divider}`,
        color: theme.palette.mode === 'dark' ? '#9e9e9e !important' : '#ffffff !important', // Force text colors
        '& .MuiToolbar-root': {
          color: theme.palette.mode === 'dark' ? '#9e9e9e !important' : '#ffffff !important'
        }
      }}
    >
      <Toolbar sx={{ 
        justifyContent: 'space-between', 
        py: 1,
        maxWidth: '1600px',
        width: '100%',
        mx: 'auto'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <TaskAltIcon 
            sx={{ 
              mr: 1.5, 
              color: PRIMARY_COLOR,
              fontSize: '2rem'
            }} 
          />
          <Typography 
            variant="h6" 
            component="h1" 
            sx={{ 
              fontWeight: 600,
              color: PRIMARY_COLOR,
              letterSpacing: '0.5px'
            }}
          >
            {t('app.title')}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
                  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(144, 202, 249, 0.2)' : 'rgba(255, 255, 255, 0.2)',
                  borderColor: PRIMARY_COLOR,
                  transform: 'translateY(-2px)'
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
                  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(144, 202, 249, 0.2)' : 'rgba(255, 255, 255, 0.2)',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              <TranslateIcon sx={{ color: theme.palette.mode === 'dark' ? '#9e9e9e' : '#ffffff' }} />
            </IconButton>
          </Tooltip>
          {!isMobile && (
            <Badge badgeContent={2} color="error" sx={{ mx: 1 }}>
              <IconButton 
                color="inherit"
                size="medium"
                sx={{ 
                  borderRadius: '50%',
                  padding: '8px',
                  backgroundColor: ICON_BG_COLOR,
                  transition: 'all 0.2s',
                  '&:hover': {
                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(144, 202, 249, 0.2)' : 'rgba(255, 255, 255, 0.2)',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                <NotificationsIcon sx={{ color: theme.palette.mode === 'dark' ? '#9e9e9e' : '#ffffff' }} />
              </IconButton>
            </Badge>
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
                transition: 'all 0.2s',
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(144, 202, 249, 0.2)' : 'rgba(255, 255, 255, 0.2)',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              <SettingsIcon sx={{ color: theme.palette.mode === 'dark' ? '#9e9e9e' : '#ffffff' }} />
            </IconButton>
          </Tooltip>
          {!isMobile && (
            <Tooltip title="Account">
              <Avatar 
                onClick={handleAvatarClick}
                sx={{ 
                  ml: 1, 
                  width: 36, 
                  height: 36,
                  border: `2px solid ${theme.palette.mode === 'dark' ? '#9e9e9e' : '#ffffff'}`,
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
          )}
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
              borderRadius: 2,
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
              borderRadius: '6px',
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
              borderRadius: '8px',
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
              borderRadius: '6px',
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
        {/* Settings Menu */}
        <Menu
          anchorEl={settingsAnchorEl}
          open={Boolean(settingsAnchorEl)}
          onClose={handleSettingsClose}
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
              minWidth: 180,
              overflow: 'visible',
              borderRadius: '12px',
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
          <MenuItem onClick={handleSettingsClose} sx={{ borderRadius: '8px', mx: 0.5, my: 0.25 }}>
            <ListItemIcon>
              <PersonIcon fontSize="small" sx={{ color: PRIMARY_COLOR }} />
            </ListItemIcon>
            <ListItemText>{t('menu.profile')}</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleSettingsClose} sx={{ borderRadius: '8px', mx: 0.5, my: 0.25 }}>
            <ListItemIcon>
              <SettingsIcon fontSize="small" sx={{ color: PRIMARY_COLOR }} />
            </ListItemIcon>
            <ListItemText>{t('menu.settings')}</ListItemText>
          </MenuItem>
          <Divider sx={{ my: 1 }} />
          <MenuItem onClick={handleSettingsClose} sx={{ borderRadius: '8px', mx: 0.5, my: 0.25 }}>
            <ListItemIcon>
              <HelpIcon fontSize="small" sx={{ color: PRIMARY_COLOR }} />
            </ListItemIcon>
            <ListItemText>{t('menu.help')}</ListItemText>
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
              borderRadius: '12px',
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
          <MenuItem onClick={handleAvatarClose} sx={{ borderRadius: '8px', mx: 0.5, my: 0.25 }}>
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
          <MenuItem onClick={handleLogout} sx={{ borderRadius: '8px', mx: 0.5, my: 0.25, color: 'error.main' }}>
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