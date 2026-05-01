import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        bg: '#F4F3F8',
        sidebar: '#FFFFFF',
        border: '#F0EEF8',
        brand: {
          DEFAULT: '#7C3AED',
          hover: '#6D28D9',
        },
        text: {
          DEFAULT: '#1A1A2E',
          muted: '#9CA3AF',
          secondary: '#6B7280',
        },
      },
      fontFamily: {
        unbounded: ['var(--font-unbounded)', 'sans-serif'],
        poppins: ['var(--font-poppins)', 'sans-serif'],
      },
      borderRadius: {
        card: '12px',
        item: '10px',
        avatar: '8px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.05)',
        'card-hover': '0 4px 16px rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
}

export default config
