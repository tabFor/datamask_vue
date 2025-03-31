/**
 * 日志工具类
 * 统一管理应用中的日志输出，可根据环境变量控制日志级别
 */
import { DEBUG_ENABLED, LOG_LEVELS as CONFIG_LOG_LEVELS, isDebugEnabled, isLogLevelEnabled } from './debugConfig';

// 日志级别映射
const LOG_LEVELS = {
  DEBUG: CONFIG_LOG_LEVELS.DEBUG,
  INFO: CONFIG_LOG_LEVELS.INFO,
  WARN: CONFIG_LOG_LEVELS.WARN,
  ERROR: CONFIG_LOG_LEVELS.ERROR,
  NONE: CONFIG_LOG_LEVELS.NONE
};

/**
 * 创建带前缀的日志输出
 * @param {string} prefix 日志前缀
 * @returns {Object} 日志对象
 */
const createLogger = (prefix = '') => {
  const formatPrefix = prefix ? `[${prefix}] ` : '';
  
  return {
    debug(...args) {
      if (DEBUG_ENABLED && isLogLevelEnabled(LOG_LEVELS.DEBUG)) {
        console.debug(formatPrefix, ...args);
      }
    },
    
    info(...args) {
      if (isLogLevelEnabled(LOG_LEVELS.INFO)) {
        console.info(formatPrefix, ...args);
      }
    },
    
    warn(...args) {
      if (isLogLevelEnabled(LOG_LEVELS.WARN)) {
        console.warn(formatPrefix, ...args);
      }
    },
    
    error(...args) {
      if (isLogLevelEnabled(LOG_LEVELS.ERROR)) {
        console.error(formatPrefix, ...args);
      }
    },
    
    // 用于记录API相关日志
    api(method, url, data) {
      if (DEBUG_ENABLED && isDebugEnabled('api.debugRequests')) {
        console.debug(`${formatPrefix}API ${method} ${url}`, data || '');
      }
    },
    
    // 用于记录API响应
    apiResponse(url, status, data) {
      if (DEBUG_ENABLED && isDebugEnabled('api.debugResponses')) {
        console.debug(`${formatPrefix}API响应 ${url} [${status}]`, data || '');
      }
    },
    
    // 用于记录组件操作
    component(componentName, action, data) {
      if (DEBUG_ENABLED && isDebugEnabled(`components.${componentName}.debug${action}`)) {
        console.debug(`${formatPrefix}${componentName} - ${action}:`, data || '');
      }
    },
    
    // 用于记录性能指标
    performance(area, metric, value) {
      if (DEBUG_ENABLED && isDebugEnabled(`performance.debug${area}`)) {
        console.debug(`${formatPrefix}性能 [${area}] ${metric}: ${value}`);
      }
    }
  };
};

// 默认日志对象
const logger = createLogger('DataMask');

// 导出日志工具和创建器函数
export { logger, createLogger, LOG_LEVELS };
export default logger; 