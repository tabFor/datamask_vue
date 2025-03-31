<template>
  <div class="login-page">
    <div class="login-background">
      <div class="background-shapes">
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
        <div class="shape shape-3"></div>
        <div class="shape shape-4"></div>
      </div>
    </div>
    <div class="login-container">
      <div class="login-header">
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
        <h2>数据脱敏系统</h2>
        <p class="subtitle">安全可靠的数据处理平台</p>
      </div>
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="rules"
        label-width="80px"
        class="login-form"
      >
        <el-form-item
          label="用户名"
          prop="username"
        >
          <el-input
            v-model="loginForm.username"
            autocomplete="off"
            class="material-input"
            placeholder="请输入用户名"
          >
            <template #prefix>
              <el-icon><User /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item
          label="密码"
          prop="password"
        >
          <el-input 
            v-model="loginForm.password" 
            type="password" 
            autocomplete="off"
            class="material-input"
            placeholder="请输入密码"
            @keyup.enter="handleLogin"
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            @click="handleLogin"
            class="material-button"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';
import { usersApi } from '@/utils/api';
import { User, Lock } from '@element-plus/icons-vue';

const router = useRouter();

const loginForm = reactive({
  username: '',
  password: ''
});

const loginFormRef = ref(null);

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
};

const handleLogin = () => {
  loginFormRef.value.validate((valid) => {
    if (valid) {
      usersApi.login({
        username: loginForm.username,
        password: loginForm.password
      })
      .then(response => {
        if (response.data.status === 'success') {
          ElMessage.success(response.data.message);
          const token = response.data.token;
          const role = response.data.role;
          
          // 存储token
          localStorage.setItem('token', token);
          // 存储用户名
          localStorage.setItem('username', response.data.username);
          // 存储用户角色
          localStorage.setItem('userRole', role);
          
          router.push('/');
        } else {
          ElMessage.error('用户名或密码错误');
        }
      })
      .catch(error => {
        ElMessage.error('登录失败，请稍后重试');
        console.error(error);
      });
    } else {
      ElMessage.error('请完整填写登录信息');
      return false;
    }
  });
};
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  padding: 20px;
  position: relative;
  overflow: hidden;
}

.login-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
}

.background-shapes {
  position: absolute;
  width: 100%;
  height: 100%;
}

.shape {
  position: absolute;
  border-radius: 50%;
  filter: blur(40px);
  opacity: 0.5;
}

.shape-1 {
  width: 300px;
  height: 300px;
  background: #4CAF50;
  top: -100px;
  left: -100px;
}

.shape-2 {
  width: 250px;
  height: 250px;
  background: #2196F3;
  bottom: -50px;
  right: -50px;
}

.shape-3 {
  width: 200px;
  height: 200px;
  background: #FFC107;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.shape-4 {
  width: 150px;
  height: 150px;
  background: #9C27B0;
  bottom: 20%;
  left: 20%;
}

.login-container {
  width: 100%;
  max-width: 420px;
  padding: 40px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 1;
  animation: slideUp 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
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

.login-header h2 {
  font-size: 32px;
  margin-bottom: 12px;
  font-weight: 600;
  color: #1a1a1a;
  letter-spacing: -0.5px;
}

.subtitle {
  font-size: 16px;
  color: #666;
  letter-spacing: 0.5px;
}

.login-form {
  margin-top: 20px;
}

.material-input :deep(.el-input__wrapper) {
  background: #f5f5f5;
  border: none;
  border-radius: 12px;
  padding: 12px 16px;
  box-shadow: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.material-input :deep(.el-input__wrapper:hover) {
  background: #eeeeee;
}

.material-input :deep(.el-input__wrapper.is-focus) {
  background: #fff;
  box-shadow: 0 0 0 2px #2196F3;
}

.material-input :deep(.el-input__prefix) {
  margin-right: 12px;
  color: #666;
}

.material-button {
  width: 100%;
  height: 48px;
  background: linear-gradient(45deg, #2196F3, #1976D2);
  border: none;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  font-size: 16px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  margin-top: 20px;
  position: relative;
  overflow: hidden;
}

.material-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, rgba(255,255,255,0.1), rgba(255,255,255,0));
  transform: translateX(-100%);
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.material-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
}

.material-button:hover::before {
  transform: translateX(100%);
}

.material-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(33, 150, 243, 0.2);
}

:deep(.el-form-item__label) {
  color: #333;
  font-size: 14px;
  font-weight: 500;
}

:deep(.el-input__inner) {
  color: #333;
  font-size: 15px;
}

:deep(.el-input__inner::placeholder) {
  color: #999;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式设计 */
@media (max-width: 480px) {
  .login-container {
    padding: 30px 20px;
    margin: 20px;
  }
  
  .login-header h2 {
    font-size: 28px;
  }
  
  .subtitle {
    font-size: 14px;
  }
  
  .material-button {
    height: 44px;
    font-size: 14px;
  }
  
  .shape {
    filter: blur(30px);
  }
}
</style>