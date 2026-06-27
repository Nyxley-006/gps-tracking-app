export const theme = {

   // ════════════════════════════════════════
   //  COLORS
   // ════════════════════════════════════════
   colors: {

      // Backgrounds
      bgPrimary: '#0a0a0a',
      bgSecondary: '#0d0d0d',
      bgCard: '#111111',
      bgSidebar: '#080808',
      bgHover: '#1a1a1a',
      bgInput: '#0d0d0d',

      // Neon Colors
      neonGreen: '#00ff41',
      neonCyan: '#00ffff',
      neonRed: '#ff003c',
      neonOrange: '#ff6600',
      neonBlue: '#0066ff',
      neonPurple: '#9900ff',

      // Main Brand
      primary: '#00ff41',
      primaryDark: '#00b32c',
      primaryGlow: 'rgba(0, 255, 65, 0.15)',

      // Status
      success: '#00ff41',
      warning: '#ff6600',
      danger: '#ff003c',
      info: '#00ffff',

      // Text
      textPrimary: '#e0e0e0',
      textSecondary: '#666666',
      textMuted: '#333333',
      textNeon: '#00ff41',

      // Borders
      border: '#1a1a1a',
      borderNeon: 'rgba(0, 255, 65, 0.3)',
      borderGlow: 'rgba(0, 255, 65, 0.6)'
   },

   // ════════════════════════════════════════
   //  TYPOGRAPHY
   // ════════════════════════════════════════
   fonts: {
      mono: "'Courier New', 'Lucida Console', monospace",
      main: "'Share Tech Mono', monospace",
      code: "'Fira Code', monospace"
   },

   fontSizes: {
      xs: '10px',
      sm: '12px',
      md: '14px',
      lg: '16px',
      xl: '20px',
      xxl: '24px',
      huge: '32px'
   },

   // ════════════════════════════════════════
   //  SPACING
   // ════════════════════════════════════════
   spacing: {
      xs: '4px',
      sm: '8px',
      md: '16px',
      lg: '24px',
      xl: '32px',
      xxl: '48px'
   },

   // ════════════════════════════════════════
   //  BORDERS & RADIUS
   // ════════════════════════════════════════
   radius: {
      sm: '4px',
      md: '6px',
      lg: '8px',
      xl: '12px',
      full: '50%'
   },

   borders: {
      default: '1px solid #1a1a1a',
      neon: '1px solid rgba(0, 255, 65, 0.3)',
      active: '1px solid #00ff41'
   },

   // ════════════════════════════════════════
   //  SHADOWS & GLOWS
   // ════════════════════════════════════════
   shadows: {
      card: '0 4px 20px rgba(0, 0, 0, 0.8)',
      neonGreen: '0 0 10px rgba(0, 255, 65, 0.5)',
      neonCyan: '0 0 10px rgba(0, 255, 255, 0.5)',
      neonRed: '0 0 10px rgba(255, 0, 60, 0.5)',
      neonOrange: '0 0 10px rgba(255, 102, 0, 0.5)',
      glow: '0 0 20px rgba(0, 255, 65, 0.3)',
      glowLg: '0 0 40px rgba(0, 255, 65, 0.2)'
   },

   // ════════════════════════════════════════
   //  LAYOUT
   // ════════════════════════════════════════
   layout: {
      sidebarWidth: '260px',
      sidebarCollapsedWidth: '60px',
      headerHeight: '56px'
   },

   // ════════════════════════════════════════
   //  TRANSITIONS
   // ════════════════════════════════════════
   transitions: {
      fast: 'all 0.15s ease',
      normal: 'all 0.25s ease',
      slow: 'all 0.4s ease'
   }
};

export default theme;