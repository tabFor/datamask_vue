import { createApp } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import router from './router'
import axios from 'axios'

const app = createApp(App)

app.use(ElementPlus)
app.use(router)

app.config.globalProperties.$axios = axios

// 添加全局错误处理器来抑制 ResizeObserver 警告
const originalConsoleError = console.error;
console.error = (...args) => {
  if (args.length > 0 && typeof args[0] === 'string' && args[0].includes('ResizeObserver loop')) {
    // 忽略 ResizeObserver 循环警告
    return;
  }
  originalConsoleError.apply(console, args);
};

app.mount('#app')
