<template>
  <div class="layout-container">
    <!-- 顶部导航栏 -->
    <el-header class="layout-header">
      <div class="header-content">
        <div class="header-left">
          <div class="logo-container">
            <svg class="logo" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#2196F3;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#1976D2;stop-opacity:1" />
                </linearGradient>
              </defs>
              <circle cx="50" cy="50" r="45" fill="none" stroke="url(#logoGradient)" stroke-width="4"/>
              <path d="M50 15 L85 30 L85 70 L50 85 L15 70 L15 30 Z" 
                    fill="url(#logoGradient)" 
                    stroke="white" 
                    stroke-width="2"/>
              <path d="M30 50 L50 35 L70 50 L50 65 Z" 
                    fill="none" 
                    stroke="white" 
                    stroke-width="3" 
                    stroke-linecap="round"/>
              <rect x="45" y="45" width="10" height="15" rx="2" fill="white"/>
              <circle cx="50" cy="40" r="3" fill="white"/>
            </svg>
          </div>
          <h1 class="logo-text">数据脱敏系统</h1>
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

    <!-- 侧边栏和主内容区域 -->
    <div class="main-content">
      <!-- 侧边栏导航 -->
      <el-aside class="layout-aside" :class="{ collapsed: isCollapse }" :width="isCollapse ? '64px' : '240px'">
        <div class="aside-header">
          <el-button
            type="text"
            class="collapse-btn"
            @click="toggleCollapse"
          >
            <el-icon>
              <component :is="isCollapse ? Expand : Fold" />
            </el-icon>
          </el-button>
        </div>
        <el-menu
          :default-active="activeMenu"
          class="aside-menu"
          :collapse="isCollapse"
          :router="true"
          background-color="#ffffff"
          text-color="#333333"
          active-text-color="#1976D2"
        >
          <el-menu-item index="/">
            <el-icon><HomeFilled /></el-icon>
            <template #title>首页</template>
          </el-menu-item>

          <el-sub-menu index="data-management" v-if="showDataManagement">
            <template #title>
              <el-icon><DataAnalysis /></el-icon>
              <span>数据管理</span>
            </template>
            <el-menu-item index="/tasks">
              <el-icon><Document /></el-icon>
              <template #title>敏感数据识别</template>
            </el-menu-item>
            <el-menu-item index="/rules">
              <el-icon><Lock /></el-icon>
              <template #title>静态数据脱敏</template>
            </el-menu-item>
            <el-menu-item index="/dynamic">
              <el-icon><Connection /></el-icon>
              <template #title>动态数据脱敏</template>
            </el-menu-item>
          </el-sub-menu>

          <el-menu-item index="/analysis" v-if="showDataAnalysis">
            <el-icon><PieChart /></el-icon>
            <template #title>数据分析</template>
          </el-menu-item>

          <el-menu-item index="/presidio-test">
            <el-icon><Monitor /></el-icon>
            <template #title>Presidio测试</template>
          </el-menu-item>

          <el-sub-menu index="system" v-if="isAdmin">
            <template #title>
              <el-icon><Setting /></el-icon>
              <span>系统管理</span>
            </template>
            <el-menu-item index="/security">
              <el-icon><Lock /></el-icon>
              <template #title>安全管理</template>
            </el-menu-item>
            <el-menu-item index="/audit">
              <el-icon><Document /></el-icon>
              <template #title>审计日志</template>
            </el-menu-item>
          </el-sub-menu>

          <el-menu-item index="/documentation">
            <el-icon><Document /></el-icon>
            <template #title>系统文档</template>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <!-- 主内容区域 -->
      <el-main class="layout-main" :class="{ collapsed: isCollapse }">
        <div class="main-container">
          <router-view v-slot="{ Component, route }">
            <transition name="fade" mode="out-in">
              <keep-alive>
                <SkeletonWrapper :skeleton-type="route.meta.skeletonType || 'default'">
                  <component :is="Component" />
                </SkeletonWrapper>
              </keep-alive>
            </transition>
          </router-view>
        </div>
      </el-main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, defineOptions } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { 
  SwitchButton, 
  HomeFilled, 
  DataAnalysis, 
  Document, 
  Lock, 
  Connection, 
  PieChart, 
  Setting,
  Expand,
  Fold,
  Monitor
} from '@element-plus/icons-vue';
import { USER_ROLES } from '@/utils/permission';
import SkeletonWrapper from './SkeletonWrapper.vue';
import { usersApi } from '@/utils/api';

defineOptions({
  name: 'MainLayout'
});

const router = useRouter();
const route = useRoute();
const userName = ref(localStorage.getItem('username') || '');
const userRole = ref(localStorage.getItem('userRole') || '');
const isCollapse = ref(false);

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

// 判断是否为管理员
const isAdmin = computed(() => {
  return userRole.value === USER_ROLES.ADMIN;
});

// 判断是否为数据分析师
const isAnalyst = computed(() => {
  return userRole.value === USER_ROLES.DATA_ANALYST;
});

// 判断是否为数据操作员
const isOperator = computed(() => {
  return userRole.value === USER_ROLES.DATA_OPERATOR;
});

// 判断是否显示数据管理菜单
const showDataManagement = computed(() => {
  return isAdmin.value || isOperator.value;
});

// 判断是否显示数据分析菜单
const showDataAnalysis = computed(() => {
  return isAdmin.value || isAnalyst.value;
});

// 当前激活的菜单
const activeMenu = computed(() => {
  return route.path;
});

// 切换侧边栏折叠状态
const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value;
};

// 处理退出登录
const handleLogout = async () => {
  try {
    await usersApi.logout();
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('userRole');
    ElMessage.success('已退出登录');
    router.push('/login');
  } catch (error) {
    console.error('登出失败:', error);
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('userRole');
    router.push('/login');
  }
};

// 监听路由变化
watch(() => route.path, () => {
  // 路由变化时的处理逻辑
});
</script>

<style scoped>
.layout-container {
  min-height: 100vh;
  background-color: #f5f7fa;
  display: flex;
  flex-direction: column;
}

.layout-header {
  background: #ffffff;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  padding: 0 24px;
  height: 64px;
  display: flex;
  align-items: center;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.header-content {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.logo-container {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo {
  width: 100%;
  height: 100%;
}

.logo-text {
  color: #1976D2;
  font-size: 20px;
  font-weight: 600;
  margin: 0;
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
  background: rgba(25, 118, 210, 0.05);
  transition: all 0.3s ease;
  cursor: pointer;
}

.user-profile:hover {
  background: rgba(25, 118, 210, 0.1);
}

.user-avatar {
  background: #1976D2;
  color: white;
  font-weight: 500;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.username {
  color: #333333;
  font-weight: 500;
  font-size: 14px;
}

.user-role {
  color: #666666;
  font-size: 12px;
}

.main-content {
  display: flex;
  flex: 1;
  margin-top: 64px; /* 为固定定位的头部留出空间 */
  overflow: hidden;
}

.layout-aside {
  background: #ffffff;
  border-right: 1px solid rgba(0, 0, 0, 0.08);
  transition: width 0.3s ease;
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 64px;
  bottom: 0;
  left: 0;
  z-index: 99;
}

.aside-header {
  height: 64px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.collapse-btn {
  padding: 8px;
  font-size: 20px;
  color: #666666;
}

.aside-menu {
  border-right: none;
  flex: 1;
}

.aside-menu:not(.el-menu--collapse) {
  width: 240px;
}

.layout-main {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  background-color: #f5f7fa;
  margin-left: 240px; /* 为固定定位的侧边栏留出空间 */
  transition: margin-left 0.3s ease;
}

.main-container {
  max-width: 1200px;
  margin: 0 auto;
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

/* 当侧边栏折叠时的样式 */
.layout-aside.collapsed {
  width: 64px;
}

.layout-main.collapsed {
  margin-left: 64px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .layout-header {
    padding: 0 16px;
    height: 56px;
  }
  
  .logo-text {
    font-size: 18px;
  }
  
  .user-info {
    display: none;
  }
  
  .user-profile {
    padding: 4px 8px;
  }
  
  .main-content {
    margin-top: 56px;
  }
  
  .layout-aside {
    top: 56px;
  }
  
  .layout-main {
    margin-left: 0;
  }
  
  .layout-aside.collapsed {
    transform: translateX(-100%);
  }
}
</style> 