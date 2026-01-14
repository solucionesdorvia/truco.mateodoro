import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
        // Semantic colors (shadcn)
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
        
        // Truco Design System
        noche: {
          DEFAULT: '#0a0f1a',
          50: '#1a2235',
          100: '#151c2c',
          200: '#111827',
          300: '#0d1220',
          400: '#0a0f1a',
          500: '#070b14',
          600: '#05080f',
          700: '#03050a',
          800: '#020305',
          900: '#010102',
        },
        paño: {
          DEFAULT: '#1a472a',
          50: '#2d7a4a',
          100: '#276841',
          200: '#225738',
          300: '#1d4e31',
          400: '#1a472a',
          500: '#163d24',
          600: '#12331e',
          700: '#0e2918',
          800: '#0a1f12',
          900: '#06150c',
        },
        celeste: {
          DEFAULT: '#67b7d1',
          light: '#8ed0e5',
          dark: '#4a9ab4',
        },
        naipe: {
          DEFAULT: '#f5f0e1',
          50: '#fdfcf9',
          100: '#faf8f2',
          200: '#f7f4eb',
          300: '#f5f0e1',
          400: '#e8dcc8',
          500: '#dbc8af',
          600: '#c9b496',
          700: '#b79f7d',
          800: '#a58a64',
          900: '#8a724f',
        },
        oro: {
          DEFAULT: '#d4a853',
          light: '#e5c77a',
          dark: '#b8860b',
          muted: '#a68942',
        },
        
        // Team colors
        equipoA: {
          DEFAULT: '#3b82f6',
          bg: 'rgba(59, 130, 246, 0.1)',
          border: 'rgba(59, 130, 246, 0.3)',
        },
        equipoB: {
          DEFAULT: '#ef4444',
          bg: 'rgba(239, 68, 68, 0.1)',
          border: 'rgba(239, 68, 68, 0.3)',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'monospace'],
        display: ['var(--font-display)', 'Impact', 'Haettenschweiler', 'sans-serif'],
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        club: '0.625rem', // 10px - más "club" que startup
      },
      boxShadow: {
        'mesa': '0 4px 20px rgba(26, 71, 42, 0.3)',
        'naipe': '0 2px 8px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2)',
        'chip': '0 2px 4px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        'glow-oro': '0 0 20px rgba(212, 168, 83, 0.4)',
        'glow-paño': '0 0 30px rgba(26, 71, 42, 0.5)',
      },
      backgroundImage: {
        'paño-texture': 'linear-gradient(135deg, #1a472a 0%, #163d24 50%, #1a472a 100%)',
        'mesa-radial': 'radial-gradient(ellipse at center, #1d4e31 0%, #1a472a 50%, #163d24 100%)',
        'naipe-gradient': 'linear-gradient(180deg, #fdfcf9 0%, #f5f0e1 100%)',
        'noche-gradient': 'linear-gradient(180deg, #1a2235 0%, #0a0f1a 100%)',
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
      },
      animation: {
        'card-deal': 'cardDeal 0.5s ease-out forwards',
        'card-play': 'cardPlay 0.3s ease-out forwards',
        'chip-bounce': 'chipBounce 0.4s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'accordion-down': 'accordionDown 0.2s ease-out',
        'accordion-up': 'accordionUp 0.2s ease-out',
      },
      keyframes: {
        cardDeal: {
          '0%': { transform: 'translateY(-100px) rotate(-10deg) scale(0.5)', opacity: '0' },
          '100%': { transform: 'translateY(0) rotate(0) scale(1)', opacity: '1' },
        },
        cardPlay: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1) translateY(-20px)' },
          '100%': { transform: 'scale(0.8) translateY(0)' },
        },
        chipBounce: {
          '0%': { transform: 'scale(0.8) translateY(20px)', opacity: '0' },
          '60%': { transform: 'scale(1.1) translateY(-5px)' },
          '100%': { transform: 'scale(1) translateY(0)', opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(212, 168, 83, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(212, 168, 83, 0.6)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        accordionDown: {
          '0%': { height: '0' },
          '100%': { height: 'var(--radix-accordion-content-height)' },
        },
        accordionUp: {
          '0%': { height: 'var(--radix-accordion-content-height)' },
          '100%': { height: '0' },
        },
      },
  	}
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
