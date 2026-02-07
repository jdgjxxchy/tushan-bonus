import { createLocalFontProcessor } from '@unocss/preset-web-fonts/local'
import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetTypography,
  presetWebFonts,
  presetWind4,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

export default defineConfig({
  shortcuts: [
    ['btn', 'px-6 py-2 rounded-lg inline-block bg-teal-600 text-white cursor-pointer hover:bg-teal-700 hover:shadow-md transition-all duration-300 disabled:cursor-default disabled:bg-gray-300 disabled:opacity-50 border-none font-medium'],
    ['btn-secondary', 'px-6 py-2 rounded-lg inline-block bg-white text-teal-600 border border-teal-600/20 cursor-pointer hover:bg-teal-50 hover:border-teal-600/40 transition-all duration-300'],
    ['icon-btn', 'inline-block cursor-pointer select-none opacity-75 transition duration-200 ease-in-out hover:opacity-100 hover:text-teal-600'],
    ['card', 'bg-white rounded-xl shadow-sm p-6 border border-gray-100'],
    ['input', 'px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white transition-all text-gray-900 placeholder:text-gray-400'],
    ['title', 'text-2xl font-bold font-display text-teal-700'],
  ],
  theme: {
    colors: {
      // Custom colors if needed, but tailwind colors usually suffice
    },
  },
  presets: [
    presetWind4(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
    }),
    presetTypography(),
    presetWebFonts({
      fonts: {
        sans: 'DM Sans',
        serif: 'DM Serif Display',
        mono: 'DM Mono',
        display: 'Outfit', // A nice display font
      },
      processors: createLocalFontProcessor(),
    }),
  ],
  transformers: [
    transformerDirectives(),
    transformerVariantGroup(),
  ],
})
