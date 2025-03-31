import { createApp } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import router from './router'
import axios from 'axios'
import 'nprogress/nprogress.css'
import './assets/nprogress-custom.css'

// 导入日志工具和调试配置
import logger from './utils/logger'
import { DEBUG_ENABLED } from './utils/debugConfig'

// 应用初始化
const app = createApp(App)

app.use(ElementPlus)
app.use(router)

app.config.globalProperties.$axios = axios
// 将日志工具添加到全局属性
app.config.globalProperties.$logger = logger

// 输出应用启动日志
logger.info('应用启动中...', {
  mode: process.env.NODE_ENV,
  debug: DEBUG_ENABLED ? '已启用' : '已禁用'
})

// 添加全局错误处理器来抑制 ResizeObserver 警告
const originalConsoleError = console.error;
console.error = (...args) => {
  if (args.length > 0 && typeof args[0] === 'string' && args[0].includes('ResizeObserver loop')) {
    // 忽略 ResizeObserver 循环警告
    return;
  }
  originalConsoleError.apply(console, args);
};

// 预加载关键资源
const preloadImages = () => {
  // 预加载背景图和关键图片资源
  const images = [];
  for (let i = 0; i < images.length; i++) {
    const img = new Image();
    img.src = images[i];
  }
};

// 在DOM内容加载完成后预加载资源
document.addEventListener('DOMContentLoaded', preloadImages);

// 在路由准备好后挂载应用
router.isReady().then(() => {
  app.mount('#app');
  
  // 触发预渲染完成事件
  document.dispatchEvent(new Event('render-event'));
  
  // 记录应用启动完成
  logger.info('应用加载完成');
});
