/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        board: {
          bg: '#1a1816',
          surface: '#24201d',
          wood: '#2b231c',
          woodLight: '#3d3227',
          line: '#d4af37',
          point: '#8c7853',
          pointHover: '#ffd700',
        },
        piece: {
          white: '#f5f5f7',
          whiteBorder: '#d1d5db',
          black: '#1f242c',
          blackBorder: '#374151',
        }
      },
      boxShadow: {
        'glow-gold': '0 0 20px rgba(212, 175, 55, 0.6)',
        'glow-cyan': '0 0 20px rgba(6, 182, 212, 0.7)',
        'glow-red': '0 0 20px rgba(239, 68, 68, 0.7)',
      }
    },
  },
  plugins: [],
}
