# 数据脱敏管理平台 - 日志系统使用指南

## 概述

为了统一管理项目中的日志输出，提高开发和调试效率，我们实现了一个集中的日志管理系统。该系统可以根据环境变量自动调整日志输出级别，避免在生产环境中输出过多的调试信息。

## 核心组件

日志系统由两个主要部分组成：

1. **debugConfig.js** - 提供全局调试配置，控制各模块的调试开关
2. **logger.js** - 提供统一的日志输出接口，根据配置决定是否输出日志

## 如何使用

### 导入日志工具

```javascript
import logger from '@/utils/logger';
```

### 基本用法

```javascript
// 不同级别的日志
logger.debug('这是调试信息', { extraData: 'something' }); // 仅在开发环境显示
logger.info('这是普通信息');                            // 所有环境显示
logger.warn('这是警告信息');                            // 所有环境显示
logger.error('这是错误信息', error);                    // 所有环境显示

// API相关日志
logger.api('GET', '/api/users', { id: 1 });           // 记录API请求
logger.apiResponse('/api/users', 200, { data });      // 记录API响应

// 组件操作日志
logger.component('TaskForm', 'Submit', formData);     // 记录组件操作

// 性能指标日志
logger.performance('Rendering', 'Time', '200ms');     // 记录性能指标
```

### 创建特定的Logger实例

针对不同模块创建专用的日志实例，便于区分不同模块的日志：

```javascript
import { createLogger } from '@/utils/logger';

// 创建专用于用户模块的日志实例
const userLogger = createLogger('UserModule');
userLogger.info('用户登录成功');  // 输出: [UserModule] 用户登录成功
```

## 日志级别

系统定义了以下日志级别，按严重程度递增：

1. **DEBUG (0)** - 详细的调试信息，仅用于开发环境
2. **INFO (1)** - 普通信息，记录应用的正常操作
3. **WARN (2)** - 警告信息，不会导致应用崩溃但需要关注的问题
4. **ERROR (3)** - 错误信息，表示应用遇到了问题
5. **NONE (4)** - 不输出任何日志

在生产环境中，默认只显示ERROR级别的日志；在开发环境中，显示所有级别的日志。

## 调试配置

在`debugConfig.js`中，我们为不同模块定义了调试开关：

```javascript
const appSettings = {
  // 组件调试设置
  components: {
    TaskForm: {
      debugApiCalls: true,  // 是否输出API调用日志
      debugValidation: true // 是否输出表单验证日志
    },
    // 其他组件...
  },
  
  // API调试设置
  api: {
    debugRequests: true,   // 是否输出请求日志
    debugResponses: true   // 是否输出响应日志
  },
  
  // 其他设置...
};
```

## 最佳实践

1. **替换现有的console调用**：
   - 用`logger.debug`替换`console.log`
   - 用`logger.error`替换`console.error`
   - 用`logger.warn`替换`console.warn`

2. **添加上下文信息**：
   ```javascript
   // 不好的做法
   logger.error('保存失败');
   
   // 好的做法
   logger.error('保存任务失败', { taskId, error });
   ```

3. **使用专门的日志方法**：
   - 对于API调用，使用`logger.api`和`logger.apiResponse`
   - 对于组件操作，使用`logger.component`

4. **避免过度日志**：
   - 不要记录敏感信息（密码、token等）
   - 避免在循环中大量输出日志
   - 使用适当的日志级别

## 注意事项

1. 所有日志输出都会被统一格式化，便于查看和筛选
2. 在生产环境中，DEBUG级别的日志会被自动忽略
3. 如果需要临时启用某个模块的调试日志，可以修改`debugConfig.js`中的配置 