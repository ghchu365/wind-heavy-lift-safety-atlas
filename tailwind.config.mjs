import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        navy: { 950: '#040E1A', 900: '#06152B', 800: '#0B1F3A', 700: '#122E52' },
        steel: { 700: '#374151', 600: '#4B5563', 500: '#6B7280', 400: '#9CA3AF', 300: '#D1D5DB' },
        orange: { safety: '#F97316', safetyLight: '#FB923C', safetyDark: '#EA580C' },
        cyan: { wind: '#22D3EE', windDark: '#06B6D4', windDim: '#0891B2' },
      },
      fontFamily: {
        display: ['"Chakra Petch"', '"Noto Sans SC"', 'sans-serif'],
        body: ['"Noto Sans SC"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'path-draw': 'pathDraw 3s ease-out forwards',
        'fade-up': 'fadeUp 0.8s ease-out forwards',
        'fade-in': 'fadeIn 1s ease-out forwards',
        'stagger-1': 'fadeUp 0.8s ease-out 0.1s forwards',
        'stagger-2': 'fadeUp 0.8s ease-out 0.2s forwards',
        'stagger-3': 'fadeUp 0.8s ease-out 0.3s forwards',
        'stagger-4': 'fadeUp 0.8s ease-out 0.4s forwards',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'slide-right': 'slideRight 1.5s ease-out forwards',
        'scan-line': 'scanLine 8s linear infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        pathDraw: { '0%': { strokeDashoffset: '1000' }, '100%': { strokeDashoffset: '0' } },
        fadeUp: { '0%': { opacity: '0', transform: 'translateY(30px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        glow: { '0%': { boxShadow: '0 0 5px rgba(249,115,22,0.3)' }, '100%': { boxShadow: '0 0 20px rgba(249,115,22,0.6)' } },
        slideRight: { '0%': { transform: 'translateX(-100%)', opacity: '0' }, '100%': { transform: 'translateX(0)', opacity: '1' } },
        scanLine: { '0%': { transform: 'translateY(-100%)' }, '100%': { transform: 'translateY(100%)' } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
      },
    },
  },
  plugins: [],
} satisfies Config;
