<template>
	<view class="admin-login-container">
		<view class="login-card">
			<text class="title">管理员登录</text>
			<text class="subtitle">请输入管理员账号密码</text>
			
			<!-- 用户名输入框 -->
			<view class="input-group">
				<text class="label">管理员账号</text>
				<input
					v-model="username"
					class="input"
					type="number"
					placeholder="请输入11位管理员账号"
					maxlength="11"
				/>
			</view>
			
			<!-- 密码输入框 -->
			<view class="input-group">
				<text class="label">密码</text>
				<input
					v-model="password"
					class="input"
					type="password"
					placeholder="请输入6位密码"
					maxlength="6"
				/>
			</view>
			
			<!-- 登录按钮 -->
			<button 
				class="login-btn" 
				:disabled="!canLogin"
				@click="adminLogin"
			>
				{{ loading ? '登录中...' : '登录' }}
			</button>
			
			<!-- 测试账号提示 -->
			<view class="test-accounts">
				<text class="hint-title">测试账号：</text>
				<text class="hint-item">13800138001 / 123456</text>
				<text class="hint-item">13800138002 / 888888</text>
				<text class="hint-item">13800138003 / 666666</text>
			</view>
		</view>
	</view>
</template>

<script>
import { ref, computed } from 'vue'

export default {
	setup() {
		// 响应式数据
		const username = ref('')
		const password = ref('')
		const loading = ref(false)
		
		// 测试账号配置（根据测试账号规范，修改为11位数字格式）
		const adminAccounts = {
			'13277826627': '123456', // 管理员账号（admin的数字替代）
			'13800138002': '888888', // 管理员账号（manager的数字替代）
			'13800138003': '666666'  // 管理员账号（root的数字替代）
		}
		
		// 计算属性：是否可以登录
		const canLogin = computed(() => {
			return username.value.trim().length > 0 && 
				   password.value.trim().length > 0 && 
				   !loading.value
		})
		
		// 管理员登录函数
		const adminLogin = async () => {
			if (!canLogin.value) return
			
			console.log('管理员尝试登录:', username.value)
			loading.value = true
			
			try {
				// 输入验证
				const inputUsername = username.value.trim()
				const inputPassword = password.value.trim()
				
				if (inputUsername.length !== 11) {
					throw new Error('管理员账号必须为11位数字')
				}
				
				if (!/^[0-9]+$/.test(inputUsername)) {
					throw new Error('管理员账号只能包含数字')
				}
				
				if (inputPassword.length !== 6) {
					throw new Error('密码必须为6位')
				}
				
				if (!/^[0-9]+$/.test(inputPassword)) {
					throw new Error('密码只能包含数字')
				}
				
				// 验证管理员账号（根据测试账号规范）
				const correctPassword = adminAccounts[inputUsername]
				
				if (!correctPassword || correctPassword !== inputPassword) {
					throw new Error('管理员账号或密码错误')
				}
				
				// 模拟登录延迟
				await new Promise(resolve => setTimeout(resolve, 1000))
				
				// 保存管理员登录状态到本地存储
				const adminInfo = {
					username: inputUsername,
					loginTime: new Date().getTime(),
					isAdmin: true
				}
				
				uni.setStorageSync('adminInfo', adminInfo)
				uni.setStorageSync('isAdminLoggedIn', true)
				
				console.log('管理员登录成功:', adminInfo)
				
				uni.showToast({
					title: '登录成功',
					icon: 'success'
				})
				
				// 发送状态更新事件给首页（可选）
				try {
					uni.$emit('adminStatusChanged')
				} catch (e) {
					// 忽略事件发送错误
				}
				
				// 跳转到订单管理页面
				setTimeout(() => {
					uni.redirectTo({
						url: '/pages/admin/order-list'
					})
				}, 1500)
				
			} catch (error) {
				console.error('管理员登录失败:', error)
				uni.showToast({
					title: error.message || '登录失败，请重试',
					icon: 'none',
					duration: 3000
				})
			} finally {
				loading.value = false
			}
		}
		
		// 页面加载时检查是否已登录
		const checkLoginStatus = () => {
			try {
				const isLoggedIn = uni.getStorageSync('isAdminLoggedIn')
				if (isLoggedIn) {
					console.log('管理员已登录，跳转到订单管理')
					uni.redirectTo({
						url: '/pages/admin/order-list'
					})
				}
			} catch (error) {
				console.log('检查登录状态失败:', error)
			}
		}
		
		// 页面显示时检查登录状态
		checkLoginStatus()
		
		return {
			username,
			password,
			loading,
			canLogin,
			adminLogin
		}
	}
}
</script>

<style scoped>
.admin-login-container {
	min-height: 100vh;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 40rpx;
}

.login-card {
	width: 100%;
	max-width: 600rpx;
	background: #fff;
	border-radius: 24rpx;
	padding: 60rpx 40rpx;
	box-shadow: 0 20rpx 40rpx rgba(0, 0, 0, 0.1);
}

.title {
	display: block;
	text-align: center;
	font-size: 48rpx;
	font-weight: bold;
	color: #333;
	margin-bottom: 16rpx;
}

.subtitle {
	display: block;
	text-align: center;
	font-size: 28rpx;
	color: #666;
	margin-bottom: 60rpx;
}

.input-group {
	margin-bottom: 40rpx;
}

.label {
	display: block;
	font-size: 28rpx;
	color: #333;
	margin-bottom: 16rpx;
	font-weight: 500;
}

.input {
	width: 100%;
	height: 88rpx;
	padding: 0 24rpx;
	border: 2rpx solid #e5e5e5;
	border-radius: 12rpx;
	font-size: 32rpx;
	background: #f8f8f8;
	box-sizing: border-box;
	transition: all 0.3s ease;
}

.input:focus {
	border-color: #007dff;
	background: #fff;
}

.login-btn {
	width: 100%;
	height: 88rpx;
	background: linear-gradient(90deg, #007dff 0%, #00c6ff 100%);
	color: #fff;
	border: none;
	border-radius: 12rpx;
	font-size: 32rpx;
	margin-top: 40rpx;
	cursor: pointer;
	transition: all 0.3s ease;
}

.login-btn:hover:not([disabled]) {
	background: linear-gradient(90deg, #0066cc 0%, #0099cc 100%);
	transform: translateY(-2rpx);
	box-shadow: 0 8rpx 16rpx rgba(0, 125, 255, 0.3);
}

.login-btn[disabled] {
	background: #e5e5e5;
	color: #aaa;
	cursor: not-allowed;
	transform: none;
	box-shadow: none;
}

.test-accounts {
	margin-top: 60rpx;
	padding: 30rpx;
	background: #f0f8ff;
	border-radius: 12rpx;
	border-left: 6rpx solid #007dff;
}

.hint-title {
	display: block;
	font-size: 28rpx;
	color: #333;
	font-weight: bold;
	margin-bottom: 16rpx;
}

.hint-item {
	display: block;
	font-size: 26rpx;
	color: #666;
	margin-bottom: 8rpx;
	font-family: 'Courier New', monospace;
}
</style>