import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: 'rgb(var(--color-brand-primary) / <alpha-value>)',
          gold: 'rgb(var(--color-brand-accent) / <alpha-value>)',
        },
        surface: {
          primary: 'rgb(var(--color-bg-primary) / <alpha-value>)',
          secondary: 'rgb(var(--color-bg-secondary) / <alpha-value>)',
          card: 'rgb(var(--color-bg-card) / <alpha-value>)',
        },
        content: {
          primary: 'rgb(var(--color-text-primary) / <alpha-value>)',
          secondary: 'rgb(var(--color-text-secondary) / <alpha-value>)',
        },
        'table-stripe': 'rgb(var(--color-table-stripe) / <alpha-value>)',
        'table-hover': 'rgb(var(--color-table-hover) / <alpha-value>)',
        border: {
          DEFAULT: 'rgb(var(--color-border) / <alpha-value>)',
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
export default config
