<template>
  <div class="security-container">
    <h1>权限管理</h1>
    
    <!-- 角色列表 -->
    <el-card class="security-card">
      <template #header>
        <div class="card-header">
          <span>角色列表</span>
        </div>
      </template>
      
      <el-table :data="roles" v-loading="roleLoading" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="角色名称" />
        <el-table-column prop="description" label="角色描述" />
      </el-table>
    </el-card>
    
    <!-- 用户管理 -->
    <el-card class="security-card">
      <template #header>
        <div class="card-header">
          <span>用户管理</span>
          <el-button type="primary" @click="handleAddUser">添加用户</el-button>
        </div>
      </template>
      
      <el-table :data="users" v-loading="userLoading" style="width: 100%">
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="role" label="角色" />
        <el-table-column label="操作" width="230">
          <template #default="scope">
            <el-button type="primary" size="small" @click="handleEditUser(scope.row)">编辑</el-button>
            <el-button type="warning" size="small" @click="handleChangeRole(scope.row)">分配角色</el-button>
            <el-button type="danger" size="small" @click="handleDeleteUser(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    
    <!-- 添加/编辑用户对话框 -->
    <el-dialog 
      v-model="userDialog.visible" 
      :title="userDialog.isEdit ? '编辑用户' : '添加用户'"
      width="500px"
    >
      <el-form 
        ref="userFormRef"
        :model="userForm" 
        :rules="userRules"
        label-width="80px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="userForm.username" :disabled="userDialog.isEdit" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="userForm.password" type="password" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="userForm.role" placeholder="请选择角色">
            <el-option 
              v-for="role in roles" 
              :key="role.name" 
              :label="role.name" 
              :value="role.name" 
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="userDialog.visible = false">取消</el-button>
          <el-button type="primary" @click="saveUser" :loading="saveLoading">确定</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 分配角色对话框 -->
    <el-dialog 
      v-model="roleDialog.visible" 
      title="分配角色"
      width="500px"
    >
      <el-form label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="roleDialog.username" disabled />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="roleDialog.role" placeholder="请选择角色">
            <el-option 
              v-for="role in roles" 
              :key="role.name" 
              :label="role.name" 
              :value="role.name" 
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="roleDialog.visible = false">取消</el-button>
          <el-button type="primary" @click="assignRole" :loading="assignLoading">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { usersApi, rolesApi } from '@/utils/api';
import { USER_ROLES } from '@/utils/permission';

// 数据加载状态
const userLoading = ref(false);
const roleLoading = ref(false);
const saveLoading = ref(false);
const assignLoading = ref(false);

// 用户和角色数据
const users = ref([]);
const roles = ref([]);

// 用户表单相关
const userFormRef = ref(null);
const userForm = reactive({
  username: '',
  password: '',
  role: USER_ROLES.DATA_OPERATOR
});

const userRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ]
};

// 对话框状态
const userDialog = reactive({
  visible: false,
  isEdit: false,
  userId: null
});

const roleDialog = reactive({
  visible: false,
  userId: null,
  username: '',
  role: '',
  originalRoleId: null
});

// 初始化数据
onMounted(() => {
  fetchUsers();
  fetchRoles();
});

// 获取用户列表
const fetchUsers = async () => {
  try {
    userLoading.value = true;
    const response = await usersApi.getUsers();
    users.value = response.data || [];
  } catch (error) {
    ElMessage.error('获取用户列表失败');
    console.error('获取用户列表失败:', error);
  } finally {
    userLoading.value = false;
  }
};

// 获取角色列表
const fetchRoles = async () => {
  try {
    roleLoading.value = true;
    const response = await rolesApi.getRoles();
    roles.value = response.data || [];
  } catch (error) {
    ElMessage.error('获取角色列表失败');
    console.error('获取角色列表失败:', error);
  } finally {
    roleLoading.value = false;
  }
};

// 添加用户
const handleAddUser = () => {
  userDialog.isEdit = false;
  userDialog.userId = null;
  userForm.username = '';
  userForm.password = '';
  userForm.role = USER_ROLES.DATA_OPERATOR;
  userDialog.visible = true;
  // 在下一个 tick 后重置表单验证
  setTimeout(() => {
    userFormRef.value?.resetFields();
  }, 0);
};

// 编辑用户
const handleEditUser = (user) => {
  userDialog.isEdit = true;
  userDialog.userId = user.id;
  userForm.username = user.username;
  userForm.password = '';  // 不回显密码
  userForm.role = user.role;
  userDialog.visible = true;
  // 在下一个 tick 后重置表单验证
  setTimeout(() => {
    userFormRef.value?.resetFields();
  }, 0);
};

// 保存用户
const saveUser = () => {
  userFormRef.value?.validate(async (valid) => {
    if (valid) {
      try {
        saveLoading.value = true;
        
        const userData = {
          username: userForm.username,
          password: userForm.password,
          role: userForm.role
        };
        
        if (userDialog.isEdit) {
          // 更新用户
          await usersApi.updateUser(userDialog.userId, userData);
          ElMessage.success('用户更新成功');
        } else {
          // 创建用户
          await usersApi.createUser(userData);
          ElMessage.success('用户创建成功');
        }
        
        userDialog.visible = false;
        fetchUsers();
      } catch (error) {
        const errorMsg = userDialog.isEdit ? '更新用户失败' : '创建用户失败';
        ElMessage.error(errorMsg);
        console.error(errorMsg, error);
      } finally {
        saveLoading.value = false;
      }
    }
  });
};

// 删除用户
const handleDeleteUser = (user) => {
  ElMessageBox.confirm(
    `确定要删除用户 "${user.username}" 吗？`,
    '删除用户',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      userLoading.value = true;
      await usersApi.deleteUser(user.id);
      ElMessage.success('用户删除成功');
      fetchUsers();
    } catch (error) {
      ElMessage.error('删除用户失败');
      console.error('删除用户失败:', error);
    } finally {
      userLoading.value = false;
    }
  }).catch(() => {});
};

// 分配角色
const handleChangeRole = async (user) => {
  try {
    // 获取用户当前角色
    const response = await rolesApi.getUserRoles(user.id);
    
    roleDialog.userId = user.id;
    roleDialog.username = user.username;
    roleDialog.role = user.role;
    roleDialog.originalRoleId = response.data && response.data.id;
    roleDialog.visible = true;
  } catch (error) {
    ElMessage.error('获取用户角色信息失败');
    console.error('获取用户角色信息失败:', error);
  }
};

// 保存角色分配
const assignRole = async () => {
  try {
    assignLoading.value = true;
    
    // 如果有原始角色，先移除
    if (roleDialog.originalRoleId) {
      await rolesApi.removeRole(roleDialog.userId, roleDialog.originalRoleId);
    }
    
    // 分配新角色
    await rolesApi.assignRole(roleDialog.userId, {
      role: roleDialog.role
    });
    
    ElMessage.success('角色分配成功');
    roleDialog.visible = false;
    fetchUsers();
  } catch (error) {
    ElMessage.error('角色分配失败');
    console.error('角色分配失败:', error);
  } finally {
    assignLoading.value = false;
  }
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