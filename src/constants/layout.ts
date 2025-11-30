/**
 * Layout constants for consistent sizing across the app
 * Use these instead of magic numbers throughout the codebase
 */

export const LAYOUT = {
  // Navigation heights
  HEADER_HEIGHT: 64,
  MOBILE_HEADER_HEIGHT: 56,
  BOTTOM_NAV_HEIGHT: 56,

  // Safe area for bottom navigation
  BOTTOM_NAV_GAP: 16,
  MOBILE_BOTTOM_PADDING: 72, // BOTTOM_NAV_HEIGHT + BOTTOM_NAV_GAP

  // Floating action button positioning
  FAB_BOTTOM_OFFSET: 80,
  FAB_RIGHT_OFFSET: 16,
  FAB_MOBILE_BOTTOM_OFFSET: 72, // Above bottom nav

  // Content max widths
  MAX_CONTENT_WIDTH: 1200,
  NARROW_CONTENT_WIDTH: 800,

  // Sidebar widths
  SIDEBAR_WIDTH: 280,
  SIDEBAR_COLLAPSED_WIDTH: 72,

  // Dialog widths
  DIALOG_SM: 400,
  DIALOG_MD: 600,
  DIALOG_LG: 800,
  DIALOG_XL: 1000,

  // Card dimensions
  TASK_CARD_MIN_HEIGHT: 80,
  NOTE_TAB_HEIGHT: 32,

  // Animation durations (ms)
  TRANSITION_FAST: 150,
  TRANSITION_NORMAL: 300,
  TRANSITION_SLOW: 500,
} as const;

// Type for layout constants
export type LayoutConstant = keyof typeof LAYOUT;
