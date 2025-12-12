// StakeVue Design System - Premium Crypto UI
// Inspired by award-winning designs with clean, minimal aesthetics

export const colors = {
  // Primary palette - Deep dark with single accent
  background: {
    primary: '#0a0a0a',
    secondary: '#111111',
    tertiary: '#1a1a1a',
    elevated: '#1f1f1f',
  },

  // Text colors - High contrast
  text: {
    primary: '#ffffff',
    secondary: 'rgba(255, 255, 255, 0.7)',
    tertiary: 'rgba(255, 255, 255, 0.5)',
    muted: 'rgba(255, 255, 255, 0.3)',
  },

  // Single accent color - Purple/Violet
  accent: {
    primary: '#8b5cf6',
    hover: '#a78bfa',
    muted: 'rgba(139, 92, 246, 0.15)',
    glow: 'rgba(139, 92, 246, 0.4)',
  },

  // Status colors - Purple theme
  status: {
    success: '#a78bfa',
    successMuted: 'rgba(167, 139, 250, 0.15)',
    error: '#f472b6',
    errorMuted: 'rgba(244, 114, 182, 0.15)',
    warning: '#c4b5fd',
    warningMuted: 'rgba(196, 181, 253, 0.15)',
  },

  // Border colors
  border: {
    default: 'rgba(255, 255, 255, 0.08)',
    hover: 'rgba(255, 255, 255, 0.15)',
    focus: 'rgba(139, 92, 246, 0.5)',
  },

  // Light mode (if needed)
  light: {
    background: {
      primary: '#fafafa',
      secondary: '#f5f5f5',
      tertiary: '#eeeeee',
    },
    text: {
      primary: '#0a0a0a',
      secondary: 'rgba(10, 10, 10, 0.7)',
      tertiary: 'rgba(10, 10, 10, 0.5)',
    },
  },
};

export const typography = {
  // Font families
  fontFamily: {
    display: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
    body: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
    mono: '"JetBrains Mono", "Fira Code", monospace',
  },

  // Font sizes - Modular scale
  fontSize: {
    xs: '0.75rem',     // 12px
    sm: '0.875rem',    // 14px
    base: '1rem',      // 16px
    lg: '1.125rem',    // 18px
    xl: '1.25rem',     // 20px
    '2xl': '1.5rem',   // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
    '5xl': '3rem',     // 48px
    '6xl': '3.75rem',  // 60px
    '7xl': '4.5rem',   // 72px
    '8xl': '6rem',     // 96px
    '9xl': '8rem',     // 128px
  },

  // Font weights
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    black: 900,
  },

  // Line heights
  lineHeight: {
    none: 1,
    tight: 1.1,
    snug: 1.25,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },

  // Letter spacing
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
};

export const spacing: Record<number, string> = {
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  7: '1.75rem',   // 28px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
  32: '8rem',     // 128px
  40: '10rem',    // 160px
  48: '12rem',    // 192px
};

export const layout = {
  maxWidth: '1440px',
  contentWidth: '1200px',
  narrowWidth: '800px',

  borderRadius: {
    none: '0',
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    '2xl': '24px',
    full: '9999px',
  },

  container: {
    padding: {
      mobile: '20px',
      tablet: '40px',
      desktop: '60px',
    },
  },
};

export const effects = {
  // Transitions
  transition: {
    fast: '150ms ease',
    normal: '300ms ease',
    slow: '500ms ease',
    slower: '700ms ease',

    // Cubic bezier for smooth animations
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  },

  // Shadows
  shadow: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.5)',
    md: '0 4px 6px rgba(0, 0, 0, 0.4)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.3)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.25)',
    glow: '0 0 40px rgba(139, 92, 246, 0.3)',
    glowStrong: '0 0 60px rgba(139, 92, 246, 0.5)',
  },

  // Blur
  blur: {
    sm: '4px',
    md: '8px',
    lg: '16px',
    xl: '24px',
  },
};

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// Media query helpers
export const media = {
  sm: `@media (min-width: ${breakpoints.sm})`,
  md: `@media (min-width: ${breakpoints.md})`,
  lg: `@media (min-width: ${breakpoints.lg})`,
  xl: `@media (min-width: ${breakpoints.xl})`,
  '2xl': `@media (min-width: ${breakpoints['2xl']})`,
};

// Z-index scale
export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  modal: 1200,
  popover: 1300,
  tooltip: 1400,
  cursor: 9999,
};

// Animation presets for GSAP
export const animations = {
  // Fade in from bottom
  fadeInUp: {
    from: { opacity: 0, y: 60 },
    to: { opacity: 1, y: 0 },
    duration: 1,
    ease: 'power3.out',
  },

  // Scale in
  scaleIn: {
    from: { opacity: 0, scale: 0.9 },
    to: { opacity: 1, scale: 1 },
    duration: 0.8,
    ease: 'power2.out',
  },

  // Parallax speed presets
  parallax: {
    slow: 0.3,
    medium: 0.5,
    fast: 0.8,
  },

  // Stagger delays
  stagger: {
    fast: 0.05,
    normal: 0.1,
    slow: 0.15,
  },
};

export default {
  colors,
  typography,
  spacing,
  layout,
  effects,
  breakpoints,
  media,
  zIndex,
  animations,
};
