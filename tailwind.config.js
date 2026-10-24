/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        canvas:   '#09090b',
        surface:  '#111115',
        raised:   '#18181d',
        subtle:   '#1f1f26',
        hover:    '#26262f',
        accent:   '#6366f1',
        'accent-text': '#a5b4fc',
        green:    '#22c55e',
        amber:    '#f59e0b',
        danger:   '#ef4444',
        dim:      '#3f3f46',
        muted:    '#71717a',
        secondary:'#a1a1aa',
        primary:  '#fafafa',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '10px',
        sm: '6px',
        md: '10px',
        lg: '14px',
        xl: '18px',
      },
      fontSize: {
        '2xs': ['10.5px', { lineHeight: '1.4', letterSpacing: '0.01em' }],
        xs:    ['12px',   { lineHeight: '1.5' }],
        sm:    ['13px',   { lineHeight: '1.5' }],
        base:  ['14px',   { lineHeight: '1.6' }],
        lg:    ['16px',   { lineHeight: '1.5', letterSpacing: '-0.01em' }],
        xl:    ['18px',   { lineHeight: '1.4', letterSpacing: '-0.02em' }],
        '2xl': ['22px',   { lineHeight: '1.3', letterSpacing: '-0.02em' }],
        '3xl': ['28px',   { lineHeight: '1.2', letterSpacing: '-0.03em' }],
      },
      boxShadow: {
        sm:     '0 1px 3px rgba(0,0,0,0.5), 0 1px 2px rgba(0,0,0,0.4)',
        md:     '0 4px 12px rgba(0,0,0,0.5), 0 2px 4px rgba(0,0,0,0.4)',
        lg:     '0 12px 32px rgba(0,0,0,0.55), 0 4px 8px rgba(0,0,0,0.35)',
        accent: '0 0 0 1px rgba(99,102,241,0.35), 0 8px 24px rgba(99,102,241,0.10)',
        focus:  '0 0 0 3px rgba(99,102,241,0.20)',
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      animation: {
        'fade-up': 'fade-up 300ms cubic-bezier(0.16,1,0.3,1) both',
        'fade-in': 'fade-in 200ms cubic-bezier(0.16,1,0.3,1) both',
        'spin-slow': 'spin 0.8s linear infinite',
        'pulse-live': 'pulse-green 2s ease-in-out infinite',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        'pulse-green': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(34,197,94,0.4)' },
          '50%':       { boxShadow: '0 0 0 4px rgba(34,197,94,0)' },
        },
      },
    },
  },
  plugins: [],
}
