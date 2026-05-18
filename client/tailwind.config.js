/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // ДОДАЄМО КЛЮЧОВІ КАДРИ ДЛЯ АНІМАЦІЇ
      keyframes: {
        'fade-in-up': {
          '0%': { 
            opacity: '0', 
            transform: 'translateY(20px)' 
          },
          '100%': { 
            opacity: '1', 
            transform: 'translateY(0)' 
          },
        }
      },
      // ПОВ'ЯЗУЄМО КАДРИ З НАЗВОЮ КЛАСУ ТА ЧАСОМ
      animation: {
        'fade-in-up': 'fade-in-up 0.3s ease-out forwards',
      },
    },
  },
  plugins: [],
}