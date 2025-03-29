/**
 * 权限控制工具函数
 */

// 角色常量
export const USER_ROLES = {
  ADMIN: 'ADMIN',
  DATA_ANALYST: 'DATA_ANALYST',
  DATA_OPERATOR: 'DATA_OPERATOR'
};

/**
 * 获取当前用户角色
 * @returns {string} 用户角色
 */
export const getUserRole = () => {
  return localStorage.getItem('userRole') || '';
};

/**
 * 判断用户是否有访问某个功能的权限
 * @param {string|array} allowedRoles 允许访问的角色
 * @returns {boolean} 是否有权限
 */
export const hasPermission = (allowedRoles) => {
  const userRole = getUserRole();
  
  if (!userRole) return false;
  
  // 管理员拥有所有权限
  if (userRole === USER_ROLES.ADMIN) return true;
  
  // 检查用户角色是否在允许的角色列表中
  if (Array.isArray(allowedRoles)) {
    return allowedRoles.includes(userRole);
  }
  
  return allowedRoles === userRole;
};

/**
 * 根据角色获取可见菜单
 * @param {string} role 用户角色
 * @returns {array} 可见菜单列表
 */
export const getMenusByRole = (role) => {
  // 默认所有角色都可以访问的菜单
  const commonMenus = [
    { path: '/', name: '首页', icon: 'House' }
  ];
  
  // 根据角色返回对应的菜单
  switch (role) {
    case USER_ROLES.ADMIN:
      // 管理员可以访问所有菜单
      return [
        ...commonMenus,
        { path: '/tasks', name: '敏感数据识别', icon: 'Search' },
        { path: '/rules', name: '配置脱敏规则', icon: 'Setting' },
        { path: '/dynamic', name: '动态数据脱敏', icon: 'DataLine' },
        { path: '/security', name: '权限管理', icon: 'Lock' },
        { path: '/audit', name: '日志审计', icon: 'List' },
        { path: '/analysis', name: '数据分析', icon: 'DataAnalysis' }
      ];
      
    case USER_ROLES.DATA_ANALYST:
      // 数据分析师只能查看和分析脱敏后的数据
      return [
        ...commonMenus,
        { path: '/analysis', name: '数据分析', icon: 'DataAnalysis' }
      ];
      
    case USER_ROLES.DATA_OPERATOR:
      // 数据操作员可以执行数据脱敏操作
      return [
        ...commonMenus,
        { path: '/tasks', name: '敏感数据识别', icon: 'Search' },
        { path: '/rules', name: '配置脱敏规则', icon: 'Setting' },
        { path: '/dynamic', name: '动态数据脱敏', icon: 'DataLine' }
      ];
      
    default:
      return commonMenus;
  }
}; 