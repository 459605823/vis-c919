import {
  defineConfig,
  presetAttributify,
  presetUno,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss';

export default defineConfig({
  presets: [presetUno(), presetAttributify()],
  rules: [
    ['font-din', {'font-family': 'DINAlternate-Bold'}],
    ['font-ysbt', {'font-family': 'YSBT'}],
    ['bg-fill', {'background-size': '100% 100%'}],
  ],
  shortcuts: {
    'center': 'flex items-center justify-center',
    'font-number': 'font-din font-bold',
  },
  transformers: [transformerVariantGroup(), transformerDirectives()],
});
