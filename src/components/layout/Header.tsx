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
  Button,
  alpha
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import TranslateIcon from '@mui/icons-material/Translate';
import PersonIcon from '@mui/icons-material/Person';
import NotificationsIcon from '@mui/icons-material/Notifications';
import HelpIcon from '@mui/icons-material/Help';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import { useThemeContext } from '../../contexts/ThemeContext';
import { useLanguageContext } from '../../contexts/LanguageContext';
import { useTranslation } from 'react-i18next';

interface HeaderProps {
  narrowMode?: boolean;
  onToggleNarrowMode?: () => void;
}

export default function Header({ narrowMode = false, onToggleNarrowMode }: HeaderProps = {}) {
  const { t } = useTranslation(['common']);
  const { mode, toggleTheme } = useThemeContext();
  const { language, changeLanguage } = useLanguageContext();
  const [settingsAnchorEl, setSettingsAnchorEl] = useState<null | HTMLElement>(null);
  const [langAnchorEl, setLangAnchorEl] = useState<null | HTMLElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Use theme colors instead of hardcoded values
  const primaryColor = theme.palette.primary.main;

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

  const handleLanguageChange = (lang: 'en' | 'es' | 'fr') => {
    changeLanguage(lang);
    handleLangMenuClose();
  };

  return (
    <AppBar 
      position="static" 
      color="inherit" 
      elevation={mode === 'light' ? 1 : 0}
      sx={{
        backdropFilter: 'blur(10px)',
        backgroundColor: theme.palette.background.default,
        borderBottom: `1px solid ${theme.palette.divider}`
      }}
    >
      <Toolbar sx={{ 
        justifyContent: 'space-between', 
        py: 1,
        px: 3,
        width: '100%'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <TaskAltIcon 
            sx={{ 
              mr: 1.5, 
              color: primaryColor,
              fontSize: '2rem'
            }} 
          />
          <Typography 
            variant="h6" 
            component="h1" 
            sx={{ 
              fontWeight: 600,
              color: primaryColor,
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
                borderRadius: '12px',
                padding: '8px',
                backgroundColor: alpha(primaryColor, 0.1),
                border: `1px solid ${alpha(primaryColor, 0.25)}`,
                transition: 'all 0.2s',
                '&:hover': {
                  backgroundColor: alpha(primaryColor, 0.15),
                  borderColor: primaryColor,
                }
              }}
            >
              {mode === 'light' 
                ? <DarkModeIcon sx={{ color: primaryColor }} /> 
                : <LightModeIcon sx={{ color: '#FFB74D' }} />
              }
            </IconButton>
          </Tooltip>
          {!isMobile && onToggleNarrowMode && (
            <Tooltip title={narrowMode ? "Wide Screen" : "Narrow Screen"}>
              <IconButton 
                onClick={onToggleNarrowMode} 
                color="inherit" 
                size="medium"
                sx={{ 
                  borderRadius: '12px',
                  padding: '8px',
                  backgroundColor: alpha(primaryColor, 0.1),
                  border: `1px solid ${alpha(primaryColor, 0.25)}`,
                  transition: 'all 0.2s',
                  '&:hover': {
                    backgroundColor: alpha(primaryColor, 0.15),
                    borderColor: primaryColor,
                  }
                }}
              >
                {narrowMode 
                  ? <FullscreenIcon sx={{ color: primaryColor }} /> 
                  : <FullscreenExitIcon sx={{ color: primaryColor }} />
                }
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title={t('language.select')}>
            <IconButton 
              onClick={handleLangMenuOpen} 
              color="inherit"
              size={isMobile ? 'small' : 'medium'}
              sx={{ 
                borderRadius: '50%',
                padding: '8px',
                backgroundColor: alpha(primaryColor, 0.2),
                transition: 'all 0.2s',
                '&:hover': {
                  backgroundColor: alpha(primaryColor, 0.3),
                  transform: 'translateY(-2px)'
                }
              }}
            >
              <TranslateIcon sx={{ color: primaryColor }} />
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
                  backgroundColor: mode === 'light' 
                    ? alpha(primaryColor, 0.2)
                    : alpha(primaryColor, 0.2),
                  transition: 'all 0.2s',
                  '&:hover': {
                    backgroundColor: mode === 'light' 
                      ? alpha(primaryColor, 0.3)
                      : alpha(primaryColor, 0.3),
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                <NotificationsIcon sx={{ color: primaryColor }} />
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
                backgroundColor: alpha(primaryColor, 0.2),
                transition: 'all 0.2s',
                '&:hover': {
                  backgroundColor: alpha(primaryColor, 0.3),
                  transform: 'translateY(-2px)'
                }
              }}
            >
              <SettingsIcon sx={{ color: primaryColor }} />
            </IconButton>
          </Tooltip>
          {!isMobile && (
            <Avatar 
              sx={{ 
                ml: 1, 
                width: 36, 
                height: 36,
                border: `2px solid ${primaryColor}`,
                cursor: 'pointer',
                transition: 'transform 0.2s',
                backgroundColor: primaryColor,
                '&:hover': {
                  transform: 'scale(1.1)'
                }
              }}
            >
              U
            </Avatar>
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
                backgroundColor: alpha(primaryColor, mode === 'light' ? 0.2 : 0.3),
              },
              '&:hover': {
                backgroundColor: alpha(primaryColor, mode === 'light' ? 0.15 : 0.2),
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
                backgroundColor: alpha(primaryColor, mode === 'light' ? 0.15 : 0.2),
              },
              '&:hover': {
                backgroundColor: mode === 'light' 
                  ? alpha(primaryColor, 0.1)
                  : alpha(primaryColor, 0.15),
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
                backgroundColor: alpha(primaryColor, mode === 'light' ? 0.2 : 0.3),
              },
              '&:hover': {
                backgroundColor: alpha(primaryColor, mode === 'light' ? 0.15 : 0.2),
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
              <PersonIcon fontSize="small" sx={{ color: primaryColor }} />
            </ListItemIcon>
            <ListItemText>{t('menu.profile')}</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleSettingsClose} sx={{ borderRadius: '8px', mx: 0.5, my: 0.25 }}>
            <ListItemIcon>
              <SettingsIcon fontSize="small" sx={{ color: primaryColor }} />
            </ListItemIcon>
            <ListItemText>{t('menu.settings')}</ListItemText>
          </MenuItem>
          <Divider sx={{ my: 1 }} />
          <MenuItem onClick={handleSettingsClose} sx={{ borderRadius: '8px', mx: 0.5, my: 0.25 }}>
            <ListItemIcon>
              <HelpIcon fontSize="small" sx={{ color: primaryColor }} />
            </ListItemIcon>
            <ListItemText>{t('menu.help')}</ListItemText>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
} 