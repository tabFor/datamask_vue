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
      
      <el-table :data="displayedRules" style="width: 100%">
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
        <el-table-column label="操作">
          <template #default="scope">
            <el-button type="primary" size="small" @click="editRule(scope.row)">编辑</el-button>
            <el-button type="danger" size="small" @click="deleteRule(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    
    <!-- 添加/编辑规则对话框 -->
    <el-dialog
      v-model="ruleDialogVisible"
      width="500px"
      :close-on-click-modal="false"
      class="filter-dialog"
      :show-close="false"
    >
      <template #header>
        <div class="dialog-header">
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
      <el-form :model="currentRule" label-width="120px" class="filter-form">
        <el-form-item label="表名">
          <el-select v-model="currentRule.tableName" placeholder="选择表">
            <el-option v-for="table in tables" :key="table.value" :label="table.label" :value="table.value" />
          </el-select>
        </el-form-item>
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
    >
      <template #header>
        <div class="dialog-header">
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
      <div class="error-content">
        无法连接到API服务器，请确保后端服务正在运行。
      </div>
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
import { ref, onMounted } from 'vue';
import { ElMessage, ElLoading } from 'element-plus';
import axios from 'axios';
import AuditLogger from '@/utils/auditLogger';
import { dynamicMaskingApi } from '@/utils/api';

// API基础URL - 只用于兼容性和备用途径
const baseURL = 'http://localhost:8081/api';

// 固定数据库名
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
const displayedRules = ref([]);

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
    const response = await axios.get(`${baseURL}/test-data/stats`);
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
    console.error('连接数据库失败:', error);
  }
};

// 初始化
onMounted(async () => {
  try {
    // 获取数据统计信息
    const response = await axios.get(`${baseURL}/test-data/stats`);
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
    console.error('连接数据库失败:', error);
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
  console.log('处理API错误:', {
    error: error,
    response: error.response,
    request: error.request,
    config: error.config
  });
  
  let errorMessage = '未知错误';
  
  if (error.response) {
    const status = error.response.status;
    const data = error.response.data;
    
    console.log('服务器响应错误:', {
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
  console.log('开始执行查询，参数：', {
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
      console.log('当前激活的脱敏规则:', activeRules);
    }
    
    // 构建API URL，添加enableMasking参数
    const apiUrl = `${baseURL}/test-data/${selectedTable.value}?page=${currentPage.value}&size=${pageSize.value}&enableMasking=${enableMasking.value}`;
    
    console.log('发送API请求:', {
      url: apiUrl,
      method: 'GET',
      headers: axios.defaults.headers
    });

    // 发送请求
    const response = await axios.get(apiUrl);
    console.log('API响应数据:', response.data);
    
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
    console.log('API请求完整错误信息:', {
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
    tableName: selectedTable.value || '',
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
    loading.value = true;
    const response = await axios.delete(`${baseURL}/masking-rules/${ruleId}`);
    
    if (response.data.success) {
      ElMessage.success('规则删除成功');
      // 记录成功日志
      await AuditLogger.log(
        '动态脱敏',
        `删除脱敏规则 ID: ${ruleId}`,
        '成功'
      );
      // 刷新规则列表
      await fetchRulesFromBackend();
    } else {
      ElMessage.error(response.data.message || '规则删除失败');
      // 记录失败日志
      await AuditLogger.log(
        '动态脱敏',
        `删除脱敏规则失败：${response.data.message}`,
        '失败'
      );
    }
  } catch (error) {
    ElMessage.error('规则删除失败');
    // 记录错误日志
    await AuditLogger.log(
      '动态脱敏',
      `删除脱敏规则失败：${error.message}`,
      '失败'
    );
    console.error('规则删除失败:', error);
  } finally {
    loading.value = false;
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
const saveRule = () => {
  if (!currentRule.value.tableName || !currentRule.value.columnName || !currentRule.value.maskingType) {
    ElMessage.warning('请填写完整的规则信息');
    return;
  }
  
  // 确保数据库字段固定为datamask
  currentRule.value.database = DATABASE_NAME;
  
  // 检查是否存在相同表列的规则
  const existingRules = maskingRules.value.filter(rule => 
    rule.tableName === currentRule.value.tableName && 
    rule.columnName === currentRule.value.columnName &&
    (isEditingRule.value ? rule.id !== currentRule.value.id : true)
  );
  
  // 检查是否存在相同表、相同列、相同脱敏类型的规则（这种情况下完全重复，应该禁止）
  const duplicateTypeRule = existingRules.find(rule => 
    rule.maskingType === currentRule.value.maskingType
  );
  
  if (duplicateTypeRule) {
    ElMessage.error(`错误：表 "${currentRule.value.tableName}" 的列 "${currentRule.value.columnName}" 已存在 "${currentRule.value.maskingType}" 类型的脱敏规则`);
    return;
  }
  
  // 如果新规则是激活状态，并且已有激活规则，提示冲突
  if (currentRule.value.active && existingRules.some(r => r.active)) {
    const activeRules = existingRules.filter(r => r.active);
    
    // 询问用户是否自动禁用其他规则
    if (confirm(`表 "${currentRule.value.tableName}" 列 "${currentRule.value.columnName}" 已有 ${activeRules.length} 个激活规则。是否自动禁用这些规则并启用当前规则？`)) {
      // 自动禁用冲突的激活规则
      activeRules.forEach(r => {
        r.active = false;
      });
    } else {
      // 用户取消，将当前规则设为未激活
      currentRule.value.active = false;
      ElMessage.info('已将当前规则设置为未激活状态');
    }
  }
  
  if (isEditingRule.value) {
    // 更新现有规则
    const index = maskingRules.value.findIndex(r => r.id === currentRule.value.id);
    if (index !== -1) {
      maskingRules.value[index] = { ...currentRule.value };
      ElMessage.success('规则已更新');
      
      // 将更新后的规则发送到后端
      sendRulesToBackend();
    }
  } else {
    // 添加新规则
    const newId = maskingRules.value.length > 0 
      ? Math.max(...maskingRules.value.map(r => r.id)) + 1 
      : 1;
    
    maskingRules.value.push({
      ...currentRule.value,
      id: newId
    });
    ElMessage.success('规则已添加');
    
    // 将新规则发送到后端
    sendRulesToBackend();
  }
  
  ruleDialogVisible.value = false;
};

// 将脱敏规则发送到后端
const sendRulesToBackend = async () => {
  try {
    // 构建API URL - 使用批量保存API
    const apiUrl = `${baseURL}/masking-rules/batch-wrapped`;
    
    // 准备请求数据，符合MaskingRuleRequest格式
    const requestData = {
      rules: maskingRules.value
    };
    
    // 发送请求
    const response = await axios.post(apiUrl, requestData);
    
    if (response.data) {
      console.log('脱敏规则已同步到后端');
      
      // 更新本地规则列表，使用后端返回的规则（包含新ID）
      if (response.data.rules) {
        maskingRules.value = response.data.rules;
      }
      
      // 如果当前显示的是所有规则，则刷新显示
      if (!showOnlyActiveRules.value) {
        displayedRules.value = maskingRules.value;
      } 
      // 如果当前只显示激活的规则，则重新获取激活的规则
      else {
        const activeRules = await fetchActiveRulesFromBackend();
        displayedRules.value = activeRules;
      }
      
      // 显示成功消息
      ElMessage.success(response.data.message || '脱敏规则已成功更新');
    } else {
      console.error('同步脱敏规则失败: 响应数据为空');
      ElMessage.error('同步脱敏规则失败: 响应数据为空');
    }
  } catch (error) {
    const errorMessage = handleApiError(error);
    console.error('同步脱敏规则出错:', errorMessage);
    ElMessage.error('同步脱敏规则出错: ' + errorMessage);
  }
};

// 初始化时从后端获取脱敏规则
const fetchRulesFromBackend = async () => {
  try {
    // 构建API URL
    const apiUrl = `${baseURL}/masking-rules`;
    
    // 发送请求
    const response = await axios.get(apiUrl);
    
    if (response.data) {
      console.log('获取脱敏规则成功:', response.data);
      // 更新本地规则
      if (response.data.rules) {
        // 确保所有规则的数据库字段为datamask
        maskingRules.value = response.data.rules.map(rule => ({
          ...rule,
          database: DATABASE_NAME
        }));
        displayedRules.value = maskingRules.value;
        console.log('已从后端获取脱敏规则');
      } else {
        // 如果没有数据，确保本地规则为空数组
        maskingRules.value = [];
        displayedRules.value = [];
        console.warn('获取的脱敏规则为空');
      }
    } else {
      console.error('获取脱敏规则失败: 响应数据为空');
      // 如果获取失败，确保本地规则为空数组
      maskingRules.value = [];
      displayedRules.value = [];
    }
  } catch (error) {
    const errorMessage = handleApiError(error);
    console.error('获取脱敏规则出错:', errorMessage);
    // 如果发生错误，确保本地规则为空数组
    maskingRules.value = [];
    displayedRules.value = [];
  }
};

// 获取激活的脱敏规则
const fetchActiveRulesFromBackend = async () => {
  try {
    // 构建API URL
    const apiUrl = `${baseURL}/masking-rules/active`;
    
    // 发送请求
    const response = await axios.get(apiUrl);
    
    if (response.data) {
      // 返回激活的规则
      if (response.data.rules) {
        return response.data.rules;
      } else {
        console.warn('获取的激活脱敏规则为空');
        return [];
      }
    } else {
      console.error('获取激活的脱敏规则失败: 响应数据为空');
      return [];
    }
  } catch (error) {
    const errorMessage = handleApiError(error);
    console.error('获取激活的脱敏规则出错:', errorMessage);
    return [];
  }
};

// 切换显示所有规则或只显示激活的规则
const toggleActiveRulesDisplay = async () => {
  try {
    if (showOnlyActiveRules.value) {
      // 只显示激活的规则
      const activeRules = await fetchActiveRulesFromBackend();
      displayedRules.value = activeRules;
      ElMessage.info('现在只显示激活的规则');
    } else {
      // 显示所有规则
      await fetchRulesFromBackend(); // 重新获取所有规则
      ElMessage.info('现在显示所有规则');
    }
  } catch (error) {
    const errorMessage = handleApiError(error);
    ElMessage.error('切换规则显示失败: ' + errorMessage);
  }
};

const loading = ref(false);

// 获取统计数据
const fetchStats = async () => {
  try {
    // 使用动态脱敏API获取统计数据
    const response = await dynamicMaskingApi.executeQuery({ type: 'stats' });
    
    if (response.data && response.data.success) {
      // 处理统计数据
      totalRecords.value = response.data.totalRecords || 0;
      console.log('成功获取统计数据，总记录数:', totalRecords.value);
      return true;
    } else {
      console.warn('获取统计数据失败: 响应不成功');
      return false;
    }
  } catch (error) {
    console.error('获取统计数据失败:', error);
    const errorMsg = handleApiError(error);
    console.error('统计数据错误详情:', errorMsg);
    return false;
  }
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

.error-content {
  padding: 20px;
  text-align: center;
  color: #f56c6c;
  font-size: 16px;
}
</style> 