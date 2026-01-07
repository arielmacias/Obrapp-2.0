/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        surface: "hsl(var(--color-surface))",
        bg: "hsl(var(--color-bg))",
        text: "hsl(var(--color-text))",
        muted: "hsl(var(--color-muted))",
        accent: "hsl(var(--color-accent))",
        border: "hsl(var(--color-border))"
      },
      boxShadow: {
        card: "0 18px 50px -30px rgba(15, 23, 42, 0.35)"
      }
    }
  },
  plugins: []
};
