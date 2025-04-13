<template>
  <div class="login-page">
    <div class="login-background" />
    <div class="google-shapes">
      <div class="g-shape g-shape-blue" />
      <div class="g-shape g-shape-red" />
      <div class="g-shape g-shape-yellow" />
      <div class="g-shape g-shape-green" />
    </div>
    <div class="dot-grid" />
    <div class="login-container">
      <div class="login-header">
        <div class="logo-container">
          <svg
            class="logo"
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient
                id="logoGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop
                  offset="0%"
                  style="stop-color:#4285F4;stop-opacity:1"
                />
                <stop
                  offset="100%"
                  style="stop-color:#34A853;stop-opacity:1"
                />
              </linearGradient>
            </defs>
            <!-- 外圈 -->
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="url(#logoGradient)"
              stroke-width="4"
            />
            <!-- 盾牌形状 -->
            <path
              d="M50 15 L85 30 L85 70 L50 85 L15 70 L15 30 Z"
              fill="url(#logoGradient)"
              stroke="white"
              stroke-width="2"
            />
            <!-- 数据流线条 -->
            <path
              d="M30 50 L50 35 L70 50 L50 65 Z"
              fill="none"
              stroke="white"
              stroke-width="3"
              stroke-linecap="round"
            />
            <!-- 锁的图案 -->
            <rect
              x="45"
              y="45"
              width="10"
              height="15"
              rx="2"
              fill="white"
            />
            <circle
              cx="50"
              cy="40"
              r="3"
              fill="white"
            />
          </svg>
        </div>
        <h2>数据脱敏系统</h2>
        <p class="subtitle">安全可靠的数据处理平台</p>
      </div>
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="rules"
        label-position="top"
        class="login-form"
        method="post"
        action="/login"
      >
        <el-form-item
          label="用户名"
          prop="username"
        >
          <el-input
            v-model="loginForm.username"
            :autocomplete="rememberMe ? 'username' : 'off'"
            class="google-input"
            placeholder="请输入用户名"
            name="username"
            type="text"
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
            :type="passwordVisible ? 'text' : 'password'" 
            :autocomplete="rememberMe ? 'current-password' : 'off'"
            class="google-input"
            placeholder="请输入密码"
            @keyup.enter="handleLogin"
            name="password"
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
            <template #suffix>
              <el-icon 
                class="password-eye" 
                @click="passwordVisible = !passwordVisible"
              >
                <View v-if="passwordVisible" />
                <Hide v-else />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>
        <div class="form-footer">
          <el-checkbox v-model="rememberMe" class="remember-me">记住我</el-checkbox>
          <a href="#" class="forgot-password" @click.prevent="showForgotPasswordDialog">忘记密码?</a>
        </div>
        <el-form-item>
          <el-button
            type="primary"
            @click="handleLogin"
            class="google-button"
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
import { ElMessage, ElMessageBox } from 'element-plus';
import { useRouter } from 'vue-router';
import { usersApi } from '@/utils/api';
import { User, Lock, View, Hide } from '@element-plus/icons-vue';

const router = useRouter();
const passwordVisible = ref(false);
const rememberMe = ref(false);

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

const showForgotPasswordDialog = () => {
  ElMessageBox.alert(
    '请联系系统管理员重置您的密码。',
    '忘记密码',
    {
      confirmButtonText: '确定',
      type: 'info',
      center: true,
    }
  );
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
          
          // 如果勾选了记住我，可以保存更长时间
          if (rememberMe.value) {
            localStorage.setItem('rememberMe', 'true');
          }
          
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
  background: #fafafa;
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

.google-shapes {
  position: absolute;
  width: 100%;
  height: 100%;
}

.g-shape {
  position: absolute;
  border-radius: 8px;
  opacity: 0.07;
  transform: rotate(15deg);
}

.g-shape-blue {
  width: 600px;
  height: 600px;
  background: #4285F4;
  top: -150px;
  right: -200px;
  transform: rotate(25deg);
  opacity: 0.08;
  border-radius: 50px;
}

.g-shape-red {
  width: 500px;
  height: 500px;
  background: #EA4335;
  bottom: -200px;
  left: -200px;
  transform: rotate(-15deg);
  opacity: 0.08;
  border-radius: 30px;
}

.g-shape-yellow {
  width: 350px;
  height: 350px;
  background: #FBBC05;
  bottom: 15%;
  right: 10%;
  transform: rotate(20deg);
  opacity: 0.07;
  border-radius: 25px;
}

.g-shape-green {
  width: 300px;
  height: 300px;
  background: #34A853;
  top: 8%;
  left: 5%;
  transform: rotate(-10deg);
  opacity: 0.07;
  border-radius: 20px;
}

.dot-grid {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    radial-gradient(#e0e0e0 1px, transparent 1px),
    radial-gradient(#e0e0e0 1px, transparent 1px);
  background-size: 25px 25px;
  background-position: 0 0, 12.5px 12.5px;
  opacity: 0.4;
}

.login-container {
  width: 100%;
  max-width: 360px;
  padding: 30px 25px;
  background: rgba(255, 255, 255, 0.92);
  border-radius: 16px;
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.1), 
              0 0 0 1px rgba(0, 0, 0, 0.01),
              0 0 30px rgba(66, 133, 244, 0.08);
  position: relative;
  z-index: 1;
  animation: slideUp 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(12px);
  overflow: hidden;
}

.login-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 5px;
  background: linear-gradient(to right, #4285F4, #34A853, #FBBC05, #EA4335);
}

.login-header {
  text-align: center;
  margin-bottom: 28px;
}

.logo-container {
  width: 68px;
  height: 68px;
  margin: 0 auto 18px;
  background: #fff;
  border-radius: 50%;
  padding: 12px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 2;
}

.logo-container::after {
  content: '';
  position: absolute;
  width: 78px;
  height: 78px;
  border-radius: 50%;
  border: 2px solid rgba(66, 133, 244, 0.25);
  z-index: -1;
}

.logo {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.15));
  animation: logoFloat 3s ease-in-out infinite;
}

@keyframes logoFloat {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-6px);
  }
}

.login-header h2 {
  font-size: 26px;
  margin-bottom: 6px;
  font-weight: 600;
  color: #202124;
  letter-spacing: -0.5px;
}

.subtitle {
  font-size: 15px;
  color: #5f6368;
  letter-spacing: 0.1px;
}

.login-form {
  margin-top: 16px;
}

.google-input :deep(.el-input__wrapper) {
  background: #f8f9fa;
  border: 1px solid #dadce0;
  border-radius: 10px;
  padding: 10px 16px;
  box-shadow: none;
  transition: all 0.2s ease;
  height: 30px;
}

.google-input :deep(.el-input__wrapper:hover) {
  background: #fff;
  border-color: #aecbfa;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.google-input :deep(.el-input__wrapper.is-focus) {
  background: #fff;
  border-color: #4285F4;
  box-shadow: 0 0 0 2px rgba(66, 133, 244, 0.25);
}

.google-input :deep(.el-input__prefix) {
  margin-right: 12px;
  color: #5f6368;
}

.password-eye {
  cursor: pointer;
  color: #5f6368;
  font-size: 18px;
  transition: color 0.2s;
}

.password-eye:hover {
  color: #4285F4;
}

.form-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 22px;
  margin-top: -4px;
}

.remember-me {
  color: #5f6368;
  font-size: 14px;
}

.forgot-password {
  color: #4285F4;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  transition: color 0.2s;
}

.forgot-password:hover {
  color: #1a73e8;
  text-decoration: underline;
}

.google-button {
  width: 100%;
  height: 46px;
  background: linear-gradient(to right, #4285F4, #1a73e8);
  border: none;
  border-radius: 10px;
  color: white;
  font-weight: 500;
  font-size: 16px;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  margin-top: 8px;
  position: relative;
  overflow: hidden;
}

.google-button::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0));
  transform: translateY(-100%);
  transition: transform 0.6s;
}

.google-button:hover {
  background: linear-gradient(to right, #3367d6, #1a73e8);
  box-shadow: 0 4px 12px rgba(66, 133, 244, 0.4);
  transform: translateY(-2px);
}

.google-button:hover::after {
  transform: translateY(100%);
}

.google-button:active {
  background: #1967d2;
  transform: translateY(0);
}

:deep(.el-form-item__label) {
  color: #202124;
  font-size: 14px;
  font-weight: 500;
  padding: 0 0 8px;
  line-height: 1.2;
}

:deep(.el-input__inner) {
  color: #202124;
  font-size: 15px;
}

:deep(.el-input__inner::placeholder) {
  color: #80868b;
}

:deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  background-color: #4285F4;
  border-color: #4285F4;
}

:deep(.el-checkbox__inner:hover) {
  border-color: #4285F4;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(25px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式设计 */
@media (max-width: 480px) {
  .login-container {
    padding: 25px 20px;
    margin: 16px;
    max-width: 320px;
  }
  
  .login-header h2 {
    font-size: 24px;
  }
  
  .subtitle {
    font-size: 14px;
  }
  
  .google-button {
    height: 44px;
    font-size: 15px;
  }
  
  .logo-container {
    width: 60px;
    height: 60px;
    padding: 10px;
  }
  
  .logo-container::after {
    width: 68px;
    height: 68px;
  }
}
</style>