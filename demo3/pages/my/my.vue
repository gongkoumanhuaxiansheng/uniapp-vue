<template>
	<view class="my-container">
		<!-- 用户信息区域 -->
		<view class="user-info">
			<image class="avatar" src="/static/default-avatar.png" @error="onAvatarError"></image>
			<view class="user-details">
				<text class="username">用户名</text>
				<text class="user-desc">欢迎使用本应用</text>
			</view>
		</view>
		
		<!-- 功能列表 -->
		<view class="menu-list">
			<view class="menu-item" @click="goToOrderCreate">
				<text class="menu-title">我的订单</text>
				<text class="menu-arrow">></text>
			</view>
			<view class="menu-item" @click="goToLogin">
				<text class="menu-title">设置</text>
				<text class="menu-arrow">></text>
			</view>
			<view class="menu-item" @click="logout">
				<text class="menu-title">退出登录</text>
				<text class="menu-arrow">></text>
			</view>
		</view>
	</view>
</template>

<script>
import { ref } from 'vue'

export default {
	setup() {
		// 响应式数据
		const userInfo = ref({
			username: '用户名',
			avatar: '/static/default-avatar.png'
		})
		
		// 头像加载错误处理
		const onAvatarError = () => {
			console.log('头像加载失败')
		}
		
		// 跳转到订单页面
		const goToOrderCreate = () => {
			uni.navigateTo({
				url: '/pages/order-create/order-create'
			})
		}
		
		// 跳转到登录页面
		const goToLogin = () => {
			uni.navigateTo({
				url: '/pages/login/login'
			})
		}
		
		// 退出登录
		const logout = () => {
			uni.showModal({
				title: '提示',
				content: '确定要退出登录吗？',
				success: (res) => {
					if (res.confirm) {
						uni.showToast({
							title: '已退出登录',
							icon: 'success'
						})
						// 跳转到登录页
						setTimeout(() => {
							uni.navigateTo({
								url: '/pages/login/login'
							})
						}, 1500)
					}
				}
			})
		}
		
		return {
			userInfo,
			onAvatarError,
			goToOrderCreate,
			goToLogin,
			logout
		}
	}
}
</script>

<style scoped>
.my-container {
	padding: 40rpx;
	background: #f5f5f5;
	min-height: 100vh;
}

.user-info {
	display: flex;
	align-items: center;
	padding: 40rpx;
	background: #fff;
	border-radius: 12rpx;
	margin-bottom: 30rpx;
	box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.1);
}

.avatar {
	width: 120rpx;
	height: 120rpx;
	border-radius: 60rpx;
	margin-right: 30rpx;
	background: #f0f0f0;
}

.user-details {
	flex: 1;
}

.username {
	display: block;
	font-size: 32rpx;
	font-weight: bold;
	color: #333;
	margin-bottom: 10rpx;
}

.user-desc {
	display: block;
	font-size: 26rpx;
	color: #999;
}

.menu-list {
	background: #fff;
	border-radius: 12rpx;
	box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.1);
}

.menu-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 30rpx 40rpx;
	border-bottom: 1rpx solid #f0f0f0;
	transition: background-color 0.2s;
}

.menu-item:last-child {
	border-bottom: none;
}

.menu-item:hover {
	background: #f8f8f8;
}

.menu-title {
	font-size: 30rpx;
	color: #333;
}

.menu-arrow {
	font-size: 24rpx;
	color: #999;
}
</style>