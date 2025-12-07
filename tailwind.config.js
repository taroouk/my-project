/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // Add any custom dark mode specific colors or styles here if needed
    },
  },
  plugins: [], // Added dark mode variant
  darkMode: 'class',
};
