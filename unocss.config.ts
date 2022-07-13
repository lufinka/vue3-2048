import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetTypography,
  presetUno,
  presetWebFonts,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

export default defineConfig({
  shortcuts: [
    ['btn', 'px-4 py-1 rounded inline-block bg-teal-700 text-white cursor-pointer hover:bg-teal-800 disabled:cursor-default disabled:bg-gray-600 disabled:opacity-50'],
    ['icon-btn', 'inline-block cursor-pointer select-none opacity-75 transition duration-200 ease-in-out hover:opacity-100 hover:text-teal-600'],
  ],
  rules: [
    [/^wh-(\d+)$/, ([, d]) => ({ width: `${d}px` })],
    [/^hh-(\d+)$/, ([, d]) => ({ height: `${d}px` })],
    [/^mg-(\d+)$/, ([, d]) => ({ margin: `${d}px` })],
    [/^pd-(\d+)$/, ([, d]) => ({ padding: `${d}px` })],
    [/^mxw-(\d+)$/, ([, d]) => ({ 'max-width': `${d}px` })],
    [/^vw-(\d+)$/, ([, d]) => ({ width: `${d}vw` })],
    [/^vh-(\d+)$/, ([, d]) => ({ height: `${d}vw` })],
  ],
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
      warn: true,
    }),
    presetTypography(),
    presetWebFonts({
      fonts: {
        sans: 'DM Sans',
        serif: 'DM Serif Display',
        mono: 'DM Mono',
      },
    }),
  ],
  transformers: [
    transformerDirectives(),
    transformerVariantGroup(),
  ],
  safelist: 'prose prose-sm m-auto text-left'.split(' '),
  theme: {
    extend: {
      screens: {
        mobile: {
          raw: 'screen and (min-width: 320px) and (max-width: 900px)',
        },
      },
    },
  },
})
