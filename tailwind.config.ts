import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#1B2A4A',
          dark: '#111d35',
          light: '#2a3d63',
        },
        amber: {
          DEFAULT: '#D4A843',
          dark: '#b88e35',
        },
      },
    },
  },
  plugins: [],
};

export default config;
