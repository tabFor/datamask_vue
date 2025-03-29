<template>
  <div class="security-container">
    <h1>权限管理</h1>
    
    <el-card class="security-card">
      <template #header>
        <div class="card-header">
          <span>角色权限管理</span>
          <el-button type="primary" @click="addRole">添加角色</el-button>
        </div>
      </template>
      
      <el-table :data="roles" style="width: 100%">
        <el-table-column prop="name" label="角色名称" />
        <el-table-column prop="description" label="角色描述" />
        <el-table-column label="操作">
          <template #default="scope">
            <el-button type="primary" size="small" @click="editRole(scope.row)">编辑</el-button>
            <el-button type="danger" size="small" @click="deleteRole(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    
    <el-card class="security-card">
      <template #header>
        <div class="card-header">
          <span>用户权限管理</span>
          <el-button type="primary" @click="addUser">添加用户</el-button>
        </div>
      </template>
      
      <el-table :data="users" style="width: 100%">
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="role" label="角色" />
        <el-table-column prop="lastLogin" label="最后登录时间" />
        <el-table-column label="操作">
          <template #default="scope">
            <el-button type="primary" size="small" @click="editUser(scope.row)">编辑</el-button>
            <el-button type="danger" size="small" @click="deleteUser(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { ElMessage } from 'element-plus';

// 角色数据
const roles = ref([
  { id: 1, name: '管理员', description: '系统管理员，拥有所有权限' },
  { id: 2, name: '数据分析师', description: '可以查看和分析脱敏后的数据' },
  { id: 3, name: '数据操作员', description: '可以执行数据脱敏操作' }
]);

// 用户数据
const users = ref([
  { id: 1, username: 'admin', role: '管理员', lastLogin: '2023-03-01 10:30:45' },
  { id: 2, username: 'analyst1', role: '数据分析师', lastLogin: '2023-03-01 09:15:22' },
  { id: 3, username: 'operator1', role: '数据操作员', lastLogin: '2023-02-28 16:45:10' }
]);

// 角色管理方法
const addRole = () => {
  ElMessage.info('添加角色功能待实现');
};

const editRole = (role) => {
  ElMessage.info(`编辑角色: ${role.name}`);
};

const deleteRole = (role) => {
  ElMessage.warning(`删除角色: ${role.name}`);
};

// 用户管理方法
const addUser = () => {
  ElMessage.info('添加用户功能待实现');
};

const editUser = (user) => {
  ElMessage.info(`编辑用户: ${user.username}`);
};

const deleteUser = (user) => {
  ElMessage.warning(`删除用户: ${user.username}`);
};
</script>

<style scoped>
.security-container {
  min-height: 100vh;
  padding: 24px;
  background: #f5f5f5;
}

.security-container h1 {
  color: #1a237e;
  font-size: 28px;
  font-weight: 500;
  margin-bottom: 24px;
  padding-left: 8px;
  border-left: 4px solid #1a237e;
}

.security-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.security-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.security-card:nth-child(2) {
  animation-delay: 0.2s;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

.card-header span {
  color: #1a237e;
  font-size: 18px;
  font-weight: 500;
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

.el-button--primary {
  background: #1a237e;
  border-color: #1a237e;
}

.el-button--primary:hover {
  background: #283593;
  border-color: #283593;
}

.el-button--danger {
  background: #d32f2f;
  border-color: #d32f2f;
}

.el-button--danger:hover {
  background: #c62828;
  border-color: #c62828;
}

.el-table {
  border-radius: 8px;
  overflow: hidden;
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

.el-table--striped .el-table__body tr.el-table__row--striped td {
  background: rgba(26, 35, 126, 0.02);
}

.el-table--enable-row-hover .el-table__body tr:hover > td {
  background: rgba(26, 35, 126, 0.04);
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

/* 响应式设计 */
@media (max-width: 768px) {
  .security-container {
    padding: 16px;
  }
  
  .card-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
  
  .el-button {
    width: 100%;
  }
  
  .el-table {
    display: block;
    overflow-x: auto;
  }
}
</style> 