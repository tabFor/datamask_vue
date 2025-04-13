<template>
  <div class="dashboard">
    <!-- 欢迎区域 -->
    <div class="welcome-section">
      <div class="welcome-content">
        <div class="welcome-text">
          <h1 class="welcome-title">
            <span class="gradient-text">数据脱敏</span>
            <span class="title-sub">安全、高效的敏感数据处理解决方案</span>
          </h1>
          <p class="welcome-description">
            本系统提供全面的数据脱敏解决方案，包括敏感数据识别、静态数据脱敏、动态数据脱敏等功能，帮助您保护敏感数据安全，满足合规要求。
          </p>
          <div class="welcome-actions">
            <el-button type="primary" size="large" class="action-button primary-action" @click="navigateTo('/tasks')">
              <el-icon><DataAnalysis /></el-icon>
              开始使用
            </el-button>
            <el-button size="large" class="action-button secondary-action" @click="navigateTo('/documentation')">
              <el-icon><Reading /></el-icon>
              了解更多
            </el-button>
          </div>
        </div>
        <div class="welcome-stats">
          <div class="stat-card">
            <div class="stat-number">99.9%</div>
            <div class="stat-label">数据安全率</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">50+</div>
            <div class="stat-label">脱敏算法</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">100%</div>
            <div class="stat-label">合规性</div>
          </div>
        </div>
      </div>
      <div class="welcome-illustration">
        <div class="data-flow">
          <div class="flow-line"></div>
          <div class="flow-dot"></div>
          <div class="flow-dot"></div>
          <div class="flow-dot"></div>
        </div>
        <div class="security-shield">
          <el-icon><Lock /></el-icon>
        </div>
      </div>
    </div>

    <!-- 学习资源区域 -->
    <div class="resources-section">
      <div class="section-header">
        <div class="header-content">
          <h2 class="section-title">
            <span class="gradient-text">数据脱敏助手</span>
            <span class="title-sub">您的数据安全专家</span>
          </h2>
          <div class="header-tags">
            <el-tag type="success" effect="plain" class="md-tag">专业</el-tag>
            <el-tag type="warning" effect="plain" class="md-tag">安全</el-tag>
            <el-tag type="info" effect="plain" class="md-tag">高效</el-tag>
          </div>
        </div>
        <p class="section-description">
          我是您的数据脱敏专家，专注于解答数据安全、脱敏算法、合规性等相关问题。
          请确保您的问题与数据脱敏相关，以便我能提供最专业的帮助。
        </p>
      </div>

      <div class="ai-assistant">
        <div class="ai-chat-container">
          <div class="chat-header">
            <div class="header-left">
              <h3>数据脱敏助手</h3>
            </div>
            <div class="header-right">
              <el-button 
                type="text" 
                class="new-chat-button"
                @click="startNewChat"
              >
                <el-icon><Refresh /></el-icon>
                新对话
              </el-button>
            </div>
          </div>
          <div class="chat-messages" ref="chatMessages">
            <div class="ai-message" v-if="messages.length === 0">
              <div class="ai-avatar">
                <el-icon><ChatDotRound /></el-icon>
              </div>
              <div class="message-content">
                <p>您好！我是您的数据脱敏助手，我可以帮您：</p>
                <div class="quick-actions">
                  <el-button 
                    v-for="(action, index) in quickActions" 
                    :key="index"
                    class="quick-action-button"
                    @click="handleQuickAction(action)"
                  >
                    {{ action }}
                  </el-button>
                </div>
              </div>
            </div>

            <template v-for="(message, index) in messages" :key="index">
              <div class="message-wrapper" :class="{ 'user-message': message.role === 'user' }">
                <div class="ai-message">
                  <div class="ai-avatar" v-if="message.role === 'assistant'">
                    <el-icon><ChatDotRound /></el-icon>
                  </div>
                  <div class="user-avatar" v-else>
                    <el-icon><User /></el-icon>
                  </div>
                  <div class="message-content">
                    <div class="answer-content" v-html="message.content"></div>
                    <el-collapse v-if="message.thinking" class="thinking-collapse">
                      <el-collapse-item title="查看分析过程">
                        <div class="thinking-content">{{ message.thinking }}</div>
                      </el-collapse-item>
                    </el-collapse>
                  </div>
                </div>
              </div>
            </template>

            <div v-if="aiLoading && messages.length > 0 && messages[messages.length - 1].role === 'user'" class="loading-message">
              <div class="ai-avatar">
                <el-icon><ChatDotRound /></el-icon>
              </div>
              <div class="message-content">
                <div class="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          </div>

          <div class="ai-input-container">
            <el-input
              v-model="userQuestion"
              placeholder="请输入您的问题..."
              :disabled="aiLoading"
              @keyup.enter="askAI"
              class="ai-input"
            >
              <template #prefix>
                <el-icon><Edit /></el-icon>
              </template>
              <template #append>
                <el-button
                  type="primary"
                  :loading="aiLoading"
                  @click="askAI"
                  class="send-button"
                >
                  <span class="send-text">发送 &#10148;</span>
                </el-button>
              </template>
            </el-input>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import {
  DataAnalysis,
  Lock,
  Reading,
  ChatDotRound,
  Edit,
  User,
  Refresh
} from '@element-plus/icons-vue';

const router = useRouter();
const isLoggedIn = ref(false);
const userName = ref('');
const userRole = ref('');
const userQuestion = ref('');
const aiLoading = ref(false);
const chatMessages = ref(null);

const messages = ref([]);

const quickActions = [
  '如何选择合适的脱敏算法？',
  '如何评估脱敏效果？',
  '如何处理特殊字符？',
  '如何配置脱敏规则？'
];

const handleQuickAction = (action) => {
  userQuestion.value = action;
  askAI();
};

const scrollToBottom = async () => {
  await nextTick();
  if (chatMessages.value) {
    chatMessages.value.scrollTop = chatMessages.value.scrollHeight;
  }
};

const extractThinkingContent = (text) => {
  const thinkMatch = text.match(/<think>(.*?)<\/think>/s);
  if (thinkMatch) {
    return thinkMatch[1].trim();
  }
  return null;
};

const removeThinkTags = (text) => {
  return text.replace(/<think>.*?<\/think>/s, '').trim();
};

const askAI = async () => {
  if (!userQuestion.value.trim()) {
    ElMessage.warning('请输入您的问题');
    return;
  }

  const userMessage = userQuestion.value;
  messages.value.push({
    role: 'user',
    content: userMessage
  });
  userQuestion.value = '';
  aiLoading.value = true;
  await scrollToBottom();

  let aiMessage = {
    role: 'assistant',
    content: '',
    thinking: ''
  };

  messages.value.push(aiMessage);
  await scrollToBottom();

  try {
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-r1:1.5b',
        prompt: `你是一个专业的数据脱敏专家，专注于数据安全、脱敏算法和合规性相关的问题。请遵循以下规则：

1. 如果用户的问题与数据脱敏无关，请礼貌地告知用户你只能回答与数据脱敏相关的问题，并建议用户提出相关的问题。

2. 对于数据脱敏相关的问题，请提供专业、详细的回答，包括：
   - 问题分析
   - 解决方案
   - 最佳实践建议

3. 使用简洁明了的语言，避免过于技术性的术语。

4. 如果问题涉及具体的技术实现，请提供示例代码或配置说明。

5. 始终强调数据安全和合规性的重要性。

用户问题：${userMessage}

<think>
请思考：
1. 问题的核心要点
2. 相关的数据安全标准
3. 可能的解决方案
4. 实际应用中的注意事项
</think>

请用简洁明了的语言回答。`
      })
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';
    let currentContent = '';
    let currentThinking = '';

    let reading = true;
    while (reading) {
      const { done, value } = await reader.read();
      if (done) {
        reading = false;
        break;
      }
      
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (line.trim()) {
          try {
            const data = JSON.parse(line);
            if (data.response) {
              fullResponse += data.response;
              const processedResponse = processResponse(fullResponse);
              
              // 只有当内容发生变化时才更新消息
              if (processedResponse.content !== currentContent || processedResponse.thinking !== currentThinking) {
                currentContent = processedResponse.content;
                currentThinking = processedResponse.thinking;
                
                // 更新消息对象
                aiMessage.content = currentContent;
                if (currentThinking) {
                  aiMessage.thinking = currentThinking;
                }
                
                // 触发响应式更新
                messages.value = [...messages.value];
                await scrollToBottom();
              }
            }
          } catch (e) {
            console.error('解析响应数据失败:', e);
          }
        }
      }
    }
  } catch (error) {
    console.error('AI请求失败:', error);
    ElMessage.error('获取回答失败，请稍后重试');
    // 如果发生错误，移除加载中的消息
    messages.value = messages.value.filter(msg => msg !== aiMessage);
  } finally {
    aiLoading.value = false;
  }
};

const processResponse = (text) => {
  const thinking = extractThinkingContent(text);
  const content = removeThinkTags(text)
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\d+\./g, '<br>$&')
    .replace(/<br><br>/g, '<br>');
  
  return {
    content,
    thinking
  };
};

const startNewChat = () => {
  messages.value = [];
  userQuestion.value = '';
  aiLoading.value = false;
};

// 在组件挂载时检查登录状态
onMounted(() => {
  const token = localStorage.getItem('token');
  if (token) {
    isLoggedIn.value = true;
    userName.value = localStorage.getItem('username');
    userRole.value = localStorage.getItem('userRole');
  }
});

// 导航函数
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
  padding: 0;
  max-width: 1200px;
  margin: 0 auto;
  font-family: 'Roboto', 'Noto Sans SC', sans-serif;
}

/* 欢迎区域样式 */
.welcome-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 120px 0;
  margin-bottom: 80px;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.welcome-content {
  flex: 1;
  max-width: 600px;
  position: relative;
  z-index: 1;
  padding: 0 48px;
}

.welcome-text {
  margin-bottom: 48px;
}

.welcome-title {
  font-size: 60px;
  font-weight: 700;
  color: #333;
  margin: 0 0 16px;
  line-height: 1.2;
  letter-spacing: -0.02em;
}

.gradient-text {
  background: linear-gradient(135deg, #1976D2 0%, #2196F3 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  display: block;
  margin-bottom: 8px;
}

.title-sub {
  display: block;
  font-size: 24px;
  font-weight: 400;
  color: #666;
  margin-top: 8px;
  letter-spacing: 0.02em;
}

.welcome-description {
  font-size: 16px;
  color: #666;
  line-height: 1.8;
  margin-bottom: 32px;
  max-width: 500px;
  letter-spacing: 0.5px;
}

.welcome-actions {
  display: flex;
  gap: 16px;
}

.action-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 24px;
  height: 48px;
  font-size: 14px;
  border-radius: 8px;
  transition: all 0.3s ease;
  font-weight: 500;
  letter-spacing: 0.75px;
  text-transform: uppercase;
}

.primary-action {
  background-color: #1976D2;
  color: white;
  box-shadow: 0 3px 1px -2px rgba(0,0,0,.2), 0 2px 2px 0 rgba(0,0,0,.14), 0 1px 5px 0 rgba(0,0,0,.12);
}

.secondary-action {
  color: #1976D2;
  background-color: transparent;
  border: 1px solid #1976D2;
}

.action-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 5px -3px rgba(0,0,0,.2), 0 8px 10px 1px rgba(0,0,0,.14), 0 3px 14px 2px rgba(0,0,0,.12);
}

.welcome-stats {
  display: flex;
  gap: 24px;
  margin-top: 48px;
  padding-top: 48px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

.stat-card {
  text-align: center;
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
  flex: 1;
}

.stat-card:hover {
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
  transform: translateY(-5px);
}

.stat-number {
  font-size: 36px;
  font-weight: 700;
  color: #1976D2;
  margin-bottom: 8px;
  background: linear-gradient(135deg, #1976D2 0%, #2196F3 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stat-label {
  font-size: 14px;
  color: #666;
  font-weight: 500;
  letter-spacing: 0.25px;
}

.welcome-illustration {
  flex: 1;
  max-width: 500px;
  position: relative;
  height: 400px;
}

.data-flow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 300px;
  height: 300px;
}

.flow-line {
  position: absolute;
  top: 0;
  left: 50%;
  width: 2px;
  height: 100%;
  background: linear-gradient(to bottom, #1976D2, transparent);
  transform: rotate(45deg);
}

.flow-dot {
  position: absolute;
  width: 12px;
  height: 12px;
  background: #1976D2;
  border-radius: 50%;
  animation: float 3s ease-in-out infinite;
}

.flow-dot:nth-child(2) {
  top: 20%;
  left: 20%;
  animation-delay: 0.2s;
}

.flow-dot:nth-child(3) {
  top: 50%;
  left: 50%;
  animation-delay: 0.4s;
}

.flow-dot:nth-child(4) {
  top: 80%;
  left: 80%;
  animation-delay: 0.6s;
}

.security-shield {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 120px;
  height: 120px;
  background: rgba(25, 118, 210, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: pulse 2s ease-in-out infinite;
}

.security-shield .el-icon {
  font-size: 48px;
  color: #1976D2;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    transform: translate(-50%, -50%) scale(1.05);
  }
}

/* 学习资源区域样式 */
.resources-section {
  padding: 80px 0;
  max-width: 1200px;
  margin: 0 auto;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.section-header {
  text-align: center;
  margin-bottom: 48px;
  padding: 0 24px;
}

.header-content {
  margin-bottom: 24px;
}

.section-title {
  font-size: 34px;
  font-weight: 700;
  color: #333;
  margin: 0 0 16px;
  letter-spacing: -0.02em;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.title-sub {
  font-size: 16px;
  color: #666;
  font-weight: 400;
  margin-top: 8px;
  letter-spacing: 0.15px;
}

.header-tags {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 16px;
}

.md-tag {
  font-size: 14px;
  padding: 8px 16px;
  border-radius: 16px;
  font-weight: 500;
  letter-spacing: 0.25px;
}

.section-description {
  font-size: 16px;
  color: #666;
  max-width: 800px;
  margin: 0 auto;
  line-height: 1.6;
  letter-spacing: 0.5px;
}

.ai-assistant {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.05);
  height: 600px;
  display: flex;
  flex-direction: column;
  margin: 0 24px;
}

.ai-assistant:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.ai-chat-container {
  padding: 24px;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 0 16px 0;
  margin-bottom: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.header-left h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.new-chat-button {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #1976D2;
  font-size: 14px;
  padding: 0 8px;
  height: 36px;
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.new-chat-button:hover {
  background: rgba(25, 118, 210, 0.1);
}

.new-chat-button .el-icon {
  font-size: 18px;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding-right: 8px;
  margin-bottom: 24px;
}

.chat-messages::-webkit-scrollbar {
  width: 4px;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 2px;
}

.chat-messages::-webkit-scrollbar-track {
  background: transparent;
}

.message-wrapper {
  margin-bottom: 24px;
  animation: fadeIn 0.3s ease;
}

.message-wrapper.user-message {
  display: flex;
  justify-content: flex-end;
}

.user-message .ai-message {
  flex-direction: row-reverse;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.user-avatar .el-icon {
  font-size: 20px;
  color: white;
}

.ai-message {
  display: flex;
  gap: 16px;
  animation: fadeIn 0.3s ease;
}

.ai-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1976D2 0%, #2196F3 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.ai-avatar .el-icon {
  font-size: 20px;
  color: white;
}

.message-content {
  flex: 1;
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  line-height: 1.6;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  max-width: 80%;
  letter-spacing: 0.25px;
}

.user-message .message-content {
  background: linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%);
  color: white;
}

.answer-content {
  white-space: pre-wrap;
  color: inherit;
  line-height: 1.6;
}

.answer-content strong {
  color: #1976D2;
  font-weight: 500;
}

.user-message .answer-content strong {
  color: white;
}

.answer-content em {
  font-style: italic;
  color: #666;
}

.user-message .answer-content em {
  color: rgba(255, 255, 255, 0.9);
}

.quick-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}

.quick-action-button {
  background: rgba(25, 118, 210, 0.1);
  color: #1976D2;
  border: none;
  padding: 0 16px;
  height: 36px;
  border-radius: 4px;
  font-size: 14px;
  transition: background-color 0.3s ease;
  letter-spacing: 0.25px;
}

.quick-action-button:hover {
  background: rgba(25, 118, 210, 0.2);
}

.ai-input-container {
  margin-top: 24px;
  position: relative;
}

.ai-input {
  border-radius: 8px;
  overflow: hidden;
}

.ai-input :deep(.el-input__wrapper) {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 12px 16px;
  border-radius: 8px;
  background-color: white;
}

.ai-input :deep(.el-input__prefix) {
  color: #1976D2;
  margin-right: 8px;
}

.send-button {
  height: 100%;
  padding: 0 20px;
  border-radius: 0 8px 8px 0;
  background: linear-gradient(135deg, #1976D2 0%, #2196F3 100%);
  border: none;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.send-button:hover {
  background: #1976D2;
  box-shadow: 0 2px 4px rgba(0,0,0,0.24), 0 4px 8px rgba(0,0,0,0.12);
}

.send-text {
  color: white;
  font-weight: 500;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
  letter-spacing: 0.75px;
  text-transform: uppercase;
}

.thinking-collapse {
  margin-top: 16px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 4px;
  overflow: hidden;
}

.thinking-content {
  padding: 12px;
  background-color: #fff;
  border-radius: 4px;
  white-space: pre-wrap;
  line-height: 1.6;
  color: #666;
  font-family: 'Roboto Mono', monospace;
  font-size: 14px;
  letter-spacing: 0.25px;
}

:deep(.el-collapse-item__header) {
  font-size: 14px;
  color: #666;
  background-color: #f8f9fa;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  padding: 12px 16px;
  font-weight: 500;
  letter-spacing: 0.25px;
}

:deep(.el-collapse-item__content) {
  padding: 0;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.loading-message {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  animation: fadeIn 0.3s ease;
}

.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  width: fit-content;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  background: #1976D2;
  border-radius: 50%;
  animation: typing 1s infinite;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 100% {
    transform: translateY(0);
    opacity: 0.4;
  }
  50% {
    transform: translateY(-4px);
    opacity: 1;
  }
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .welcome-section {
    flex-direction: column;
    text-align: center;
    padding: 80px 24px;
  }

  .welcome-content {
    max-width: 100%;
    margin-bottom: 48px;
    padding: 0;
  }

  .welcome-illustration {
    max-width: 100%;
    height: 300px;
  }

  .welcome-actions {
    justify-content: center;
  }

  .welcome-stats {
    justify-content: center;
  }

  .welcome-description {
    margin: 0 auto 32px;
  }
}

@media (max-width: 768px) {
  .welcome-title {
    font-size: 48px;
  }

  .title-sub {
    font-size: 20px;
  }

  .welcome-description {
    font-size: 16px;
  }

  .section-title {
    font-size: 28px;
  }

  .ai-chat-container {
    padding: 16px;
  }

  .ai-message {
    gap: 12px;
  }

  .ai-avatar, .user-avatar {
    width: 32px;
    height: 32px;
  }

  .ai-avatar .el-icon, .user-avatar .el-icon {
    font-size: 16px;
  }

  .message-content {
    padding: 12px;
  }

  .quick-actions {
    flex-direction: column;
  }

  .quick-action-button {
    width: 100%;
  }
}
</style>
