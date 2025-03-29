<template>
  <div class="task-management">
    <!-- 顶部操作栏 -->
    <div class="header-actions">
      <div class="title-section">
        <h2>敏感数据识别</h2>
        <p class="subtitle">创建和管理数据识别任务，自动识别敏感信息</p>
      </div>
      <div class="action-buttons">
        <el-button
          type="primary"
          class="neumorphic-button"
          @click="showCreateTaskDialog"
        >
          <i class="el-icon-plus"></i>
          创建识别任务
        </el-button>
        <div class="search-box">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索任务"
            class="neumorphic-input"
            clearable
            @input="handleSearch"
          >
            <template #prefix>
              <i class="el-icon-search"></i>
            </template>
          </el-input>
        </div>
      </div>
    </div>
    
    <!-- 任务列表 -->
    <div class="table-container">
      <el-table
        v-loading="loading"
        :data="filteredTasks"
        class="neumorphic-table"
        style="width: 100%"
      >
        <el-table-column
          prop="taskName"
          label="任务名称"
          min-width="180"
        >
          <template #default="scope">
            <div class="task-name">
              <i class="el-icon-document"></i>
              <span>{{ scope.row.taskName }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="createTime"
          label="创建时间"
          width="180"
        />
        <el-table-column
          prop="status"
          label="状态"
          width="120"
        >
          <template #default="scope">
            <div class="status-container">
              <el-tag 
                :type="getStatusType(scope.row.status)"
                class="neumorphic-tag"
              >
                {{ scope.row.status }}
              </el-tag>
              <el-progress 
                v-if="scope.row.status === '进行中'"
                :percentage="scope.row.progress || 0"
                :indeterminate="true"
                :show-text="false"
                class="status-progress"
              />
              <el-icon v-if="scope.row.status === '进行中'" class="is-loading"><Loading /></el-icon>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="priority"
          label="优先级"
          width="100"
        >
          <template #default="scope">
            <el-tag 
              size="small" 
              :type="getPriorityType(scope.row.priority)"
              class="neumorphic-tag"
            >
              {{ scope.row.priority }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="executeTime"
          label="执行时间"
          width="180"
        />
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="scope">
            <div class="action-buttons">
              <el-button
                size="small"
                class="neumorphic-button"
                @click="viewTaskDetail(scope.row)"
              >
                <i class="el-icon-view"></i>
                查看
              </el-button>
              <el-button
                size="small"
                type="primary"
                class="neumorphic-button"
                @click="executeTask(scope.row)"
                :disabled="scope.row.status === '已完成' || scope.row.status === '进行中'"
              >
                <i class="el-icon-video-play"></i>
                执行
              </el-button>
              <el-button
                size="small"
                type="danger"
                class="neumorphic-button"
                @click="deleteTask(scope.row)"
              >
                <i class="el-icon-delete"></i>
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
    
    <!-- 分页 -->
    <div class="pagination">
      <el-pagination
        :current-page="currentPage"
        :page-size="pageSize"
        :total="totalTasks"
        layout="total, prev, pager, next"
        class="neumorphic-pagination"
        @current-change="handlePageChange"
      />
    </div>
    
    <!-- 创建任务对话框 -->
    <el-dialog
      v-model="createTaskDialogVisible"
      width="60%"
      :close-on-click-modal="false"
      class="filter-dialog"
      :show-close="false"
    >
      <template #header>
        <div class="dialog-header">
          <span class="dialog-title">{{ isEditMode ? '编辑识别任务' : '创建识别任务' }}</span>
          <el-button
            class="close-button"
            circle
            @click="createTaskDialogVisible = false"
          >
            <el-icon><Close /></el-icon>
          </el-button>
        </div>
      </template>
      <task-form
        :initial-data="currentTask"
        :is-edit="isEditMode"
        @submit="handleTaskSubmit"
        @cancel="createTaskDialogVisible = false"
      />
    </el-dialog>
  </div>
</template>

<script setup>
/* eslint-disable no-undef */
import { ref, computed, onMounted, watch, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Loading, Close } from '@element-plus/icons-vue';
import { tasksApi } from '@/utils/api';
import TaskForm from './TaskForm.vue';

const router = useRouter();

// 数据状态
const tasks = ref([]);
const loading = ref(false);
const searchKeyword = ref('');
const createTaskDialogVisible = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const totalTasks = ref(0);
const isEditMode = ref(false);
const currentTask = ref({});
const autoRefreshTimer = ref(null);
const hasRunningTasks = ref(false);

// 计算属性：根据搜索关键词过滤任务
const filteredTasks = computed(() => {
  // 不再在前端过滤，改为使用后端搜索
  return tasks.value;
});

// 计算属性：检查是否有正在运行的任务
const hasRunningTasksComputed = computed(() => {
  return tasks.value.some(task => task.status === '进行中' || task.status === '等待中');
});

// 监听是否有运行中的任务
watch(hasRunningTasksComputed, (newVal) => {
  hasRunningTasks.value = newVal;
  if (newVal) {
    startAutoRefresh();
  } else {
    stopAutoRefresh();
  }
});

// 生命周期钩子：组件挂载时获取任务列表
onMounted(() => {
  fetchTasks();
});

// 获取任务列表
const fetchTasks = async () => {
  if (loading.value) return; // 防止重复请求
  
  loading.value = true;
  try {
    const response = await tasksApi.getTasks({
      page: currentPage.value,
      pageSize: pageSize.value,
      keyword: searchKeyword.value
    });
    
    if (response.data.success) {
      // 更新任务列表，保持现有任务的轮询状态
      const updatedTasks = response.data.data.tasks.map(newTask => {
        const existingTask = tasks.value.find(t => t.id === newTask.id);
        return {
          ...newTask,
          isPolling: existingTask?.isPolling || false
        };
      });
      
      tasks.value = updatedTasks;
      totalTasks.value = response.data.data.total;
      
      // 检查是否有正在运行的任务需要开始轮询
      updatedTasks.forEach(task => {
        if ((task.status === '进行中' || task.status === '等待中') && !task.isPolling) {
          startPollingTaskStatus(task.id);
          task.isPolling = true;
        }
      });
    } else {
      ElMessage.error(response.data.message || '获取任务列表失败');
    }
  } catch (error) {
    console.error('获取任务列表失败:', error);
    ElMessage.error('获取任务列表失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

// 显示创建任务对话框
const showCreateTaskDialog = () => {
  isEditMode.value = false;
  currentTask.value = {};
  createTaskDialogVisible.value = true;
};

// 创建任务
const createTask = async (taskData) => {
  try {
    const response = await tasksApi.createTask(taskData);
    
    if (response.data.success) {
      ElMessage.success(response.data.message || '创建任务成功');
      createTaskDialogVisible.value = false;
      fetchTasks(); // 刷新任务列表
    } else {
      ElMessage.error(response.data.message || '创建任务失败');
    }
  } catch (error) {
    console.error('创建任务失败:', error);
    ElMessage.error('创建任务失败，请稍后重试');
  }
};

// 更新任务
const updateTask = async (taskData) => {
  try {
    const response = await tasksApi.updateTask(currentTask.value.id, taskData);
    
    if (response.data.success) {
      ElMessage.success(response.data.message || '更新任务成功');
      createTaskDialogVisible.value = false;
      fetchTasks(); // 刷新任务列表
    } else {
      ElMessage.error(response.data.message || '更新任务失败');
    }
  } catch (error) {
    console.error('更新任务失败:', error);
    ElMessage.error('更新任务失败，请稍后重试');
  }
};

// 处理任务提交（创建或更新）
const handleTaskSubmit = (taskData) => {
  if (isEditMode.value) {
    updateTask(taskData);
  } else {
    createTask(taskData);
  }
};

// 查看任务详情
const viewTaskDetail = async (task) => {
  try {
    const response = await tasksApi.getTask(task.id);
    
    if (response.data.success) {
      // 获取到详细信息后，打开编辑对话框
      currentTask.value = {
        ...response.data.data,
        isCompleted: response.data.data.status === '已完成' // 添加状态标记
      };
      isEditMode.value = true;
      createTaskDialogVisible.value = true;
    } else {
      ElMessage.error(response.data.message || '获取任务详情失败');
    }
  } catch (error) {
    console.error('获取任务详情失败:', error);
    ElMessage.error('获取任务详情失败，请稍后重试');
    // 如果获取详情失败，就直接导航到详情页
    router.push(`/tasks/${task.id}`);
  }
};

// 执行任务
const executeTask = async (task) => {
  try {
    // 检查任务状态
    if (task.status === '进行中') {
      ElMessage.warning('任务正在执行中，请稍候');
      return;
    }

    // 立即更新任务状态为进行中
    const taskIndex = tasks.value.findIndex(t => t.id === task.id);
    if (taskIndex !== -1) {
      tasks.value[taskIndex] = {
        ...tasks.value[taskIndex],
        status: '进行中',
        progress: 70 // 设置初始进度
      };
    }

    const response = await tasksApi.executeTask(task.id);
    
    if (response.data.success) {
      ElMessage.success(response.data.message || '任务已提交到队列');
      // 开始轮询任务状态
      startPollingTaskStatus(task.id);
    } else {
      // 如果提交失败，恢复原状态
      if (taskIndex !== -1) {
        tasks.value[taskIndex] = {
          ...tasks.value[taskIndex],
          status: task.status,
          progress: undefined
        };
      }
      ElMessage.error(response.data.message || '提交任务失败');
    }
  } catch (error) {
    // 如果发生错误，恢复原状态
    const taskIndex = tasks.value.findIndex(t => t.id === task.id);
    if (taskIndex !== -1) {
      tasks.value[taskIndex] = {
        ...tasks.value[taskIndex],
        status: task.status,
        progress: undefined
      };
    }
    console.error('提交任务失败:', error);
    ElMessage.error('提交任务失败，请稍后重试');
  }
};

// 轮询任务状态
let pollingTimer = null;
const startPollingTaskStatus = async (taskId) => {
  if (pollingTimer) {
    clearInterval(pollingTimer);
  }
  
  pollingTimer = setInterval(async () => {
    try {
      const response = await tasksApi.getTask(taskId);
      if (response.data.code === 200) {
        const taskData = response.data.data;
        const taskStatus = taskData.status;
        
        // 更新任务列表中的任务状态
        const taskIndex = tasks.value.findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
          tasks.value[taskIndex] = {
            ...tasks.value[taskIndex],
            ...taskData,
            // 如果是进行中状态，添加一个假的进度值
            progress: taskStatus === '进行中' ? Math.floor(Math.random() * 30 + 70) : undefined
          };
        }
        
        // 如果任务完成或失败，停止轮询
        if (taskStatus === '已完成' || taskStatus === '失败') {
          clearInterval(pollingTimer);
          pollingTimer = null;
          
          // 更新任务的轮询状态
          if (taskIndex !== -1) {
            tasks.value[taskIndex].isPolling = false;
          }
          
          // 根据任务状态显示不同的消息
          if (taskStatus === '已完成') {
            ElMessage.success({
              message: `任务执行完成，共处理 ${taskData.processedRecords || 0} 条记录`,
              duration: 5000
            });
          } else {
            ElMessage.error({
              message: `任务执行失败：${taskData.errorMessage || '未知错误'}`,
              duration: 5000
            });
          }
        }
      }
    } catch (error) {
      console.error('获取任务状态失败:', error);
      clearInterval(pollingTimer);
      pollingTimer = null;
      
      // 更新任务的轮询状态
      const taskIndex = tasks.value.findIndex(t => t.id === taskId);
      if (taskIndex !== -1) {
        tasks.value[taskIndex].isPolling = false;
      }
      
      ElMessage.error('获取任务状态失败，请刷新页面重试');
    }
  }, 3000);
};

// 开始自动刷新
const startAutoRefresh = () => {
  if (!autoRefreshTimer.value) {
    autoRefreshTimer.value = setInterval(() => {
      fetchTasks();
    }, 5000); // 每5秒刷新一次
  }
};

// 停止自动刷新
const stopAutoRefresh = () => {
  if (autoRefreshTimer.value) {
    clearInterval(autoRefreshTimer.value);
    autoRefreshTimer.value = null;
  }
};

// 组件卸载时清除所有定时器
onUnmounted(() => {
  if (pollingTimer) {
    clearInterval(pollingTimer);
    pollingTimer = null;
  }
  if (autoRefreshTimer.value) {
    clearInterval(autoRefreshTimer.value);
    autoRefreshTimer.value = null;
  }
});

// 删除任务
const deleteTask = (task) => {
  ElMessageBox.confirm(
    '此操作将永久删除该任务，是否继续?',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      const response = await tasksApi.deleteTask(task.id);
      
      if (response.data.success) {
        ElMessage.success(response.data.message || '删除成功');
        fetchTasks(); // 刷新任务列表
      } else {
        ElMessage.error(response.data.message || '删除任务失败');
      }
    } catch (error) {
      console.error('删除任务失败:', error);
      ElMessage.error('删除任务失败，请稍后重试');
    }
  }).catch(() => {
    ElMessage.info('已取消删除');
  });
};

// 获取状态标签类型
const getStatusType = (status) => {
  const statusMap = {
    '进行中': 'primary',
    '已完成': 'success',
    '失败': 'danger',
    '等待中': 'info'
  };
  return statusMap[status] || 'info';
};

// 获取优先级标签类型
const getPriorityType = (priority) => {
  const priorityMap = {
    '高': 'danger',
    'high': 'danger',
    '中': 'warning',
    'medium': 'warning',
    '低': 'info',
    'low': 'info'
  };
  return priorityMap[priority] || 'info';
};

// 处理分页变化
const handlePageChange = (page) => {
  currentPage.value = page;
  fetchTasks();
};

// 添加搜索关键词变化监听
const handleSearch = () => {
  currentPage.value = 1; // 重置到第一页
  fetchTasks();
};

// 监听搜索关键词变化
watch(searchKeyword, (newVal, oldVal) => {
  // 只有当输入内容变为空或有一定长度时才触发搜索
  if (!newVal || newVal.length >= 2 || (oldVal && oldVal.length > newVal.length)) {
    handleSearch();
  }
});
</script>

<style scoped>
.task-management {
  min-height: 100vh;
  padding: 24px;
  background: #f5f5f5;
}

.header-actions {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  animation: fadeIn 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.title-section {
  flex: 1;
}

.title-section h2 {
  color: #1a237e;
  font-size: 28px;
  font-weight: 500;
  margin: 0 0 8px 0;
}

.subtitle {
  color: #666;
  font-size: 16px;
  margin: 0;
}

.action-buttons {
  display: flex;
  gap: 16px;
  align-items: center;
}

.search-box {
  width: 300px;
}

.el-input {
  --el-input-bg-color: #f5f5f5;
  --el-input-border-color: transparent;
  --el-input-hover-border-color: transparent;
  --el-input-focus-border-color: #1a237e;
}

.el-input__wrapper {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 8px;
}

.el-input__wrapper:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.el-input__wrapper.is-focus {
  box-shadow: 0 0 0 2px rgba(26, 35, 126, 0.2);
}

.table-container {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
  animation: fadeIn 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  animation-delay: 0.2s;
}

.el-table {
  --el-table-border-color: transparent;
  --el-table-header-bg-color: #f5f7fa;
  --el-table-row-hover-bg-color: rgba(26, 35, 126, 0.04);
}

.el-table th {
  background-color: #f5f7fa;
  color: #1a237e;
  font-weight: 500;
  padding: 16px;
}

.el-table td {
  padding: 16px;
  transition: background-color 0.3s ease;
}

.task-name {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #1a237e;
  font-weight: 500;
}

.el-tag {
  border-radius: 6px;
  padding: 4px 8px;
  font-weight: 500;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.el-tag:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.el-tag--success {
  background-color: #4caf50;
  color: white;
}

.el-tag--warning {
  background-color: #ff9800;
  color: white;
}

.el-tag--danger {
  background-color: #f44336;
  color: white;
}

.el-tag--info {
  background-color: #607d8b;
  color: white;
}

.el-button {
  text-transform: uppercase;
  font-weight: 500;
  letter-spacing: 0.5px;
  border-radius: 6px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 8px 16px;
}

.el-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.el-button:active {
  transform: translateY(0);
}

.el-button--primary {
  background: #1a237e;
  border-color: #1a237e;
}

.el-button--primary:hover {
  background: #283593;
  border-color: #283593;
}

.el-button--primary.is-disabled {
  background: #e0e0e0;
  border-color: #e0e0e0;
  color: #9e9e9e;
  cursor: not-allowed;
  box-shadow: none;
}

.el-button--primary.is-disabled:hover {
  transform: none;
  box-shadow: none;
}

.el-button--primary.is-disabled:active {
  transform: none;
}

.el-button--danger {
  background: #d32f2f;
  border-color: #d32f2f;
}

.el-button--danger:hover {
  background: #c62828;
  border-color: #c62828;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  padding: 16px 24px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  animation: fadeIn 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  animation-delay: 0.4s;
}

.el-pagination {
  --el-pagination-button-bg-color: #f5f5f5;
  --el-pagination-hover-color: #1a237e;
  --el-pagination-active-bg-color: #1a237e;
}

.el-dialog {
  border-radius: 12px;
  overflow: hidden;
}

.el-dialog__header {
  background: #1a237e;
  padding: 20px 24px;
  margin: 0;
}

.el-dialog__title {
  color: white;
  font-weight: 500;
  font-size: 20px;
}

.el-dialog__body {
  padding: 24px;
}

.el-dialog__footer {
  border-top: 1px solid #eee;
  padding: 16px 24px;
}

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

/* 响应式设计 */
@media (max-width: 768px) {
  .task-management {
    padding: 16px;
  }
  
  .header-actions {
    flex-direction: column;
    gap: 16px;
  }
  
  .action-buttons {
    width: 100%;
    flex-direction: column;
  }
  
  .search-box {
    width: 100%;
  }
  
  .el-button {
    width: 100%;
  }
  
  .table-container {
    padding: 16px;
  }
  
  .el-table {
    display: block;
    overflow-x: auto;
  }
}

.status-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-progress {
  width: 60px;
  margin-left: 8px;
}

.el-progress-bar__inner {
  background-color: #1a237e;
}

.el-icon.is-loading {
  animation: rotating 2s linear infinite;
  color: #1a237e;
}

@keyframes rotating {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
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