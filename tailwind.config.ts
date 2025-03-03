import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        'gray-750': '#2B3544',
      },
      fontFamily: {
        mono: [
          "ui-monospace", 
          "SFMono-Regular", 
          "Menlo", 
          "Monaco", 
          "Consolas", 
          "Liberation Mono", 
          "Courier New", 
          "monospace"
        ],
        heading: [
          "Monaco",
          "Consolas",
          "monospace"
        ],
        body: [
          "Menlo",
          "Liberation Mono",
          "monospace"
        ],
        display: [
          "SFMono-Regular",
          "Courier New",
          "monospace"
        ],
        homeTitle: [
          "Arial Black",
          "Impact",
          "sans-serif"
        ]
      },
      fontSize: {
        'xs': '.75rem',
        'sm': '.775rem',
        'md': '.855rem',
        'base': '1rem',
        'lg': '1.125rem',
        'xl': '1.25rem',
        '2xl': '1.3rem',
        '3xl': '1.4rem',
        '4xl': '1.5rem',
        '5xl': '1.75rem',
        '6xl': '2rem',
      }
    },
  },
  plugins: [require('daisyui')],

  daisyui: {
    themes: ["light", "night", "cyberpunk"], // List of DaisyUI's built-in themes
  },

} satisfies Config;
