/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        chawarma: {
          dark: '#0d0d11',
          card: '#16161c',
          cardHover: '#1c1c24',
          border: 'rgba(255, 215, 120, 0.12)',
          borderHover: 'rgba(245, 179, 58, 0.35)',
          gold: '#e6a838',
          goldLight: '#f6c368',
          goldDark: '#b87c1c',
          amber: '#f59e0b',
          cream: '#f9f6f0',
          muted: '#9a9aa3',
          whatsapp: '#25D366',
          whatsappHover: '#20ba59',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Cinzel', 'Playfair Display', 'serif'],
      },
      boxShadow: {
        'gold-glow': '0 0 25px -5px rgba(230, 168, 56, 0.25)',
        'gold-sm': '0 0 10px rgba(230, 168, 56, 0.2)',
        'whatsapp-glow': '0 4px 20px -2px rgba(37, 211, 102, 0.35)',
      }
    },
  },
  plugins: [],
}
