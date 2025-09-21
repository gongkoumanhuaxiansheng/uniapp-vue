import { token } from '../store/user.js'

// 请求基础配置
const baseConfig = {
	baseURL: 'https://your-api-domain.com/api', // 替换为实际的API域名
	timeout: 10000,
	header: {
		'Content-Type': 'application/json'
	}
}

// 请求拦截器
const request = (options) => {
	return new Promise((resolve, reject) => {
		// 添加token
		if (token.value) {
			options.header = {
				...options.header,
				'Authorization': `Bearer ${token.value}`
			}
		}
		
		// 添加基础配置
		const config = {
			...baseConfig,
			...options,
			header: {
				...baseConfig.header,
				...options.header
			}
		}
		
		// 发起请求
		uni.request({
			...config,
			success: (res) => {
				console.log('API请求成功:', res)
				
				// 处理响应
				if (res.statusCode === 200) {
					if (res.data.code === 0) {
						resolve(res.data)
					} else {
						// 业务错误
						uni.showToast({
							title: res.data.message || '请求失败',
							icon: 'none'
						})
						reject(res.data)
					}
				} else if (res.statusCode === 401) {
					// token过期，跳转登录
					uni.showToast({
						title: '登录已过期，请重新登录',
						icon: 'none'
					})
					// 清除用户信息并跳转登录
					uni.redirectTo({
						url: '/pages/login/login'
					})
					reject(res)
				} else {
					// 其他HTTP错误
					uni.showToast({
						title: `请求失败(${res.statusCode})`,
						icon: 'none'
					})
					reject(res)
				}
			},
			fail: (err) => {
				console.error('API请求失败:', err)
				uni.showToast({
					title: '网络请求失败',
					icon: 'none'
				})
				reject(err)
			}
		})
	})
}

// 封装常用请求方法
const api = {
	get: (url, data = {}) => {
		return request({
			url,
			method: 'GET',
			data
		})
	},
	
	post: (url, data = {}) => {
		return request({
			url,
			method: 'POST',
			data
		})
	},
	
	put: (url, data = {}) => {
		return request({
			url,
			method: 'PUT',
			data
		})
	},
	
	delete: (url, data = {}) => {
		return request({
			url,
			method: 'DELETE',
			data
		})
	}
}

export { request, api }
export default api