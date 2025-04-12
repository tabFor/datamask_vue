import request from './request'

// 数据库相关API
export const databaseApi = {
  // 获取数据库表列表
  getTables(params) {
    return request.get('/api/database/tables', { params })
  },
  
  // 获取表字段列表
  getColumns(params) {
    return request.get('/api/database/columns', { params })
  },
  
  // 测试数据库连接
  testConnection(data) {
    return request.post('/api/database/test-connection', data)
  },

  // 检测表的敏感列
  detectTableSensitiveColumns(tableName, connectionParams) {
    if (connectionParams) {
      // 如果提供了连接参数，作为查询参数添加
      return request.get(`/api/sensitive-data/detect/${tableName}`, { 
        params: connectionParams 
      });
    }
    return request.get(`/api/sensitive-data/detect/${tableName}`);
  },

  // 检测所有敏感列
  detectAllSensitiveColumns() {
    return request.get('/api/sensitive-data/detect')
  },

  // 检测单个列的敏感信息
  detectColumn(data) {
    return request.post('/api/sensitive-data/detect/column', data)
  },
  
  // 预览敏感列识别结果
  previewSensitiveColumns(tableName, connectionParams) {
    const data = { tableName, ...connectionParams };
    console.log('发送到presidio API的数据:', data);
    return request.post('/api/presidio/detect-sensitive-columns', data);
  }
}

// 脱敏规则相关API
export const rulesApi = {
  // 获取所有规则
  getAllRules() {
    return request.get('/api/rules')
  },
  
  // 获取单个规则
  getRule(ruleId) {
    return request.get(`/api/rules/${ruleId}`)
  },
  
  // 创建规则
  createRule(data) {
    return request.post('/api/rules', data)
  },
  
  // 更新规则
  updateRule(ruleId, data) {
    return request.put(`/api/rules/${ruleId}`, data)
  },
  
  // 删除规则
  deleteRule(ruleId) {
    return request.delete(`/api/rules/${ruleId}`)
  }
}

// 任务相关API
export const tasksApi = {
  // 获取任务列表
  getTasks(params) {
    return request.get('/api/tasks', { params })
  },
  
  // 获取单个任务
  getTask(id) {
    return request.get(`/api/tasks/${id}`)
  },
  
  // 创建任务
  createTask(data) {
    console.log('创建任务请求数据:', data);
    console.log('当前用户信息:', {
      username: localStorage.getItem('username'),
      role: localStorage.getItem('userRole'),
      tokenExists: !!localStorage.getItem('token')
    });
    return request.post('/api/tasks', data)
      .then(response => {
        console.log('创建任务成功响应:', response.data);
        return response;
      })
      .catch(error => {
        console.error('创建任务错误详情:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          headers: error.response?.headers
        });
        throw error;
      });
  },
  
  // 更新任务
  updateTask(id, data) {
    return request.put(`/api/tasks/${id}`, data)
  },
  
  // 删除任务
  deleteTask(id) {
    return request.delete(`/api/tasks/${id}`)
  },
  
  // 执行任务
  executeTask(id) {
    return request.post(`/api/tasks/${id}/execute`, {
      taskId: id
    })
  },
  
  // 获取规则映射模板
  getRulesMappingTemplate() {
    return request.get('/api/tasks/rules-mapping-template')
  }
}

// 动态脱敏相关API
export const dynamicMaskingApi = {
  // 获取动态脱敏规则
  getRules(params) {
    return request.get('/api/dynamic/masking/rules', { params })
  },
  
  // 获取单个动态脱敏规则
  getRule(ruleId) {
    return request.get(`/api/dynamic/masking/rules/${ruleId}`)
  },
  
  // 创建动态脱敏规则
  createRule(data) {
    return request.post('/api/dynamic/masking/rules', data)
  },
  
  // 更新动态脱敏规则
  updateRule(ruleId, data) {
    return request.put(`/api/dynamic/masking/rules/${ruleId}`, data)
  },
  
  // 删除动态脱敏规则
  deleteRule(ruleId) {
    return request.delete(`/api/dynamic/masking/rules/${ruleId}`)
  },
  
  // 执行动态脱敏查询
  executeQuery(data) {
    return request.post('/api/dynamic/masking/query', data)
  }
}

// 用户管理相关API
export const usersApi = {
  // 用户登录
  login(data) {
    return request.post('/api/login', data)
  },
  
  // 检查登录状态
  checkAuth() {
    return request.get('/api/check-auth')
  },
  
  // 用户登出
  logout() {
    return request.post('/api/auth/logout')
  },
  
  // 获取用户列表
  getUsers() {
    return request.get('/api/users')
  },
  
  // 获取单个用户
  getUser(userId) {
    return request.get(`/api/users/${userId}`)
  },
  
  // 创建用户
  createUser(data) {
    return request.post('/api/users', data)
  },
  
  // 更新用户
  updateUser(userId, data) {
    return request.put(`/api/users/${userId}`, data)
  },
  
  // 删除用户
  deleteUser(userId) {
    return request.delete(`/api/users/${userId}`)
  },
  
  // 更新用户权限
  updateUserPermissions(userId, data) {
    return request.put(`/api/users/${userId}/permissions`, data)
  }
}

// 角色管理相关API
export const rolesApi = {
  // 获取所有角色
  getRoles() {
    return request.get('/api/roles')
  },
  
  // 获取角色详情
  getRole(roleId) {
    return request.get(`/api/roles/${roleId}`)
  },
  
  // 给用户分配角色
  assignRole(userId, data) {
    return request.post(`/api/users/${userId}/roles`, data)
  },
  
  // 移除用户角色
  removeRole(userId, roleId) {
    return request.delete(`/api/users/${userId}/roles/${roleId}`)
  },
  
  // 查询用户角色
  getUserRoles(userId) {
    return request.get(`/api/users/${userId}/roles`)
  }
}

// 日志审计相关API
export const auditLogsApi = {
  // 搜索/获取日志
  searchLogs(params) {
    return request.get('/api/audit-logs/search', { params })
  },
  
  // 获取日志详情
  getLog(logId) {
    return request.get(`/api/audit-logs/${logId}`)
  },
  
  // 获取日志操作类型统计
  getOperationStats() {
    return request.get('/api/audit-logs/stats/operations')
  },
  
  // 获取日志时间统计
  getTimeStats() {
    return request.get('/api/audit-logs/stats/time')
  }
}

// 遮蔽规则相关API
export const maskingRulesApi = {
  // 获取所有遮蔽规则
  getAllRules() {
    return request.get('/api/masking-rules')
  },
  
  // 获取激活的遮蔽规则
  getActiveRules() {
    return request.get('/api/masking-rules/active')
  },
  
  // 创建遮蔽规则
  createRule(data) {
    return request.post('/api/masking-rules', data)
  },
  
  // 批量创建/更新遮蔽规则
  batchUpdateRules(data) {
    return request.post('/api/masking-rules/batch-wrapped', data)
  },
  
  // 更新遮蔽规则
  updateRule(ruleId, data) {
    return request.put(`/api/masking-rules/${ruleId}`, data)
  },
  
  // 删除遮蔽规则
  deleteRule(ruleId) {
    return request.delete(`/api/masking-rules/${ruleId}`)
  },
  
  // 激活/停用遮蔽规则
  toggleRuleStatus(ruleId, status) {
    return request.put(`/api/masking-rules/${ruleId}/status`, { active: status })
  }
}

// 遮蔽数据访问相关API
export const maskedDataApi = {
  // 获取遮蔽数据文件列表
  getFiles() {
    return request.get('/api/masked-data/files')
  },
  
  // 预览遮蔽数据文件
  previewFile(filePath, page, size) {
    return request.get('/api/masked-data/preview', { 
      params: { 
        filePath, 
        page, 
        size 
      } 
    })
  },
  
  // 下载遮蔽数据文件
  downloadFile(filePath) {
    return request.get('/api/masked-data/download', { 
      params: { filePath },
      responseType: 'blob'
    })
  },
  
  // 获取遮蔽数据表列表
  getTables() {
    return request.get('/api/masked-data/db-tables')
  },
  
  // 查询遮蔽数据表
  queryTable(tableName, page, size, conditions) {
    const params = { tableName, page, size }
    
    if (conditions) {
      params.conditions = JSON.stringify(conditions)
    }
    
    return request.get('/api/masked-data/db-query', { params })
  }
}

// 测试数据相关API
export const testDataApi = {
  // 获取测试数据统计
  getStats() {
    return request.get('/api/test-data/stats')
  },
  
  // 获取客户信息列表
  getCustomers(params) {
    return request.get('/api/test-data/customers', { params })
  },
  
  // 按照表名获取通用测试数据列表
  getTestData(tableName, params) {
    return request.get(`/api/test-data/${tableName}`, { params })
  }
}

// Presidio相关API
export const presidioApi = {
  // 检查Presidio服务状态
  checkStatus() {
    return request.get('/api/presidio/status')
  },
  
  // 分析文本
  analyzeText(text) {
    return request.post('/api/presidio/analyze', { text })
  },
  
  // 脱敏文本
  anonymizeText(text) {
    return request.post('/api/presidio/anonymize', { text })
  },
  
  // 检测敏感列
  detectSensitiveColumns(tableName, connectionParams) {
    const data = { tableName, ...connectionParams };
    return request.post('/api/presidio/detect-sensitive-columns', data)
  }
} 