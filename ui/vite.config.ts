import { defineConfig } from 'vite';
import vueJsx from '@vitejs/plugin-vue-jsx';
import UnoCSS from 'unocss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/ui/',
  plugins: [
    vueJsx(),
    UnoCSS(),
  ],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
