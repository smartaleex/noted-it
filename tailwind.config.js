/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#12151b',
          2: '#4b5563',
          3: '#8b95a5',
        },
        paper: '#f7f8fa',
        line: '#e3e7ed',
        accent: {
          DEFAULT: '#2f5bd7',
          soft: '#eef2fd',
          mid: '#c3d0f5',
        },
        safe: { DEFAULT: '#0f7b56', soft: '#e8f6f0' },
        warn: { DEFAULT: '#a45b09', soft: '#fdf3e3' },
        danger: { DEFAULT: '#b3261e', soft: '#fdeceb' },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['Spectral', 'Georgia', 'serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(16,24,40,.05), 0 1px 3px rgba(16,24,40,.06)',
        panel: '-8px 0 40px rgba(16,24,40,.10)',
      },
    },
  },
  plugins: [],
}
