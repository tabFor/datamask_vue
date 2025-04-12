<template>
  <div class="presidio-test-container">
    <el-row :gutter="20">
      <!-- 左侧状态面板 -->
      <el-col :span="6">
        <el-card class="status-panel" shadow="hover">
          <template #header>
            <div class="panel-header">
              <el-icon><Monitor /></el-icon>
              <span>服务状态</span>
            </div>
          </template>
          <div class="status-content">
            <el-button 
              type="primary" 
              class="status-button" 
              @click="checkStatus" 
              :loading="statusLoading"
              :icon="Monitor"
            >
              检查服务状态
            </el-button>
            <div v-if="statusResult" class="status-details">
              <el-descriptions :column="1" border>
                <el-descriptions-item label="分析器状态">
                  <el-tag :type="statusResult.analyzer_available ? 'success' : 'danger'">
                    {{ statusResult.analyzer_available ? '正常' : '异常' }}
                  </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="脱敏器状态">
                  <el-tag :type="statusResult.anonymizer_available ? 'success' : 'danger'">
                    {{ statusResult.anonymizer_available ? '正常' : '异常' }}
                  </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="分析器地址">
                  {{ statusResult.analyzer_url }}
                </el-descriptions-item>
                <el-descriptions-item label="脱敏器地址">
                  {{ statusResult.anonymizer_url }}
                </el-descriptions-item>
              </el-descriptions>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 右侧功能区域 -->
      <el-col :span="18">
        <el-tabs v-model="activeTab" class="function-tabs">
          <!-- 文本分析标签页 -->
          <el-tab-pane label="文本分析" name="analyze">
            <el-card class="function-card" shadow="hover">
              <template #header>
                <div class="panel-header">
                  <el-icon><Search /></el-icon>
                  <span>敏感信息识别</span>
                </div>
              </template>
              <div class="function-content">
                <el-input
                  v-model="analyzeText"
                  type="textarea"
                  :rows="6"
                  placeholder="请输入要分析的文本..."
                  class="text-input"
                />
                <div class="action-buttons">
                  <el-button 
                    type="primary" 
                    @click="analyzeTextData" 
                    :loading="analyzeLoading"
                    :icon="Search"
                  >
                    开始分析
                  </el-button>
                  <el-button 
                    @click="analyzeText = ''"
                  >
                    <el-icon><Delete /></el-icon>
                    清空
                  </el-button>
                </div>
                <div v-if="analyzeResult" class="result-container">
                  <el-divider content-position="left">分析结果</el-divider>
                  <el-timeline>
                    <el-timeline-item
                      v-for="(item, index) in analyzeResult.results"
                      :key="index"
                      :type="getTimelineType(item.entity_type)"
                      :timestamp="`可信度: ${(item.score * 100).toFixed(1)}%`"
                    >
                      <el-card class="result-card">
                        <template #header>
                          <div class="result-header">
                            <el-tag :type="getTagType(item.entity_type)">
                              {{ item.entity_type }}
                            </el-tag>
                            <span class="result-text">{{ item.text }}</span>
                          </div>
                        </template>
                        <div class="result-details">
                          <el-descriptions :column="2" border>
                            <el-descriptions-item label="起始位置">
                              {{ item.start }}
                            </el-descriptions-item>
                            <el-descriptions-item label="结束位置">
                              {{ item.end }}
                            </el-descriptions-item>
                            <el-descriptions-item label="置信度">
                              <el-progress 
                                :percentage="item.score * 100" 
                                :status="getProgressStatus(item.score)"
                              />
                            </el-descriptions-item>
                          </el-descriptions>
                        </div>
                      </el-card>
                    </el-timeline-item>
                  </el-timeline>
                </div>
              </div>
            </el-card>
          </el-tab-pane>

          <!-- 文本脱敏标签页 -->
          <el-tab-pane label="文本脱敏" name="anonymize">
            <el-card class="function-card" shadow="hover">
              <template #header>
                <div class="panel-header">
                  <el-icon><Lock /></el-icon>
                  <span>敏感信息脱敏</span>
                </div>
              </template>
              <div class="function-content">
                <el-input
                  v-model="anonymizeText"
                  type="textarea"
                  :rows="6"
                  placeholder="请输入要脱敏的文本..."
                  class="text-input"
                />
                <div class="action-buttons">
                  <el-button 
                    type="primary" 
                    @click="anonymizeTextData" 
                    :loading="anonymizeLoading"
                    :icon="Lock"
                  >
                    开始脱敏
                  </el-button>
                  <el-button 
                    @click="anonymizeText = ''"
                  >
                    <el-icon><Delete /></el-icon>
                    清空
                  </el-button>
                </div>
                <div v-if="anonymizeResult" class="result-container">
                  <el-divider content-position="left">脱敏结果</el-divider>
                  <el-card class="result-card">
                    <template #header>
                      <div class="result-header">
                        <span>原始文本</span>
                      </div>
                    </template>
                    <div class="text-content">{{ anonymizeResult.original_text }}</div>
                  </el-card>
                  <el-card class="result-card">
                    <template #header>
                      <div class="result-header">
                        <span>脱敏后文本</span>
                      </div>
                    </template>
                    <div class="text-content anonymized">{{ anonymizeResult.anonymized_text }}</div>
                  </el-card>
                </div>
              </div>
            </el-card>
          </el-tab-pane>
        </el-tabs>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { presidioApi } from '@/utils/api';
import {
  Monitor,
  Search,
  Lock,
  Delete,
} from '@element-plus/icons-vue';

export default {
  name: 'PresidioTest',
  components: {
    Monitor,
    Search,
    Lock,
    Delete,
  },
  data() {
    return {
      // 标签页控制
      activeTab: 'analyze',
      
      // 状态检查
      statusLoading: false,
      statusResult: null,
      
      // 文本分析
      analyzeText: 'My name is John Smith and my email is john.smith@example.com. My phone number is 555-123-4567 and my credit card is 4111 1111 1111 1111. My social security number is 123-45-6789.',
      analyzeLoading: false,
      analyzeResult: null,
      
      // 文本脱敏
      anonymizeText: 'My name is Emma Johnson and I live at 123 Main Street, New York. My email is emma.johnson@example.com and my phone number is 212-555-7890. My credit card number is 5555 6666 7777 8888.',
      anonymizeLoading: false,
      anonymizeResult: null,
    };
  },
  created() {
    // 检查是否已登录
    if (!localStorage.getItem('token')) {
      this.$message.warning('请先登录');
      this.$router.push('/login');
    }
  },
  methods: {
    // 获取标签类型
    getTagType(entityType) {
      const typeMap = {
        'PERSON': 'danger',
        'EMAIL': 'warning',
        'PHONE_NUMBER': 'info',
        'CREDIT_CARD': 'danger',
        'SSN': 'danger',
        'ADDRESS': 'warning',
        'DATE': 'info',
        'default': 'info'
      };
      return typeMap[entityType] || typeMap.default;
    },
    
    // 获取时间线类型
    getTimelineType(entityType) {
      const typeMap = {
        'PERSON': 'danger',
        'EMAIL': 'warning',
        'PHONE_NUMBER': 'info',
        'CREDIT_CARD': 'danger',
        'SSN': 'danger',
        'ADDRESS': 'warning',
        'DATE': 'info',
        'default': 'info'
      };
      return typeMap[entityType] || typeMap.default;
    },
    
    // 获取进度条状态
    getProgressStatus(score) {
      if (score >= 0.9) return 'success';
      if (score >= 0.7) return 'warning';
      return 'exception';
    },
    
    async checkStatus() {
      this.statusLoading = true;
      this.statusResult = null;
      
      try {
        const response = await presidioApi.checkStatus();
        this.statusResult = response.data;
      } catch (error) {
        console.error('检查状态失败:', error);
        if (error.response?.status === 401) {
          this.$message.error('登录已过期，请重新登录');
          this.$router.push('/login');
        } else {
          this.$message.error(error.response?.data?.message || '服务连接失败');
        }
      } finally {
        this.statusLoading = false;
      }
    },
    
    async analyzeTextData() {
      if (!this.analyzeText) {
        this.$message.warning('请输入要分析的文本');
        return;
      }
      
      this.analyzeLoading = true;
      this.analyzeResult = null;
      
      try {
        const response = await presidioApi.analyzeText(this.analyzeText);
        this.analyzeResult = response.data;
      } catch (error) {
        console.error('分析文本失败:', error);
        if (error.response?.status === 401) {
          this.$message.error('登录已过期，请重新登录');
          this.$router.push('/login');
        } else {
          this.$message.error(error.response?.data?.message || '分析失败');
        }
      } finally {
        this.analyzeLoading = false;
      }
    },
    
    async anonymizeTextData() {
      if (!this.anonymizeText) {
        this.$message.warning('请输入要脱敏的文本');
        return;
      }
      
      this.anonymizeLoading = true;
      this.anonymizeResult = null;
      
      try {
        const response = await presidioApi.anonymizeText(this.anonymizeText);
        this.anonymizeResult = response.data;
      } catch (error) {
        console.error('脱敏文本失败:', error);
        if (error.response?.status === 401) {
          this.$message.error('登录已过期，请重新登录');
          this.$router.push('/login');
        } else {
          this.$message.error(error.response?.data?.message || '脱敏失败');
        }
      } finally {
        this.anonymizeLoading = false;
      }
    }
  }
};
</script>

<style scoped>
.presidio-test-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 60px);
}

.status-panel {
  height: 100%;
  margin-bottom: 20px;
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.panel-header .el-icon {
  font-size: 20px;
}

.status-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.status-button {
  width: 100%;
}

.status-details {
  margin-top: 10px;
}

.function-tabs {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
}

.function-card {
  margin-bottom: 20px;
}

.function-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.text-input {
  width: 100%;
}

.action-buttons {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.result-container {
  margin-top: 20px;
}

.result-card {
  margin-bottom: 10px;
}

.result-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.result-text {
  font-weight: 500;
  color: #303133;
}

.result-details {
  margin-top: 10px;
}

.text-content {
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.6;
}

.text-content.anonymized {
  color: #67c23a;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .el-col {
    width: 100%;
  }
  
  .status-panel {
    margin-bottom: 20px;
  }
}

/* 动画效果 */
.el-card {
  transition: all 0.3s ease;
}

.el-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.el-timeline-item {
  transition: all 0.3s ease;
}

.el-timeline-item:hover {
  transform: translateX(5px);
}

/* Material Design 风格的阴影 */
.el-card {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.el-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

/* 渐变背景 */
.status-panel {
  background: linear-gradient(135deg, #ffffff 0%, #f5f7fa 100%);
}

.function-card {
  background: linear-gradient(135deg, #ffffff 0%, #f5f7fa 100%);
}

/* 圆角设计 */
.el-card {
  border-radius: 8px;
}

.el-button {
  border-radius: 6px;
}

/* 间距优化 */
.el-descriptions {
  margin: 10px 0;
}

.el-divider {
  margin: 20px 0;
}

/* 文字样式 */
.panel-header span {
  font-weight: 600;
  color: #303133;
}

.result-header span {
  font-weight: 500;
  color: #606266;
}

/* 进度条样式 */
.el-progress {
  margin: 5px 0;
}

/* 表格样式 */
.el-table {
  border-radius: 8px;
  overflow: hidden;
}

/* 标签样式 */
.el-tag {
  border-radius: 4px;
}

/* 输入框样式 */
.el-input {
  border-radius: 6px;
}

.el-textarea__inner {
  border-radius: 6px;
  resize: vertical;
}
</style> 