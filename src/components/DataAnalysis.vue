<template>
  <el-container class="data-analysis-container">
    <el-header>
      <h2>脱敏数据分析</h2>
    </el-header>
    <el-main>
      <el-tabs v-model="activeTab">
        <!-- 文件数据查看 -->
        <el-tab-pane label="文件数据" name="files">
          <el-row>
            <el-col :span="6">
              <el-card class="file-list-card">
                <template #header>
                  <div class="card-header">
                    <span>可用数据文件</span>
                    <el-button type="primary" size="small" @click="loadFileList">
                      刷新
                    </el-button>
                  </div>
                </template>
                <el-scrollbar height="500px">
                  <el-menu @select="handleFileSelect">
                    <el-menu-item v-for="file in fileList" :key="file.path" :index="file.path">
                      <el-icon><Document /></el-icon>
                      <span>{{ file.name }}</span>
                    </el-menu-item>
                  </el-menu>
                </el-scrollbar>
                <div v-if="fileList.length === 0" class="empty-list">
                  暂无可用文件
                </div>
              </el-card>
            </el-col>
            <el-col :span="18">
              <el-card class="preview-card">
                <template #header>
                  <div class="card-header">
                    <span>{{ selectedFile ? selectedFile : '数据预览' }}</span>
                    <div v-if="selectedFile">
                      <el-button type="success" size="small" @click="downloadFile(selectedFile)">
                        下载文件
                      </el-button>
                    </div>
                  </div>
                </template>
                
                <!-- 数据分析概览 -->
                <div v-if="tableData.length > 0" class="analysis-overview">
                  <el-row :gutter="20">
                    <el-col :span="6" v-for="(stat, index) in dataStats" :key="index">
                      <el-card class="stat-card" shadow="hover">
                        <div class="stat-title">{{ stat.title }}</div>
                        <div class="stat-value">{{ stat.value }}</div>
                        <div class="stat-desc">{{ stat.description }}</div>
                      </el-card>
                    </el-col>
                  </el-row>
                </div>

                <!-- 数据可视化图表 -->
                <div v-if="tableData.length > 0" class="charts-container">
                  <el-row :gutter="20">
                    <el-col :span="12">
                      <el-card class="chart-card">
                        <template #header>
                          <div class="card-header">
                            <span>数据分布分析</span>
                          </div>
                        </template>
                        <div ref="distributionChart" class="chart"></div>
                      </el-card>
                    </el-col>
                    <el-col :span="12">
                      <el-card class="chart-card">
                        <template #header>
                          <div class="card-header">
                            <span>数值趋势分析</span>
                          </div>
                        </template>
                        <div ref="trendChart" class="chart"></div>
                      </el-card>
                    </el-col>
                  </el-row>
                  <el-row :gutter="20" style="margin-top: 20px;">
                    <el-col :span="12">
                      <el-card class="chart-card">
                        <template #header>
                          <div class="card-header">
                            <span>分类占比分析</span>
                          </div>
                        </template>
                        <div ref="pieChart" class="chart"></div>
                      </el-card>
                    </el-col>
                    <el-col :span="12">
                      <el-card class="chart-card">
                        <template #header>
                          <div class="card-header">
                            <span>相关性分析</span>
                          </div>
                        </template>
                        <div ref="correlationChart" class="chart"></div>
                      </el-card>
                    </el-col>
                  </el-row>
                </div>
                
                <el-table
                  v-if="tableData.length > 0"
                  :data="tableData"
                  border
                  style="width: 100%"
                  height="450px"
                  :max-height="450"
                  :fit="true"
                  :reserve-selection="true"
                >
                  <el-table-column
                    v-for="header in tableHeaders"
                    :key="header"
                    :prop="header"
                    :label="header"
                    align="center"
                  />
                </el-table>
                
                <el-empty v-else description="请选择文件查看数据" />
                
                <el-pagination
                  v-if="tableData.length > 0"
                  layout="prev, pager, next, sizes, total"
                  :total="totalItems"
                  :page-size="pageSize"
                  :current-page="currentPage"
                  :page-sizes="[10, 20, 50, 100]"
                  @current-change="handlePageChange"
                  @size-change="handleSizeChange"
                />
              </el-card>
            </el-col>
          </el-row>
        </el-tab-pane>
        
        <!-- 数据库表查看 -->
        <el-tab-pane label="数据库表" name="db">
          <el-row>
            <el-col :span="6">
              <el-card class="table-list-card">
                <template #header>
                  <div class="card-header">
                    <span>可用数据表</span>
                    <el-button type="primary" size="small" @click="loadTableList">
                      刷新
                    </el-button>
                  </div>
                </template>
                <el-scrollbar height="500px">
                  <el-menu @select="handleTableSelect">
                    <el-menu-item v-for="table in tableList" :key="table" :index="table">
                      <el-icon><Grid /></el-icon>
                      <span>{{ table }}</span>
                    </el-menu-item>
                  </el-menu>
                </el-scrollbar>
                <div v-if="tableList.length === 0" class="empty-list">
                  暂无可用数据表
                </div>
              </el-card>
            </el-col>
            <el-col :span="18">
              <el-card class="preview-card">
                <template #header>
                  <div class="card-header">
                    <span>{{ selectedTable ? selectedTable : '数据查询' }}</span>
                    <el-button type="primary" size="small" @click="showFilterDialog = true">
                      筛选
                    </el-button>
                  </div>
                </template>
                
                <el-table
                  v-if="dbTableData.length > 0"
                  :data="dbTableData"
                  border
                  style="width: 100%"
                  height="450px"
                  :max-height="450"
                  :fit="true"
                  :reserve-selection="true"
                >
                  <el-table-column
                    v-for="column in tableColumns"
                    :key="column"
                    :prop="column"
                    :label="column"
                    align="center"
                    min-width="120"
                  />
                </el-table>
                
                <el-empty v-else description="请选择数据表进行查询" />
                
                <el-pagination
                  v-if="dbTableData.length > 0"
                  layout="total, sizes, prev, pager, next"
                  :total="dbTotalItems"
                  :page-size="dbPageSize"
                  :current-page="dbCurrentPage"
                  :page-sizes="[10, 20, 50, 100]"
                  @current-change="handleDbPageChange"
                  @size-change="handleDbSizeChange"
                />

                <!-- 筛选设置弹窗 -->
                <el-dialog
                  v-model="showFilterDialog"
                  width="500px"
                  :close-on-click-modal="false"
                  class="filter-dialog"
                  :show-close="false"
                  top="5vh"
                  :append-to-body="true"
                >
                  <template #header>
                    <div class="dialog-header dark">
                      <span class="dialog-title">筛选设置</span>
                      <el-button
                        class="close-button"
                        circle
                        @click="showFilterDialog = false"
                      >
                        <el-icon><Close /></el-icon>
                      </el-button>
                    </div>
                  </template>
                  <el-scrollbar height="60vh" max-height="60vh">
                    <el-form :model="filterForm" label-width="100px" class="filter-form">
                      <el-form-item v-for="column in tableColumns" :key="column" :label="column">
                        <el-input 
                          v-model="filterForm[column]" 
                          placeholder="输入筛选条件"
                          clearable
                        />
                      </el-form-item>
                    </el-form>
                  </el-scrollbar>
                  <template #footer>
                    <div class="dialog-footer">
                      <el-button @click="showFilterDialog = false">取消</el-button>
                      <el-button type="primary" @click="applyFilter">
                        确定
                      </el-button>
                    </div>
                  </template>
                </el-dialog>
              </el-card>
            </el-col>
          </el-row>
        </el-tab-pane>
      </el-tabs>
    </el-main>
  </el-container>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted, nextTick } from 'vue';
import { Document, Grid, Close } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { maskedDataApi } from '@/utils/api';
import * as echarts from 'echarts';

// 标签页控制
const activeTab = ref('files');

// 文件列表相关
const fileList = ref([]);
const selectedFile = ref('');
const tableHeaders = ref([]);
const tableData = ref([]);
const totalItems = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);

// 数据表列表相关
const tableList = ref([]);
const selectedTable = ref('');
const tableColumns = ref([]);
const dbTableData = ref([]);
const dbTotalItems = ref(0);
const dbCurrentPage = ref(1);
const dbPageSize = ref(20);

// 筛选相关
const showFilterDialog = ref(false);
const filterForm = ref({});

// 数据分析相关
const dataStats = ref([]);
const distributionChart = ref(null);
const trendChart = ref(null);
const pieChart = ref(null);
const correlationChart = ref(null);

// 初始化图表实例
let distributionChartInstance = null;
let trendChartInstance = null;
let pieChartInstance = null;
let correlationChartInstance = null;

// 监听数据变化，更新分析结果
watch(() => tableData.value, (newData) => {
  if (newData.length > 0) {
    analyzeData();
    // 使用 nextTick 确保 DOM 已经更新
    nextTick(() => {
      initCharts();
    });
  }
}, { deep: true });

// 在组件挂载时加载数据
onMounted(() => {
  loadFileList();
  loadTableList();
});

// 加载文件列表
const loadFileList = async () => {
  try {
    const response = await maskedDataApi.getFiles();
    fileList.value = response.data;
  } catch (error) {
    ElMessage.error('获取脱敏数据文件列表失败');
    console.error(error);
  }
};

// 选择文件加载预览
const handleFileSelect = async (filePath) => {
  selectedFile.value = filePath;
  try {
    const response = await maskedDataApi.previewFile(filePath, currentPage.value - 1, pageSize.value);
    
    tableHeaders.value = response.data.headers;
    tableData.value = response.data.data;
    totalItems.value = response.data.total;
  } catch (error) {
    ElMessage.error('获取文件预览数据失败');
    console.error(error);
  }
};

// 下载文件
const downloadFile = async (filePath) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      ElMessage.error('请先登录');
      return;
    }

    const response = await maskedDataApi.downloadFile(filePath);

    // 获取文件名
    const contentDisposition = response.headers['content-disposition'];
    const filename = contentDisposition
      ? contentDisposition.split('filename=')[1].replace(/"/g, '')
      : filePath.split('/').pop();

    // 创建blob并下载
    const blob = new Blob([response.data]);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    ElMessage.success('文件下载已开始');
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '下载失败，请稍后重试');
    console.error('下载文件失败:', error);
  }
};

// 处理文件数据分页
const handlePageChange = (page) => {
  currentPage.value = page;
  if (selectedFile.value) {
    handleFileSelect(selectedFile.value);
  }
};

// 处理页面大小变化
const handleSizeChange = (size) => {
  pageSize.value = size;
  if (selectedFile.value) {
    handleFileSelect(selectedFile.value);
  }
};

// 加载数据表列表
const loadTableList = async () => {
  try {
    const response = await maskedDataApi.getTables();
    tableList.value = response.data;
  } catch (error) {
    ElMessage.error('获取脱敏数据表列表失败');
    console.error(error);
  }
};

// 选择数据表进行查询
const handleTableSelect = async (tableName) => {
  selectedTable.value = tableName;
  
  try {
    // 先查询表结构信息
    const response = await maskedDataApi.queryTable(tableName, 0, dbPageSize.value);
    
    // 从表结构信息中提取列名
    tableColumns.value = response.data.columns.map(col => col.Field);
    dbTableData.value = response.data.data;
    dbTotalItems.value = response.data.total;
    dbCurrentPage.value = 1;

    // 初始化筛选表单
    filterForm.value = {};
    tableColumns.value.forEach(column => {
      filterForm.value[column] = '';
    });
  } catch (error) {
    ElMessage.error('获取数据表数据失败');
    console.error(error);
  }
};

// 应用筛选条件
const applyFilter = async () => {
  // 过滤出有值的条件
  const conditions = {};
  Object.keys(filterForm.value).forEach(key => {
    if (filterForm.value[key] && filterForm.value[key].trim() !== '') {
      conditions[key] = filterForm.value[key].trim();
    }
  });
  
  try {
    const response = await maskedDataApi.queryTable(selectedTable.value, 0, dbPageSize.value, conditions);
    
    dbTableData.value = response.data.data;
    dbTotalItems.value = response.data.total;
    dbCurrentPage.value = 1;
    showFilterDialog.value = false;
    
    ElMessage.success('筛选条件已应用');
  } catch (error) {
    ElMessage.error('应用筛选条件失败');
    console.error(error);
  }
};

// 处理数据库表分页
const handleDbPageChange = async (page) => {
  dbCurrentPage.value = page;
  try {
    const response = await maskedDataApi.queryTable(selectedTable.value, page - 1, dbPageSize.value);
    dbTableData.value = response.data.data;
    dbTotalItems.value = response.data.total;
  } catch (error) {
    ElMessage.error('获取数据失败');
    console.error(error);
  }
};

// 处理数据库表页面大小变化
const handleDbSizeChange = async (size) => {
  dbPageSize.value = size;
  dbCurrentPage.value = 1;
  try {
    const response = await maskedDataApi.queryTable(selectedTable.value, 0, size);
    dbTableData.value = response.data.data;
    dbTotalItems.value = response.data.total;
  } catch (error) {
    ElMessage.error('获取数据失败');
    console.error(error);
  }
};

// 数据分析函数
const analyzeData = () => {
  if (tableData.value.length === 0) return;

  // 计算基本统计信息
  const stats = [];
  const numericColumns = [];
  const categoricalColumns = [];

  // 分析每列数据
  tableHeaders.value.forEach(header => {
    const values = tableData.value.map(row => row[header]);
    const isNumeric = values.every(v => !isNaN(parseFloat(v)) && isFinite(v));
    
    if (isNumeric) {
      numericColumns.push(header);
      const numericValues = values.map(v => parseFloat(v));
      const sum = numericValues.reduce((a, b) => a + b, 0);
      const avg = sum / numericValues.length;
      const max = Math.max(...numericValues);
      const min = Math.min(...numericValues);
      
      stats.push({
        title: `${header}统计`,
        value: avg.toFixed(2),
        description: `范围: ${min.toFixed(2)} - ${max.toFixed(2)}`
      });
    } else {
      categoricalColumns.push(header);
      const uniqueValues = new Set(values);
      stats.push({
        title: `${header}统计`,
        value: uniqueValues.size,
        description: `唯一值数量`
      });
    }
  });

  dataStats.value = stats;
};

// 初始化图表
const initCharts = () => {
  if (!tableData.value.length) return;

  // 确保 DOM 元素存在
  if (!distributionChart.value || !trendChart.value || !pieChart.value || !correlationChart.value) {
    console.warn('图表容器未准备好');
    return;
  }

  // 销毁旧实例
  if (distributionChartInstance) distributionChartInstance.dispose();
  if (trendChartInstance) trendChartInstance.dispose();
  if (pieChartInstance) pieChartInstance.dispose();
  if (correlationChartInstance) correlationChartInstance.dispose();

  try {
    // 创建新实例
    distributionChartInstance = echarts.init(distributionChart.value);
    trendChartInstance = echarts.init(trendChart.value);
    pieChartInstance = echarts.init(pieChart.value);
    correlationChartInstance = echarts.init(correlationChart.value);

    // 设置图表配置
    updateDistributionChart();
    updateTrendChart();
    updatePieChart();
    updateCorrelationChart();
  } catch (error) {
    console.error('初始化图表失败:', error);
  }
};

// 更新分布图
const updateDistributionChart = () => {
  if (!distributionChartInstance) return;

  const option = {
    title: {
      text: '数据分布',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    xAxis: {
      type: 'category',
      data: tableHeaders.value
    },
    yAxis: {
      type: 'value'
    },
    series: [{
      data: tableHeaders.value.map(header => {
        const values = tableData.value.map(row => row[header]);
        return values.length;
      }),
      type: 'bar'
    }]
  };

  distributionChartInstance.setOption(option);
};

// 更新趋势图
const updateTrendChart = () => {
  if (!trendChartInstance) return;

  const numericColumns = tableHeaders.value.filter(header => {
    const values = tableData.value.map(row => row[header]);
    return values.every(v => !isNaN(parseFloat(v)) && isFinite(v));
  });

  if (numericColumns.length === 0) return;

  const option = {
    title: {
      text: '数值趋势',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: numericColumns,
      bottom: 0
    },
    xAxis: {
      type: 'category',
      data: Array.from({ length: tableData.value.length }, (_, i) => i + 1)
    },
    yAxis: {
      type: 'value'
    },
    series: numericColumns.map(column => ({
      name: column,
      type: 'line',
      data: tableData.value.map(row => parseFloat(row[column]))
    }))
  };

  trendChartInstance.setOption(option);
};

// 更新饼图
const updatePieChart = () => {
  if (!pieChartInstance) return;

  const categoricalColumns = tableHeaders.value.filter(header => {
    const values = tableData.value.map(row => row[header]);
    return !values.every(v => !isNaN(parseFloat(v)) && isFinite(v));
  });

  if (categoricalColumns.length === 0) return;

  const selectedColumn = categoricalColumns[0];
  const valueCounts = {};
  tableData.value.forEach(row => {
    const value = row[selectedColumn];
    valueCounts[value] = (valueCounts[value] || 0) + 1;
  });

  const option = {
    title: {
      text: `${selectedColumn}分布`,
      left: 'center'
    },
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [{
      type: 'pie',
      radius: '50%',
      data: Object.entries(valueCounts).map(([name, value]) => ({
        name,
        value
      })),
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  };

  pieChartInstance.setOption(option);
};

// 更新相关性图
const updateCorrelationChart = () => {
  if (!correlationChartInstance) return;

  const numericColumns = tableHeaders.value.filter(header => {
    const values = tableData.value.map(row => row[header]);
    return values.every(v => !isNaN(parseFloat(v)) && isFinite(v));
  });

  if (numericColumns.length < 2) return;

  const correlationData = [];
  for (let i = 0; i < numericColumns.length; i++) {
    for (let j = i + 1; j < numericColumns.length; j++) {
      const col1 = numericColumns[i];
      const col2 = numericColumns[j];
      const values1 = tableData.value.map(row => parseFloat(row[col1]));
      const values2 = tableData.value.map(row => parseFloat(row[col2]));
      
      // 计算相关系数
      const correlation = calculateCorrelation(values1, values2);
      correlationData.push([i, j, correlation]);
    }
  }

  const option = {
    title: {
      text: '相关性分析',
      left: 'center'
    },
    tooltip: {
      position: 'top'
    },
    grid: {
      height: '50%',
      top: '10%'
    },
    xAxis: {
      type: 'category',
      data: numericColumns,
      splitArea: {
        show: true
      }
    },
    yAxis: {
      type: 'category',
      data: numericColumns,
      splitArea: {
        show: true
      }
    },
    visualMap: {
      min: -1,
      max: 1,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '15%'
    },
    series: [{
      type: 'heatmap',
      data: correlationData,
      label: {
        show: true
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  };

  correlationChartInstance.setOption(option);
};

// 计算相关系数
const calculateCorrelation = (x, y) => {
  const n = x.length;
  let sumX = 0, sumY = 0, sumXY = 0;
  let sumX2 = 0, sumY2 = 0;

  for (let i = 0; i < n; i++) {
    sumX += x[i];
    sumY += y[i];
    sumXY += x[i] * y[i];
    sumX2 += x[i] * x[i];
    sumY2 += y[i] * y[i];
  }

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

  return denominator === 0 ? 0 : numerator / denominator;
};

// 在组件卸载时销毁图表实例
onUnmounted(() => {
  if (distributionChartInstance) distributionChartInstance.dispose();
  if (trendChartInstance) trendChartInstance.dispose();
  if (pieChartInstance) pieChartInstance.dispose();
  if (correlationChartInstance) correlationChartInstance.dispose();
});
</script>

<style scoped>
.data-analysis-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 24px;
}

.el-header {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
  padding: 16px 24px;
  display: flex;
  align-items: center;
}

.el-header h2 {
  margin: 0;
  color: #1a237e;
  font-size: 24px;
  font-weight: 500;
}

.el-main {
  padding: 0;
}

.el-tabs {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 24px;
}

.el-tabs__header {
  margin-bottom: 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

.el-tabs__item {
  font-size: 16px;
  color: #666;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.el-tabs__item.is-active {
  color: #1a237e;
  font-weight: 500;
}

.el-tabs__active-bar {
  background-color: #1a237e;
  height: 3px;
  border-radius: 3px;
}

.file-list-card, .table-list-card, .preview-card {
  border: none;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: #fff;
}

.file-list-card:hover, .table-list-card:hover, .preview-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  background: transparent;
}

.card-header span {
  font-size: 16px;
  font-weight: 500;
  color: #1a237e;
}

.el-button {
  text-transform: uppercase;
  font-weight: 500;
  letter-spacing: 0.5px;
  border-radius: 4px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.el-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.el-button:active {
  transform: translateY(0);
}

.el-menu {
  border-right: none;
}

.el-menu-item {
  height: 48px;
  line-height: 48px;
  margin: 4px 0;
  border-radius: 4px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.el-menu-item:hover {
  background-color: rgba(26, 35, 126, 0.04);
}

.el-menu-item.is-active {
  background-color: rgba(26, 35, 126, 0.08);
  color: #1a237e;
}

.el-table {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.el-table th {
  background-color: rgba(26, 35, 126, 0.04);
  color: #1a237e;
  font-weight: 500;
  padding: 16px;
}

.el-table td {
  padding: 16px;
  transition: background-color 0.3s ease;
}

.el-table tr:hover td {
  background-color: rgba(26, 35, 126, 0.02);
}

.el-pagination {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.12);
}

.el-dialog {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
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
  font-weight: 500;
  font-size: 18px;
  color: #1a237e;
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

.filter-dialog :deep(.el-dialog) {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  margin: 0 auto;
}

.filter-dialog :deep(.el-dialog__body) {
  padding: 0;
  overflow: hidden;
  flex: 1;
}

.filter-dialog :deep(.el-dialog__header) {
  padding: 0;
  margin: 0;
}

.filter-dialog :deep(.el-dialog__close) {
  color: #ffffff;
  position: absolute;
  right: 20px;
  top: 20px;
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

.dialog-footer .el-button {
  min-width: 80px;
}

.empty-list {
  text-align: center;
  padding: 32px;
  color: #666;
  font-size: 14px;
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

.file-list-card, .table-list-card, .preview-card {
  animation: fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .data-analysis-container {
    padding: 16px;
  }
  
  .el-col-6 {
    width: 100%;
    margin-bottom: 16px;
  }
  
  .el-col-18 {
    width: 100%;
  }
  
  .card-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
  
  .el-button {
    width: 100%;
  }
}

.analysis-overview {
  margin-bottom: 24px;
}

.stat-card {
  height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-title {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #1a237e;
  margin-bottom: 8px;
}

.stat-desc {
  font-size: 12px;
  color: #999;
}

.charts-container {
  margin-bottom: 24px;
}

.chart-card {
  margin-bottom: 20px;
}

.chart {
  height: 300px;
  width: 100%;
}
</style> 