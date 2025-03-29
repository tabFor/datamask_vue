<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import { RouterView } from 'vue-router';
import request from '@/utils/request';

export default defineComponent({
  name: 'App',
  components: {
    RouterView,
  },
  created() {
    this.checkLoginStatus();
  },
  methods: {
    async checkLoginStatus() {
      try {
        const response = await request.get('/api/check-login');
        
        if (!response.data.isLoggedIn) {
          // 未登录，跳转到登录页
          this.$router.push('/login');
        } else {
          // 已登录，存储用户信息
          localStorage.setItem('username', response.data.username);
          
          // 如果响应中包含角色信息，存储用户角色
          if (response.data.role) {
            localStorage.setItem('userRole', response.data.role);
          }
        }
      } catch (error) {
        console.error('登录校验失败:', error);
      }
    }
  }
});
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin: 0;
  padding: 0;
  min-height: 100vh;
}

/* 全局样式 */
:root {
  --primary-color: #1a237e;
  --primary-light: #3949ab;
  --text-primary: #1a237e;
  --text-secondary: #666;
  --background-light: #f5f7fa;
  --background-dark: #e4e7eb;
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--background-light);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: var(--primary-color);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--primary-light);
}

/* 全局过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 全局卡片样式 */
.el-card {
  border: none;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
}

.el-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

/* 全局按钮样式 */
.el-button {
  border-radius: 8px;
  font-weight: 500;
  letter-spacing: 0.5px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.el-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.el-button:active {
  transform: translateY(0);
}

/* 全局表格样式 */
.el-table {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.el-table th {
  background-color: rgba(26, 35, 126, 0.04);
  color: var(--text-primary);
  font-weight: 500;
  padding: 16px;
}

.el-table td {
  padding: 16px;
  transition: background-color 0.3s ease;
}

.el-table tr:hover td {
  background-color: rgba(26, 35, 126, 0.02);
}

/* 全局输入框样式 */
.el-input__wrapper,
.el-select__wrapper {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 8px;
}

.el-input__wrapper:hover,
.el-select__wrapper:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.el-input__wrapper.is-focus,
.el-select__wrapper.is-focus {
  box-shadow: 0 0 0 3px rgba(26, 35, 126, 0.15);
}

/* 全局标签样式 */
.el-tag {
  border-radius: 6px;
  padding: 0 12px;
  height: 28px;
  line-height: 26px;
  font-weight: 500;
}

/* 全局对话框样式 */
.el-dialog {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
}

.el-dialog__header {
  background: var(--primary-color);
  padding: 20px 24px;
  margin: 0;
}

.el-dialog__title {
  color: white;
  font-weight: 500;
  font-size: 20px;
}

.el-dialog__body {
  padding: 24px;
}

.el-dialog__footer {
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  padding: 16px 24px;
}

/* 全局分页样式 */
.el-pagination {
  --el-pagination-button-bg-color: var(--background-light);
  --el-pagination-hover-color: var(--primary-color);
  --el-pagination-active-bg-color: var(--primary-color);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .el-card {
    border-radius: 8px;
  }
  
  .el-button {
    padding: 8px 16px;
  }
  
  .el-table th,
  .el-table td {
    padding: 12px;
  }
  
  .el-dialog {
    margin: 16px !important;
  }
}
</style>
