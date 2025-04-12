import axios from 'axios'
import logger from './logger'

// 创建axios实例
const request = axios.create({
    baseURL: 'http://localhost:8081', // 更新为实际后端地址
    timeout: 5000
})

// 请求拦截器
request.interceptors.request.use(
    config => {
        // 在请求发送之前做一些处理，比如统一添加token
        const token = localStorage.getItem('token')
        if (token) {
            config.headers['Authorization'] = 'Bearer ' + token
            // 使用日志工具记录
            logger.api(config.method, config.url, '已添加token认证');
            console.log(`请求 ${config.url} 已添加token: ${token.substring(0, 10)}...`);
        } else {
            logger.warn(`请求: ${config.url}，未找到token`);
            console.warn(`警告: 请求 ${config.url} 未找到token，这可能导致403错误`);
        }
        
        // 打印完整的请求配置
        console.log('请求配置:', {
            url: config.url,
            method: config.method,
            headers: config.headers,
            params: config.params,
            data: config.data
        });
        
        return config
    },
    error => {
        // 对请求错误做些什么
        logger.error('请求拦截器错误', error);
        return Promise.reject(error)
    }
)

// 响应拦截器
request.interceptors.response.use(
    response => {
        // 对响应数据做点什么
        logger.apiResponse(response.config.url, response.status, '请求成功');
        return response
    },
    error => {
        // 对响应错误做点什么
        if (error.response && error.response.status === 401) {
            // token过期或无效
            logger.warn('接收到401未授权响应，清除认证信息并跳转登录页');
            localStorage.removeItem('token')
            localStorage.removeItem('username')
            localStorage.removeItem('userRole')
            window.location.href = '/login'
        } else if (error.response && error.response.status === 403) {
            // 权限不足
            logger.warn('接收到403禁止访问响应，可能是权限不足', {
                url: error.config.url,
                method: error.config.method,
                data: error.config.data
            });
            
            // 打印更详细的403错误信息
            console.error('403权限不足详情:', {
                url: error.config.url,
                method: error.config.method,
                requestData: error.config.data,
                responseData: error.response.data,
                headers: error.response.headers,
                token: localStorage.getItem('token') ? '存在' : '不存在',
                username: localStorage.getItem('username'),
                userRole: localStorage.getItem('userRole')
            });
            
            // 可选：显示权限不足提示
            // import { ElMessage } from 'element-plus'
            // ElMessage.error('权限不足，无法执行此操作')
        } else {
            logger.error('API请求错误', error);
        }
        return Promise.reject(error)
    }
)

export default request 