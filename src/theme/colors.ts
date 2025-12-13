/**
 * Theme Colors Configuration
 * 
 * This file defines the color palette for the application.
 * Colors are organized by purpose and can be used throughout the app.
 */

// Primary Color Palette (based on #060771)
export const primary = {
  50: '#E6E7F5',
  100: '#CCCFEB',
  200: '#999FD7',
  300: '#666FC3',
  400: '#333FAF',
  500: '#060771', // Main primary color
  600: '#05065A',
  700: '#040443',
  800: '#03032D',
  900: '#020116',
};

// Secondary Color Palette (based on #FFE08F)
export const secondary = {
  50: '#FFFBF5',
  100: '#FFF7EB',
  200: '#FFEFD7',
  300: '#FFE7C3',
  400: '#FFDFAF',
  500: '#FFE08F', // Main secondary color
  600: '#CCB472',
  700: '#998855',
  800: '#665C38',
  900: '#33301C',
};

// Third Color Palette (based on #FF6C0C - Orange)
export const orange = {
  50: '#FFF5F0',
  100: '#FFEBE1',
  200: '#FFD7C3',
  300: '#FFC3A5',
  400: '#FFAF87',
  500: '#FF6C0C', // Main orange color
  600: '#CC560A',
  700: '#994107',
  800: '#662B05',
  900: '#331602',
};

// Fourth Color Palette (based on #BF1A1A - Red)
export const danger = {
  50: '#F5E6E6',
  100: '#EBCCCC',
  200: '#D79999',
  300: '#C36666',
  400: '#AF3333',
  500: '#BF1A1A', // Main danger/red color
  600: '#991515',
  700: '#731010',
  800: '#4D0B0B',
  900: '#260505',
};

// Accent Colors
export const accent = {
  blue: '#3B82F6',
  indigo: '#6366F1',
  purple: '#8B5CF6',
  pink: '#EC4899',
  teal: '#14B8A6',
  cyan: '#06B6D4',
};

// Warning Color (using orange as warning - same as orange palette)
export const warning = {
  50: '#FFF5F0',
  100: '#FFEBE1',
  200: '#FFD7C3',
  300: '#FFC3A5',
  400: '#FFAF87',
  500: '#FF6C0C', // Main warning color (same as orange)
  600: '#CC560A',
  700: '#994107',
  800: '#662B05',
  900: '#331602',
};

export const success = {
  50: '#F0FDF4',
  100: '#DCFCE7',
  200: '#BBF7D0',
  300: '#86EFAC',
  400: '#4ADE80',
  500: '#22C55E', // Main success color
  600: '#16A34A',
  700: '#15803D',
  800: '#166534',
  900: '#14532D',
};

export const info = {
  50: '#EFF6FF',
  100: '#DBEAFE',
  200: '#BFDBFE',
  300: '#93C5FD',
  400: '#60A5FA',
  500: '#3B82F6', // Main info color
  600: '#2563EB',
  700: '#1D4ED8',
  800: '#1E40AF',
  900: '#1E3A8A',
};

// Neutral/Gray Colors
export const gray = {
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
};

// Dark Mode Colors
export const dark = {
  background: '#0F172A',
  surface: '#1E293B',
  surfaceVariant: '#334155',
  text: '#F1F5F9',
  textSecondary: '#CBD5E1',
  border: '#334155',
  divider: '#475569',
};

// Light Mode Colors
export const light = {
  background: '#FFFFFF',
  surface: '#F9FAFB',
  surfaceVariant: '#F3F4F6',
  text: '#111827',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  divider: '#D1D5DB',
};

// Export all colors as a single object for easy access
export const colors = {
  primary,
  secondary,
  orange,
  danger,
  accent,
  warning,
  success,
  info,
  gray,
  dark,
  light,
};

// Type definitions for TypeScript
export type ColorPalette = typeof colors;
export type PrimaryColor = keyof typeof primary;
export type SecondaryColor = keyof typeof secondary;
export type OrangeColor = keyof typeof orange;
export type DangerColor = keyof typeof danger;
export type WarningColor = keyof typeof warning;
export type SuccessColor = keyof typeof success;
export type InfoColor = keyof typeof info;
export type GrayColor = keyof typeof gray;

