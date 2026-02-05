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
    ['btn', 'px-6 py-2 rounded-full inline-block bg-gradient-to-r from-teal-400 to-blue-500 text-white cursor-pointer hover:from-teal-500 hover:to-blue-600 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 disabled:cursor-default disabled:bg-gray-600 disabled:opacity-50 border-none'],
    ['btn-secondary', 'px-6 py-2 rounded-full inline-block bg-white text-teal-600 border border-teal-100 cursor-pointer hover:bg-teal-50 hover:shadow-md transition-all duration-300'],
    ['icon-btn', 'inline-block cursor-pointer select-none opacity-75 transition duration-200 ease-in-out hover:opacity-100 hover:text-teal-600'],
    ['card', 'bg-white/80 backdrop-blur-md rounded-xl shadow-lg p-6 border border-white/20'],
    ['input', 'px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white/80 backdrop-blur-sm transition-all text-gray-900 placeholder:text-gray-400'],
    ['title', 'text-2xl font-bold font-display text-gray-900'],
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
