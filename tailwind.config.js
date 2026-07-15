/** @type {import('tailwindcss').Config} */
export default {
  // Aquí le decimos a Tailwind qué archivos debe revisar para aplicar estilos
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Aquí puedes personalizar colores o fuentes más adelante
    },
  },
  plugins: [],
}