/**
 * App color palette and typography definitions.
 * Organized by light/dark theme variants.
 */

import { Platform } from 'react-native';

const tintColorLight = '#11181C';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#111827',
    textMuted: '#6B7280',
    background: '#F9FAFB',
    card: '#FFFFFF',
    cardSecondary: '#F3F4F6',
    border: '#E5E7EB',
    primary: '#FF2E2E',
    success: '#10B981',
    warning: '#FF9F43',
    tint: '#FF2E2E',
    icon: '#6B7280',
    tabIconDefault: '#9CA3AF',
    tabIconSelected: '#FF2E2E',
  },
  dark: {
    text: '#FFFFFF',
    textMuted: '#8B8FA3',
    background: '#0F1017',
    card: '#161825',
    cardSecondary: '#1E2030',
    border: '#2A2D3E',
    primary: '#FF2E2E',
    success: '#10B981',
    warning: '#FF9F43',
    tint: '#FF2E2E',
    icon: '#8B8FA3',
    tabIconDefault: '#8B8FA3',
    tabIconSelected: '#FFFFFF',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
