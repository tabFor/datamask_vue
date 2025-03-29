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
import request from '@/utils/request';
import dayjs from 'dayjs';

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

    const response = await request.get('/api/audit-logs/search', { params });
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
  padding: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
}

.audit-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E");
  z-index: 0;
}

.audit-container h1 {
  color: #fff;
  font-size: 28px;
  font-weight: 500;
  margin-bottom: 24px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 1;
}

.audit-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
  position: relative;
  z-index: 1;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: fadeIn 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.audit-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.card-header span {
  color: #fff;
  font-size: 18px;
  font-weight: 500;
}

.filter-container {
  display: flex;
  gap: 16px;
  align-items: center;
}

.el-date-picker {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  backdrop-filter: blur(5px);
}

.el-select {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  backdrop-filter: blur(5px);
}

.el-select .el-input__wrapper {
  background: transparent;
  box-shadow: none;
}

.el-select .el-input__inner {
  color: #fff;
}

.el-select-dropdown {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.el-select-dropdown__item {
  color: #333;
}

.el-select-dropdown__item.hover,
.el-select-dropdown__item:hover {
  background: rgba(64, 158, 255, 0.1);
  color: #409eff;
}

.el-table {
  background: transparent;
  color: #333;
}

.el-table th {
  background: rgba(255, 255, 255, 0.1);
  color: #333;
  font-weight: 500;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.el-table td {
  background: transparent;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  color: #333;
}

.el-table--striped .el-table__body tr.el-table__row--striped td {
  background: rgba(255, 255, 255, 0.05);
}

.el-table--enable-row-hover .el-table__body tr:hover > td {
  background: rgba(255, 255, 255, 0.1);
}

.el-tag {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(5px);
}

.el-tag--success {
  background: rgba(103, 194, 58, 0.2);
  border-color: rgba(103, 194, 58, 0.3);
  color: #67c23a;
}

.el-tag--danger {
  background: rgba(245, 108, 108, 0.2);
  border-color: rgba(245, 108, 108, 0.3);
  color: #f56c6c;
}

.pagination-container {
  padding: 16px 24px;
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.el-pagination {
  --el-pagination-button-bg-color: rgba(255, 255, 255, 0.1);
  --el-pagination-button-color: #fff;
  --el-pagination-hover-color: #fff;
  --el-pagination-active-color: #fff;
  --el-pagination-active-background-color: rgba(255, 255, 255, 0.2);
}

.el-radio-group {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 4px;
  backdrop-filter: blur(5px);
}

.el-radio-button__inner {
  background: transparent;
  border: none;
  color: #fff;
  box-shadow: none;
}

.el-radio-button__original-radio:checked + .el-radio-button__inner {
  background: rgba(255, 255, 255, 0.2);
  box-shadow: none;
}

/* 添加动画效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.audit-card:nth-child(2) {
  animation-delay: 0.2s;
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
  
  .el-radio-group {
    width: 100%;
    display: flex;
  }
  
  .el-radio-button {
    flex: 1;
  }
  
  .el-radio-button__inner {
    width: 100%;
  }
  
  .statistics-summary {
    justify-content: center;
  }
}

/* 添加下拉菜单样式 */
:deep(.audit-select-dropdown) {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

:deep(.el-select-dropdown__item) {
  color: #333;
}

:deep(.el-select-dropdown__item.hover),
:deep(.el-select-dropdown__item:hover) {
  background: rgba(64, 158, 255, 0.1);
  color: #409eff;
}

:deep(.el-select .el-input__wrapper) {
  background: rgba(255, 255, 255, 0.1);
  box-shadow: none;
}

:deep(.el-select .el-input__inner) {
  color: #fff;
}

:deep(.el-select .el-input__inner::placeholder) {
  color: rgba(255, 255, 255, 0.7);
}

:deep(.el-select-dropdown__item.selected) {
  color: #409eff;
  font-weight: bold;
}
</style> 