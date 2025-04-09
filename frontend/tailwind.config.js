/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: "class", // <- this enables class-based dark mode
    theme: {
      extend: {},
    },
    plugins: [],
  };
  