/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Ensure this matches your file structure
  ],
    darkMode: "class", // <- this enables class-based dark mode
    theme: {
      extend: {
        borderRadius: {
          sm: 'calc(var(--radius) - 4px)',
          md: 'calc(var(--radius) - 2px)',
          lg: 'var(--radius)',
          xl: 'calc(var(--radius) + 4px)',
        },
        colors: {
          background: 'oklch(1 0 0)',
          foreground: 'oklch(0.145 0 0)',
          border: 'oklch(0.85 0 0)',      // Add this
          ring: 'oklch(0.5 0 0)',         // Add this too
          // more as needed...
        }
        
      },
    },
    plugins: [],
  };
  