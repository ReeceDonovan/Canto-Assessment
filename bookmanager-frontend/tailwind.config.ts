/** @type {import('tailwindcss').Config} */
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  // darkMode: 'selector', // Enable dark mode
  darkMode: 'class', // Enable dark mode
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      colors: {
        'dark-gray': '#1a1a1a',
        'light-gray': '#f5f5f5',
        'light-gray-2': '#e0e0e0',
      },
    },
  },
  plugins: [],
}

export default config;
