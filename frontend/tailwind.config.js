/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
      animation: {
        'spin-ruleta': 'spin-ruleta 4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'fade-in': 'fade-in 0.5s ease-out',
        'float-particle': 'float-particle 2s ease-out infinite',
        'orbit': 'orbit 3s linear infinite',
        'confetti-fall': 'confetti-fall 3s linear infinite',
        'bounce-in': 'bounce-in 0.6s ease-out',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
      keyframes: {
        'spin-ruleta': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(1800deg)' }
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        'float-particle': {
          '0%': { 
            transform: 'translateY(0px) scale(0)', 
            opacity: '1' 
          },
          '50%': { 
            transform: 'translateY(-100px) scale(1)', 
            opacity: '0.8' 
          },
          '100%': { 
            transform: 'translateY(-200px) scale(0)', 
            opacity: '0' 
          }
        },
        'orbit': {
          '0%': { transform: 'translate(-50%, -50%) rotate(0deg) translateX(150px) rotate(0deg)' },
          '100%': { transform: 'translate(-50%, -50%) rotate(360deg) translateX(150px) rotate(-360deg)' }
        },
        'confetti-fall': {
          '0%': { 
            transform: 'translateY(-10px) rotate(0deg)', 
            opacity: '1' 
          },
          '100%': { 
            transform: 'translateY(100vh) rotate(720deg)', 
            opacity: '0' 
          }
        },
        'bounce-in': {
          '0%': { 
            transform: 'scale(0.3) translateY(-100px)', 
            opacity: '0' 
          },
          '50%': { 
            transform: 'scale(1.05) translateY(0px)', 
            opacity: '1' 
          },
          '70%': { 
            transform: 'scale(0.95)', 
            opacity: '1' 
          },
          '100%': { 
            transform: 'scale(1)', 
            opacity: '1' 
          }
        },
        'pulse-glow': {
          '0%, 100%': { 
            boxShadow: '0 0 20px rgba(232, 172, 210, 0.4)' 
          },
          '50%': { 
            boxShadow: '0 0 40px rgba(232, 172, 210, 0.8)' 
          }
        }
      },
      backdropBlur: {
        'xs': '2px',
      }
    },
  },
  plugins: [],
}