import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import path from 'path';

export default defineConfig({
  plugins: [
    vue(),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    // 启用CSS代码分割
    cssCodeSplit: true,
    // 启用源码映射以便更好的调试
    sourcemap: false,
    // 减小打包体积
    minify: 'terser',
    terserOptions: {
      compress: {
        // 移除console
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
  // 优化页面加载速度和闪烁问题
  css: {
    // 启用CSS模块
    modules: {
      localsConvention: 'camelCaseOnly',
    },
    // 预处理器选项
    preprocessorOptions: {
      scss: {
        additionalData: '',
      },
    },
  },
}); 