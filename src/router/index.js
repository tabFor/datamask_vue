import { createRouter, createWebHistory } from 'vue-router';
import MainLayout from '@/components/MainLayout.vue';
import UserLogin from '@/components/UserLogin.vue';
import { USER_ROLES, hasPermission } from '@/utils/permission';

// 页面加载状态管理
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

// 配置NProgress
NProgress.configure({ 
  showSpinner: false,
  easing: 'ease',
  speed: 500
});

const routes = [
  { 
    path: '/', 
    component: MainLayout,
    children: [
      {
        path: '',
        component: () => import('@/components/HelloWorld.vue'),
        meta: { 
          requiresAuth: true,
          title: '首页',
          skeletonType: 'card'
        }
      },
      { 
        path: 'tasks', 
        component: () => import('@/components/TaskManagement.vue'),
        meta: { 
          requiresAuth: true,
          allowedRoles: [USER_ROLES.ADMIN, USER_ROLES.DATA_OPERATOR],
          title: '任务管理',
          skeletonType: 'table'
        }
      },
      { 
        path: 'rules', 
        component: () => import('@/components/RuleManagement.vue'),
        meta: { 
          requiresAuth: true,
          allowedRoles: [USER_ROLES.ADMIN, USER_ROLES.DATA_OPERATOR],
          title: '规则管理',
          skeletonType: 'table'
        }
      },
      { 
        path: 'security', 
        component: () => import('@/components/SecurityManagement.vue'),
        meta: { 
          requiresAuth: true,
          allowedRoles: [USER_ROLES.ADMIN],
          title: '权限管理',
          skeletonType: 'table'
        }
      },
      { 
        path: 'audit', 
        component: () => import('@/components/AuditLogs.vue'),
        meta: { 
          requiresAuth: true,
          allowedRoles: [USER_ROLES.ADMIN],
          title: '审计日志',
          skeletonType: 'table'
        }
      },
      { 
        path: 'dynamic', 
        component: () => import('@/components/DynamicMasking.vue'),
        meta: { 
          requiresAuth: true,
          allowedRoles: [USER_ROLES.ADMIN, USER_ROLES.DATA_OPERATOR],
          title: '动态脱敏',
          skeletonType: 'form'
        }
      },
      {
        path: 'analysis',
        component: () => import('@/components/DataAnalysis.vue'),
        meta: {
          requiresAuth: true,
          allowedRoles: [USER_ROLES.ADMIN, USER_ROLES.DATA_ANALYST],
          title: '数据分析',
          skeletonType: 'chart'
        }
      }
    ]
  },
  { 
    path: '/login', 
    component: UserLogin,
    meta: { 
      requiresAuth: false,
      title: '登录'
    }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    // 保持滚动位置，防止页面跳动
    return { top: 0 }
  }
});

// 路由前置守卫
router.beforeEach((to, from, next) => {
  // 开始加载进度条
  NProgress.start();
  
  const isAuthenticated = !!localStorage.getItem('token');
  
  // 如果路由需要认证
  if (to.meta.requiresAuth) {
    // 如果未登录，重定向到登录页
    if (!isAuthenticated) {
      next({ path: '/login' });
      return;
    }
    
    // 如果路由有角色限制
    if (to.meta.allowedRoles) {
      // 检查用户是否有权限访问
      if (!hasPermission(to.meta.allowedRoles)) {
        // 无权限，重定向到首页
        next({ path: '/' });
        return;
      }
    }
  }
  
  // 如果已登录且要访问登录页，重定向到首页
  if (to.path === '/login' && isAuthenticated) {
    next({ path: '/' });
    return;
  }
  
  next();
});

// 路由后置守卫
router.afterEach(() => {
  // 结束加载进度条
  NProgress.done();
});

export default router;