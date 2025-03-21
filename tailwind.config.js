/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{tsx,html}"],
  darkMode: "media",
  theme: {
    extend: {
      zIndex: {
        1: "1",
        100: "100",
        max: "2147483647"
      }
    }
  }
}
