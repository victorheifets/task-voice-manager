/**
 * Spacing constants for consistent padding/margins across the app
 * Based on 8px grid system
 * Use these with MUI's sx prop: sx={{ p: SPACING.CARD_PADDING }}
 */

// Base unit is 8px (MUI default)
const BASE_UNIT = 8;

export const SPACING = {
  // Container padding (responsive values for sx prop)
  CONTAINER_PADDING: {
    xs: 1.5,  // 12px
    sm: 2,    // 16px
    md: 3,    // 24px
    lg: 4,    // 32px
  },

  // Card padding
  CARD_PADDING: {
    xs: 2,    // 16px
    sm: 2.5,  // 20px
    md: 3,    // 24px
  },

  CARD_PADDING_COMPACT: {
    xs: 1.5,  // 12px
    sm: 2,    // 16px
    md: 2.5,  // 20px
  },

  // Tab panel padding
  TAB_PANEL_PADDING: {
    xs: 1.5,  // 12px - consistent across ALL tabs
    sm: 2,    // 16px
    md: 3,    // 24px
    lg: 4,    // 32px
  },

  // Gap between elements
  GAP_SM: 1,    // 8px
  GAP_MD: 2,    // 16px
  GAP_LG: 3,    // 24px
  GAP_XL: 4,    // 32px

  // Section spacing
  SECTION_MARGIN: {
    xs: 2,    // 16px
    sm: 3,    // 24px
    md: 4,    // 32px
  },

  // Input field spacing
  INPUT_SPACING: 2, // 16px between form fields

  // List item spacing
  LIST_ITEM_PADDING: {
    xs: 1,    // 8px
    sm: 1.5,  // 12px
    md: 2,    // 16px
  },

  // Icon button padding
  ICON_BUTTON_PADDING: 1, // 8px

  // Chip/tag spacing
  CHIP_SPACING: 0.5, // 4px gap between chips
} as const;

// Helper to convert spacing units to pixels
export const toPixels = (units: number): number => units * BASE_UNIT;

// Type for spacing constants
export type SpacingKey = keyof typeof SPACING;
