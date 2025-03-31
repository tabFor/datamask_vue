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
  detectTableSensitiveColumns(tableName) {
    return request.get(`/api/sensitive-data/detect/${tableName}`)
  },

  // 检测所有敏感列
  detectAllSensitiveColumns() {
    return request.get('/api/sensitive-data/detect')
  },

  // 检测单个列的敏感信息
  detectColumn(data) {
    return request.post('/api/sensitive-data/detect/column', data)
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
    return request.post('/api/tasks', data)
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
    return request.post('/login', data)
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