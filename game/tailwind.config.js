/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Design Tokens - Single Source of Truth
      colors: {
        // Semantic colors (Lane A - Event Status)
        success: 'rgb(var(--success) / <alpha-value>)',
        warn: 'rgb(var(--warn) / <alpha-value>)',
        error: 'rgb(var(--error) / <alpha-value>)',
        
        // Brand accent (Lane C - Your Status + CTA)
        accent: {
          50: 'rgb(var(--accent) / 0.05)',
          100: 'rgb(var(--accent) / 0.1)',
          500: 'rgb(var(--accent) / 0.5)',
          600: 'rgb(var(--accent))',
          700: 'rgb(var(--accent) / 0.8)',
          800: 'rgb(var(--accent) / 0.9)',
          900: 'rgb(var(--accent) / 0.95)',
        },
        
        // Neutral palette (Lane B - Availability + general)
        fg: 'rgb(var(--fg))',
        'fg-muted': 'rgb(var(--fg-muted))',
        bg: {
          DEFAULT: 'rgb(var(--bg))',
          muted: 'rgb(var(--bg-muted))',
        },
        surface: 'rgb(var(--surface))',
        border: 'rgb(var(--border))',
        divider: 'rgb(var(--divider))',
      },
      // Typography Scale (Inter)
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto']
      },
      fontSize: {
        h1: ['2rem', { lineHeight: '1.2', fontWeight: '600' }], // 32px mobile
        h2: ['1.5rem', { lineHeight: '1.25', fontWeight: '600' }], // 24px
        h3: ['1.25rem', { lineHeight: '1.3', fontWeight: '600' }], // 20px
        body: ['1rem', { lineHeight: '1.5', fontWeight: '400' }], // 16px
        sm: ['0.875rem', { lineHeight: '1.45', fontWeight: '400' }], // 14px
        caption: ['0.75rem', { lineHeight: '1.4', fontWeight: '500' }], // 12px
      },
      letterSpacing: {
        tight: '-0.01em', // Display sizes (H1/H2)
        normal: '0',
        wide: '0.04em', // All-caps micro labels only (use sparingly)
      },
      // Border radius
      borderRadius: {
        card: '12px',
        button: '12px',
        chip: '8px',
      },
      
      // Shadows
      boxShadow: {
        card: '0 2px 8px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 8px 24px rgba(0, 0, 0, 0.08)',
        button: '0 1px 3px rgba(0, 0, 0, 0.1)',
      },
      // Spacing (8-pt grid)
      spacing: {
        '0.5': '2px',   // Fine adjustments
        '1': '4px',     // Fine adjustments
        '1.5': '6px',   // Fine adjustments
        '2': '8px',     // Base grid unit
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '7': '28px',
        '8': '32px',
        '9': '36px',
        '10': '40px',
        '11': '44px',   // Touch target height
        '12': '48px',
        '14': '56px',
        '16': '64px',
        '20': '80px',
        '24': '96px',
        '28': '112px',
        '32': '128px',
      },
      // Animation durations
      transitionDuration: {
        fast: '150ms',
        '170': '170ms',
        normal: '180ms',
        '200': '200ms',
      },
      // Max widths
      maxWidth: {
        card: '480px',
        page: '1200px',
      },
      
      // Z-index scale
      zIndex: {
        toast: '50',
        modal: '40',
        overlay: '30',
        dropdown: '20',
        sticky: '10',
      }
    },
  },
  plugins: [
    // Custom utilities
    function({ addUtilities, theme }) {
      const newUtilities = {
        '.seat-count': {
          'font-variant-numeric': 'tabular-nums',
          'font-feature-settings': '"tnum" 1',
        },
        '.motion-safe\\:animate-pulse': {
          '@media (prefers-reduced-motion: no-preference)': {
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          },
        },
        '.motion-safe\\:animate-bounce': {
          '@media (prefers-reduced-motion: no-preference)': {
            animation: 'bounce 1s infinite',
          },
        },
      }
      addUtilities(newUtilities)
    }
  ]
}

