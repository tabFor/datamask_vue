/**
 * 调试配置工具
 * 用于集中管理项目中的调试输出和日志
 */

// 调试开关 - 整个应用
const DEBUG_ENABLED = process.env.NODE_ENV !== 'production';

// 日志级别
const LOG_LEVELS = {
  NONE: 0,   // 不输出任何日志
  ERROR: 1,  // 只输出错误日志
  WARN: 2,   // 输出警告和错误
  INFO: 3,   // 输出信息、警告和错误
  DEBUG: 4,  // 输出所有日志
  ALL: 5     // 输出所有日志，包括详细跟踪
};

// 当前日志级别
const CURRENT_LOG_LEVEL = process.env.NODE_ENV === 'production' 
  ? LOG_LEVELS.ERROR 
  : LOG_LEVELS.ALL;

// 应用调试设置
const appSettings = {
  // 组件调试设置
  components: {
    TaskForm: {
      debugApiCalls: DEBUG_ENABLED,
      debugValidation: DEBUG_ENABLED,
      debugMappings: DEBUG_ENABLED
    },
    DynamicMasking: {
      debugQueries: DEBUG_ENABLED,
      debugRules: DEBUG_ENABLED
    },
    RuleManagement: {
      debugApiCalls: DEBUG_ENABLED
    }
  },
  
  // API调试设置
  api: {
    debugRequests: DEBUG_ENABLED,
    debugResponses: DEBUG_ENABLED,
    debugErrors: true // 始终启用错误调试
  },
  
  // 性能调试
  performance: {
    debugComponentRenders: DEBUG_ENABLED && false, // 默认禁用性能调试
    debugApiTiming: DEBUG_ENABLED && false
  }
};

/**
 * 检查调试设置是否启用
 * @param {string} path 设置路径，如 'components.TaskForm.debugApiCalls'
 * @returns {boolean} 是否启用
 */
function isDebugEnabled(path) {
  if (!DEBUG_ENABLED) return false;
  
  const keys = path.split('.');
  let current = appSettings;
  
  for (const key of keys) {
    if (current[key] === undefined) return false;
    current = current[key];
  }
  
  return Boolean(current);
}

/**
 * 检查当前日志级别是否允许指定级别的日志
 * @param {number} level 日志级别
 * @returns {boolean} 是否允许
 */
function isLogLevelEnabled(level) {
  return level <= CURRENT_LOG_LEVEL;
}

export {
  DEBUG_ENABLED,
  LOG_LEVELS,
  CURRENT_LOG_LEVEL,
  isDebugEnabled,
  isLogLevelEnabled
}; 