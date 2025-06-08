/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary Colors
        'primary': '#2563EB', // Deep blue (primary) - blue-600
        'primary-50': '#EFF6FF', // Very light blue (50-level shade) - blue-50
        'primary-100': '#DBEAFE', // Light blue (100-level shade) - blue-100
        'primary-500': '#3B82F6', // Medium blue (500-level shade) - blue-500
        'primary-700': '#1D4ED8', // Dark blue (700-level shade) - blue-700
        'primary-900': '#1E3A8A', // Very dark blue (900-level shade) - blue-900
        
        // Secondary Colors
        'secondary': '#059669', // Balanced green (secondary) - emerald-600
        'secondary-50': '#ECFDF5', // Very light green (50-level shade) - emerald-50
        'secondary-100': '#D1FAE5', // Light green (100-level shade) - emerald-100
        'secondary-500': '#10B981', // Medium green (500-level shade) - emerald-500
        'secondary-700': '#047857', // Dark green (700-level shade) - emerald-700
        
        // Accent Colors
        'accent': '#DC2626', // Strategic red (accent) - red-600
        'accent-50': '#FEF2F2', // Very light red (50-level shade) - red-50
        'accent-100': '#FEE2E2', // Light red (100-level shade) - red-100
        'accent-500': '#EF4444', // Medium red (500-level shade) - red-500
        
        // Background Colors
        'background': '#FAFBFC', // Soft off-white (background) - slate-50
        'surface': '#FFFFFF', // Pure white (surface) - white
        
        // Text Colors
        'text-primary': '#1F2937', // Near-black (text primary) - gray-800
        'text-secondary': '#6B7280', // Medium gray (text secondary) - gray-500
        
        // Status Colors
        'success': '#10B981', // Vibrant green (success) - emerald-500
        'success-50': '#ECFDF5', // Very light green (success 50) - emerald-50
        'success-100': '#D1FAE5', // Light green (success 100) - emerald-100
        
        'warning': '#F59E0B', // Warm amber (warning) - amber-500
        'warning-50': '#FFFBEB', // Very light amber (warning 50) - amber-50
        'warning-100': '#FEF3C7', // Light amber (warning 100) - amber-100
        
        'error': '#EF4444', // Clear red (error) - red-500
        'error-50': '#FEF2F2', // Very light red (error 50) - red-50
        'error-100': '#FEE2E2', // Light red (error 100) - red-100
        
        // Border Colors
        'border': '#E5E7EB', // Light gray (border) - gray-200
        'border-light': '#F3F4F6', // Very light gray (border light) - gray-100
      },
      fontFamily: {
        'heading': ['Inter', 'sans-serif'],
        'body': ['Inter', 'sans-serif'],
        'caption': ['Inter', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
      fontWeight: {
        'normal': '400',
        'medium': '500',
        'semibold': '600',
        'bold': '700',
      },
      boxShadow: {
        'sm': '0 1px 3px rgba(0, 0, 0, 0.1)',
        'md': '0 4px 6px rgba(0, 0, 0, 0.1)',
        'lg': '0 10px 15px rgba(0, 0, 0, 0.1)',
      },
      animation: {
        'fade-in': 'fadeIn 200ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'slide-up': 'slideUp 300ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'scale-in': 'scaleIn 200ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      scale: {
        '102': '1.02',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      zIndex: {
        '1000': '1000',
        '1100': '1100',
        '1200': '1200',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}