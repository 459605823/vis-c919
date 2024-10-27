import {URL, fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import {cwd} from 'node:process';
import {defineConfig} from 'vite';
import vue from '@vitejs/plugin-vue';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import {AntDesignVueResolver} from 'unplugin-vue-components/resolvers';
import {createSvgIconsPlugin} from 'vite-plugin-svg-icons';
import Unocss from 'unocss/vite';
import VueRouter from 'unplugin-vue-router/vite';
import {VueRouterAutoImports} from 'unplugin-vue-router';
import legacy from '@vitejs/plugin-legacy';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: '',
        changeOrigin: true,
        secure: false,
        rewrite: path => path.replace(/^\/api/, ''),
      },
    },
  },
  plugins: [
    legacy({
      targets: ['defaults', 'not IE 11'],
    }),
    VueRouter({
      dts: 'src/typed-router.d.ts',
    }),
    vue(),
    AutoImport({
      imports: ['vue', VueRouterAutoImports],
      dts: 'src/auto-imports.d.ts',
      eslintrc: {
        enabled: true,
        filepath: './.eslintrc-auto-import.json',
        globalsPropValue: true,
      },
    }),
    Components({
      types: [],
      directoryAsNamespace: true,
      collapseSamePrefixes: true,
      globalNamespaces: ['charts'],
      dts: 'src/components.d.ts',
      resolvers: [
        AntDesignVueResolver({
          importStyle: false,
        }),
      ],
    }),
    createSvgIconsPlugin({
      iconDirs: [resolve(cwd(), 'src/assets/svgs')],
      symbolId: 'icon-[dir]-[name]',
    }),
    Unocss(),
  ],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import '@/styles/utils.scss';`,
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
