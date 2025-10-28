import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
	],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        'sans': ['var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        'heading': ['var(--font-source-sans)', 'var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'xs': ['var(--font-size-xs)', { lineHeight: 'var(--line-height-normal)' }],
        'sm': ['var(--font-size-sm)', { lineHeight: 'var(--line-height-normal)' }],
        'base': ['var(--font-size-base)', { lineHeight: 'var(--line-height-relaxed)' }],
        'lg': ['var(--font-size-lg)', { lineHeight: 'var(--line-height-relaxed)' }],
        'xl': ['var(--font-size-xl)', { lineHeight: 'var(--line-height-normal)' }],
        '2xl': ['var(--font-size-2xl)', { lineHeight: 'var(--line-height-tight)' }],
        '3xl': ['var(--font-size-3xl)', { lineHeight: 'var(--line-height-tight)' }],
        '4xl': ['var(--font-size-4xl)', { lineHeight: 'var(--line-height-tight)' }],
        '5xl': ['var(--font-size-5xl)', { lineHeight: 'var(--line-height-tight)' }],
        // Fluid typography using clamp()
        'fluid-sm': ['clamp(0.875rem, 2.5vw, 1rem)', { lineHeight: 'var(--line-height-normal)' }],
        'fluid-base': ['clamp(1rem, 2.5vw, 1.125rem)', { lineHeight: 'var(--line-height-relaxed)' }],
        'fluid-lg': ['clamp(1.125rem, 3vw, 1.5rem)', { lineHeight: 'var(--line-height-relaxed)' }],
        'fluid-xl': ['clamp(1.25rem, 4vw, 1.875rem)', { lineHeight: 'var(--line-height-normal)' }],
        'fluid-2xl': ['clamp(1.5rem, 5vw, 2.25rem)', { lineHeight: 'var(--line-height-tight)' }],
        'fluid-3xl': ['clamp(1.875rem, 6vw, 3rem)', { lineHeight: 'var(--line-height-tight)' }],
        'fluid-4xl': ['clamp(2.25rem, 8vw, 3.75rem)', { lineHeight: 'var(--line-height-tight)' }],
        'fluid-5xl': ['clamp(3rem, 10vw, 4.5rem)', { lineHeight: 'var(--line-height-tight)' }],
      },
      fontWeight: {
        'light': 'var(--font-weight-light)',
        'normal': 'var(--font-weight-normal)',
        'medium': 'var(--font-weight-medium)',
        'semibold': 'var(--font-weight-semibold)',
      },
      lineHeight: {
        'tight': 'var(--line-height-tight)',
        'normal': 'var(--line-height-normal)',
        'relaxed': 'var(--line-height-relaxed)',
        'loose': 'var(--line-height-loose)',
      },
      letterSpacing: {
        'tight': 'var(--letter-spacing-tight)',
        'normal': 'var(--letter-spacing-normal)',
        'wide': 'var(--letter-spacing-wide)',
        'wider': 'var(--letter-spacing-wider)',
        'widest': 'var(--letter-spacing-widest)',
      },
      screens: {
        'xs': '475px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
        // Custom breakpoints for specific use cases
        'mobile': {'max': '767px'},
        'tablet': {'min': '768px', 'max': '1023px'},
        'desktop': {'min': '1024px'},
        'touch': {'max': '1023px'}, // For touch devices
      },
      spacing: {
        // Fluid spacing utilities
        'fluid-1': 'clamp(0.25rem, 1vw, 0.5rem)',
        'fluid-2': 'clamp(0.5rem, 1.5vw, 1rem)',
        'fluid-3': 'clamp(0.75rem, 2vw, 1.5rem)',
        'fluid-4': 'clamp(1rem, 2.5vw, 2rem)',
        'fluid-5': 'clamp(1.25rem, 3vw, 2.5rem)',
        'fluid-6': 'clamp(1.5rem, 3.5vw, 3rem)',
        'fluid-8': 'clamp(2rem, 4vw, 4rem)',
        'fluid-10': 'clamp(2.5rem, 5vw, 5rem)',
        'fluid-12': 'clamp(3rem, 6vw, 6rem)',
        'fluid-16': 'clamp(4rem, 8vw, 8rem)',
        'fluid-20': 'clamp(5rem, 10vw, 10rem)',
        // Touch-friendly sizes
        'touch-sm': '40px',
        'touch-md': '44px',
        'touch-lg': '48px',
        'touch-xl': '56px',
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        surface: "#F9FBFD",
      },
      boxShadow: {
        soft: "0 8px 20px -12px rgba(15,23,42,0.18), 0 24px 44px -24px rgba(15,23,42,0.14)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        blob: {
          "0%": {
            transform: "translate(0px, 0px) scale(1)",
          },
          "33%": {
            transform: "translate(30px, -50px) scale(1.1)",
          },
          "66%": {
            transform: "translate(-20px, 20px) scale(0.9)",
          },
          "100%": {
            transform: "translate(0px, 0px) scale(1)",
          },
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "blob": "blob 7s infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
