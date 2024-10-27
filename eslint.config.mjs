// @ts-check
import antfu from '@antfu/eslint-config';
import {FlatCompat} from '@eslint/eslintrc';

const compat = new FlatCompat();

export default antfu(
  {
    type: 'app',
    ignores: ['public'],
    unocss: true,
    formatters: {
      css: true,
    },
    stylistic: {
      quotes: 'single',
      semi: true,
    },
    jsonc: false,
    yaml: false,
  },
  ...compat.config({
    extends: [
      './.eslintrc-auto-import.json',
    ],
  }),
  {
    files: ['**/*.vue'],
    rules: {
      'vue/object-curly-spacing': ['error', 'never'],
      'vue/block-order': ['error', {order: ['template', 'script', 'style']}],
    },
  },
  {
    rules: {
      'no-console': 'off',
      'ts/explicit-function-return-type': 'off',
      'eslint-comments/no-unlimited-disable': 'off',
      'style/object-curly-spacing': ['error', 'never'],
      'style/block-spacing': ['error', 'never'],
      'style/brace-style': ['error', '1tbs', {allowSingleLine: true}],
    },
  },
);
