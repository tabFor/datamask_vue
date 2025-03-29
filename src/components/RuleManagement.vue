<!-- eslint-disable vue/max-attributes-per-line -->
<template>
  <div class="rule-management">
    <!-- 顶部操作栏 -->
    <div class="header-actions">
      <div class="title-section">
        <h2>静态数据脱敏</h2>
        <p class="subtitle">配置和管理数据脱敏规则，保护敏感信息</p>
      </div>
    </div>

    <!-- 主要内容区 -->
    <div class="main-content">
      <div class="rules-card">
        <div class="card-header">
          <div class="header-left">
            <h3>脱敏规则列表</h3>
            <div class="search-section">
              <el-input
                v-model="search"
                placeholder="搜索规则"
                class="glass-input"
                @input="debouncedSearch"
                clearable
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
              <el-select 
                v-model="searchField" 
                class="glass-select"
                placeholder="搜索字段"
              >
                <el-option label="全部字段" value="all" />
                <el-option label="规则名称" value="name" />
                <el-option label="规则ID" value="ruleId" />
                <el-option label="描述" value="description" />
                <el-option label="类型" value="type" />
              </el-select>
            </div>
          </div>
          <el-button
            type="primary"
            class="glass-button"
            @click="showAddRuleModal"
          >
            <el-icon><Plus /></el-icon>
            新增规则
          </el-button>
        </div>

        <div class="table-container">
          <el-table
            v-loading="loading"
            :data="filteredRules"
            class="glass-table"
            style="width: 100%"
            highlight-current-row
            :empty-text="noDataText"
          >
            <el-table-column
              prop="name"
              label="规则名称"
              width="150"
            >
              <template #default="scope">
                <div class="rule-name">
                  <el-icon><Document /></el-icon>
                  <span>{{ scope.row.name }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column
              prop="ruleId"
              label="规则ID"
              width="120"
            />
            <el-table-column
              prop="description"
              label="描述"
              show-overflow-tooltip
            />
            <el-table-column
              prop="type"
              label="类型"
              width="100"
            >
              <template #default="scope">
                <el-tag
                  :type="getTypeTagType(scope.row.type)"
                  class="glass-tag"
                >
                  {{ getTypeDisplayName(scope.row.type) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column
              prop="pattern"
              label="脱敏模式"
              width="120"
            >
              <template #default="scope">
                <el-tag
                  :type="getPatternTagType(scope.row.pattern)"
                  class="glass-tag"
                >
                  {{ getPatternDisplayName(scope.row.pattern) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column
              prop="updatedAt"
              label="更新时间"
              width="140"
            >
              <template #default="scope">
                {{ formatDate(scope.row.updatedAt) }}
              </template>
            </el-table-column>
            <el-table-column
              label="操作"
              width="180"
              fixed="right"
            >
              <template #default="scope">
                <div class="action-buttons">
                  <el-button
                    size="small"
                    class="glass-button"
                    @click="showEditRuleModal(scope.row)"
                  >
                    <el-icon><Edit /></el-icon>
                    编辑
                  </el-button>
                  <el-button
                    size="small"
                    type="danger"
                    class="glass-button"
                    @click="confirmDeleteRule(scope.row)"
                  >
                    <el-icon><Delete /></el-icon>
                    删除
                  </el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>
        
        <!-- 分页组件 -->
        <div class="pagination-container">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="totalRules"
            layout="total, sizes, prev, pager, next, jumper"
            class="glass-pagination"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </div>

    <!-- 新增/编辑规则模态框 -->
    <el-dialog
      v-model="isModalVisible"
      width="500px"
      :close-on-click-modal="false"
      class="filter-dialog"
      :show-close="false"
    >
      <template #header>
        <div class="dialog-header">
          <span class="dialog-title">{{ isEditing ? '编辑规则' : '新增规则' }}</span>
          <el-button
            class="close-button"
            circle
            @click="isModalVisible = false"
          >
            <el-icon><Close /></el-icon>
          </el-button>
        </div>
      </template>
      <div class="form-container">
        <el-form :model="currentRule" label-width="100px" class="filter-form">
          <el-form-item 
            label="规则ID" 
            required
          >
            <el-input 
              v-model="currentRule.ruleId" 
              :disabled="isEditing" 
              placeholder="请输入规则ID，如 phone_mask"
              class="custom-input"
            />
          </el-form-item>
          <el-form-item label="规则名称" required>
            <el-input 
              v-model="currentRule.name"
              class="custom-input"
            />
          </el-form-item>
          <el-form-item label="描述" required>
            <el-input 
              v-model="currentRule.description" 
              type="textarea" 
              :rows="3"
              class="custom-input"
            />
          </el-form-item>
          <el-form-item label="类型" required>
            <el-select 
              v-model="currentRule.type" 
              placeholder="选择类型"
              class="custom-select"
            >
              <el-option label="手机号码" value="PHONE" />
              <el-option label="身份证号" value="ID_CARD" />
              <el-option label="姓名" value="NAME" />
              <el-option label="邮箱" value="EMAIL" />
              <el-option label="银行卡号" value="BANK_CARD" />
              <el-option label="地址" value="ADDRESS" />
              <el-option label="自定义" value="CUSTOM" />
            </el-select>
          </el-form-item>
          <el-form-item label="脱敏模式" required>
            <el-select 
              v-model="currentRule.pattern" 
              placeholder="选择脱敏模式"
              class="custom-select"
            >
              <el-option label="保留前缀和后缀" value="KEEP_PREFIX_SUFFIX" />
              <el-option label="仅保留前缀" value="KEEP_PREFIX" />
              <el-option label="仅保留后缀" value="KEEP_SUFFIX" />
              <el-option label="邮箱脱敏" value="EMAIL_MASK" />
              <el-option label="地址脱敏" value="ADDRESS_MASK" />
              <el-option label="完全脱敏" value="FULL_MASK" />
            </el-select>
          </el-form-item>
          <el-form-item 
            v-if="showPrefixInput"
            label="前缀长度"
          >
            <el-input-number 
              v-model="currentRule.prefixLength" 
              :min="0" 
              :max="10"
              class="custom-input-number"
              controls-position="right"
            />
          </el-form-item>
          <el-form-item 
            v-if="showSuffixInput"
            label="后缀长度"
          >
            <el-input-number 
              v-model="currentRule.suffixLength" 
              :min="0" 
              :max="10"
              class="custom-input-number"
              controls-position="right"
            />
          </el-form-item>
          <el-form-item label="替换字符">
            <el-input 
              v-model="currentRule.replacementChar" 
              maxlength="1"
              class="custom-input"
            />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button 
            @click="isModalVisible = false"
          >
            取消
          </el-button>
          <el-button
            type="primary"
            :loading="saving"
            @click="saveRule"
          >
            保存
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import { rulesApi } from '@/utils/api';
import { Search, Document, Plus, Edit, Delete, Close } from '@element-plus/icons-vue';

// 初始化所有响应式数据
const rules = ref([]);
const search = ref('');
const searchField = ref('all');
const isModalVisible = ref(false);
const isEditing = ref(false);
const loading = ref(false);
const saving = ref(false);
const searchTimeout = ref(null);
const currentPage = ref(1);
const pageSize = ref(10);
const allRules = ref([]);

const currentRule = ref({
  id: null,
  ruleId: '',
  name: '',
  description: '',
  type: 'PHONE',
  pattern: 'KEEP_PREFIX_SUFFIX',
  prefixLength: 3,
  suffixLength: 4,
  replacementChar: '*',
  createdAt: null,
  updatedAt: null
});

// 根据搜索关键词过滤规则
const filteredRules = computed(() => {
  if (!search.value) {
    // 如果没有搜索关键词，则直接使用分页后的数据
    return paginatedRules.value;
  }
  
  const keyword = search.value.toLowerCase();
  const filtered = allRules.value.filter(rule => {
    if (searchField.value === 'all') {
      return rule.name.toLowerCase().includes(keyword) ||
             rule.ruleId.toLowerCase().includes(keyword) ||
             rule.description.toLowerCase().includes(keyword) ||
             rule.type.toLowerCase().includes(keyword) ||
             getPatternDisplayName(rule.pattern).toLowerCase().includes(keyword);
    } else if (searchField.value === 'name') {
      return rule.name.toLowerCase().includes(keyword);
    } else if (searchField.value === 'ruleId') {
      return rule.ruleId.toLowerCase().includes(keyword);
    } else if (searchField.value === 'description') {
      return rule.description.toLowerCase().includes(keyword);
    } else if (searchField.value === 'type') {
      return rule.type.toLowerCase().includes(keyword);
    }
    return false;
  });
  
  // 不在计算属性中修改状态，而是返回结果
  const startIndex = (currentPage.value - 1) * pageSize.value;
  return filtered.slice(startIndex, startIndex + pageSize.value);
});

// 计算过滤后的总记录数
const filteredTotal = computed(() => {
  if (!search.value) {
    return allRules.value.length;
  }
  
  const keyword = search.value.toLowerCase();
  return allRules.value.filter(rule => {
    if (searchField.value === 'all') {
      return rule.name.toLowerCase().includes(keyword) ||
             rule.ruleId.toLowerCase().includes(keyword) ||
             rule.description.toLowerCase().includes(keyword) ||
             rule.type.toLowerCase().includes(keyword) ||
             getPatternDisplayName(rule.pattern).toLowerCase().includes(keyword);
    } else if (searchField.value === 'name') {
      return rule.name.toLowerCase().includes(keyword);
    } else if (searchField.value === 'ruleId') {
      return rule.ruleId.toLowerCase().includes(keyword);
    } else if (searchField.value === 'description') {
      return rule.description.toLowerCase().includes(keyword);
    } else if (searchField.value === 'type') {
      return rule.type.toLowerCase().includes(keyword);
    }
    return false;
  }).length;
});

// 总记录数使用计算属性
const totalRules = computed(() => {
  return filteredTotal.value;
});

// 计算当前页的数据
const paginatedRules = computed(() => {
  if (search.value) {
    // 如果有搜索关键词，由filteredRules处理
    return [];
  }
  const startIndex = (currentPage.value - 1) * pageSize.value;
  return allRules.value.slice(startIndex, startIndex + pageSize.value);
});

// 无搜索结果时的提示
const noDataText = computed(() => {
  if (search.value && filteredRules.value.length === 0) {
    return `没有找到包含 "${search.value}" 的结果`;
  }
  return '暂无数据';
});

// 是否显示前缀输入框
const showPrefixInput = computed(() => {
  return ['KEEP_PREFIX_SUFFIX', 'KEEP_PREFIX', 'EMAIL_MASK'].includes(currentRule.value.pattern);
});

// 是否显示后缀输入框
const showSuffixInput = computed(() => {
  return ['KEEP_PREFIX_SUFFIX', 'KEEP_SUFFIX'].includes(currentRule.value.pattern);
});

// 根据脱敏模式返回对应的Tag类型
const getPatternTagType = (pattern) => {
  const patternMap = {
    'KEEP_PREFIX_SUFFIX': 'success',
    'KEEP_PREFIX': 'warning',
    'KEEP_SUFFIX': 'warning',
    'EMAIL_MASK': 'info',
    'ADDRESS_MASK': 'info',
    'FULL_MASK': 'danger'
  };
  return patternMap[pattern] || 'info';
};

// 获取脱敏模式的显示名称
const getPatternDisplayName = (pattern) => {
  const patternMap = {
    'KEEP_PREFIX_SUFFIX': '保留前后缀',
    'KEEP_PREFIX': '保留前缀',
    'KEEP_SUFFIX': '保留后缀',
    'EMAIL_MASK': '邮箱脱敏',
    'ADDRESS_MASK': '地址脱敏',
    'FULL_MASK': '完全脱敏'
  };
  return patternMap[pattern] || pattern;
};

// 根据类型返回对应的Tag类型
const getTypeTagType = (type) => {
  const typeMap = {
    'PHONE': 'success',
    'ID_CARD': 'warning',
    'NAME': 'info',
    'EMAIL': 'primary',
    'BANK_CARD': 'danger',
    'ADDRESS': 'info',
    'CUSTOM': ''
  };
  return typeMap[type] || 'info';
};

// 获取类型的显示名称
const getTypeDisplayName = (type) => {
  const typeMap = {
    'PHONE': '手机号码',
    'ID_CARD': '身份证号',
    'NAME': '姓名',
    'EMAIL': '邮箱',
    'BANK_CARD': '银行卡号',
    'ADDRESS': '地址',
    'CUSTOM': '自定义'
  };
  return typeMap[type] || type;
};

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 获取所有规则
const fetchRules = async () => {
  loading.value = true;
  try {
    const response = await rulesApi.getAllRules();
    if (response.data.success) {
      allRules.value = response.data.data.rules || [];
      rules.value = paginatedRules.value;
    } else {
      ElMessage.error(response.data.message || '获取规则列表失败');
    }
  } catch (error) {
    console.error('获取规则列表失败:', error);
    ElMessage.error('获取规则列表失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

// 显示添加规则对话框
const showAddRuleModal = () => {
  isEditing.value = false;
  
  currentRule.value = {
    ruleId: '', // 用户需要手动输入规则ID
    name: '',
    description: '',
    type: 'PHONE',
    pattern: 'KEEP_PREFIX_SUFFIX',
    prefixLength: 3,
    suffixLength: 4,
    replacementChar: '*',
    createdAt: null,
    updatedAt: null
  };
  isModalVisible.value = true;
};

// 显示编辑规则对话框
const showEditRuleModal = (rule) => {
  isEditing.value = true;
  currentRule.value = { ...rule };
  isModalVisible.value = true;
};

// 保存规则
const saveRule = async () => {
  // 表单验证
  if (!currentRule.value.name || !currentRule.value.description || !currentRule.value.type || !currentRule.value.pattern || !currentRule.value.ruleId) {
    ElMessage.warning('请填写完整的规则信息');
    return;
  }
  
  // 验证规则ID格式
  if (!/^[a-z0-9_]+$/.test(currentRule.value.ruleId)) {
    ElMessage.warning('规则ID只能包含小写字母、数字和下划线');
    return;
  }
  
  saving.value = true;
  try {
    let response;
    if (isEditing.value) {
      // 编辑现有规则 - 使用ruleId
      response = await rulesApi.updateRule(currentRule.value.ruleId, currentRule.value);
    } else {
      // 创建新规则
      response = await rulesApi.createRule(currentRule.value);
    }
    
    if (response.data.success) {
      ElMessage.success(isEditing.value ? '规则已更新' : '规则已添加');
      isModalVisible.value = false;
      fetchRules(); // 刷新规则列表
    } else {
      ElMessage.error(response.data.message || (isEditing.value ? '更新规则失败' : '添加规则失败'));
    }
  } catch (error) {
    console.error(isEditing.value ? '更新规则失败:' : '添加规则失败:', error);
    ElMessage.error(isEditing.value ? '更新规则失败，请稍后重试' : '添加规则失败，请稍后重试');
  } finally {
    saving.value = false;
  }
};

// 确认删除规则
const confirmDeleteRule = (rule) => {
  ElMessageBox.confirm(
    `确定要删除规则 "${rule.name}" 吗？`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(() => {
      deleteRule(rule.ruleId);
    })
    .catch(() => {
      ElMessage.info('已取消删除');
    });
};

// 删除规则
const deleteRule = async (ruleId) => {
  loading.value = true;
  try {
    const response = await rulesApi.deleteRule(ruleId);
    if (response.data.success) {
      ElMessage.success('规则已成功删除');
      fetchRules(); // 刷新规则列表
    } else {
      ElMessage.error(response.data.message || '删除规则失败');
    }
  } catch (error) {
    console.error('删除规则失败:', error);
    ElMessage.error('删除规则失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

// 处理每页显示条数变化
const handleSizeChange = (newSize) => {
  pageSize.value = newSize;
  fetchRules();
};

// 处理页码变化
const handleCurrentChange = (newPage) => {
  currentPage.value = newPage;
  if (!search.value) {
    rules.value = paginatedRules.value;
  }
};

// 防抖搜索函数
const debouncedSearch = () => {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value);
  }
  searchTimeout.value = setTimeout(() => {
    // 搜索时重置页码
    currentPage.value = 1;
  }, 300);
};

// 组件挂载时获取规则列表
onMounted(() => {
  fetchRules();
});

// 清理定时器
onBeforeUnmount(() => {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value);
  }
});
</script>

<style scoped>
.rule-management {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 24px;
}

.header-actions {
  margin-bottom: 24px;
}

.title-section h2 {
  margin: 0;
  color: white;
  font-size: 28px;
  font-weight: 600;
}

.subtitle {
  margin: 8px 0 0;
  color: rgba(255, 255, 255, 0.8);
  font-size: 16px;
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
}

.rules-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
  padding: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header-left h3 {
  margin: 0 0 16px;
  color: white;
  font-size: 20px;
  font-weight: 500;
}

.search-section {
  display: flex;
  gap: 16px;
}

.glass-input :deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.glass-input :deep(.el-input__wrapper:hover) {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
}

.glass-input :deep(.el-input__wrapper.is-focus) {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.glass-input :deep(.el-input__inner) {
  color: white;
}

.glass-input :deep(.el-input__inner::placeholder) {
  color: rgba(255, 255, 255, 0.6);
}

.glass-select :deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.glass-select :deep(.el-input__inner) {
  color: white;
}

.glass-button {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  transition: all 0.3s ease;
}

.glass-button:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.glass-button:active {
  transform: translateY(1px);
}

.table-container {
  margin: 24px 0;
}

.glass-table {
  background: transparent;
}

.glass-table :deep(.el-table__header-wrapper) {
  background: rgba(255, 255, 255, 0.05);
}

.glass-table :deep(.el-table__body-wrapper) {
  background: transparent;
}

.glass-table :deep(.el-table__row) {
  background: transparent;
}

.glass-table :deep(.el-table__cell) {
  background: transparent;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  color: #2c3e50;
}

.glass-table :deep(.el-table__header-wrapper th) {
  color: #2c3e50;
  font-weight: 600;
}

.glass-table :deep(.el-table__row:hover > td) {
  background: rgba(255, 255, 255, 0.2) !important;
  color: #2c3e50;
}

.glass-table :deep(.el-table__row.current-row > td) {
  background: rgba(255, 255, 255, 0.3) !important;
  color: #2c3e50;
}

.rule-name {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #2c3e50;
}

.glass-tag {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #2c3e50;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.glass-pagination :deep(.el-pagination__total),
.glass-pagination :deep(.el-pagination__jump) {
  color: white;
}

.glass-pagination :deep(.el-pagination__button) {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
}

.glass-pagination :deep(.el-pagination__button:hover) {
  background: rgba(255, 255, 255, 0.2);
}

.glass-pagination :deep(.el-pagination__button.is-active) {
  background: rgba(255, 255, 255, 0.3);
}

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

.filter-form {
  padding: 24px;
}

.filter-form :deep(.el-form-item__label) {
  color: #606266;
  font-weight: 500;
}

.filter-form :deep(.el-input__wrapper) {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.filter-form :deep(.el-input__wrapper:hover) {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.filter-form :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 3px rgba(26, 35, 126, 0.15);
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