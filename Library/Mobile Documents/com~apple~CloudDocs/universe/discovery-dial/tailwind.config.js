/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
    "./app/**/*.{js,jsx}",
    "./pages/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  safelist: [
    // Positioning classes (critical for dial layout)
    'relative',
    'absolute',
    'fixed',
    'left-1/2',
    'top-1/2',
    '-translate-x-1/2',
    '-translate-y-1/2',
    'inset-0',
    // Text opacity variants
    'text-white',
    'text-white/60',
    'text-white/70',
    'text-white/80',
    'text-white/90',
    'text-white/95',
    // Responsive text sizes
    'text-[11px]',
    'text-sm',
    'text-base',
    'text-2xl',
    'text-3xl',
    'md:text-sm',
    'md:text-base',
    'md:text-3xl',
    // Layout utilities
    'pointer-events-none',
    'select-none',
    'z-10',
    'z-20',
    // Mobile-specific
    'min-h-screen',
    'h-screen',
    'w-full',
    'flex',
    'flex-col',
    'items-center',
    'justify-center',
    'overflow-hidden'
  ]
}

