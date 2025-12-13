/**
 * Theme Configuration
 * 
 * Centralized theme configuration for the application.
 * This file exports all theme-related constants and utilities.
 */

export * from './colors';

// Theme configuration object
export const theme = {
  colors: {
    primary: '#060771',
    secondary: '#FFE08F',
    orange: '#FF6C0C',
    danger: '#BF1A1A',
    accent: {
      blue: '#3B82F6',
      indigo: '#6366F1',
      purple: '#8B5CF6',
      pink: '#EC4899',
      teal: '#14B8A6',
      cyan: '#06B6D4',
    },
    warning: '#FF6C0C', // Same as orange
    success: '#22C55E',
    info: '#3B82F6',
    gray: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 48,
    '3xl': 64,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    '2xl': 24,
    full: 9999,
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  fontWeight: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 8,
    },
  },
  loaders: {
    xs: {
      size: 12,
      borderWidth: 1.5,
    },
    sm: {
      size: 16,
      borderWidth: 2,
    },
    md: {
      size: 20,
      borderWidth: 2.5,
    },
    lg: {
      size: 24,
      borderWidth: 3,
    },
    xl: {
      size: 32,
      borderWidth: 3.5,
    },
  },
} as const;

export default theme;

