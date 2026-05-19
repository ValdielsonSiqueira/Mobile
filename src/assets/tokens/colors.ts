export const palette = {
  primary: {
    DEFAULT: '#3b82f6',
    light: '#bfdbfe',
    transparent: '#3b82f620',
  },
  success: {
    DEFAULT: '#22c55e',
    transparent: '#22c55e20',
  },
  danger: {
    DEFAULT: '#ef4444',
    transparent: '#ef444420',
  },
  warning: {
    DEFAULT: '#fbbf24', // amber-400
  },
  categories: {
    orange: '#f97316',
    violet: '#8b5cf6',
    pink: '#ec4899',
    cyan: '#06b6d4',
    purple: '#a855f7',
    indigo: '#6366f1',
    green600: '#16a34a',
    green700: '#15803d',
  },
  white: '#ffffff',
  black: '#000000',
  slate: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    400: '#94a3b8',
    500: '#64748b',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  }
};

export const themeColors = {
  light: {
    background: palette.slate[50],
    card: palette.white,
    textMain: palette.slate[900],
    textSub: palette.slate[500],
    border: palette.slate[200],
    tabBarActive: palette.primary.DEFAULT,
    tabBarInactive: palette.slate[400],
    tabBarBg: palette.white,
  },
  dark: {
    background: palette.slate[900],
    card: palette.slate[800],
    textMain: palette.slate[100],
    textSub: palette.slate[400],
    border: palette.slate[700],
    tabBarActive: palette.primary.DEFAULT,
    tabBarInactive: palette.slate[500],
    tabBarBg: palette.slate[900],
  }
};
