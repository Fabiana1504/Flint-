import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        nimiq: {
          yellow: '#F5A623',
          'yellow-light': '#FEF3DC',
        },
        background: '#FAFAF8',
        surface: '#FFFFFF',
        'text-primary': '#1A1A1A',
        'text-secondary': '#6B7280',
        border: '#E5E7EB',
        success: '#10B981',
        error: '#EF4444',
      },
      fontFamily: {
        display: ['Sora', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      fontSize: {
        'display': ['2.25rem', { fontWeight: '700', lineHeight: '1.2' }],
        'h2': ['1.5rem', { fontWeight: '600', lineHeight: '1.3' }],
        'h3': ['1.125rem', { fontWeight: '600', lineHeight: '1.4' }],
        'body': ['1rem', { fontWeight: '400', lineHeight: '1.6' }],
        'label': ['0.875rem', { fontWeight: '500', lineHeight: '1.4' }],
      },
      borderRadius: {
        '2xl': '1rem',
        'full': '9999px',
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
      },
      maxWidth: {
        'app': '430px',
      },
    },
  },
  plugins: [],
}

export default config
