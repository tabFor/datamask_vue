<template>
  <div class="layout-container">
    <!-- 顶部导航栏 -->
    <el-header class="layout-header">
      <div class="header-content">
        <div class="header-left">
          <h1 class="logo">数据脱敏系统</h1>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item v-for="(item, index) in breadcrumbItems" 
                              :key="index"
                              :to="item.path"
                              :class="{ 'is-active': index === breadcrumbItems.length - 1 }">
              {{ item.title }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <el-dropdown trigger="click">
            <div class="user-profile">
              <el-avatar :size="32" class="user-avatar">
                {{ userName.charAt(0).toUpperCase() }}
              </el-avatar>
              <div class="user-info">
                <span class="username">{{ userName }}</span>
                <span class="user-role">{{ userRoleText }}</span>
              </div>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="handleLogout">
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </el-header>

    <!-- 主要内容区域 -->
    <el-main class="layout-main">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </el-main>
  </div>
</template>

<script setup>
import { ref, computed, watch, defineOptions } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { SwitchButton } from '@element-plus/icons-vue';
import { USER_ROLES } from '@/utils/permission';

defineOptions({
  name: 'MainLayout'
});

const router = useRouter();
const route = useRoute();
const userName = ref(localStorage.getItem('username') || '');
const userRole = ref(localStorage.getItem('userRole') || '');

// 计算用户角色文本
const userRoleText = computed(() => {
  switch (userRole.value) {
    case USER_ROLES.ADMIN:
      return '管理员';
    case USER_ROLES.DATA_ANALYST:
      return '数据分析师';
    case USER_ROLES.DATA_OPERATOR:
      return '数据操作员';
    default:
      return '';
  }
});

// 面包屑导航项
const breadcrumbItems = computed(() => {
  const items = [];
  const matched = route.matched;
  
  matched.forEach((record) => {
    if (record.meta && record.meta.title) {
      items.push({
        title: record.meta.title,
        path: record.path
      });
    }
  });
  
  return items;
});

// 处理退出登录
const handleLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  localStorage.removeItem('userRole');
  ElMessage.success('已退出登录');
  router.push('/login');
};

// 监听路由变化，更新面包屑
watch(() => route.path, () => {
  // 路由变化时的处理逻辑
});
</script>

<style scoped>
.layout-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e7eb 100%);
  position: relative;
}

.layout-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E");
  z-index: 0;
}

.layout-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  padding: 0 32px;
  height: 72px;
  display: flex;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.header-content {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 32px;
}

.logo {
  color: #1a237e;
  font-size: 24px;
  font-weight: 600;
  margin: 0;
  letter-spacing: 0.5px;
  background: linear-gradient(45deg, #1a237e, #3949ab);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 4px 12px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.5);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.user-profile:hover {
  background: rgba(255, 255, 255, 0.8);
}

.user-avatar {
  background: #1a237e;
  color: white;
  font-weight: 500;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.username {
  color: #1a237e;
  font-weight: 500;
  font-size: 14px;
}

.user-role {
  color: #666;
  font-size: 12px;
}

.layout-main {
  padding: 32px;
  max-width: 1400px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

/* 面包屑样式 */
:deep(.el-breadcrumb) {
  font-size: 14px;
}

:deep(.el-breadcrumb__item) {
  color: #666;
}

:deep(.el-breadcrumb__item.is-active) {
  color: #1a237e;
  font-weight: 500;
}

:deep(.el-breadcrumb__inner) {
  transition: all 0.3s ease;
}

:deep(.el-breadcrumb__inner:hover) {
  color: #1a237e;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .layout-header {
    padding: 0 20px;
    height: 64px;
  }
  
  .header-left {
    gap: 16px;
  }
  
  .logo {
    font-size: 20px;
  }
  
  .layout-main {
    padding: 20px;
  }
  
  .user-info {
    display: none;
  }
  
  .user-profile {
    padding: 4px 8px;
  }
}
</style> 