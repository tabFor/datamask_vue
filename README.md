模块一：系统架构设计与数据库设计

  设计数据库表结构：包含原始数据表、脱敏后数据表、脱敏策略表等。

  设计系统架构：后端使用Spring Boot，数据库使用MySQL，数据脱敏与SQL改写模块的交互方式。

模块二：敏感数据识别模块

  功能：根据预设的规则，识别数据库中的敏感字段。

  技术：使用正则表达式或基于字段类型和样本数据的匹配算法。

  开发计划：

  设计并实现规则管理功能。

  实现字段匹配与敏感数据识别。

  实现数据样本的自动采集与匹配功能。

模块三：静态数据脱敏模块

  功能：对敏感数据进行脱敏处理，保留数据的可用性。

  技术：K-Anonymity、L-Diversity和T-Closeness等算法。

  开发计划：

  实现不同算法的脱敏逻辑。

  实现对大规模数据的批量脱敏处理功能。

  支持字段类型的泛化和数据掩码。

模块四：动态数据脱敏模块（SQL改写）

  功能：通过SQL改写技术对用户的查询进行实时脱敏。

  技术：使用JSQLParser进行SQL语句的解析与改写。

  开发计划：

  实现SQL查询的解析模块。

  实现脱敏字段匹配与查询改写模块。

  在数据库查询时，动态应用脱敏规则。

模块五：权限管理与日志审计

  功能：根据用户权限对数据脱敏进行控制，记录系统日志。

  技术：Spring Security、日志框架（如Log4j）。

  开发计划：

  实现用户角色与权限管理。

  实现脱敏操作的日志审计功能。

模块六：前端和API设计（可选）

  功能：设计前端页面或RESTful API，供用户配置脱敏规则、查看脱敏数据等。

  技术：Spring Boot提供RESTful API，前端使用Vue。

# DataMask Vue前端

## 项目概述

DataMask是一个数据脱敏系统，提供静态数据脱敏和动态数据脱敏两种功能。本项目是系统的前端部分，使用Vue 3和Element Plus构建。

## 功能区分

### 静态数据脱敏

- 通过任务的方式对数据源进行批量脱敏处理
- 支持选择多个脱敏规则，对指定表或字段进行脱敏
- 脱敏结果可以是CSV文件或数据库表
- 相关API路径以`/api/tasks`、`/api/desensitization`、`/api/static-masking`开头

### 动态数据脱敏

- 在数据查询过程中实时对结果进行脱敏
- 支持对特定字段配置脱敏规则
- 可以实时切换查看原始数据和脱敏后数据
- 相关API使用其他路径，如`/api/dynamic/masking`

## 代码组织

### 静态脱敏相关组件

- `TaskManagement.vue`: 脱敏任务管理页面
- `TaskForm.vue`: 脱敏任务创建/编辑表单
- `RuleManagement.vue`: 脱敏规则管理页面

### 动态脱敏相关组件

- `DynamicMasking.vue`: 动态脱敏查询界面

### API模块

- `api.js`: 包含所有API调用定义
  - `tasksApi`: 静态脱敏任务相关API
  - `rulesApi`: 静态脱敏规则相关API
  - `dynamicMaskingApi`: 动态脱敏相关API

## 开发指南

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run serve
```

### 构建生产版本

```bash
npm run build
```

## 注意事项

1. 静态脱敏和动态脱敏功能完全分离，请确保API调用使用正确的路径
2. 任务表单中脱敏规则为多选，可选择多个规则ID
3. 系统会自动使用`StaticDataMaskingService`处理静态脱敏数据