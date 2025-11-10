/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#030014',
        secondary: '#151312',
        accent: '#AB8BFF',
        light: {
          100: '#D6c6ff',
          200: '#a8b5db',
          300: '#9ca4ab',
        },
        dark: {
          100: '#221f3d',
          200: '#0f0d24',
        },
      },
    },
  },
  plugins: [],
};
