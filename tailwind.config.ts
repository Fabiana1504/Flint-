import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        nimiq: {
          yellow:        '#F5A623',
          'yellow-dim':  '#E8951A',
          'yellow-light':'#FEF3DC',
          dark:          '#18181B',
          'dark-2':      '#1C1C28',
        },
        background:       '#F0EFE9',
        surface:          '#FFFFFF',
        'text-primary':   '#18181B',
        'text-secondary': '#71717A',
        'text-muted':     '#A1A1AA',
        border:           '#E4E4E7',
        success:          '#10B981',
        error:            '#EF4444',
        cat: {
          testing: '#A855F7',
          design:  '#EC4899',
          writing: '#3B82F6',
          survey:  '#14B8A6',
          dev:     '#F97316',
        },
      },
      fontFamily: {
        display: ['Sora', 'sans-serif'],
        body:    ['Inter', 'sans-serif'],
      },
      borderRadius: {
        '3xl': '1.25rem',
        '4xl': '1.5rem',
        '5xl': '2rem',
      },
      boxShadow: {
        'card':    '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'card-md': '0 4px 20px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)',
        'card-lg': '0 8px 32px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.05)',
        'yellow':  '0 4px 20px rgba(245,166,35,0.45)',
        'yellow-lg':'0 8px 32px rgba(245,166,35,0.50)',
        'glow':    '0 0 40px rgba(245,166,35,0.20)',
        'inner-sm':'inset 0 1px 2px rgba(0,0,0,0.05)',
      },
      maxWidth: { app: '430px' },
    },
  },
  plugins: [],
}

export default config
