/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Plant Theme Colors
        primary: {
          DEFAULT: '#2d6a4f',
          dark: '#1b4332',
          light: '#52b788',
        },
        secondary: {
          DEFAULT: '#52b788',
          light: '#95d5b2',
          lighter: '#d8f3dc',
        },
        accent: {
          DEFAULT: '#95d5b2',
          sage: '#74c69d',
        },
        forest: {
          DEFAULT: '#2d6a4f',
          deep: '#1b4332',
          light: '#40916c',
        },
        mint: {
          DEFAULT: '#95d5b2',
          light: '#d8f3dc',
          dark: '#74c69d',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
