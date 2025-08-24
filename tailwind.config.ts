import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        'display': ['Gilroy', 'Poppins', 'Inter', '-apple-system', 'system-ui', 'sans-serif'],
        'sans': ['Inter', '-apple-system', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display': 'clamp(48px, 9vw, 124px)',
        'display-sm': 'clamp(28px, 4vw, 56px)',
      },
      letterSpacing: {
        'tight': '-0.02em',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        '2xl': '24px',
      },
      backdropBlur: {
        '20': '20px',
      },
      boxShadow: {
        'soft-3d': '0 20px 60px rgba(0,0,0,0.35)',
        'glass': '0 8px 30px rgba(0,0,0,0.25)',
      },
      colors: {
        // Brand colors
        'white': '#FFFFFF',
        'orchid': '#D174D2',
        'coral': '#E0563F', 
        'steel': '#3F567F',
        'plum': '#412653',
        'black-90': 'rgba(0,0,0,0.9)',
        'white-80': 'rgba(255,255,255,0.8)',
        'white-20': 'rgba(255,255,255,0.2)',
        'white-10': 'rgba(255,255,255,0.1)',
        
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      backgroundImage: {
        'app-gradient': 'linear-gradient(115deg, #2C3E57 0%, #3F567F 25%, #4B3B7A 55%, #412653 100%)',
        'hero-overlay': 'radial-gradient(closest-side at 65% 30%, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.0) 70%)',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
