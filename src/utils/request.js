import axios from 'axios'

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
        }
        return config
    },
    error => {
        // 对请求错误做些什么
        console.log(error)
        return Promise.reject(error)
    }
)

// 响应拦截器
request.interceptors.response.use(
    response => {
        // 对响应数据做点什么
        return response
    },
    error => {
        // 对响应错误做点什么
        if (error.response && error.response.status === 401) {
            // token过期或无效
            localStorage.removeItem('token')
            localStorage.removeItem('username')
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

export default request 