<template>
  <div class="dynamic-masking-container">
    <h1>动态数据脱敏</h1>
    
    <el-card class="query-card">
      <template #header>
        <div class="card-header">
          <span>数据库查询</span>
          <el-select v-model="selectedTable" placeholder="选择表" @change="handleTableChange">
            <el-option v-for="table in tables" :key="table.value" :label="table.label" :value="table.value" />
          </el-select>
        </div>
      </template>
      
      <div class="query-editor">
        <div class="editor-header">
          <span>查询选项</span>
          <div class="editor-actions">
            <el-switch
              v-model="enableMasking"
              active-text="启用脱敏"
              inactive-text="原始数据"
            />
            <el-button type="primary" @click="executeQuery" :loading="isLoading">执行查询</el-button>
          </div>
        </div>
        
        <div class="query-options">
          <el-form :inline="true" class="query-form">
            <el-form-item label="每页记录数">
              <el-input-number v-model="pageSize" :min="5" :max="50" :step="5" />
            </el-form-item>
            <el-form-item label="页码">
              <el-input-number v-model="currentPage" :min="0" :step="1" />
            </el-form-item>
          </el-form>
        </div>
        
        <div class="query-tips">
          <el-alert
            title="查询提示"
            type="info"
            :closable="false"
            :description="'当前查询: ' + (selectedTable ? tables.find(t => t.value === selectedTable)?.label : '未选择表')"
            show-icon
          />
        </div>
      </div>
      
      <div v-if="queryExecuted" class="query-results">
        <div class="results-header">
          <span>查询结果</span>
          <div class="results-info">
            <el-tag v-if="enableMasking" type="success">已脱敏</el-tag>
            <el-tag v-else type="warning">原始数据</el-tag>
            <span>共 {{ queryResults.length }} 条记录</span>
          </div>
        </div>
        
        <el-table :data="queryResults" style="width: 100%" border max-height="500">
          <el-table-column v-for="column in tableColumns" :key="column" :prop="column" :label="column">
            <template #default="scope">
              <span>{{ formatCellValue(scope.row[column], column) }}</span>
            </template>
          </el-table-column>
        </el-table>
        
        <div class="pagination-container">
          <el-pagination
            v-if="totalRecords > 0"
            background
            layout="prev, pager, next, sizes, total"
            :total="totalRecords"
            :page-size="pageSize"
            :current-page="currentPage + 1"
            @current-change="handlePageChange"
            @size-change="handleSizeChange"
          />
        </div>
      </div>
    </el-card>
    
    <el-card class="masking-rules-card">
      <template #header>
        <div class="card-header">
          <span>动态脱敏规则</span>
          <div class="rule-actions">
            <el-switch
              v-model="showOnlyActiveRules"
              active-text="只显示激活规则"
              inactive-text="显示所有规则"
              @change="toggleActiveRulesDisplay"
            />
            <el-button type="primary" @click="addMaskingRule">添加规则</el-button>
          </div>
        </div>
      </template>
      
      <el-table :data="paginatedRules" style="width: 100%" :row-class-name="getRowClassName">
        <el-table-column label="数据库">
          <template #default>datamask</template>
        </el-table-column>
        <el-table-column prop="tableName" label="表名" />
        <el-table-column prop="columnName" label="列名" />
        <el-table-column prop="maskingType" label="脱敏类型">
          <template #default="scope">
            <el-tag :type="getMaskingTypeTag(scope.row.maskingType)">
              {{ scope.row.maskingType }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态">
          <template #default="scope">
            <el-switch
              v-model="scope.row.active"
              @change="(val) => updateRuleStatus(scope.row, val)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template #default="scope">
            <div class="action-buttons">
              <el-button type="primary" size="small" @click="editRule(scope.row)">
                <el-icon><Edit /></el-icon>
                <span>编辑</span>
              </el-button>
              <el-button type="danger" size="small" @click="deleteRule(scope.row.id)">
                <el-icon><Delete /></el-icon>
                <span>删除</span>
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-if="rulesTotal > 0"
          background
          layout="prev, pager, next, sizes, total"
          :total="rulesTotal"
          :page-size="rulesPageSize"
          :current-page="rulesCurrentPage"
          @current-change="handleRulesPageChange"
          @size-change="handleRulesSizeChange"
        />
      </div>
    </el-card>
    
    <!-- 添加/编辑规则对话框 -->
    <el-dialog
      v-model="ruleDialogVisible"
      width="500px"
      :close-on-click-modal="false"
      class="filter-dialog"
      :show-close="false"
      top="5vh"
      :append-to-body="true"
    >
      <template #header>
        <div class="dialog-header dark">
          <span class="dialog-title">{{ isEditingRule ? '编辑脱敏规则' : '添加脱敏规则' }}</span>
          <el-button
            class="close-button"
            circle
            @click="ruleDialogVisible = false"
          >
            <el-icon><Close /></el-icon>
          </el-button>
        </div>
      </template>
      <el-scrollbar height="60vh" max-height="60vh">
        <el-form :model="currentRule" label-width="120px" class="filter-form">
          <el-form-item label="列名">
            <el-select v-model="currentRule.columnName" placeholder="选择列">
              <el-option v-for="column in columns" :key="column" :label="column" :value="column" />
            </el-select>
          </el-form-item>
          <el-form-item label="脱敏类型">
            <el-select v-model="currentRule.maskingType" placeholder="选择脱敏类型">
              <el-option label="完全遮盖" value="完全遮盖" />
              <el-option label="部分遮盖" value="部分遮盖" />
              <el-option label="替换" value="替换" />
              <el-option label="哈希" value="哈希" />
              <el-option label="随机化" value="随机化" />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-switch v-model="currentRule.active" />
          </el-form-item>
        </el-form>
      </el-scrollbar>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="ruleDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveRule">保存</el-button>
        </div>
      </template>
    </el-dialog>
    
    <!-- API连接状态提示 -->
    <el-dialog
      v-model="showApiErrorDialog"
      width="500px"
      :close-on-click-modal="false"
      class="filter-dialog"
      :show-close="false"
      top="5vh"
      :append-to-body="true"
    >
      <template #header>
        <div class="dialog-header dark">
          <span class="dialog-title">API连接错误</span>
          <el-button
            class="close-button"
            circle
            @click="showApiErrorDialog = false"
          >
            <el-icon><Close /></el-icon>
          </el-button>
        </div>
      </template>
      <el-scrollbar height="60vh" max-height="60vh">
        <div class="error-content">
          无法连接到API服务器，请确保后端服务正在运行。
        </div>
      </el-scrollbar>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showApiErrorDialog = false">关闭</el-button>
          <el-button type="primary" @click="retryConnection">重试</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { ElMessage, ElLoading, ElMessageBox } from 'element-plus';
import { Close, Edit, Delete } from '@element-plus/icons-vue';
import request from '@/utils/request';
import logger from '@/utils/logger';
import { maskingRulesApi, testDataApi } from '@/utils/api';

// 固定数据库名称
const DATABASE_NAME = 'datamask';

// 表列表
const tables = ref([
  { label: '客户数据', value: 'customer_info' },
  { label: '员工数据', value: 'employee_data' },
  { label: '金融记录', value: 'financial_records' },
  { label: '医疗记录', value: 'medical_records' },
  { label: '在线交易', value: 'online_transactions' }
]);

// 列列表（根据选择的表动态变化）
const columns = ref([]);

// 表结构映射
const tableStructure = {
  'customer_info': ['id', 'name', 'age', 'gender', 'email', 'phone', 'address', 'id_card', 'credit_card'],
  'financial_records': ['id', 'customer_id', 'account_number', 'transaction_type', 'amount', 'balance', 'transaction_date', 'card_number'],
  'medical_records': ['id', 'patient_id', 'patient_name', 'blood_type', 'diagnosis', 'treatment', 'visit_date', 'doctor', 'medical_insurance_id'],
  'employee_data': ['id', 'name', 'department', 'position', 'salary', 'hire_date', 'social_security_number', 'bank_account'],
  'online_transactions': ['id', 'user_id', 'order_id', 'product_name', 'amount', 'payment_method', 'card_number', 'transaction_date', 'shipping_address']
};

// 查询相关
const selectedTable = ref('');
const enableMasking = ref(true);
const queryExecuted = ref(false);
const queryResults = ref([]);
const isLoading = ref(false);

// 分页相关
const currentPage = ref(0); // 后端API从0开始计数
const pageSize = ref(10);
const totalRecords = ref(0);

// 表格列
const tableColumns = ref([]);

// 格式化单元格值，避免直接显示对象
const formatCellValue = (value, column) => {
  if (value === null || value === undefined) {
    return '';
  }
  
  // 处理特定列的对象格式
  if (typeof value === 'object') {
    // 处理patient对象
    if (column === 'patient' && value.name) {
      return `${value.name}(${value.gender}, ${value.age}岁)`;
    }
    
    // 处理user对象
    if ((column === 'user' || column === 'customer') && value.name) {
      return value.name;
    }
    
    // 处理日期对象
    if (value instanceof Date) {
      return value.toLocaleString('zh-CN');
    }
    
    // 其他对象转为JSON字符串，但格式化显示更友好
    try {
      return JSON.stringify(value, null, 2).replace(/[{}"]/g, '').replace(/,/g, ', ');
    } catch (e) {
      return String(value);
    }
  }
  
  return value;
};

// 脱敏规则
const maskingRules = ref([]);
const showOnlyActiveRules = ref(false);

// 规则分页相关
const rulesPageSize = ref(10);
const rulesCurrentPage = ref(1);
const rulesTotal = computed(() => displayedRules.value.length);

// 分页后的规则数据
const paginatedRules = computed(() => {
  const start = (rulesCurrentPage.value - 1) * rulesPageSize.value;
  const end = start + rulesPageSize.value;
  return displayedRules.value.slice(start, end);
});

// 处理规则页码变化
const handleRulesPageChange = (page) => {
  rulesCurrentPage.value = page;
};

// 处理规则每页数量变化
const handleRulesSizeChange = (size) => {
  rulesPageSize.value = size;
  rulesCurrentPage.value = 1; // 重置到第一页
};

// 基于当前选中表格的规则排序
const sortedRules = computed(() => {
  return [...maskingRules.value].sort((a, b) => {
    // 首先按照是否为当前选中表格排序
    if (a.tableName === selectedTable.value && b.tableName !== selectedTable.value) {
      return -1;
    }
    if (a.tableName !== selectedTable.value && b.tableName === selectedTable.value) {
      return 1;
    }
    // 其次按照启用状态排序
    if (a.active && !b.active) {
      return -1;
    }
    if (!a.active && b.active) {
      return 1;
    }
    // 最后按照表名和列名排序
    if (a.tableName !== b.tableName) {
      return a.tableName.localeCompare(b.tableName);
    }
    return a.columnName.localeCompare(b.columnName);
  });
});

// 显示的规则（根据过滤条件筛选）
const displayedRules = computed(() => {
  if (showOnlyActiveRules.value) {
    return sortedRules.value.filter(rule => rule.active);
  }
  return sortedRules.value;
});

// 规则对话框
const ruleDialogVisible = ref(false);
const isEditingRule = ref(false);
const currentRule = ref({
  id: null,
  database: DATABASE_NAME,
  tableName: '',
  columnName: '',
  maskingType: '',
  active: true
});

// API错误相关
const showApiErrorDialog = ref(false);
const apiErrorMessage = ref('');

// 重试连接
const retryConnection = async () => {
  showApiErrorDialog.value = false;
  
  try {
    // 获取数据统计信息
    const response = await request.get('/api/test-data/stats');
    if (response.data && response.data.success) {
      ElMessage.success('成功连接到数据库');
      
      // 获取统计数据
      await fetchStats();
      
      // 预设一个默认表
      if (tables.value.length > 0) {
        handleTableChange(tables.value[0].value);
      }
    }
  } catch (error) {
    const errorMessage = handleApiError(error);
    apiErrorMessage.value = errorMessage;
    showApiErrorDialog.value = true;
    logger.error('连接数据库失败:', error);
  }
};

// 初始化
onMounted(async () => {
  try {
    // 获取数据统计信息
    const response = await request.get('/api/test-data/stats');
    if (response.data && response.data.success) {
      ElMessage.success('成功连接到数据库');
      
      // 从后端获取脱敏规则
      await fetchRulesFromBackend();
      
      // 获取统计数据
      await fetchStats();
      
      // 预设一个默认表
      if (tables.value.length > 0) {
        handleTableChange(tables.value[0].value);
      }
    }
  } catch (error) {
    const errorMessage = handleApiError(error);
    apiErrorMessage.value = errorMessage;
    showApiErrorDialog.value = true;
    logger.error('连接数据库失败:', error);
  }
});

// 处理表变更
const handleTableChange = (value) => {
  selectedTable.value = value;
  
  // 根据选择的表设置列
  if (value && tableStructure[value]) {
    columns.value = tableStructure[value];
  } else {
    columns.value = [];
  }
  
  // 重置分页
  currentPage.value = 0;
  
  // 自动执行查询
  executeQuery();
  
  ElMessage.success(`已选择表: ${value}`);
};

// 处理页码变化
const handlePageChange = (page) => {
  currentPage.value = page - 1; // 转换为从0开始的索引
  executeQuery();
};

// 处理每页记录数变化
const handleSizeChange = (size) => {
  pageSize.value = size;
  executeQuery();
};

// 处理API错误
const handleApiError = (error) => {
  // 记录详细错误信息
  logger.error('处理API错误:', {
    error: error,
    response: error.response,
    request: error.request,
    config: error.config
  });
  
  let errorMessage = '未知错误';
  
  if (error.response) {
    const status = error.response.status;
    const data = error.response.data;
    
    logger.error('服务器响应错误:', {
      status: status,
      data: data,
      headers: error.response.headers
    });
    
    if (status === 404) {
      errorMessage = '请求的资源不存在 (404)';
    } else if (status === 500) {
      errorMessage = '服务器内部错误 (500)';
    } else if (data && data.message) {
      errorMessage = data.message;
    } else {
      errorMessage = `服务器错误 (${status})`;
    }
  } else if (error.request) {
    // 请求已发送但没有收到响应
    errorMessage = '无法连接到服务器，请检查网络连接';
  } else {
    // 请求设置时出错
    errorMessage = error.message || '请求设置错误';
  }
  
  return errorMessage;
};

// 执行查询
const executeQuery = async () => {
  logger.debug('开始执行查询，参数：', {
    selectedTable: selectedTable.value,
    pageSize: pageSize.value,
    currentPage: currentPage.value,
    enableMasking: enableMasking.value
  });

  if (!selectedTable.value) {
    ElMessage.warning('请先选择表');
    return;
  }
  
  isLoading.value = true;
  const loadingInstance = ElLoading.service({
    lock: true,
    text: '正在查询数据...',
    background: 'rgba(0, 0, 0, 0.7)'
  });
  
  try {
    // 如果启用了脱敏，获取激活的脱敏规则
    let activeRules = [];
    if (enableMasking.value) {
      activeRules = await fetchActiveRulesFromBackend();
      logger.debug('当前激活的脱敏规则:', activeRules);
    }
    
    // 发送请求
    const response = await request.get(`/api/test-data/${selectedTable.value}`, {
      params: {
        page: currentPage.value,
        size: pageSize.value,
        enableMasking: enableMasking.value
      }
    });
    
    logger.debug('API响应数据:', response.data);
    
    if (response.data) {
      // 处理分页数据
      if (response.data.data && response.data.data.content) {
        let results = response.data.data.content;
        totalRecords.value = response.data.data.totalElements || results.length;
        
        if (!Array.isArray(results)) {
          results = [results];
        }
        
        // 设置表格列
        if (results.length > 0) {
          tableColumns.value = Object.keys(results[0]);
        } else {
          tableColumns.value = [];
        }
        
        // 直接使用后端返回的结果（已脱敏或未脱敏）
        queryResults.value = results;
      } else if (response.data.data) {
        // 处理非分页数据
        let results = response.data.data;
        
        if (!Array.isArray(results)) {
          results = [results];
        }
        
        totalRecords.value = results.length;
        
        // 设置表格列
        if (results.length > 0) {
          tableColumns.value = Object.keys(results[0]);
        } else {
          tableColumns.value = [];
        }
        
        // 直接使用后端返回的结果（已脱敏或未脱敏）
        queryResults.value = results;
      } else {
        // 没有数据
        queryResults.value = [];
        tableColumns.value = [];
        totalRecords.value = 0;
        ElMessage.warning('查询结果为空');
      }
      
      queryExecuted.value = true;
      ElMessage.success(response.data.message || '查询执行成功');
    } else {
      queryResults.value = [];
      tableColumns.value = [];
      totalRecords.value = 0;
      queryExecuted.value = false;
      ElMessage.error('查询失败: 响应数据为空');
    }
  } catch (error) {
    logger.error('API请求完整错误信息:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      responseData: error.response?.data,
      requestConfig: error.config
    });
    
    const errorMessage = handleApiError(error);
    ElMessage.error('查询出错: ' + errorMessage);
  } finally {
    loadingInstance.close();
    isLoading.value = false;
  }
};

// 获取后端激活的脱敏规则
const fetchActiveRulesFromBackend = async () => {
  try {
    const response = await maskingRulesApi.getActiveRules();
    
    if (response.data) {
      if (response.data.activeRuleIds) {
        return response.data.activeRuleIds;
      } else {
        logger.warn('获取的激活脱敏规则为空');
        return [];
      }
    } else {
      logger.error('获取激活的脱敏规则失败: 响应数据为空');
      return [];
    }
  } catch (error) {
    const errorMessage = handleApiError(error);
    logger.error('获取激活的脱敏规则出错:', errorMessage);
    return [];
  }
};

// 初始化时从后端获取脱敏规则
const fetchRulesFromBackend = async () => {
  try {
    // 使用配置好的request实例
    const response = await maskingRulesApi.getAllRules();
    
    if (response.data) {
      logger.debug('获取脱敏规则成功:', response.data);
      // 更新本地规则
      if (response.data.rules) {
        // 确保所有规则的数据库字段为datamask
        maskingRules.value = response.data.rules.map(rule => ({
          ...rule,
          database: DATABASE_NAME
        }));
        logger.debug('已从后端获取脱敏规则');
      } else {
        // 如果没有数据，确保本地规则为空数组
        maskingRules.value = [];
        logger.warn('获取的脱敏规则为空');
      }
    } else {
      logger.error('获取脱敏规则失败: 响应数据为空');
      // 如果获取失败，确保本地规则为空数组
      maskingRules.value = [];
    }
  } catch (error) {
    const errorMessage = handleApiError(error);
    logger.error('获取脱敏规则出错:', errorMessage);
    // 如果发生错误，确保本地规则为空数组
    maskingRules.value = [];
  }
};

// 获取数据统计
const fetchStats = async () => {
  try {
    // 检查token
    const token = localStorage.getItem('token');
    if (!token) {
      logger.warn('获取统计数据失败: 未找到认证token');
      ElMessage.warning('您尚未登录或登录已过期，请先登录');
      return false;
    }
    
    logger.debug('开始请求统计数据，当前token:', token.substring(0, 20) + '...');
    
    // 使用testDataApi
    const response = await testDataApi.getStats();
    
    if (response.data && response.data.success) {
      totalRecords.value = response.data.data.totalRecords || 0;
      logger.debug('成功获取统计数据，总记录数:', totalRecords.value);
      return true;
    } else {
      logger.warn('获取统计数据失败: 响应不成功', response.data);
      return false;
    }
  } catch (error) {
    logger.error('获取统计数据失败:', error);
    // 输出详细错误信息
    logger.error('错误详情:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      responseData: error.response?.data,
      headers: error.response?.headers,
      config: error.config
    });
    
    const errorMsg = handleApiError(error);
    logger.error('统计数据错误详情:', errorMsg);
    
    // 处理403错误
    if (error.response && error.response.status === 403) {
      ElMessage.warning('您的登录权限不足，请联系管理员或使用有权限的账号登录');
      // 不要自动退出，而是让用户决定是否退出
    }
    
    return false;
  }
};

// 获取脱敏类型对应的标签类型
const getMaskingTypeTag = (type) => {
  switch (type) {
    case '完全遮盖': return 'danger';
    case '部分遮盖': return 'warning';
    case '替换': return 'info';
    case '哈希': return 'success';
    case '随机化': return 'primary';
    default: return '';
  }
};

// 添加规则
const addMaskingRule = () => {
  isEditingRule.value = false;
  currentRule.value = {
    id: null,
    database: DATABASE_NAME,
    tableName: selectedTable.value,
    columnName: '',
    maskingType: '',
    active: true
  };
  ruleDialogVisible.value = true;
};

// 编辑规则
const editRule = (rule) => {
  isEditingRule.value = true;
  // 确保数据库字段固定为datamask
  currentRule.value = { 
    ...rule,
    database: DATABASE_NAME
  };
  ruleDialogVisible.value = true;
};

// 删除规则
const deleteRule = async (ruleId) => {
  try {
    if (!ruleId) {
      ElMessage.error('规则ID为空，无法删除');
      return;
    }
    
    await ElMessageBox.confirm('确定要删除这条规则吗？此操作不可恢复。', '删除确认', {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning'
    });
    
    const response = await maskingRulesApi.deleteRule(ruleId);
    
    if (response.data && response.data.success) {
      ElMessage.success('规则删除成功');
      fetchRulesFromBackend(); // 重新加载规则列表
    } else {
      ElMessage.error(response.data?.message || '删除规则失败');
    }
  } catch (error) {
    if (error === 'cancel') {
      // 用户取消了操作
      return;
    }
    const errorMessage = handleApiError(error);
    ElMessage.error('删除规则出错: ' + errorMessage);
  }
};

// 更新规则状态
const updateRuleStatus = (rule, status) => {
  // 如果是启用规则，需要处理冲突规则
  if (status) {
    // 查找同表同列的其他规则
    const conflictRules = maskingRules.value.filter(r => 
      r.id !== rule.id && 
      r.tableName === rule.tableName && 
      r.columnName === rule.columnName && 
      r.active
    );
    
    // 如果存在冲突规则，将它们全部设置为未激活
    if (conflictRules.length > 0) {
      conflictRules.forEach(conflictRule => {
        conflictRule.active = false;
      });
      
      ElMessage.warning(`已自动禁用表 "${rule.tableName}" 列 "${rule.columnName}" 的其他 ${conflictRules.length} 个规则`);
    }
  }
  
  rule.active = status;
  ElMessage.success(`规则 "${rule.tableName}.${rule.columnName}" 已${status ? '启用' : '禁用'}`);
  
  // 将更新后的规则发送到后端
  sendRulesToBackend();
};

// 保存规则
const saveRule = async () => {
  try {
    // 验证表单
    if (!currentRule.value.columnName) {
      ElMessage.warning('请选择列名');
      return;
    }
    
    if (!currentRule.value.maskingType) {
      ElMessage.warning('请选择脱敏类型');
      return;
    }
    
    // 构建请求数据
    const requestData = {
      rules: [
        {
          id: currentRule.value.id,
          database: DATABASE_NAME,
          tableName: selectedTable.value,
          columnName: currentRule.value.columnName,
          maskingType: currentRule.value.maskingType,
          active: currentRule.value.active
        }
      ]
    };
    
    // 发送请求
    const response = await maskingRulesApi.batchUpdateRules(requestData);
    
    if (response.data && response.data.success) {
      ruleDialogVisible.value = false;
      ElMessage.success('规则保存成功');
      
      // 重新获取规则列表
      fetchRulesFromBackend();
    } else {
      ElMessage.error(response.data?.message || '保存规则失败');
    }
  } catch (error) {
    const errorMessage = handleApiError(error);
    ElMessage.error('保存规则出错: ' + errorMessage);
  }
};

// 将脱敏规则发送到后端
const sendRulesToBackend = async () => {
  try {
    // 准备请求数据，符合MaskingRuleRequest格式
    const requestData = {
      rules: maskingRules.value
    };
    
    // 发送请求
    const response = await request.post('/api/masking-rules/batch-wrapped', requestData);
    
    if (response.data) {
      logger.debug('脱敏规则已同步到后端');
      
      // 更新本地规则列表，使用后端返回的规则（包含新ID）
      if (response.data.rules) {
        maskingRules.value = response.data.rules;
      }
      
      return true;
    } else {
      logger.error('同步脱敏规则失败: 响应数据为空');
      return false;
    }
  } catch (error) {
    const errorMessage = handleApiError(error);
    logger.error('同步脱敏规则出错:', errorMessage);
    return false;
  }
};

// 切换显示所有规则或只显示激活的规则
const toggleActiveRulesDisplay = async () => {
  try {
    // 这里不需要特别的处理，因为displayedRules现在是计算属性
    // 会自动根据showOnlyActiveRules的值更新
    ElMessage.info(showOnlyActiveRules.value ? '现在只显示激活的规则' : '现在显示所有规则');
  } catch (error) {
    const errorMessage = handleApiError(error);
    ElMessage.error('切换规则显示失败: ' + errorMessage);
  }
};

// 获取表格行的类名，当前查询表的规则使用特殊样式
const getRowClassName = ({ row }) => {
  return row.tableName === selectedTable.value ? 'current-table-row' : '';
};
</script>

<style scoped>
.dynamic-masking-container {
  padding: 32px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  min-height: 100vh;
  position: relative;
  overflow: hidden;
}

.dynamic-masking-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 200px;
  background: linear-gradient(135deg, #1a237e 0%, #0d47a1 100%);
  z-index: 0;
}

.dynamic-masking-container h1 {
  margin: 0 0 32px;
  color: white;
  font-size: 32px;
  font-weight: 600;
  position: relative;
  z-index: 1;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.query-card, .masking-rules-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  margin-bottom: 32px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 1;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.query-card:hover, .masking-rules-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  background: rgba(255, 255, 255, 0.5);
  border-radius: 16px 16px 0 0;
}

.card-header span {
  font-size: 20px;
  font-weight: 600;
  color: #1a237e;
  letter-spacing: 0.5px;
}

.query-editor {
  padding: 24px;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.editor-actions {
  display: flex;
  gap: 20px;
  align-items: center;
}

.query-options {
  margin-bottom: 24px;
  background: rgba(0, 0, 0, 0.02);
  padding: 20px;
  border-radius: 12px;
}

.query-form {
  display: flex;
  gap: 24px;
}

.query-tips {
  margin-bottom: 24px;
}

.query-results {
  padding: 24px;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.results-info {
  display: flex;
  gap: 20px;
  align-items: center;
}

.el-table {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
}

.el-table th {
  background-color: rgba(26, 35, 126, 0.04);
  color: #1a237e;
  font-weight: 600;
  padding: 16px;
}

.el-table td {
  padding: 16px;
  transition: background-color 0.3s ease;
}

.el-table tr:hover td {
  background-color: rgba(26, 35, 126, 0.02);
}

.pagination-container {
  margin-top: 24px;
  display: flex;
  justify-content: center;
  padding-top: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}

.rule-actions {
  display: flex;
  gap: 20px;
  align-items: center;
}

.el-button {
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.5px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 8px;
  padding: 12px 24px;
}

.el-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
}

.el-button:active {
  transform: translateY(0);
}

.el-tag {
  border-radius: 6px;
  padding: 6px 12px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.el-switch {
  margin-right: 12px;
}

.el-dialog {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.el-dialog__header {
  background: linear-gradient(135deg, #1a237e 0%, #0d47a1 100%);
  padding: 20px 24px;
  margin: 0;
}

.el-dialog__title {
  color: white;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.el-dialog__body {
  padding: 32px;
}

.el-form-item__label {
  color: #1a237e;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.el-input__wrapper,
.el-select__wrapper,
.el-input-number__wrapper {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 8px;
}

.el-input__wrapper:hover,
.el-select__wrapper:hover,
.el-input-number__wrapper:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.el-input__wrapper.is-focus,
.el-select__wrapper.is-focus,
.el-input-number__wrapper.is-focus {
  box-shadow: 0 0 0 3px rgba(26, 35, 126, 0.15);
}

.api-error-content {
  padding: 24px;
}

.api-error-details {
  margin-top: 20px;
  padding: 20px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 12px;
  border-left: 4px solid #f44336;
}

.api-error-details p {
  margin: 12px 0;
  color: #666;
  line-height: 1.6;
}

.api-error-details strong {
  color: #1a237e;
  font-weight: 600;
}

/* 添加动画效果 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.query-card, .masking-rules-card {
  animation: fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 添加滚动条样式 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: rgba(26, 35, 126, 0.2);
  border-radius: 4px;
  transition: all 0.3s ease;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(26, 35, 126, 0.3);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .dynamic-masking-container {
    padding: 16px;
  }
  
  .card-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
    padding: 16px;
  }
  
  .editor-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
  
  .query-form {
    flex-direction: column;
  }
  
  .results-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
  
  .el-button {
    width: 100%;
    margin-bottom: 8px;
  }
}

/* 统一的对话框样式 */
.filter-dialog :deep(.el-dialog) {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  margin: 0 auto;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
}

.dialog-header.dark {
  background: #1a237e;
}

.dialog-header.dark .dialog-title {
  color: #ffffff;
}

.dialog-header.dark .close-button {
  color: #ffffff;
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

.filter-dialog :deep(.el-dialog__header) {
  padding: 0;
  margin: 0;
}

.filter-dialog :deep(.el-dialog__body) {
  padding: 0;
  overflow: hidden;
  flex: 1;
}

.filter-dialog :deep(.el-dialog__footer) {
  padding: 0;
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

.error-content {
  padding: 20px;
  text-align: center;
  color: #f56c6c;
  font-size: 16px;
}

/* 操作按钮样式优化 */
.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.action-buttons .el-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px 12px;
}

.action-buttons .el-button .el-icon {
  margin-right: 4px;
}

/* 表格高亮当前选中表的规则 */
:deep(.el-table .current-table-row) {
  background-color: rgba(26, 35, 126, 0.04) !important;
}

:deep(.el-table .current-table-row:hover > td) {
  background-color: rgba(26, 35, 126, 0.08) !important;
}

:deep(.el-table .current-table-row td) {
  font-weight: 500;
  color: #1a237e;
}
</style> 