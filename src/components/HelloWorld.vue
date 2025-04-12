<template>
  <el-container class="dashboard">
    <div class="dashboard-decoration">
      <div class="decoration-circle circle-1"></div>
      <div class="decoration-circle circle-2"></div>
      <div class="decoration-circle circle-3"></div>
    </div>
    <el-main class="dashboard-main">
      <div class="dashboard-header">
        <div class="logo-container">
          <svg class="logo" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#2196F3;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#1976D2;stop-opacity:1" />
              </linearGradient>
            </defs>
            <!-- 外圈 -->
            <circle cx="50" cy="50" r="45" fill="none" stroke="url(#logoGradient)" stroke-width="4"/>
            <!-- 盾牌形状 -->
            <path d="M50 15 L85 30 L85 70 L50 85 L15 70 L15 30 Z" 
                  fill="url(#logoGradient)" 
                  stroke="white" 
                  stroke-width="2"/>
            <!-- 数据流线条 -->
            <path d="M30 50 L50 35 L70 50 L50 65 Z" 
                  fill="none" 
                  stroke="white" 
                  stroke-width="3" 
                  stroke-linecap="round"/>
            <!-- 锁的图案 -->
            <rect x="45" y="45" width="10" height="15" rx="2" fill="white"/>
            <circle cx="50" cy="40" r="3" fill="white"/>
          </svg>
        </div>
        <h1 class="dashboard-title">数据脱敏管理平台</h1>
        <p class="dashboard-subtitle">安全、高效的敏感数据处理解决方案</p>
      </div>
      
      <!-- 数据操作员功能区 -->
      <el-row :gutter="24" v-if="hasPermission([USER_ROLES.DATA_OPERATOR]) && !isAdmin" class="role-section">
        <el-col :span="24">
          <div class="section-title">数据操作员功能</div>
        </el-col>
        
        <el-col :md="12" :lg="8">
          <el-card class="feature-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <div class="icon-wrapper">
                  <el-icon><DataAnalysis /></el-icon>
                </div>
                <span>敏感数据识别</span>
              </div>
            </template>
            <div class="card-content">
              <p class="card-description">创建新的数据识别任务，自动识别敏感信息</p>
              <el-button
                type="primary"
                class="card-button gradient-primary"
                @click="navigateTo('/tasks')"
              >
                创建识别任务
              </el-button>
            </div>
          </el-card>
        </el-col>

        <el-col :md="12" :lg="8">
          <el-card class="feature-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <div class="icon-wrapper">
                  <el-icon><Lock /></el-icon>
                </div>
                <span>静态数据脱敏</span>
              </div>
            </template>
            <div class="card-content">
              <p class="card-description">配置数据脱敏规则，保护敏感数据安全</p>
              <el-button
                type="success"
                class="card-button gradient-success"
                @click="navigateTo('/rules')"
              >
                配置脱敏规则
              </el-button>
            </div>
          </el-card>
        </el-col>

        <el-col :md="12" :lg="8">
          <el-card class="feature-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <div class="icon-wrapper">
                  <el-icon><Connection /></el-icon>
                </div>
                <span>动态数据脱敏</span>
              </div>
            </template>
            <div class="card-content">
              <p class="card-description">实时数据库查询，动态脱敏处理</p>
              <el-button
                type="warning"
                class="card-button gradient-warning"
                @click="navigateTo('/dynamic')"
              >
                数据库查询
              </el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>
      
      <!-- 数据分析师功能区 -->
      <el-row :gutter="24" v-if="hasPermission([USER_ROLES.DATA_ANALYST]) && !isAdmin" class="role-section">
        <el-col :span="24">
          <div class="section-title">数据分析师功能</div>
        </el-col>
        
        <el-col :md="12" :lg="8" :offset="isAnalystOnly ? 8 : 0">
          <el-card class="feature-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <div class="icon-wrapper">
                  <el-icon><PieChart /></el-icon>
                </div>
                <span>数据分析</span>
              </div>
            </template>
            <div class="card-content">
              <p class="card-description">深入分析数据，生成可视化报表</p>
              <el-button
                type="success"
                class="card-button gradient-success"
                @click="navigateTo('/analysis')"
              >
                进行数据分析
              </el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>
      
      <!-- 管理员功能卡片 - 所有功能 -->
      <el-row :gutter="24" v-if="isAdmin">
        <el-col :span="24">
          <div class="section-title">数据处理功能</div>
        </el-col>
        <el-col :md="12" :lg="6">
          <el-card class="feature-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <div class="icon-wrapper">
                  <el-icon><DataAnalysis /></el-icon>
                </div>
                <span>敏感数据识别</span>
              </div>
            </template>
            <div class="card-content">
              <p class="card-description">创建新的数据识别任务，自动识别敏感信息</p>
              <el-button
                type="primary"
                class="card-button gradient-primary"
                @click="navigateTo('/tasks')"
              >
                创建识别任务
              </el-button>
            </div>
          </el-card>
        </el-col>

        <el-col :md="12" :lg="6">
          <el-card class="feature-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <div class="icon-wrapper">
                  <el-icon><Lock /></el-icon>
                </div>
                <span>静态数据脱敏</span>
              </div>
            </template>
            <div class="card-content">
              <p class="card-description">配置数据脱敏规则，保护敏感数据安全</p>
              <el-button
                type="success"
                class="card-button gradient-success"
                @click="navigateTo('/rules')"
              >
                配置脱敏规则
              </el-button>
            </div>
          </el-card>
        </el-col>

        <el-col :md="12" :lg="6">
          <el-card class="feature-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <div class="icon-wrapper">
                  <el-icon><Connection /></el-icon>
                </div>
                <span>动态数据脱敏</span>
              </div>
            </template>
            <div class="card-content">
              <p class="card-description">实时数据库查询，动态脱敏处理</p>
              <el-button
                type="warning"
                class="card-button gradient-warning"
                @click="navigateTo('/dynamic')"
              >
                数据库查询
              </el-button>
            </div>
          </el-card>
        </el-col>
        
        <el-col :md="12" :lg="6">
          <el-card class="feature-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <div class="icon-wrapper">
                  <el-icon><PieChart /></el-icon>
                </div>
                <span>数据分析</span>
              </div>
            </template>
            <div class="card-content">
              <p class="card-description">深入分析数据，生成可视化报表</p>
              <el-button
                type="success"
                class="card-button gradient-success"
                @click="navigateTo('/analysis')"
              >
                进行数据分析
              </el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="24" class="admin-section" v-if="isAdmin">
        <el-col :span="24">
          <div class="section-title">管理员功能</div>
        </el-col>
        <el-col :md="12" :lg="8">
          <el-card class="feature-card admin-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <div class="icon-wrapper">
                  <el-icon><Setting /></el-icon>
                </div>
                <span>系统管理</span>
              </div>
            </template>
            <div class="card-content">
              <p class="card-description">管理用户权限及系统配置</p>
              <el-button
                type="danger"
                class="card-button gradient-danger"
                @click="navigateTo('/security')"
              >
                系统管理
              </el-button>
            </div>
          </el-card>
        </el-col>
        
        <el-col :md="12" :lg="8">
          <el-card class="feature-card admin-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <div class="icon-wrapper">
                  <el-icon><Document /></el-icon>
                </div>
                <span>审计日志</span>
              </div>
            </template>
            <div class="card-content">
              <p class="card-description">查看系统操作记录，监控异常行为</p>
              <el-button
                type="info"
                class="card-button gradient-info"
                @click="navigateTo('/audit')"
              >
                查看日志
              </el-button>
            </div>
          </el-card>
        </el-col>
        
        <el-col :md="12" :lg="8">
          <el-card class="feature-card admin-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <div class="icon-wrapper">
                  <el-icon><Monitor /></el-icon>
                </div>
                <span>Presidio测试</span>
              </div>
            </template>
            <div class="card-content">
              <p class="card-description">测试Presidio敏感信息识别和脱敏功能</p>
              <el-button
                type="primary"
                class="card-button gradient-primary"
                @click="navigateTo('/presidio-test')"
              >
                测试功能
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
import {
  DataAnalysis,
  Lock,
  Connection,
  PieChart,
  Document,
  Setting,
  Monitor,
} from '@element-plus/icons-vue';

const isLoggedIn = ref(false);
const userName = ref('');
const userRole = ref('');

// 判断是否为管理员
const isAdmin = computed(() => {
  return userRole.value === USER_ROLES.ADMIN;
});

// 判断是否仅为数据分析师
const isAnalystOnly = computed(() => {
  return userRole.value === USER_ROLES.DATA_ANALYST;
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
  background-color: #f9fafc;
  background-image: linear-gradient(135deg, #f9fafc 0%, #f5f7fa 100%);
  position: relative;
  overflow: hidden;
}

.dashboard-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.decoration-circle {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.5;
}

.circle-1 {
  top: -150px;
  right: -100px;
  width: 500px;
  height: 500px;
  background: linear-gradient(135deg, rgba(66, 184, 131, 0.2), rgba(53, 73, 94, 0.1));
  animation: float-slow 15s infinite alternate ease-in-out;
}

.circle-2 {
  bottom: -200px;
  left: -150px;
  width: 600px;
  height: 600px;
  background: linear-gradient(135deg, rgba(53, 73, 94, 0.1), rgba(66, 184, 131, 0.2));
  animation: float-slow 20s infinite alternate-reverse ease-in-out;
}

.circle-3 {
  top: 30%;
  right: 25%;
  width: 300px;
  height: 300px;
  background: linear-gradient(135deg, rgba(66, 184, 131, 0.1), rgba(255, 183, 77, 0.1));
  animation: float-slow 18s infinite alternate ease-in-out;
}

@keyframes float-slow {
  0% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(40px, 40px);
  }
}

.dashboard-main {
  padding: 50px 40px;
  max-width: 1400px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.dashboard-header {
  text-align: center;
  margin-bottom: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.logo-container {
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  background: #fff;
  border-radius: 20px;
  padding: 15px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
  animation: logoFloat 3s ease-in-out infinite;
}

@keyframes logoFloat {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

.dashboard-title {
  margin: 0;
  font-size: 36px;
  font-weight: 600;
  color: #1a1a1a;
  letter-spacing: -0.5px;
}

.dashboard-subtitle {
  margin: 12px 0 0;
  font-size: 18px;
  color: #666;
  letter-spacing: 0.5px;
}

.feature-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  transition: all 0.4s ease;
  border: none;
  position: relative;
  background-color: white;
}

.feature-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 15px 35px rgba(50, 50, 93, 0.1), 0 5px 15px rgba(0, 0, 0, 0.07);
}

.feature-card:before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, #42b883, #35495e);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.feature-card:hover:before {
  opacity: 1;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 24px 28px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(249, 250, 252, 0.9));
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
}

.feature-card:hover .card-header {
  background: linear-gradient(135deg, rgba(255, 255, 255, 1), rgba(249, 250, 252, 0.95));
}

.icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(66, 184, 131, 0.15), rgba(53, 73, 94, 0.05));
  box-shadow: 0 4px 12px rgba(66, 184, 131, 0.1);
  transition: all 0.3s ease;
}

.feature-card:hover .icon-wrapper {
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(66, 184, 131, 0.15);
}

.icon-wrapper .el-icon {
  font-size: 26px;
  color: #42b883;
  transition: all 0.3s ease;
}

.feature-card:hover .icon-wrapper .el-icon {
  color: #35495e;
}

.card-header span {
  color: #35495e;
  font-size: 22px;
  font-weight: 600;
  letter-spacing: 0.2px;
  transition: all 0.3s ease;
}

.feature-card:hover .card-header span {
  color: #42b883;
}

.card-content {
  padding: 30px;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background-color: white;
}

.card-description {
  color: #606266;
  font-size: 16px;
  margin: 0 0 28px 0;
  line-height: 1.7;
  transition: all 0.3s ease;
}

.feature-card:hover .card-description {
  color: #303133;
}

.card-button {
  width: 100%;
  padding: 14px 20px;
  border-radius: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  transition: all 0.3s ease;
  font-size: 15px;
  position: relative;
  overflow: hidden;
  z-index: 1;
  border: none;
  background-size: 200% 100%;
  background-position: 0% 0%;
}

.card-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 7px 14px rgba(50, 50, 93, 0.2), 0 3px 6px rgba(0, 0, 0, 0.12);
  background-position: 100% 0%;
  filter: brightness(1.05);
}

.gradient-primary {
  background: linear-gradient(135deg, #007AFF 0%, #00B4FF 100%);
  color: white;
  border: none;
}

.gradient-success {
  background: linear-gradient(135deg, #34C759 0%, #00E5A0 100%);
  color: white;
  border: none;
}

.gradient-warning {
  background: linear-gradient(135deg, #FF9500 0%, #FFB340 100%);
  color: white;
  border: none;
}

.gradient-info {
  background: linear-gradient(135deg, #5856D6 0%, #007AFF 100%);
  color: white;
  border: none;
}

.gradient-danger {
  background: linear-gradient(135deg, #FF3B30 0%, #FF6B6B 100%);
  color: white;
  border: none;
}

.el-button.card-button.is-plain {
  background-color: transparent;
  border: 2px solid currentColor;
  opacity: 0.9;
}

.el-button.card-button.is-plain:hover {
  opacity: 1;
  background-color: rgba(66, 184, 131, 0.05);
}

.admin-section {
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  position: relative;
}

.admin-section:before {
  content: none; /* 删除之前的伪元素 */
}

.section-title {
  text-align: center;
  margin: 30px 0 20px;
  position: relative;
  color: #35495e;
  font-size: 20px;
  font-weight: 600;
  padding-bottom: 10px;
}

.section-title:after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 3px;
  background: linear-gradient(90deg, #42b883, #35495e);
  border-radius: 3px;
}

.role-section {
  margin-bottom: 40px;
}

.admin-section {
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  position: relative;
}

.admin-card {
  min-height: 220px;
  background: linear-gradient(to right bottom, rgba(255, 255, 255, 0.99), rgba(255, 255, 255, 0.95));
  transition: transform 0.4s ease, box-shadow 0.4s ease;
}

.admin-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(50, 50, 93, 0.12), 0 10px 20px rgba(0, 0, 0, 0.08);
}

.admin-card:before {
  background: linear-gradient(90deg, #35495e, #42b883);
  height: 5px;
}

.admin-card .icon-wrapper {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, rgba(53, 73, 94, 0.15), rgba(66, 184, 131, 0.1));
}

.admin-card .card-button {
  font-weight: 600;
}

/* 响应式设计优化 */
@media (max-width: 1200px) {
  .dashboard-main {
    padding: 40px 30px;
  }
  
  .el-col {
    margin-bottom: 30px;
  }
}

@media (max-width: 992px) {
  .dashboard-main {
    padding: 35px 25px;
  }
  
  .el-col {
    margin-bottom: 25px;
  }
}

@media (max-width: 768px) {
  .dashboard-main {
    padding: 30px 20px;
  }
  
  .dashboard-title {
    font-size: 28px;
  }
  
  .dashboard-subtitle {
    font-size: 15px;
    margin-bottom: 30px;
  }
  
  .card-header {
    padding: 20px 24px;
  }
  
  .icon-wrapper {
    width: 46px;
    height: 46px;
  }
  
  .icon-wrapper .el-icon {
    font-size: 22px;
  }
  
  .card-header span {
    font-size: 18px;
  }
  
  .card-content {
    padding: 24px;
  }
  
  .card-description {
    font-size: 14px;
    margin-bottom: 20px;
  }
  
  .card-button {
    padding: 12px 16px;
    font-size: 14px;
  }
  
  .admin-section {
    margin-top: 40px;
    padding-top: 40px;
  }
}

@media (max-width: 480px) {
  .dashboard-main {
    padding: 25px 15px;
  }
  
  .dashboard-title {
    font-size: 24px;
  }
  
  .dashboard-subtitle {
    font-size: 14px;
    margin-bottom: 25px;
  }
  
  .card-header {
    padding: 16px 20px;
  }
  
  .icon-wrapper {
    width: 40px;
    height: 40px;
  }
  
  .icon-wrapper .el-icon {
    font-size: 20px;
  }
  
  .card-header span {
    font-size: 16px;
  }
  
  .card-content {
    padding: 20px;
  }
}

/* 动画效果优化 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.el-col {
  animation: fadeInUp 0.9s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.el-col:nth-child(1) { animation-delay: 0.1s; }
.el-col:nth-child(2) { animation-delay: 0.2s; }
.el-col:nth-child(3) { animation-delay: 0.3s; }
.el-col:nth-child(4) { animation-delay: 0.4s; }
.el-col:nth-child(5) { animation-delay: 0.5s; }
.el-col:nth-child(6) { animation-delay: 0.6s; }

/* 添加精美阴影效果 */
.feature-card::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 5%;
  width: 90%;
  height: 10px;
  filter: blur(12px);
  background: linear-gradient(90deg, rgba(0,0,0,0.05), rgba(0,0,0,0.08), rgba(0,0,0,0.05));
  border-radius: 50%;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.feature-card:hover::after {
  opacity: 1;
}
</style>
