# 测试数据接口使用说明

## 数据库连接信息

- **数据库URL**: jdbc:mysql://localhost:3306/datamask
- **用户名**: root
- **密码**: 1926669707tyx
- **端口**: 8081

## 接口概述

测试数据接口提供了对五种敏感数据类型的查询功能，包括客户信息、金融记录、医疗记录、员工数据和在线交易。所有接口均返回统一格式的JSON响应，包含`success`状态和`data`数据。

## 通用响应格式

```json
{
  "success": true,
  "data": { ... }
}
```

## 1. 数据统计接口

### 1.1 获取所有测试数据的统计信息

- **接口URL**: `/api/test-data/stats`
- **请求方式**: GET
- **接口描述**: 获取各表的数据条数统计

**响应示例**:
```json
{
  "success": true,
  "data": {
    "customerInfo": 100,
    "financialRecord": 100,
    "medicalRecord": 100,
    "employeeData": 100,
    "onlineTransaction": 100
  }
}
```

## 2. 客户信息接口

### 2.1 获取客户信息列表（分页）

- **接口URL**: `/api/test-data/customers`
- **请求方式**: GET
- **接口描述**: 分页获取客户信息列表

**请求参数**:

| 参数名 | 类型    | 是否必须 | 描述           | 默认值 |
|--------|---------|----------|----------------|--------|
| page   | Integer | 否       | 页码(从0开始)  | 0      |
| size   | Integer | 否       | 每页记录数     | 10     |

### 2.2 根据ID获取客户信息

- **接口URL**: `/api/test-data/customers/{id}`
- **请求方式**: GET
- **接口描述**: 获取指定ID的客户详细信息

### 2.3 根据姓名搜索客户信息

- **接口URL**: `/api/test-data/customers/search/name`
- **请求方式**: GET
- **接口描述**: 根据姓名模糊搜索客户信息

**请求参数**:

| 参数名 | 类型   | 是否必须 | 描述                 |
|--------|--------|----------|----------------------|
| name   | String | 是       | 客户姓名(支持模糊匹配) |

### 2.4 根据年龄范围搜索客户信息

- **接口URL**: `/api/test-data/customers/search/age`
- **请求方式**: GET
- **接口描述**: 查询指定年龄范围内的客户

**请求参数**:

| 参数名 | 类型    | 是否必须 | 描述     |
|--------|---------|----------|----------|
| minAge | Integer | 是       | 最小年龄 |
| maxAge | Integer | 是       | 最大年龄 |

### 2.5 根据性别搜索客户信息

- **接口URL**: `/api/test-data/customers/search/gender`
- **请求方式**: GET
- **接口描述**: 查询指定性别的客户

**请求参数**:

| 参数名 | 类型   | 是否必须 | 描述 |
|--------|--------|----------|------|
| gender | String | 是       | 性别 |

## 3. 金融记录接口

### 3.1 获取金融记录列表（分页）

- **接口URL**: `/api/test-data/financial-records`
- **请求方式**: GET
- **接口描述**: 分页获取金融记录列表

**请求参数**:

| 参数名 | 类型    | 是否必须 | 描述           | 默认值 |
|--------|---------|----------|----------------|--------|
| page   | Integer | 否       | 页码(从0开始)  | 0      |
| size   | Integer | 否       | 每页记录数     | 10     |

### 3.2 根据ID获取金融记录

- **接口URL**: `/api/test-data/financial-records/{id}`
- **请求方式**: GET
- **接口描述**: 获取指定ID的金融记录详情

### 3.3 根据客户ID获取金融记录

- **接口URL**: `/api/test-data/financial-records/customer/{customerId}`
- **请求方式**: GET
- **接口描述**: 获取指定客户的所有金融记录

### 3.4 根据交易类型查询金融记录

- **接口URL**: `/api/test-data/financial-records/search/transaction-type`
- **请求方式**: GET
- **接口描述**: 查询指定交易类型的金融记录

**请求参数**:

| 参数名          | 类型   | 是否必须 | 描述     |
|-----------------|--------|----------|----------|
| transactionType | String | 是       | 交易类型 |

### 3.5 根据余额范围查询金融记录

- **接口URL**: `/api/test-data/financial-records/search/balance`
- **请求方式**: GET
- **接口描述**: 查询指定余额范围内的金融记录

**请求参数**:

| 参数名     | 类型      | 是否必须 | 描述     |
|------------|-----------|----------|----------|
| minBalance | BigDecimal | 是       | 最小余额 |
| maxBalance | BigDecimal | 是       | 最大余额 |

## 4. 医疗记录接口

### 4.1 获取医疗记录列表（分页）

- **接口URL**: `/api/test-data/medical-records`
- **请求方式**: GET
- **接口描述**: 分页获取医疗记录列表

**请求参数**:

| 参数名 | 类型    | 是否必须 | 描述           | 默认值 |
|--------|---------|----------|----------------|--------|
| page   | Integer | 否       | 页码(从0开始)  | 0      |
| size   | Integer | 否       | 每页记录数     | 10     |

### 4.2 根据ID获取医疗记录

- **接口URL**: `/api/test-data/medical-records/{id}`
- **请求方式**: GET
- **接口描述**: 获取指定ID的医疗记录详情

### 4.3 根据患者ID获取医疗记录

- **接口URL**: `/api/test-data/medical-records/patient/{patientId}`
- **请求方式**: GET
- **接口描述**: 获取指定患者的所有医疗记录

### 4.4 根据血型查询医疗记录

- **接口URL**: `/api/test-data/medical-records/search/blood-type`
- **请求方式**: GET
- **接口描述**: 查询指定血型的医疗记录

**请求参数**:

| 参数名    | 类型   | 是否必须 | 描述 |
|-----------|--------|----------|------|
| bloodType | String | 是       | 血型 |

### 4.5 根据就诊日期范围查询医疗记录

- **接口URL**: `/api/test-data/medical-records/search/visit-date`
- **请求方式**: GET
- **接口描述**: 查询指定就诊日期范围内的医疗记录

**请求参数**:

| 参数名    | 类型 | 是否必须 | 描述     | 格式       |
|-----------|------|----------|----------|------------|
| startDate | Date | 是       | 开始日期 | yyyy-MM-dd |
| endDate   | Date | 是       | 结束日期 | yyyy-MM-dd |

### 4.6 根据诊断结果模糊查询医疗记录

- **接口URL**: `/api/test-data/medical-records/search/diagnosis`
- **请求方式**: GET
- **接口描述**: 根据诊断结果模糊查询医疗记录

**请求参数**:

| 参数名    | 类型   | 是否必须 | 描述                   |
|-----------|--------|----------|-----------------------|
| diagnosis | String | 是       | 诊断结果(支持模糊匹配) |

## 5. 员工数据接口

### 5.1 获取员工数据列表（分页）

- **接口URL**: `/api/test-data/employee-data`
- **请求方式**: GET
- **接口描述**: 分页获取员工数据列表

**请求参数**:

| 参数名 | 类型    | 是否必须 | 描述           | 默认值 |
|--------|---------|----------|----------------|--------|
| page   | Integer | 否       | 页码(从0开始)  | 0      |
| size   | Integer | 否       | 每页记录数     | 10     |

### 5.2 根据ID获取员工数据

- **接口URL**: `/api/test-data/employee-data/{id}`
- **请求方式**: GET
- **接口描述**: 获取指定ID的员工数据详情

### 5.3 根据部门查询员工数据

- **接口URL**: `/api/test-data/employee-data/search/department`
- **请求方式**: GET
- **接口描述**: 查询指定部门的员工数据

**请求参数**:

| 参数名     | 类型   | 是否必须 | 描述     |
|------------|--------|----------|----------|
| department | String | 是       | 部门名称 |

### 5.4 根据职位查询员工数据

- **接口URL**: `/api/test-data/employee-data/search/position`
- **请求方式**: GET
- **接口描述**: 查询指定职位的员工数据

**请求参数**:

| 参数名   | 类型   | 是否必须 | 描述     |
|----------|--------|----------|----------|
| position | String | 是       | 职位名称 |

### 5.5 根据薪资范围查询员工数据

- **接口URL**: `/api/test-data/employee-data/search/salary`
- **请求方式**: GET
- **接口描述**: 查询指定薪资范围内的员工数据

**请求参数**:

| 参数名    | 类型      | 是否必须 | 描述     |
|-----------|-----------|----------|----------|
| minSalary | BigDecimal | 是       | 最低薪资 |
| maxSalary | BigDecimal | 是       | 最高薪资 |

## 6. 在线交易接口

### 6.1 获取在线交易列表（分页）

- **接口URL**: `/api/test-data/online-transactions`
- **请求方式**: GET
- **接口描述**: 分页获取在线交易列表

**请求参数**:

| 参数名 | 类型    | 是否必须 | 描述           | 默认值 |
|--------|---------|----------|----------------|--------|
| page   | Integer | 否       | 页码(从0开始)  | 0      |
| size   | Integer | 否       | 每页记录数     | 10     |

### 6.2 根据ID获取在线交易

- **接口URL**: `/api/test-data/online-transactions/{id}`
- **请求方式**: GET
- **接口描述**: 获取指定ID的在线交易详情

### 6.3 根据用户ID获取在线交易

- **接口URL**: `/api/test-data/online-transactions/user/{userId}`
- **请求方式**: GET
- **接口描述**: 获取指定用户的所有在线交易

### 6.4 根据订单ID查询在线交易

- **接口URL**: `/api/test-data/online-transactions/search/order-id`
- **请求方式**: GET
- **接口描述**: 查询指定订单ID的在线交易

**请求参数**:

| 参数名  | 类型   | 是否必须 | 描述   |
|---------|--------|----------|--------|
| orderId | String | 是       | 订单ID |

### 6.5 根据产品名称模糊查询在线交易

- **接口URL**: `/api/test-data/online-transactions/search/product`
- **请求方式**: GET
- **接口描述**: 根据产品名称模糊查询在线交易

**请求参数**:

| 参数名      | 类型   | 是否必须 | 描述                   |
|-------------|--------|----------|-----------------------|
| productName | String | 是       | 产品名称(支持模糊匹配) |

### 6.6 根据支付方式查询在线交易

- **接口URL**: `/api/test-data/online-transactions/search/payment-method`
- **请求方式**: GET
- **接口描述**: 查询指定支付方式的在线交易

**请求参数**:

| 参数名        | 类型   | 是否必须 | 描述     |
|---------------|--------|----------|----------|
| paymentMethod | String | 是       | 支付方式 |

## 使用示例

### 示例1: 获取数据统计信息

```
GET http://localhost:8081/api/test-data/stats
```

### 示例2: 分页获取客户信息

```
GET http://localhost:8081/api/test-data/customers?page=0&size=20
```

### 示例3: 根据年龄范围查询客户

```
GET http://localhost:8081/api/test-data/customers/search/age?minAge=20&maxAge=30
```

### 示例4: 查询指定部门的员工数据

```
GET http://localhost:8081/api/test-data/employee-data/search/department?department=技术部
```

### 示例5: 根据就诊日期范围查询医疗记录

```
GET http://localhost:8081/api/test-data/medical-records/search/visit-date?startDate=2023-01-01&endDate=2023-12-31
```
