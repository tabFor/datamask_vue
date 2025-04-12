<template>
  <div class="task-form">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="120px"
      :disabled="isTaskCompleted"
    >
      <!-- 基本信息 -->
      <h3>基本信息</h3>
      <el-form-item
        label="任务名称"
        prop="taskName"
      >
        <el-input
          v-model="formData.taskName"
          placeholder="请输入任务名称"
          :disabled="isTaskCompleted"
        />
      </el-form-item>
      <el-form-item
        label="任务描述"
        prop="description"
      >
        <el-input 
          v-model="formData.description" 
          type="textarea" 
          :rows="3" 
          placeholder="请输入任务描述"
          :disabled="isTaskCompleted"
        />
      </el-form-item>
      <el-form-item
        label="优先级"
        prop="priority"
      >
        <el-select
          v-model="formData.priority"
          placeholder="请选择优先级"
          :disabled="isTaskCompleted"
        >
          <el-option
            label="高"
            value="high"
          />
          <el-option
            label="中"
            value="medium"
          />
          <el-option
            label="低"
            value="low"
          />
        </el-select>
      </el-form-item>

      <!-- 数据源配置 -->
      <h3>数据源配置</h3>
      <el-form-item
        label="数据库类型"
        prop="dbType"
      >
        <el-select
          v-model="formData.dbType"
          placeholder="请选择数据库类型"
          :disabled="isTaskCompleted"
          @change="handleDbTypeChange"
        >
          <el-option
            label="MySQL"
            value="mysql"
          />
          <el-option
            label="PostgreSQL"
            value="postgresql"
          />
          <el-option
            label="Oracle"
            value="oracle"
          />
          <el-option
            label="SQL Server"
            value="sqlserver"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="主机名"
        prop="host"
      >
        <el-input
          v-model="formData.host"
          placeholder="请输入主机名或IP地址"
          :disabled="isTaskCompleted"
        />
      </el-form-item>
      <el-form-item
        label="端口"
        prop="port"
      >
        <el-input
          v-model.number="formData.port"
          placeholder="请输入端口号"
          :disabled="isTaskCompleted"
        />
      </el-form-item>
      <el-form-item
        label="用户名"
        prop="username"
      >
        <el-input
          v-model="formData.username"
          placeholder="请输入数据库用户名"
          :disabled="isTaskCompleted"
        />
      </el-form-item>
      <el-form-item
        label="密码"
        prop="password"
      >
        <el-input
          v-model="formData.password"
          type="password"
          placeholder="请输入数据库密码"
          :disabled="isTaskCompleted"
        />
      </el-form-item>
      <el-form-item
        label="数据库名"
        prop="dbName"
      >
        <el-input
          v-model="formData.dbName"
          placeholder="请输入数据库名称"
          :disabled="isTaskCompleted"
        />
      </el-form-item>
      <el-form-item>
        <el-button 
          type="primary" 
          :loading="testingConnection"
          @click="testConnection"
          :disabled="isTaskCompleted"
        >
          测试连接
        </el-button>
      </el-form-item>
      <el-form-item
        label="表名"
        prop="tableName"
      >
        <div class="table-select-container">
          <el-select 
            v-model="formData.tableName" 
            placeholder="请选择表"
            :loading="tablesLoading"
            @focus="fetchTables"
            class="table-select"
            :disabled="isTaskCompleted"
          >
            <el-option
              v-for="table in tables"
              :key="table"
              :label="table"
              :value="table"
            />
          </el-select>
          <el-button
            type="primary"
            link
            @click="showAISuggestion"
            :disabled="!formData.tableName || isTaskCompleted"
            class="ai-suggestion-btn"
          >
            获取AI脱敏建议
          </el-button>
        </div>
      </el-form-item>

      <!-- 脱敏方式选择 -->
      <h3>脱敏方式</h3>
      <el-form-item label="脱敏方式选择">
        <el-radio-group v-model="formData.maskingMethod" :disabled="isTaskCompleted">
          <el-radio label="custom">手动配置规则</el-radio>
          <el-radio label="presidio">Presidio自动识别</el-radio>
        </el-radio-group>
      </el-form-item>

      <!-- 根据脱敏方式切换不同的界面 -->
      <div v-if="formData.maskingMethod === 'custom'">
        <!-- 手动配置规则部分 -->
        <el-form-item
          label="脱敏规则"
          prop="rules"
        >
          <el-select 
            v-model="formData.rules" 
            multiple 
            placeholder="请选择脱敏规则"
            :loading="rulesLoading"
            @focus="fetchRules"
            :disabled="isTaskCompleted"
          >
            <el-option
              v-for="rule in availableRules"
              :key="rule.ruleId"
              :label="rule.name"
              :value="rule.ruleId"
            >
              <div>
                <span>{{ rule.name }}</span>
                <div class="rule-description">
                  {{ rule.description }}
                </div>
              </div>
            </el-option>
          </el-select>
          <div class="form-item-help">
            <small>可以选择多个脱敏规则，系统将使用StaticDataMaskingService进行处理</small>
          </div>
        </el-form-item>

        <!-- 字段映射 -->
        <div v-if="formData.rules.length > 0 && tableColumns.length > 0" class="field-mapping-section">
          <h3>字段映射</h3>
          <div class="field-mapping-header">
            <span>请为每个列选择对应的脱敏规则</span>
            <el-button 
              type="primary" 
              size="small" 
              @click="autoRecommendRuleMappings"
              :disabled="sensitiveColumns.length === 0 || isTaskCompleted"
            >
              自动推荐映射
            </el-button>
          </div>
          <div class="field-mapping-info">
            <el-alert
              title="重要提示：正确的字段映射是脱敏任务成功执行的关键"
              type="warning"
              description="请确保为需要脱敏的列选择合适的规则，否则可能导致任务执行时处理0条记录。"
              :closable="false"
              show-icon
            />
          </div>
          <div class="field-mapping-container">
            <el-form-item 
              v-for="column in tableColumns" 
              :key="column"
              :label="column"
              class="field-mapping-item"
            >
              <div class="column-mapping">
                <div class="column-info">
                  <el-select 
                    v-model="formData.columnMappings[column]" 
                    placeholder="请选择脱敏规则"
                    clearable
                    class="rule-select"
                    :disabled="isTaskCompleted"
                  >
                    <el-option
                      label="不脱敏"
                      value=""
                    />
                    <el-option
                      v-for="ruleId in formData.rules"
                      :key="ruleId"
                      :label="getRuleName(ruleId)"
                      :value="ruleId"
                    />
                  </el-select>
                  <div class="column-tags">
                    <el-tag 
                      v-if="sensitiveColumns.some(sc => sc.columnName === column)"
                      type="warning"
                      size="small"
                      class="sensitive-tag"
                    >
                      敏感数据
                    </el-tag>
                    <el-tag size="small" type="info" class="type-tag">
                      {{ columnTypes[column] || '未知类型' }}
                    </el-tag>
                  </div>
                </div>
              </div>
            </el-form-item>
          </div>
        </div>
      </div>

      <div v-else-if="formData.maskingMethod === 'presidio'">
        <!-- Presidio自动识别部分 -->
        <el-form-item
          label="自动识别选项"
          prop="autoDetectColumns"
        >
          <el-checkbox v-model="formData.autoDetectColumns" :disabled="isTaskCompleted">自动识别敏感列</el-checkbox>
          <div class="form-item-help">
            <small>开启后，系统将使用Presidio引擎自动识别并脱敏敏感数据，无需手动指定规则</small>
          </div>
        </el-form-item>
        
        <el-form-item>
          <el-button 
            type="primary" 
            size="small" 
            v-if="formData.tableName" 
            @click="previewSensitiveColumns" 
            :loading="previewLoading"
            :disabled="isTaskCompleted"
          >
            预览敏感列识别结果
          </el-button>
        </el-form-item>

        <!-- 显示Presidio提示 -->
        <div v-if="tableColumns.length > 0" class="presidio-info-section">
          <h3>Presidio自动识别</h3>
          <el-alert
            title="Presidio将自动处理以下敏感数据类型"
            type="info"
            description="个人姓名、电话号码、电子邮箱、身份证号、地址、银行卡号等"
            :closable="false"
            show-icon
          />
          
          <!-- 显示预览的敏感列 -->
          <div v-if="detectedColumns.length > 0" class="detected-columns-section">
            <h4>识别出 {{ detectedColumns.length }} 个敏感列：</h4>
            <el-table :data="detectedColumns" border stripe class="detected-columns-table">
              <el-table-column prop="columnName" label="列名" width="180"></el-table-column>
              <el-table-column prop="sensitiveType" label="敏感类型" width="180"></el-table-column>
              <el-table-column prop="dataType" label="数据类型" width="120"></el-table-column>
              <el-table-column prop="maskingRule" label="脱敏规则"></el-table-column>
              <el-table-column prop="description" label="说明"></el-table-column>
            </el-table>
          </div>
          
          <div class="sensitive-columns-preview" v-else-if="sensitiveColumns.length > 0">
            <p>系统已识别出以下可能的敏感列：</p>
            <el-tag 
              v-for="column in sensitiveColumns" 
              :key="column.columnName || column"
              class="sensitive-column-tag"
              type="warning"
            >
              {{ column.columnName || column }}
            </el-tag>
          </div>
        </div>
      </div>

      <!-- 输出配置 -->
      <h3>输出配置</h3>
      <el-form-item
        label="输出格式"
        prop="outputFormat"
      >
        <el-select
          v-model="formData.outputFormat"
          placeholder="请选择输出格式"
          :disabled="isTaskCompleted"
        >
          <el-option
            label="保留原格式"
            value="original"
          />
          <el-option
            label="CSV"
            value="csv"
          />
          <el-option
            label="JSON"
            value="json"
          />
          <el-option
            label="数据库"
            value="database"
          />
        </el-select>
      </el-form-item>

      <!-- 当选择数据库输出格式时显示输出表名配置 -->
      <el-form-item
        v-if="formData.outputFormat === 'database'"
        label="输出表名"
        prop="outputTable"
      >
        <el-input
          v-model="formData.outputTable"
          placeholder="请输入输出表名"
          :disabled="isTaskCompleted"
        />
      </el-form-item>

      <el-form-item
        label="备份原数据"
        prop="backupData"
      >
        <el-switch v-model="formData.backupData" :disabled="isTaskCompleted" />
      </el-form-item>
    </el-form>

    <!-- 表单操作按钮 -->
    <div class="form-actions">
      <el-button @click="cancel">
        取消
      </el-button>
      <el-button
        v-if="!isTaskCompleted"
        type="primary"
        :loading="submitting"
        @click="submitForm"
      >
        提交
      </el-button>
    </div>

    <!-- AI建议对话框 -->
    <AISuggestionDialog
      v-model="aiSuggestionVisible"
      :table-name="formData.tableName"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { databaseApi, rulesApi } from '@/utils/api';
import AISuggestionDialog from './AISuggestionDialog.vue';
import logger from '@/utils/logger';

const props = defineProps({
  initialData: {
    type: Object,
    default: () => ({})
  },
  isEdit: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['submit', 'cancel']);

// 表单引用
const formRef = ref(null);

// 加载状态
const tablesLoading = ref(false);
const rulesLoading = ref(false);
const submitting = ref(false);
const testingConnection = ref(false);

// 数据列表
const tables = ref([]);
const availableRules = ref([]);
const tableColumns = ref([]);
const sensitiveColumns = ref([]);
const columnTypes = ref({});
const rulesMappingTemplate = ref(null);
const detectedColumns = ref([]);
const previewLoading = ref(false);

// 表单数据
const formData = reactive({
  taskName: props.initialData.taskName || '',
  description: props.initialData.description || '',
  priority: props.initialData.priority || 'medium',
  
  dbType: props.initialData.dbType || 'mysql',
  host: props.initialData.host || '',
  port: props.initialData.port || '',
  username: props.initialData.username || '',
  password: props.initialData.password || '',
  dbName: props.initialData.dbName || '',
  tableName: props.initialData.tableName || '',
  
  rules: props.initialData.rules || [],
  columnMappings: props.initialData.columnMappings || {},
  sensitiveColumns: props.initialData.sensitiveColumns || [],
  columnTypes: props.initialData.columnTypes || {},
  
  outputFormat: props.initialData.outputFormat || 'original',
  outputTable: props.initialData.outputTable || '',
  backupData: props.initialData.backupData !== undefined ? props.initialData.backupData : true,
  usePresidio: props.initialData.usePresidio || false,
  autoDetectColumns: props.initialData.autoDetectColumns || false,
  maskingMethod: props.initialData.maskingMethod || 'custom'
});

// 计算属性：判断任务是否已完成
const isTaskCompleted = computed(() => {
  return props.initialData.isCompleted || false;
});

// 表单验证规则
const rules = {
  taskName: [{ required: true, message: '请输入任务名称', trigger: 'blur' }],
  dbType: [{ required: true, message: '请选择数据库类型', trigger: 'change' }],
  host: [{ required: true, message: '请输入主机名', trigger: 'blur' }],
  port: [{ required: true, message: '请输入端口号', trigger: 'blur' }],
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  dbName: [{ required: true, message: '请输入数据库名', trigger: 'blur' }],
  tableName: [{ required: true, message: '请选择表', trigger: 'change' }],
  rules: [{ 
    required: true, 
    message: '请选择至少一个脱敏规则', 
    trigger: 'change',
    validator: (rule, value, callback) => {
      if (!value || value.length === 0) {
        // 如果选择了Presidio方式，则不需要选择规则
        if (formData.maskingMethod === 'presidio') {
          callback();
        } else {
          callback(new Error('请选择至少一个脱敏规则'));
        }
      } else {
        callback();
      }
    }
  }],
  outputFormat: [{ required: true, message: '请选择输出格式', trigger: 'change' }],
  outputTable: [{ 
    required: true, 
    message: '请输入输出表名', 
    trigger: 'blur',
    validator: (rule, value, callback) => {
      if (formData.outputFormat === 'database' && !value) {
        callback(new Error('选择数据库输出格式时必须指定输出表名'));
      } else {
        callback();
      }
    }
  }]
};

// 预设数据库连接配置
const presetConnections = {
  mysql: {
    host: 'localhost',
    port: 3306,
    username: 'root',
    password: '1926669707tyx',
    dbName: 'datamask'
  },
  postgresql: {
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: '1926669707tyx',
    dbName: 'datamask'
  },
  oracle: {
    host: 'localhost',
    port: 1521,
    username: 'system',
    password: '1926669707tyx',
    dbName: 'datamask'
  },
  sqlserver: {
    host: 'localhost',
    port: 1433,
    username: 'sa',
    password: '1926669707tyx',
    dbName: 'datamask'
  }
};

// 处理数据库类型变化
const handleDbTypeChange = (dbType) => {
  if (presetConnections[dbType]) {
    const preset = presetConnections[dbType];
    formData.host = preset.host;
    formData.port = preset.port;
    formData.username = preset.username;
    formData.password = preset.password;
    formData.dbName = preset.dbName;
    
    // 清空表名，因为数据库改变了
    formData.tableName = '';
    tables.value = [];
    
    // 提示用户连接信息已自动填充
    ElMessage.success('已自动填充预设数据库连接信息');
  }
};

// 获取表列表
const fetchTables = async () => {
  if (tables.value.length > 0) return;
  
  if (!formData.dbType || !formData.host || !formData.port || !formData.username || !formData.password || !formData.dbName) {
    ElMessage.warning('请先填写完整的数据库连接信息');
    return;
  }
  
  tablesLoading.value = true;
  try {
    const response = await databaseApi.getTables({
      dbType: formData.dbType,
      host: formData.host,
      port: formData.port,
      username: formData.username,
      password: formData.password,
      dbName: formData.dbName
    });
    
    if (response.data.success) {
      tables.value = response.data.data.tables || [];
    } else {
      ElMessage.error(response.data.message || '获取表列表失败');
    }
  } catch (error) {
    console.error('获取表列表失败:', error);
    ElMessage.error('获取表列表失败，请检查数据库连接信息');
  } finally {
    tablesLoading.value = false;
  }
};

// 获取脱敏规则列表
const fetchRules = async () => {
  if (availableRules.value.length > 0) return;
  
  rulesLoading.value = true;
  try {
    const response = await rulesApi.getAllRules();
    
    if (response.data.success) {
      availableRules.value = response.data.data.rules || [];
    } else {
      ElMessage.error(response.data.message || '获取脱敏规则失败');
    }
  } catch (error) {
    console.error('获取脱敏规则失败:', error);
    ElMessage.error('获取脱敏规则失败，请稍后重试');
  } finally {
    rulesLoading.value = false;
  }
};

// 获取规则映射模板
const fetchRulesMappingTemplate = async () => {
  try {
    const response = await rulesApi.getRulesMappingTemplates();
    rulesMappingTemplate.value = response.data;
    logger.debug('获取规则映射模板成功:', rulesMappingTemplate.value);
  } catch (error) {
    ElMessage.error('获取规则映射模板失败');
    logger.error('获取规则映射模板失败', error);
  }
};

// 根据列名推荐规则
const getRecommendedRuleForColumn = (column) => {
  // 如果传入的是字符串（列名），创建一个简单对象
  const sensitiveColumn = typeof column === 'string' 
    ? { columnName: column } 
    : column;
    
  if (!sensitiveColumn) return null;
  
  // 先尝试使用sensitiveType匹配
  if (sensitiveColumn.sensitiveType) {
    const sensitiveType = sensitiveColumn.sensitiveType;
    
    if (sensitiveType === '姓名') {
      return availableRules.value.find(r => r.type === 'NAME')?.ruleId;
    } else if (sensitiveType.includes('手机') || sensitiveType.includes('电话')) {
      return availableRules.value.find(r => r.type === 'PHONE')?.ruleId;
    } else if (sensitiveType.includes('邮箱')) {
      return availableRules.value.find(r => r.type === 'EMAIL')?.ruleId;
    } else if (sensitiveType.includes('地址')) {
      return availableRules.value.find(r => r.type === 'ADDRESS')?.ruleId;
    } else if (sensitiveType.includes('身份证')) {
      return availableRules.value.find(r => r.type === 'ID_CARD')?.ruleId;
    } else if (sensitiveType.includes('银行卡') || sensitiveType.includes('信用卡')) {
      return availableRules.value.find(r => r.type === 'BANK_CARD')?.ruleId;
    }
  }
  
  // 尝试使用maskingRule匹配
  if (sensitiveColumn.maskingRule) {
    const matchingRule = availableRules.value.find(
      r => r.description?.includes(sensitiveColumn.maskingRule) || 
           sensitiveColumn.maskingRule.includes(r.description)
    );
    if (matchingRule) {
      return matchingRule.ruleId;
    }
  }
  
  // 回退到使用模板
  if (rulesMappingTemplate.value) {
    const normalizedColumnName = sensitiveColumn.columnName.toLowerCase();
    
    // 检查模板中是否有针对此列的推荐
    if (rulesMappingTemplate.value.columnRuleMappings && 
        rulesMappingTemplate.value.columnRuleMappings[normalizedColumnName]) {
      // 查找被标记为推荐的规则
      const recommendedRules = rulesMappingTemplate.value.columnRuleMappings[normalizedColumnName]
        .filter(rule => rule.recommended);
      
      if (recommendedRules.length > 0) {
        return recommendedRules[0].ruleId;
      }
    }
  }
  
  // 最后回退到简单的列名匹配
  const normalizedColumnName = sensitiveColumn.columnName.toLowerCase();
  
  if (normalizedColumnName.includes('phone') || normalizedColumnName.includes('mobile')) {
    return availableRules.value.find(r => r.type === 'PHONE')?.ruleId;
  } else if (normalizedColumnName.includes('name')) {
    return availableRules.value.find(r => r.type === 'NAME')?.ruleId;
  } else if (normalizedColumnName.includes('email')) {
    return availableRules.value.find(r => r.type === 'EMAIL')?.ruleId;
  } else if (normalizedColumnName.includes('address')) {
    return availableRules.value.find(r => r.type === 'ADDRESS')?.ruleId;
  } else if (normalizedColumnName.includes('id_card') || normalizedColumnName.includes('idcard')) {
    return availableRules.value.find(r => r.type === 'ID_CARD')?.ruleId;
  } else if (normalizedColumnName.includes('bank') || normalizedColumnName.includes('card')) {
    return availableRules.value.find(r => r.type === 'BANK_CARD')?.ruleId;
  }
  
  return null;
};

// 自动推荐规则映射
const autoRecommendRuleMappings = () => {
  if (sensitiveColumns.value.length === 0 || availableRules.value.length === 0) return;
  
  logger.info("开始自动推荐规则映射...");
  logger.debug("敏感列数据:", JSON.stringify(sensitiveColumns.value, null, 2));
  logger.debug("可用规则数据:", JSON.stringify(availableRules.value.map(r => ({
    ruleId: r.ruleId,
    name: r.name,
    type: r.type,
    description: r.description
  })), null, 2));
  
  const newMappings = { ...formData.columnMappings };
  
  // 为敏感列推荐规则
  sensitiveColumns.value.forEach(column => {
    const columnName = column.columnName || column;
    
    // 如果还没有为此列设置规则，则尝试推荐
    if (!newMappings[columnName]) {
      // 传递整个column对象而不仅仅是列名
      const recommendedRuleId = getRecommendedRuleForColumn(column);
      if (recommendedRuleId) {
        logger.debug(`为列 ${columnName} 推荐规则: ${recommendedRuleId}`);
        newMappings[columnName] = recommendedRuleId;
        // 确保规则已被选中
        if (!formData.rules.includes(recommendedRuleId)) {
          formData.rules.push(recommendedRuleId);
        }
      } else {
        logger.debug(`未能为列 ${columnName} 找到合适的规则`);
      }
    } else {
      logger.debug(`列 ${columnName} 已有规则设置，跳过推荐`);
    }
  });
  
  formData.columnMappings = newMappings;
  logger.debug("规则映射结果:", formData.columnMappings);
};

// 获取表字段
const fetchTableColumns = async () => {
  if (!formData.dbType || !formData.host || !formData.port || !formData.username || !formData.password || !formData.dbName || !formData.tableName) {
    tableColumns.value = [];
    sensitiveColumns.value = [];
    columnTypes.value = {};
    return;
  }
  
  try {
    const columnsResponse = await databaseApi.getColumns({
      dbType: formData.dbType,
      host: formData.host,
      port: formData.port,
      username: formData.username,
      password: formData.password,
      dbName: formData.dbName,
      tableName: formData.tableName
    });
    
    if (columnsResponse.data.success) {
      const columns = columnsResponse.data.data.columns || [];
      tableColumns.value = columns;
      
      // 初始化字段映射和类型信息
      if (!props.isEdit) {
        const newMappings = {};
        const newTypes = {};
        columns.forEach(column => {
          newMappings[column] = formData.columnMappings[column] || '';
          newTypes[column] = columnsResponse.data.data.columnTypes?.[column] || '';
        });
        formData.columnMappings = newMappings;
        formData.columnTypes = newTypes;
      }
      
      // 获取敏感数据检测结果
      try {
        logger.info('开始检测敏感数据，表名:', formData.tableName);
        logger.debug('当前数据库连接信息:', {
          dbType: formData.dbType,
          host: formData.host,
          port: formData.port,
          username: formData.username,
          dbName: formData.dbName
        });
        
        // 准备数据库连接参数
        const connectionParams = {
          dbType: formData.dbType,
          host: formData.host,
          port: formData.port,
          username: formData.username,
          password: formData.password,
          dbName: formData.dbName
        };
        
        const sensitiveResponse = await databaseApi.detectTableSensitiveColumns(
          formData.tableName, 
          connectionParams
        );
        logger.debug('敏感数据检测API响应状态:', sensitiveResponse.status);
        logger.debug('敏感数据检测API响应头:', sensitiveResponse.headers);
        logger.debug('敏感数据检测响应完整数据:', sensitiveResponse);
        
        // 检查响应状态码
        if (sensitiveResponse.status === 200) {
          logger.info('敏感数据检测成功，数据:', JSON.stringify(sensitiveResponse.data, null, 2));
          
          // 验证接收到的数据格式
          if (Array.isArray(sensitiveResponse.data)) {
            logger.debug(`收到 ${sensitiveResponse.data.length} 个敏感列`);
            
            // 检查数据的结构
            if (sensitiveResponse.data.length > 0) {
              logger.debug('第一个敏感列示例:', JSON.stringify(sensitiveResponse.data[0], null, 2));
            }
          } else {
            logger.warn('敏感列数据不是数组格式:', typeof sensitiveResponse.data);
          }
          
          sensitiveColumns.value = sensitiveResponse.data || [];
          formData.sensitiveColumns = sensitiveColumns.value;
          
          // 自动推荐规则映射
          autoRecommendRuleMappings();
        } else {
          logger.error('敏感数据检测失败:', sensitiveResponse.statusText);
          ElMessage.error('获取敏感数据检测结果失败');
        }
      } catch (error) {
        logger.error('敏感数据检测异常:', error);
        logger.error('错误详情:', {
          message: error.message,
          stack: error.stack,
          response: error.response?.data
        });
        ElMessage.error('获取敏感数据检测结果失败，请稍后重试');
      }
      
      // 更新字段类型信息
      columnTypes.value = columnsResponse.data.data.columnTypes || {};
      formData.columnTypes = columnTypes.value;
    } else {
      ElMessage.error(columnsResponse.data.message || '获取表字段失败');
    }
  } catch (error) {
    logger.error('获取表字段或敏感数据检测失败:', error);
    ElMessage.error('获取表字段或敏感数据检测失败，请检查连接信息');
  }
};

// 获取规则名称
const getRuleName = (ruleId) => {
  const rule = availableRules.value.find(r => r.ruleId === ruleId);
  return rule ? rule.name : ruleId;
};

// 监听表名变化，获取表字段
const watchTableName = () => {
  if (formData.tableName) {
    fetchTableColumns();
  }
};

// 提交表单
const submitForm = () => {
  formRef.value.validate(async (valid) => {
    if (!valid) {
      ElMessage.error('请正确填写表单');
      return;
    }
    
    // 打印完整的表单数据用于调试
    console.log('表单数据:', {
      ...formData,
      password: '******' // 隐藏密码
    });
    
    submitting.value = true;
    try {
      // 格式化提交数据，转换为API所需格式
      const submitData = {
        taskName: formData.taskName,
        description: formData.description,
        priority: formData.priority,
        dbType: formData.dbType,
        host: formData.host,
        port: formData.port,
        username: formData.username,
        password: formData.password,
        dbName: formData.dbName,
        tableName: formData.tableName,
        // 将maskingMethod转换为usePresidio字段
        usePresidio: formData.maskingMethod === 'presidio',
        // 根据所选方式添加不同的参数
        ...(formData.maskingMethod === 'custom' ? {
          // 将columnMappings转换为maskingRules数组格式
          maskingRules: Object.entries(formData.columnMappings)
            .filter(([, ruleId]) => ruleId) // 过滤掉没有选择规则的列
            .map(([columnName, ruleId]) => ({
              columnName,
              ruleId
            })),
          // 同时提供原始的columnMappings映射关系
          columnMappings: Object.entries(formData.columnMappings)
            .filter(([, ruleId]) => ruleId)
            .reduce((map, [columnName, ruleId]) => {
              map[columnName] = ruleId;
              return map;
            }, {})
        } : {
          // Presidio相关参数
          autoDetectColumns: formData.autoDetectColumns,
          detectedColumns: detectedColumns.value.length > 0 ? JSON.stringify(detectedColumns.value) : null
        }),
        outputFormat: formData.outputFormat,
        // 只有当输出格式为数据库时才包含输出表名
        ...(formData.outputFormat === 'database' && {
          outputTable: formData.outputTable
        })
      };
      
      // 打印发送到后端的数据进行调试
      console.log('提交到后端的数据:', submitData);

      emit('submit', submitData);
    } catch (error) {
      logger.error('提交表单失败:', error);
    } finally {
      submitting.value = false;
    }
  });
};

// 取消
const cancel = () => {
  emit('cancel');
};

// 监听表名变化
import { watch } from 'vue';
watch(() => formData.tableName, watchTableName);

// 监听maskingMethod变化
watch(() => formData.maskingMethod, (newVal) => {
  if (newVal === 'presidio') {
    // 选择了Presidio，设置autoDetectColumns为true
    formData.autoDetectColumns = true;
    // 清空manual模式下选择的规则和映射
    // formData.rules = [];
    // formData.columnMappings = {};
    ElMessage.info('已启用Presidio自动识别，系统将自动处理敏感数据');
  }
});

// 组件挂载时，获取脱敏规则列表
onMounted(() => {
  fetchRules();
  fetchRulesMappingTemplate();
  
  // 如果有初始数据库类型，自动填充连接信息
  if (formData.dbType && presetConnections[formData.dbType]) {
    handleDbTypeChange(formData.dbType);
  }
  
  // 如果是编辑模式，获取表字段
  if (props.isEdit && formData.tableName) {
    fetchTables();
    fetchTableColumns();
  }
});

// 测试数据库连接
const testConnection = async () => {
  if (!formData.dbType || !formData.host || !formData.port || !formData.username || !formData.password || !formData.dbName) {
    ElMessage.warning('请先填写完整的数据库连接信息');
    return;
  }
  
  testingConnection.value = true;
  try {
    const response = await databaseApi.testConnection({
      dbType: formData.dbType,
      host: formData.host,
      port: formData.port,
      username: formData.username,
      password: formData.password,
      dbName: formData.dbName
    });
    
    if (response.data.success) {
      ElMessage.success('数据库连接成功');
      // 连接成功后自动获取表列表
      await fetchTables();
      
      // 如果已经选择了表，自动检测敏感数据
      if (formData.tableName) {
        await fetchTableColumns();
      }
    } else {
      ElMessage.error(response.data.message || '数据库连接失败');
    }
  } catch (error) {
    logger.error('测试数据库连接失败:', error);
    ElMessage.error('数据库连接失败，请检查连接信息');
  } finally {
    testingConnection.value = false;
  }
};

// AI建议对话框控制
const aiSuggestionVisible = ref(false);

const showAISuggestion = () => {
  if (!formData.tableName) {
    ElMessage.warning('请先选择表');
    return;
  }
  aiSuggestionVisible.value = true;
};

// 预览敏感列
const previewSensitiveColumns = async () => {
  if (!formData.tableName) {
    ElMessage.warning('请先选择表');
    return;
  }
  
  // 验证数据库连接参数
  if (!formData.dbType || !formData.host || !formData.port || 
      !formData.username || !formData.password || !formData.dbName) {
    ElMessage.warning('请先完成数据库连接信息的填写');
    return;
  }
  
  previewLoading.value = true;
  try {
    // 准备数据库连接参数
    const connectionParams = {
      dbType: formData.dbType,
      host: formData.host,
      port: formData.port,
      username: formData.username,
      password: formData.password,
      dbName: formData.dbName
    };
    
    // 打印连接参数以进行调试
    console.log('预览敏感列时的连接参数:', connectionParams);
    
    const response = await databaseApi.previewSensitiveColumns(
      formData.tableName,
      connectionParams
    );
    
    // 打印响应以进行调试
    console.log('预览敏感列API响应:', response.data);
    
    if (response.data.success) {
      // 直接使用response.data作为数据源，因为它已经包含了columns数组
      detectedColumns.value = response.data.columns || [];
      ElMessage.success('预览敏感列识别结果成功');
    } else {
      ElMessage.error(response.data.message || '预览敏感列识别结果失败');
    }
  } catch (error) {
    logger.error('预览敏感列识别结果失败:', error);
    ElMessage.error('预览敏感列识别结果失败，请稍后重试');
  } finally {
    previewLoading.value = false;
  }
};
</script>

<style scoped>
.task-form {
  padding: 20px;
}

h3 {
  margin-top: 20px;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
  color: #303133;
  font-weight: 500;
}

.form-actions {
  margin-top: 30px;
  text-align: right;
}

.rule-description {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

.field-mapping-section {
  margin-top: 20px;
}

.field-mapping-container {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin-top: 15px;
}

.field-mapping-item {
  margin-bottom: 15px;
}

.field-mapping-item:last-child {
  margin-bottom: 0;
}

.column-mapping {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.column-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.rule-select {
  width: 100%;
}

.column-tags {
  display: flex;
  gap: 8px;
  align-items: center;
}

.sensitive-tag {
  margin: 0;
}

.type-tag {
  margin: 0;
  background-color: #e4e7ed;
  border-color: #e4e7ed;
  color: #606266;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #606266;
}

:deep(.el-select) {
  width: 100%;
}

.table-select-container {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
}

.table-select {
  flex: 1;
  min-width: 0;
}

.ai-suggestion-btn {
  flex-shrink: 0;
  white-space: nowrap;
}

:deep(.el-select) {
  width: 100%;
}

:deep(.el-select .el-input__wrapper) {
  width: 100%;
}

:deep(.el-select .el-input__inner) {
  width: 100%;
}

.field-mapping-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.field-mapping-info {
  margin-bottom: 15px;
}

.presidio-info-section {
  margin-top: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.sensitive-columns-preview {
  margin-top: 10px;
}

.sensitive-column-tag {
  margin-right: 5px;
  margin-bottom: 5px;
}

.detected-columns-section {
  margin-top: 10px;
}

.detected-columns-table {
  margin-top: 10px;
}

.form-item-help {
  margin-top: 5px;
  color: #909399;
  font-size: 12px;
}

/* 脱敏方式选择相关样式 */
:deep(.el-radio-group) {
  display: flex;
  margin-bottom: 15px;
}

:deep(.el-radio) {
  margin-right: 20px;
  padding: 8px 16px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  transition: all 0.3s;
}

:deep(.el-radio.is-checked) {
  background-color: #f0f9eb;
  border-color: #67c23a;
}
</style> 