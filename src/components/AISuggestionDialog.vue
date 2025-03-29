<template>
  <el-dialog
    v-model="dialogVisible"
    width="500px"
    :close-on-click-modal="false"
    class="filter-dialog"
    :show-close="false"
  >
    <template #header>
      <div class="dialog-header">
        <span class="dialog-title">AI脱敏建议</span>
        <el-button
          class="close-button"
          circle
          @click="handleClose"
        >
          <el-icon><Close /></el-icon>
        </el-button>
      </div>
    </template>
    <div class="ai-suggestion-container">
      <div class="loading-section" v-if="loading">
        <el-icon class="loading-icon"><Loading /></el-icon>
        <span>正在分析表中需要脱敏的字段...</span>
      </div>
      
      <div class="answer-section" v-if="answer">
        <h4>需要脱敏的字段：</h4>
        <div class="answer-content">
          {{ answer }}
        </div>
        
        <el-collapse v-if="thinkingContent" class="thinking-collapse">
          <el-collapse-item title="查看AI分析过程">
            <div class="thinking-content">
              {{ thinkingContent }}
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">关闭</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { Loading, Close } from '@element-plus/icons-vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  tableName: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['update:modelValue']);

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const answer = ref('');
const loading = ref(false);
const thinkingContent = ref('');

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
  loading.value = true;
  answer.value = '';
  thinkingContent.value = '';
  try {
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-r1:1.5b',
        prompt: `作为一个数据安全专家，请分析表 ${props.tableName} 中需要脱敏的字段。

数据脱敏的基本概念：
1. 个人身份信息(PII)：包括姓名、身份证号、电话号码、地址等可直接识别个人身份的信息
2. 敏感个人信息(SPI)：包括银行账号、密码、生物特征、健康医疗信息等
3. 商业敏感信息：包括薪资、财务数据、商业机密等

需要重点关注的字段类型：
- 身份类：name、real_name、id_card、passport_no等
- 联系类：phone、email、address、location等
- 账户类：account、password、credit_card等
- 生物特征：face_image、fingerprint等
- 健康医疗：medical_history、diagnosis等
- 财务类：salary、balance、transaction等

请分析表名中的语义和字段名特征，列出所有需要脱敏的字段名称，用逗号分隔。

<分析过程>
1. 分析表名是否暗示表的用途（如user、employee、patient等）
2. 识别字段名中包含的敏感信息关键词
3. 考虑字段的组合是否会造成隐私泄露
</分析过程>

请只返回需要脱敏的字段列表，格式如：name,phone,email,id_card`
      })
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';

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
              // 过滤掉think标签内容后再显示
              answer.value = removeThinkTags(fullResponse);
              
              // 提取思考内容
              const thinking = extractThinkingContent(fullResponse);
              if (thinking) {
                thinkingContent.value = thinking;
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
    ElMessage.error('获取脱敏建议失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

const handleClose = () => {
  dialogVisible.value = false;
  answer.value = '';
  thinkingContent.value = '';
};

// 当对话框打开时自动获取建议
watch(dialogVisible, (newVal) => {
  if (newVal && props.tableName) {
    askAI();
  }
});
</script>

<style scoped>
.ai-suggestion-container {
  padding: 20px;
  min-height: 200px;
}

.loading-section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 40px 0;
}

.loading-icon {
  font-size: 20px;
  color: #409EFF;
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.answer-section {
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.answer-section h4 {
  margin: 0 0 10px 0;
  color: #303133;
}

.answer-content {
  white-space: pre-wrap;
  line-height: 1.6;
  color: #606266;
  font-family: monospace;
  margin-bottom: 15px;
}

.thinking-collapse {
  margin-top: 15px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
}

.thinking-content {
  padding: 10px;
  background-color: #fff;
  border-radius: 4px;
  white-space: pre-wrap;
  line-height: 1.6;
  color: #606266;
  font-family: monospace;
}

:deep(.el-collapse-item__header) {
  font-size: 14px;
  color: #606266;
  background-color: #f8f9fa;
  border-bottom: 1px solid #ebeef5;
}

:deep(.el-collapse-item__content) {
  padding: 0;
}

/* 统一的对话框样式 */
.filter-dialog :deep(.el-dialog) {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
}

.dialog-title {
  color: #1a237e;
  font-weight: 500;
  font-size: 18px;
}

.close-button {
  border: none;
  background: transparent;
  color: #909399;
  transition: all 0.3s ease;
}

.close-button:hover {
  color: #1a237e;
  background: rgba(26, 35, 126, 0.04);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  background: #f5f7fa;
  border-top: 1px solid #e4e7ed;
}

.filter-dialog :deep(.el-dialog__header) {
  padding: 0;
  margin: 0;
}

.filter-dialog :deep(.el-dialog__body) {
  padding: 24px;
}

.filter-dialog :deep(.el-dialog__footer) {
  padding: 0;
}
</style> 