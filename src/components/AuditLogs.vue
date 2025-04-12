<template>
  <div class="audit-container">
    <h1>日志审计</h1>
    
    <el-card class="audit-card">
      <template #header>
        <div class="card-header">
          <span>操作日志</span>
          <div class="filter-container">
            <el-select
              v-model="selectedOperation"
              placeholder="选择操作类型"
              clearable
              style="width: 200px"
              popper-class="audit-select-dropdown"
              :popper-append-to-body="true"
              :teleported="true"
            >
              <el-option
                v-for="option in operationOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              :teleported="true"
            />
          </div>
        </div>
      </template>
      
      <el-table 
        :data="filteredLogs" 
        style="width: 100%" 
        v-loading="loading"
        height="400"
        :max-height="400"
        :scrollbar-always-on="true"
      >
        <el-table-column prop="timestamp" label="时间" width="180">
          <template #default="scope">
            {{ formatDateTime(scope.row.timestamp) }}
          </template>
        </el-table-column>
        <el-table-column prop="username" label="操作用户" width="120" />
        <el-table-column prop="operation" label="操作类型" width="120">
          <template #default="scope">
            {{ getOperationDisplayName(scope.row.operation) }}
          </template>
        </el-table-column>
        <el-table-column prop="details" label="操作详情" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === '成功' || scope.row.status === 'success' ? 'success' : 'danger'">
              {{ scope.row.status === 'success' ? '成功' : scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination-container">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next"
          :total="total"
          :current-page="currentPage"
          :page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { ElMessage } from 'element-plus';
import dayjs from 'dayjs';
import { auditLogsApi } from '@/utils/api';

// 日志筛选条件
const dateRange = ref([]);
const selectedOperation = ref('');

// 分页相关
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

// 数据
const logs = ref([]);
const loading = ref(false);

// 操作类型选项
const operationOptions = [
  { label: '全部', value: '' },
  { label: '系统相关', value: 'system' },
  { label: '用户认证相关', value: 'auth' },
  { label: '数据库管理相关', value: 'database' },
  { label: '脱敏规则相关', value: 'masking_rules' },
  { label: '任务管理相关', value: 'task' },
  { label: '数据查看相关', value: 'data_view' },
  { label: '敏感数据检测相关', value: 'sensitive_detection' },
  { label: '审计日志相关', value: 'audit' },
  { label: '动态脱敏相关', value: 'dynamic_masking' },
  { label: '脱敏数据管理相关', value: 'masked_data' }
];

// 操作类型映射表
const operationTypeMap = {
  // 系统相关
  system: ['system_welcome'],
  
  // 用户认证相关
  auth: ['user_login', 'check_login_status'],
  
  // 数据库管理相关
  database: ['test_db_connection', 'get_db_tables', 'get_table_columns'],
  
  // 脱敏规则相关
  masking_rules: ['get_all_rules', 'get_active_rules', 'save_rule', 'delete_rule', 'update_rule', 'get_rules_template'],
  
  // 任务管理相关
  task: ['create_task', 'execute_task', 'get_task_status', 'delete_task', 'get_tasks', 'get_task'],
  
  // 数据查看相关
  data_view: [
    'get_masked_users', 'get_masked_orders', 'preview_masked_data', 'download_masked_data',
    'get_customers', 'get_data_stats', 'get_orders', 'get_online_transactions',
    'get_customer_by_id', 'search_customers_by_name', 'search_customers_by_age',
    'get_transactions_by_payment', 'search_customers_by_gender',
    'get_financial_records', 'get_medical_records', 'get_employee_data',
    'get_financial_records_by_date', 'get_medical_records_by_patient',
    'get_employee_data_by_dept'
  ],
  
  // 敏感数据检测相关
  sensitive_detection: ['detect_table_sensitive_columns', 'detect_all_sensitive_columns', 'detect_column'],
  
  // 审计日志相关
  audit: ['search_audit_logs'],
  
  // 动态脱敏相关
  dynamic_masking: ['dynamic_query'],
  
  // 脱敏数据管理相关
  masked_data: ['list_masked_files', 'query_masked_table', 'update_masked_data', 'delete_masked_data']
};

// 格式化日期时间
const formatDateTime = (timestamp) => {
  if (!timestamp || !Array.isArray(timestamp)) {
    return '未知时间';
  }
  try {
    // 数组格式：[年, 月, 日, 时, 分, 秒, 纳秒]
    const [year, month, day, hour, minute, second] = timestamp;
    // 构建时间字符串
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}`;
    return dayjs(dateStr).format('YYYY-MM-DD HH:mm:ss');
  } catch (error) {
    console.error('时间解析错误:', error);
    return '时间格式错误';
  }
};

// 前端筛选后的日志数据
const filteredLogs = computed(() => {
  let result = [...logs.value];
  
  // 按日期范围筛选
  if (dateRange.value && dateRange.value.length === 2) {
    const startDate = dayjs(dateRange.value[0]).startOf('day');
    const endDate = dayjs(dateRange.value[1]).endOf('day');
    result = result.filter(log => {
      if (!log.timestamp || !Array.isArray(log.timestamp)) return false;
      const [year, month, day, hour, minute, second] = log.timestamp;
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}`;
      const logDate = dayjs(dateStr);
      return logDate.isAfter(startDate) && logDate.isBefore(endDate);
    });
  }
  
  // 不在这里进行操作类型筛选，而是依赖后端筛选
  
  // 按时间降序排序（最新的在前）
  result.sort((a, b) => {
    if (!a.timestamp || !b.timestamp) return 0;
    const [yearA, monthA, dayA, hourA, minuteA, secondA] = a.timestamp;
    const [yearB, monthB, dayB, hourB, minuteB, secondB] = b.timestamp;
    
    const dateStrA = `${yearA}-${String(monthA).padStart(2, '0')}-${String(dayA).padStart(2, '0')} ${String(hourA).padStart(2, '0')}:${String(minuteA).padStart(2, '0')}:${String(secondA).padStart(2, '0')}`;
    const dateStrB = `${yearB}-${String(monthB).padStart(2, '0')}-${String(dayB).padStart(2, '0')} ${String(hourB).padStart(2, '0')}:${String(minuteB).padStart(2, '0')}:${String(secondB).padStart(2, '0')}`;
    
    return dayjs(dateStrB).valueOf() - dayjs(dateStrA).valueOf();
  });
  
  return result;
});

// 获取所有日志
const fetchLogs = async () => {
  try {
    loading.value = true;
    const params = {
      page: currentPage.value - 1, // 后端分页从0开始
      size: pageSize.value
    };

    // 添加时间范围参数
    if (dateRange.value && dateRange.value.length === 2) {
      params.startTime = dayjs(dateRange.value[0]).format('YYYY-MM-DD HH:mm:ss');
      params.endTime = dayjs(dateRange.value[1]).format('YYYY-MM-DD HH:mm:ss');
    }

    // 添加操作类型参数
    if (selectedOperation.value) {
      // 获取选中分类下的所有具体操作类型
      const operationTypes = operationTypeMap[selectedOperation.value] || [];
      // 将操作类型数组转换为逗号分隔的字符串
      params.operations = operationTypes.join(',');
    }

    const response = await auditLogsApi.searchLogs(params);
    logs.value = response.data.content;
    total.value = response.data.totalElements;
  } catch (error) {
    ElMessage.error('获取日志数据失败');
    console.error('获取日志数据失败:', error);
  } finally {
    loading.value = false;
  }
};

// 处理分页
const handlePageChange = (page) => {
  currentPage.value = page;
  fetchLogs();
};

// 处理每页显示条数变化
const handleSizeChange = (size) => {
  pageSize.value = size;
  currentPage.value = 1; // 重置到第一页
  fetchLogs();
};

// 监听筛选条件变化
watch([dateRange, selectedOperation], () => {
  currentPage.value = 1; // 重置页码
  fetchLogs();
});

// 组件挂载时加载数据
onMounted(() => {
  fetchLogs();
});

// 获取操作类型显示名称
const getOperationDisplayName = (operation) => {
  if (!operation) return '未知操作';
  
  // 这里可以添加一些特殊的映射规则
  if (operation.includes('/api/audit-logs')) {
    return '日志查询';
  } else if (operation.includes('login') || operation.includes('登录')) {
    return '用户登录';
  } else if (operation.includes('logout') || operation.includes('登出')) {
    return '用户登出';
  } else if (operation.includes('/api/tasks')) {
    return '任务管理';
  } else if (operation.includes('/api/rules')) {
    return '规则管理';
  } else if (operation.includes('/api/data')) {
    return '数据管理';
  } else if (operation.includes('/api/db') || operation.includes('database')) {
    return '数据库操作';
  } else if (operation.includes('sensitiv') || operation.includes('敏感')) {
    return '敏感数据检测';
  } else if (operation.includes('mask') || operation.includes('脱敏')) {
    return '数据脱敏';
  } else {
    return '系统操作';
  }
};
</script>

<style scoped>
.audit-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 24px;
  animation: fadeIn 0.5s ease-out;
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

.audit-container h1 {
  color: #1a237e;
  font-size: 34px;
  font-weight: 400;
  margin-bottom: 24px;
  letter-spacing: -0.25px;
  background: linear-gradient(45deg, #1a237e, #3949ab);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: slideIn 0.6s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.audit-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 24px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: fadeInUp 0.6s ease-out;
}

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

.audit-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 12px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.12);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(26, 35, 126, 0.1);
}

.card-header span {
  color: #1a237e;
  font-size: 20px;
  font-weight: 500;
  letter-spacing: 0.15px;
}

.filter-container {
  display: flex;
  gap: 16px;
  align-items: center;
}

.el-select :deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(26, 35, 126, 0.2);
  border-radius: 8px;
  box-shadow: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(5px);
}

.el-select :deep(.el-input__wrapper:hover) {
  background: #ffffff;
  border-color: #3949ab;
  transform: translateY(-1px);
}

.el-select :deep(.el-input__wrapper.is-focus) {
  background: #ffffff;
  border-color: #3949ab;
  box-shadow: 0 0 0 3px rgba(57, 73, 171, 0.15);
  transform: translateY(-1px);
}

.el-select :deep(.el-input__inner) {
  color: #1a237e;
}

.el-select :deep(.el-input__inner::placeholder) {
  color: #5f6368;
}

.el-date-picker :deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(26, 35, 126, 0.2);
  border-radius: 8px;
  box-shadow: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(5px);
}

.el-date-picker :deep(.el-input__wrapper:hover) {
  background: #ffffff;
  border-color: #3949ab;
  transform: translateY(-1px);
}

.el-date-picker :deep(.el-input__wrapper.is-focus) {
  background: #ffffff;
  border-color: #3949ab;
  box-shadow: 0 0 0 3px rgba(57, 73, 171, 0.15);
  transform: translateY(-1px);
}

.el-table {
  background: transparent;
  color: #1a237e;
}

.el-table th {
  background: rgba(26, 35, 126, 0.03);
  color: #3949ab;
  font-weight: 500;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid rgba(26, 35, 126, 0.1);
}

.el-table td {
  background: transparent;
  border-bottom: 1px solid rgba(26, 35, 126, 0.1);
  color: #1a237e;
  padding: 12px 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.el-table--striped .el-table__body tr.el-table__row--striped td {
  background: rgba(26, 35, 126, 0.02);
}

.el-table--enable-row-hover .el-table__body tr:hover > td {
  background: rgba(26, 35, 126, 0.05) !important;
  color: #1a237e;
}

.el-tag {
  background: rgba(57, 73, 171, 0.1);
  border: none;
  color: #3949ab;
  border-radius: 6px;
  font-weight: 500;
  padding: 4px 12px;
  transition: all 0.3s ease;
}

.el-tag:hover {
  background: rgba(57, 73, 171, 0.2);
  transform: translateY(-1px);
}

.el-tag--success {
  background: rgba(19, 115, 51, 0.1);
  color: #137333;
}

.el-tag--danger {
  background: rgba(197, 34, 31, 0.1);
  color: #c5221f;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid rgba(26, 35, 126, 0.1);
}

.el-pagination {
  --el-pagination-button-bg-color: rgba(255, 255, 255, 0.9);
  --el-pagination-button-color: #1a237e;
  --el-pagination-hover-color: #3949ab;
  --el-pagination-active-color: #ffffff;
  --el-pagination-active-background-color: #1a237e;
}

.el-pagination .el-pager li {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(26, 35, 126, 0.2);
  color: #1a237e;
  border-radius: 6px;
  margin: 0 4px;
  transition: all 0.3s ease;
}

.el-pagination .el-pager li:hover {
  background: rgba(57, 73, 171, 0.1);
  color: #3949ab;
  transform: translateY(-1px);
}

.el-pagination .el-pager li.active {
  background: linear-gradient(45deg, #1a237e, #3949ab);
  color: #ffffff;
  border-color: transparent;
  transform: translateY(-1px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .audit-container {
    padding: 16px;
  }
  
  .card-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
  
  .filter-container {
    flex-direction: column;
    width: 100%;
  }
  
  .el-select {
    width: 100%;
  }
  
  .el-date-picker {
    width: 100%;
  }
}

/* 下拉菜单样式 */
:deep(.audit-select-dropdown) {
  background: rgba(255, 255, 255, 0.95);
  border: none;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
}

:deep(.el-select-dropdown__item) {
  color: #1a237e;
  transition: all 0.3s ease;
}

:deep(.el-select-dropdown__item.hover),
:deep(.el-select-dropdown__item:hover) {
  background: rgba(57, 73, 171, 0.1);
  color: #3949ab;
  transform: translateX(4px);
}

:deep(.el-select .el-input__wrapper) {
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 0 0 1px rgba(26, 35, 126, 0.2);
}

:deep(.el-select .el-input__inner) {
  color: #1a237e;
}

:deep(.el-select .el-input__inner::placeholder) {
  color: #5f6368;
}

:deep(.el-select-dropdown__item.selected) {
  color: #3949ab;
  font-weight: 500;
}
</style> 