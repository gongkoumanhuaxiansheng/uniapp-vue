<template>
	<view class="content">
		<image class="logo" src="/static/logo.png" @error="onImageError"></image>
		<view class="text-area">
			<text class="title">{{title}}</text>
		</view>
		
		<!-- 快捷操作按钮 -->
		<view class="action-buttons">
			<button class="action-btn primary" @click="goToCreateOrder">
				创建订单
			</button>
			
			<!-- 管理员相关按钮：根据登录状态动态显示 -->
			<template v-if="!isAdminLoggedIn">
				<button class="action-btn admin-login" @click="goToAdminLogin">
					管理员登录
				</button>
			</template>
			
			<template v-else>
				<button class="action-btn secondary" @click="goToAdmin">
					管理后台
				</button>
				<button class="action-btn logout" @click="adminLogout">
					退出管理
				</button>
			</template>
		</view>
	</view>
</template>

<script>
import { ref, onMounted } from 'vue'

export default {
	setup() {
		// 使用Vue3 Composition API
		const title = ref('欢迎使用uni-app')
		const isAdminLoggedIn = ref(false)
		
		// 检查管理员登录状态
		const checkAdminStatus = () => {
			try {
				const adminLoginStatus = uni.getStorageSync('isAdminLoggedIn')
				const adminInfo = uni.getStorageSync('adminInfo')
				isAdminLoggedIn.value = adminLoginStatus && adminInfo
				console.log('管理员登录状态:', isAdminLoggedIn.value)
			} catch (error) {
				console.error('检查管理员状态失败:', error)
				isAdminLoggedIn.value = false
			}
		}
		
		// 页面加载时的操作
		onMounted(() => {
			console.log('首页加载完成')
			checkAdminStatus()
		})
		
		// 跳转到创建订单页面（TabBar页面，使用switchTab）
		const goToCreateOrder = () => {
			try {
				uni.switchTab({
					url: '/pages/order-create/order-create'
				})
			} catch (error) {
				console.error('跳转到创建订单页面失败:', error)
				uni.showToast({
					title: '页面跳转失败',
					icon: 'none'
				})
			}
		}
		
		// 管理员登录按钮
		const goToAdminLogin = () => {
			try {
				uni.navigateTo({
					url: '/pages/admin/admin-login'
				})
			} catch (error) {
				console.error('跳转到管理员登录失败:', error)
				uni.showToast({
					title: '页面跳转失败',
					icon: 'none'
				})
			}
		}
		
		// 跳转到管理后台（已登录管理员）
		const goToAdmin = () => {
			try {
				if (isAdminLoggedIn.value) {
					uni.navigateTo({
						url: '/pages/admin/order-list'
					})
				} else {
					// 未登录则跳转到登录页
					uni.navigateTo({
						url: '/pages/admin/admin-login'
					})
				}
			} catch (error) {
				console.error('跳转到管理后台失败:', error)
				uni.showToast({
					title: '页面跳转失败',
					icon: 'none'
				})
			}
		}
		
		// 管理员退出登录
		const adminLogout = () => {
			uni.showModal({
				title: '确认退出',
				content: '确定要退出管理员账户吗？',
				success: (res) => {
					if (res.confirm) {
						try {
							uni.removeStorageSync('isAdminLoggedIn')
							uni.removeStorageSync('adminInfo')
							isAdminLoggedIn.value = false
							uni.showToast({
								title: '已退出管理员账户',
								icon: 'success'
							})
						} catch (error) {
							console.error('退出登录失败:', error)
							uni.showToast({
								title: '退出失败，请重试',
								icon: 'none'
							})
						}
					}
				}
			})
		}
		
		// 图片加载错误处理
		const onImageError = () => {
			console.log('Logo图片加载失败')
			uni.showToast({
				title: '图片加载失败',
				icon: 'none',
				duration: 2000
			})
		}
		
		return {
			title,
			isAdminLoggedIn,
			goToCreateOrder,
			goToAdminLogin,
			goToAdmin,
			adminLogout,
			onImageError
		}
	},
	
	// uni-app页面生命周期
	onShow() {
		// 页面显示时检查管理员状态
		this.checkAdminStatus && this.checkAdminStatus()
		console.log('首页显示')
	}
}
</script>

<style>
	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.logo {
		height: 200rpx;
		width: 200rpx;
		margin-top: 200rpx;
		margin-left: auto;
		margin-right: auto;
		margin-bottom: 50rpx;
	}

	.text-area {
		display: flex;
		justify-content: center;
	}

	.title {
		font-size: 36rpx;
		color: #8f8f94;
	}
	
	.action-buttons {
		margin-top: 80rpx;
		display: flex;
		flex-direction: column;
		width: 600rpx;
	}
	
	.action-btn {
		width: 100%;
		height: 88rpx;
		border: none;
		border-radius: 12rpx;
		font-size: 32rpx;
		margin-bottom: 30rpx;
		cursor: pointer;
		transition: all 0.3s ease;
	}
	
	.primary {
		background: linear-gradient(90deg, #007dff 0%, #00c6ff 100%);
		color: #fff;
	}
	
	.primary:hover {
		background: linear-gradient(90deg, #0066cc 0%, #0099cc 100%);
		transform: translateY(-2rpx);
		box-shadow: 0 8rpx 16rpx rgba(0, 125, 255, 0.3);
	}
	
	.secondary {
		background: #fff;
		color: #007dff;
		border: 2rpx solid #007dff;
	}
	
	.secondary:hover {
		background: #f0f8ff;
		transform: translateY(-2rpx);
		box-shadow: 0 8rpx 16rpx rgba(0, 125, 255, 0.2);
	}
	
	.admin-login {
		background: linear-gradient(90deg, #ff9500 0%, #ff6b00 100%);
		color: #fff;
	}
	
	.admin-login:hover {
		background: linear-gradient(90deg, #e6850e 0%, #e65a00 100%);
		transform: translateY(-2rpx);
		box-shadow: 0 8rpx 16rpx rgba(255, 149, 0, 0.3);
	}
	
	.logout {
		background: #fff;
		color: #ff4757;
		border: 2rpx solid #ff4757;
	}
	
	.logout:hover {
		background: #fff5f5;
		transform: translateY(-2rpx);
		box-shadow: 0 8rpx 16rpx rgba(255, 71, 87, 0.2);
	}
</style>
