import AuditLogger from '@/utils/auditLogger';
import { usersApi } from '@/utils/api';

// 在更新用户权限方法中添加日志记录
const updateUserPermissions = async (userId, permissions) => {
  try {
    loading.value = true;
    const response = await usersApi.updateUserPermissions(userId, {
      permissions
    });
    
    if (response.data.success) {
      ElMessage.success('用户权限更新成功');
      // 记录成功日志
      await AuditLogger.logPermissionChange(
        response.data.username,
        '更新'
      );
      // 刷新用户列表
      fetchUsers();
    } else {
      ElMessage.error(response.data.message || '用户权限更新失败');
      // 记录失败日志
      await AuditLogger.log(
        '权限变更',
        `更新用户权限失败：${response.data.message}`,
        '失败'
      );
    }
  } catch (error) {
    ElMessage.error('用户权限更新失败');
    // 记录错误日志
    await AuditLogger.log(
      '权限变更',
      `更新用户权限失败：${error.message}`,
      '失败'
    );
    console.error('用户权限更新失败:', error);
  } finally {
    loading.value = false;
  }
};

// 在删除用户方法中添加日志记录
const deleteUser = async (userId) => {
  try {
    loading.value = true;
    const response = await usersApi.deleteUser(userId);
    
    if (response.data.success) {
      ElMessage.success('用户删除成功');
      // 记录成功日志
      await AuditLogger.logPermissionChange(
        response.data.username,
        '删除'
      );
      // 刷新用户列表
      fetchUsers();
    } else {
      ElMessage.error(response.data.message || '用户删除失败');
      // 记录失败日志
      await AuditLogger.log(
        '权限变更',
        `删除用户失败：${response.data.message}`,
        '失败'
      );
    }
  } catch (error) {
    ElMessage.error('用户删除失败');
    // 记录错误日志
    await AuditLogger.log(
      '权限变更',
      `删除用户失败：${error.message}`,
      '失败'
    );
    console.error('用户删除失败:', error);
  } finally {
    loading.value = false;
  }
}; 