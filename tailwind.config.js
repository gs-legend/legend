module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    themeVariants: ['dark', 'neon'],
    extend: {},
  },
  plugins: [],
  variants: {
    backgroundColor: ['responsive', 'hover', 'focus', 'dark', 'dark:hover', 'dark:focus'],
    textColor: ['responsive', 'hover', 'focus', 'dark', 'dark:hover', 'dark:focus'],
  },
};
