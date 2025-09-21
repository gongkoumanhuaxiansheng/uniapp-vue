import { ref, computed } from 'vue'

// 用户状态管理
const userInfo = ref({
	id: '',
	phone: '',
	avatar: '',
	nickname: '用户',
	isLogin: false
})

const token = ref('')

// 计算属性
const isLoggedIn = computed(() => {
	return userInfo.value.isLogin && token.value
})

// 登录
const login = (phone, userToken) => {
	userInfo.value.phone = phone
	userInfo.value.isLogin = true
	token.value = userToken
	
	// 保存到本地存储
	uni.setStorageSync('userInfo', userInfo.value)
	uni.setStorageSync('token', userToken)
}

// 退出登录
const logout = () => {
	userInfo.value = {
		id: '',
		phone: '',
		avatar: '',
		nickname: '用户',
		isLogin: false
	}
	token.value = ''
	
	// 清除本地存储
	uni.removeStorageSync('userInfo')
	uni.removeStorageSync('token')
}

// 初始化用户信息（从本地存储恢复）
const initUserInfo = () => {
	try {
		const storedUserInfo = uni.getStorageSync('userInfo')
		const storedToken = uni.getStorageSync('token')
		
		if (storedUserInfo && storedToken) {
			userInfo.value = storedUserInfo
			token.value = storedToken
		}
	} catch (error) {
		console.error('初始化用户信息失败:', error)
	}
}

export {
	userInfo,
	token,
	isLoggedIn,
	login,
	logout,
	initUserInfo
}