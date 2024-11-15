/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: 'jit',
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'], // Specify paths
  theme: {
    extend: {},
  },
  plugins: [],
}
