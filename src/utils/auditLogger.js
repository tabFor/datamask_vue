import request from './request';

class AuditLogger {
  static async log(operation, details, status = '成功') {
    try {
      await request.post('/api/audit-logs', {
        username: localStorage.getItem('username') || '未知用户',
        operation,
        details,
        status
      });
    } catch (error) {
      console.error('记录审计日志失败:', error);
    }
  }

  // 数据识别相关日志
  static async logDataIdentification(tableName, result) {
    await this.log(
      '数据识别',
      `对数据表 ${tableName} 执行敏感数据识别，${result}`,
      result.includes('成功') ? '成功' : '失败'
    );
  }

  // 静态脱敏相关日志
  static async logStaticMasking(tableName, method) {
    await this.log(
      '静态脱敏',
      `对数据表 ${tableName} 执行${method}脱敏`,
      '成功'
    );
  }

  // 动态脱敏相关日志
  static async logDynamicMasking(rule) {
    await this.log(
      '动态脱敏',
      `配置动态脱敏规则: ${rule}`,
      '成功'
    );
  }

  // 权限变更相关日志
  static async logPermissionChange(username, action) {
    await this.log(
      '权限变更',
      `${action}用户 ${username} 的权限`,
      '成功'
    );
  }

  // 数据查询相关日志
  static async logDataQuery(tableName, queryType) {
    await this.log(
      '数据查询',
      `${queryType}查询数据表 ${tableName}`,
      '成功'
    );
  }
}

export default AuditLogger; 