import { createRouter, createWebHistory } from 'vue-router';
import MainLayout from '@/components/MainLayout.vue';
import HelloWorld from '@/components/HelloWorld.vue';
import TaskManagement from '@/components/TaskManagement.vue';
import RuleManagement from '@/components/RuleManagement.vue';
import UserLogin from '@/components/UserLogin.vue';
import DynamicMasking from '@/components/DynamicMasking.vue';
import DataAnalysis from '@/components/DataAnalysis.vue';
import { USER_ROLES, hasPermission } from '@/utils/permission';

const routes = [
  { 
    path: '/', 
    component: MainLayout,
    children: [
      {
        path: '',
        component: HelloWorld,
        meta: { 
          requiresAuth: true,
          title: '首页'
        }
      },
      { 
        path: 'tasks', 
        component: TaskManagement,
        meta: { 
          requiresAuth: true,
          allowedRoles: [USER_ROLES.ADMIN, USER_ROLES.DATA_OPERATOR],
          title: '任务管理'
        }
      },
      { 
        path: 'rules', 
        component: RuleManagement,
        meta: { 
          requiresAuth: true,
          allowedRoles: [USER_ROLES.ADMIN, USER_ROLES.DATA_OPERATOR],
          title: '规则管理'
        }
      },
      { 
        path: 'security', 
        component: () => import('@/components/SecurityManagement.vue'),
        meta: { 
          requiresAuth: true,
          allowedRoles: [USER_ROLES.ADMIN],
          title: '权限管理'
        }
      },
      { 
        path: 'audit', 
        component: () => import('@/components/AuditLogs.vue'),
        meta: { 
          requiresAuth: true,
          allowedRoles: [USER_ROLES.ADMIN],
          title: '审计日志'
        }
      },
      { 
        path: 'dynamic', 
        component: DynamicMasking,
        meta: { 
          requiresAuth: true,
          allowedRoles: [USER_ROLES.ADMIN, USER_ROLES.DATA_OPERATOR],
          title: '动态脱敏'
        }
      },
      {
        path: 'analysis',
        component: DataAnalysis,
        meta: {
          requiresAuth: true,
          allowedRoles: [USER_ROLES.ADMIN, USER_ROLES.DATA_ANALYST],
          title: '数据分析'
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
  routes
});

// 路由前置守卫
router.beforeEach((to, from, next) => {
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

export default router;