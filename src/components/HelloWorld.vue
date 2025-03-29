<template>
  <el-container class="dashboard">
    <el-main class="dashboard-main">
      <el-row :gutter="20">
        <!-- 数据脱敏功能卡片 -->
        <el-col 
          :span="8" 
          v-if="hasPermission([USER_ROLES.ADMIN, USER_ROLES.DATA_OPERATOR])"
        >
          <el-card class="feature-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <i class="el-icon-data-analysis"></i>
                <span>敏感数据识别</span>
              </div>
            </template>
            <div class="card-content">
              <p class="card-description">创建新的数据识别任务，自动识别敏感信息</p>
              <el-button
                type="primary"
                class="card-button"
                @click="navigateTo('/tasks')"
              >
                创建识别任务
              </el-button>
            </div>
          </el-card>
        </el-col>

        <el-col 
          :span="8" 
          v-if="hasPermission([USER_ROLES.ADMIN, USER_ROLES.DATA_OPERATOR])"
        >
          <el-card class="feature-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <i class="el-icon-lock"></i>
                <span>静态数据脱敏</span>
              </div>
            </template>
            <div class="card-content">
              <p class="card-description">配置数据脱敏规则，保护敏感数据安全</p>
              <el-button
                type="success"
                class="card-button"
                @click="navigateTo('/rules')"
              >
                配置脱敏规则
              </el-button>
            </div>
          </el-card>
        </el-col>

        <el-col 
          :span="8" 
          v-if="hasPermission([USER_ROLES.ADMIN, USER_ROLES.DATA_OPERATOR])"
        >
          <el-card class="feature-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <i class="el-icon-connection"></i>
                <span>动态数据脱敏</span>
              </div>
            </template>
            <div class="card-content">
              <p class="card-description">实时数据库查询，动态脱敏处理</p>
              <el-button
                type="warning"
                class="card-button"
                @click="navigateTo('/dynamic')"
              >
                数据库查询
              </el-button>
            </div>
          </el-card>
        </el-col>
        
        <!-- 数据分析师可见的数据分析功能 -->
        <el-col 
          :span="8" 
          v-if="hasPermission([USER_ROLES.ADMIN, USER_ROLES.DATA_ANALYST])"
        >
          <el-card class="feature-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <i class="el-icon-pie-chart"></i>
                <span>数据分析</span>
              </div>
            </template>
            <div class="card-content">
              <p class="card-description">深入分析数据，生成可视化报表</p>
              <el-button
                type="success"
                class="card-button"
                @click="navigateTo('/analysis')"
              >
                进行数据分析
              </el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="20" class="admin-section" v-if="isAdmin">
        <el-col :span="12">
          <el-card class="feature-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <i class="el-icon-user-solid"></i>
                <span>权限管理</span>
              </div>
            </template>
            <div class="card-content">
              <p class="card-description">管理系统用户权限，确保数据安全</p>
              <el-button
                type="info"
                class="card-button"
                @click="navigateTo('/security')"
              >
                管理权限
              </el-button>
            </div>
          </el-card>
        </el-col>

        <el-col :span="12">
          <el-card class="feature-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <i class="el-icon-document"></i>
                <span>日志审计</span>
              </div>
            </template>
            <div class="card-content">
              <p class="card-description">查看系统操作日志，追踪用户行为</p>
              <el-button
                type="danger"
                class="card-button"
                @click="navigateTo('/audit')"
              >
                查看审计日志
              </el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </el-main>
  </el-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { USER_ROLES, hasPermission } from '@/utils/permission';

const isLoggedIn = ref(false);
const userName = ref('');
const userRole = ref('');

// 判断是否为管理员
const isAdmin = computed(() => {
  return userRole.value === USER_ROLES.ADMIN;
});

// 在组件挂载时检查登录状态
onMounted(() => {
  const token = localStorage.getItem('token');
  if (token) {
    isLoggedIn.value = true;
    userName.value = localStorage.getItem('username');
    userRole.value = localStorage.getItem('userRole');
  }
});

const router = useRouter();
// 定义一个通用的跳转函数
const navigateTo = (path) => {
  if (!isLoggedIn.value && path !== '/login') {
    ElMessage.warning('请先登录，再进行此操作');
    return;
  }
  router.push(path);
};
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
}

.dashboard-main {
  padding: 40px 32px;
  max-width: 1400px;
  margin: 0 auto;
}

.feature-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 24px;
  background: rgba(26, 35, 126, 0.08);
  border-bottom: 1px solid rgba(26, 35, 126, 0.12);
}

.card-header i {
  font-size: 28px;
  color: #1a237e;
  background: rgba(26, 35, 126, 0.1);
  padding: 12px;
  border-radius: 12px;
}

.card-header span {
  color: #1a237e;
  font-size: 20px;
  font-weight: 600;
}

.card-content {
  padding: 24px;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.card-description {
  color: #666;
  font-size: 15px;
  margin: 0 0 20px 0;
  line-height: 1.6;
}

.card-button {
  width: 100%;
  padding: 14px;
  border-radius: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 15px;
}

.admin-section {
  margin-top: 40px;
  padding-top: 40px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

/* 响应式设计优化 */
@media (max-width: 1200px) {
  .dashboard-main {
    padding: 32px 24px;
  }
  
  .el-col {
    margin-bottom: 24px;
  }
}

@media (max-width: 768px) {
  .dashboard-main {
    padding: 24px 16px;
  }
  
  .card-header {
    padding: 16px 20px;
  }
  
  .card-header i {
    font-size: 24px;
    padding: 8px;
  }
  
  .card-header span {
    font-size: 18px;
  }
  
  .card-content {
    padding: 20px;
  }
  
  .card-description {
    font-size: 14px;
  }
  
  .card-button {
    padding: 12px;
    font-size: 14px;
  }
}

/* 动画效果优化 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.el-col {
  animation: fadeInUp 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.el-col:nth-child(1) { animation-delay: 0.1s; }
.el-col:nth-child(2) { animation-delay: 0.2s; }
.el-col:nth-child(3) { animation-delay: 0.3s; }
.el-col:nth-child(4) { animation-delay: 0.4s; }
.el-col:nth-child(5) { animation-delay: 0.5s; }
.el-col:nth-child(6) { animation-delay: 0.6s; }
</style>
