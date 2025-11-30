'use client';

import { useTheme, useMediaQuery } from '@mui/material';

/**
 * Unified responsive breakpoint hook
 * Use this throughout the app for consistent mobile/tablet/desktop detection
 *
 * Breakpoints:
 * - isMobile: < 600px (sm)
 * - isTablet: >= 600px and < 1200px (between sm and lg)
 * - isDesktop: >= 1200px (lg and up)
 * - isSmallMobile: < 400px (very small screens like iPhone SE)
 */
export const useResponsive = () => {
  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));        // < 600px
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'lg')); // 600-1199px
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));          // >= 1200px
  const isSmallMobile = useMediaQuery('(max-width: 400px)');            // < 400px

  // Convenience booleans
  const isMobileOrTablet = isMobile || isTablet;
  const isTabletOrDesktop = isTablet || isDesktop;

  return {
    // Core breakpoints
    isMobile,
    isTablet,
    isDesktop,
    isSmallMobile,

    // Convenience combinations
    isMobileOrTablet,
    isTabletOrDesktop,

    // Raw breakpoint values for custom media queries
    breakpoints: {
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  };
};

export default useResponsive;
