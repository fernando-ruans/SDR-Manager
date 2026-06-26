import type { Config } from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        glow: '0 0 0 1px rgba(34,211,238,0.18), 0 0 40px rgba(34,211,238,0.12)',
      },
      colors: {
        hub: {
          bg: '#050816',
          panel: '#0b1220',
          panelAlt: '#111827',
          border: '#1f2937',
          neon: '#2dd4bf',
          cyan: '#22d3ee',
          amber: '#f59e0b',
          text: '#e5eefc',
          muted: '#8aa0bf',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'ui-sans-serif', 'system-ui'],
        body: ['"Inter"', 'ui-sans-serif', 'system-ui'],
      },
      backgroundImage: {
        'grid-radial':
          'radial-gradient(circle at top, rgba(34,211,238,0.12), transparent 38%), linear-gradient(180deg, rgba(8,15,32,0.96), rgba(5,8,22,1))',
      },
    },
  },
  plugins: [],
} satisfies Config;