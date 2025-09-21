<template>
	 <view class="admin-container">
	    <!-- 页面标题和筛选区 -->
	    <view class="header">
	      <view class="header-top">
	        <text class="title">订单管理后台</text>
	        <view class="admin-info" v-if="adminInfo">
	          <text class="admin-name">管理员: {{ adminInfo.username }}</text>
	          <button class="logout-btn" @click="adminLogout">退出</button>
	        </view>
	      </view>
	      <view class="filter-bar">
	        <text 
	          v-for="status in statusFilters" 
	          :key="status.value"
	          :class="['filter-item', activeFilter === status.value ? 'active' : '']"
	          @click="changeFilter(status.value)"
	        >
	          {{ status.label }}
	        </text>
	      </view>
	    </view>
	
	    <!-- 订单列表 -->
	    <view class="order-list">
	      <!-- 加载状态 -->
	      <view v-if="loading" class="loading">加载中...</view>
	      
	      <!-- 空状态 -->
	      <view v-else-if="filteredOrders.length === 0" class="empty">
	        暂无订单数据
	      </view>
	
	      <!-- 订单列表 -->
	      <view v-else>
	        <view 
	          v-for="order in filteredOrders" 
	          :key="order._id"
	          class="order-item"
	        >
	          <view class="order-header">
	            <text class="order-id">订单ID: {{ order._id }}</text>
	            <text :class="['status-badge', `status-${order.status}`]">
	              {{ getStatusText(order.status) }}
	            </text>
	          </view>
	          
	          <view class="order-content">
	            <text class="user-info">用户手机: {{ order.phone }}</text>
	            <text class="create-time">创建时间: {{ formatTime(order.createTime) }}</text>
	          </view>
	
	          <!-- 图片预览 (这里需要根据你的实际数据结构调整) -->
	          <view class="order-images" v-if="order.images && order.images.length > 0">
	            <image 
	              v-for="(img, index) in order.images.slice(0, 3)" 
	              :key="index"
	              :src="img"
	              class="thumb-image"
	              mode="aspectFill"
	              @click="previewImage(order.images, index)"
	            />
	            <text v-if="order.images.length > 3" class="more-images">
	              +{{ order.images.length - 3 }}更多
	            </text>
	          </view>
	
	          <view class="order-address">
	            <text class="address-text">收货地址: {{ order.address }}</text>
	          </view>
	
	          <!-- 审核操作按钮 (仅对待审核订单显示) -->
	          <view class="order-actions" v-if="order.status === 0">
	            <button class="btn approve" @click="approveOrder(order._id)">通过</button>
	            <button class="btn reject" @click="rejectOrder(order._id)">拒绝</button>
	          </view>
	        </view>
	      </view>
	    </view>
	  </view>
</template>

<script>
	import { ref, computed, onMounted } from 'vue'
	export default{
		setup() {
			//响应式数据
			const orderList = ref([])//从数据库获取的原始订单列表
			const loading = ref(false)//加载状态
			const activeFilter = ref('all')//当前激活的筛选状态
			const adminInfo = ref(null)//管理员信息
			
			// 检查管理员登录状态
			const checkAdminAuth = () => {
				try {
					const isLoggedIn = uni.getStorageSync('isAdminLoggedIn')
					const storedAdminInfo = uni.getStorageSync('adminInfo')
					
					console.log('检查管理员权限:', { isLoggedIn, storedAdminInfo })
					
					if (!isLoggedIn || !storedAdminInfo) {
						console.log('未登录或登录信息无效，跳转到登录页')
						uni.showModal({
							title: '权限验证',
							content: '您需要管理员权限才能访问此页面',
							showCancel: false,
							confirmText: '去登录',
							success: () => {
								uni.redirectTo({
									url: '/pages/admin/admin-login'
								})
							}
						})
						return false
					}
					
					// 检查登录时间是否过期（24小时）
					const loginTime = storedAdminInfo.loginTime
					const currentTime = new Date().getTime()
					const expireTime = 24 * 60 * 60 * 1000 // 24小时
					
					if (currentTime - loginTime > expireTime) {
						console.log('登录已过期，清除登录状态')
						uni.removeStorageSync('isAdminLoggedIn')
						uni.removeStorageSync('adminInfo')
						uni.showModal({
							title: '登录过期',
							content: '登录已过期，请重新登录',
							showCancel: false,
							confirmText: '重新登录',
							success: () => {
								uni.redirectTo({
									url: '/pages/admin/admin-login'
								})
							}
						})
						return false
					}
					
					adminInfo.value = storedAdminInfo
					console.log('管理员权限验证通过:', adminInfo.value)
					return true
					
				} catch (error) {
					console.error('权限验证失败:', error)
					uni.redirectTo({
						url: '/pages/admin/admin-login'
					})
					return false
				}
			}
			
			// 管理员退出登录
			const adminLogout = () => {
				uni.showModal({
					title: '确认退出',
					content: '确定要退出管理员登录吗？',
					success: (res) => {
						if (res.confirm) {
							console.log('管理员退出登录')
							uni.removeStorageSync('isAdminLoggedIn')
							uni.removeStorageSync('adminInfo')
							uni.showToast({
								title: '已退出登录',
								icon: 'success'
							})
							setTimeout(() => {
								uni.redirectTo({
									url: '/pages/admin/admin-login'
								})
							}, 1500)
						}
					}
				})
			}
			//筛选选项
			const statusFilters = ref([
				{value:'all',label:'全部'},
				{value:'0',label:'待审核'},
				{value:'1',label:'已通过'},
				{value:'2',label:'已拒绝'}
			])
			//计算属性:根据筛选条件过滤订单
			const filteredOrders = computed(()=>{
				if (activeFilter.value === 'all'){
					return orderList.value
				}
				return orderList.value.filter(order=>order.status.toString()===activeFilter.value)
			})
			//核心函数,从云数据库获取订单列表
			const getOrderList = async()=>{
				loading.value = true
				console.log('开始从云数据库获取订单列表...')
				try {
					//获取数据库引用
					const db = wx.cloud.database()
					//查询"orders"集合中所有记录,并按创建时间降序排列
					const res = await db.collection('orders').orderBy('createTime','desc').get()
					console.log('从云数据库获取订单成功:',res.data)
					orderList.value = res.data//将数据存入响应式变量
				}catch(err){
					console.error('获取订单列表失败:',err)
					uni.showToast({
						title:'获取数据失败',
						icon:'none'
					})
				}finally{
					loading.value=false
				}
			}
			//审核订单(通过)
			const approveOrder = async (orderId)=>{
				await updateOrderStatus(orderId,1,'通过')
			}
			//审核订单(拒绝)
			const rejectOrder = async (orderId)=>{
				await updateOrderStatus(orderId,2,'拒绝')
			}
			//更新订单状态的通用函数
			const updateOrderStatus=async (orderId,newStatus,actionName)=>{  
				try {
					console.log(`开始${actionName}订单:`, orderId)
					uni.showLoading({title:'操作中...'})
					
					// #ifdef MP-WEIXIN
					const db = wx.cloud.database()
					// #endif
					
					// #ifndef MP-WEIXIN  
					// 其他平台的数据库操作需要根据实际情况调整
					uni.showToast({
						title:'当前平台不支持云数据库',
						icon:'none'
					})
					return
					// #endif
					
					//更新订单状态
					await db.collection('orders').doc(orderId).update({
						data:{
							status:newStatus,
							reviewTime:new Date()//记录审核时间
						}
					})
					
					uni.hideLoading()
					console.log(`${actionName}订单成功:`, orderId)
					uni.showToast({
						title:`${actionName}成功`,
						icon:'success'
					})
					
					//重新获取订单列表,更新UI
					await getOrderList()
				} catch (err) {
					uni.hideLoading()
					console.error('更新订单状态失败:',err)
					
					// 根据错误类型提供具体的错误信息
					let errorTitle = `${actionName}失败`;
					let errorContent = '请稍后重试';
					let showModal = false;
					
					if (err.errCode === -502003 || err.message && err.message.includes('permission denied')) {
						errorTitle = '权限不足';
						errorContent = '管理员操作需要数据库写权限\n\n解决方案：\n1. 在微信开发者工具中点击“云开发”\n2. 点击“数据库”\n3. 选择“orders”集合\n4. 点击“权限设置”\n5. 设置为：所有用户可读，所有用户可写';
						showModal = true;
					} else if (err.message && err.message.includes('网络')) {
						errorContent = '网络连接失败，请检查网络后重试';
					} else if (err.errCode === -502005) {
						errorContent = '数据库集合不存在，请检查orders集合是否已创建';
					}
					
					if (showModal) {
						uni.showModal({
							title: errorTitle,
							content: errorContent,
							showCancel: false,
							confirmText: '我知道了'
						});
					} else {
						uni.showToast({
							title: `${actionName}失败，${errorContent}`,
							icon:'none'
						});
					}
				}
			}
			//更改筛选条件
			const changeFilter = (filterValue) => {
				activeFilter.value=filterValue
			}
			//获取状态文本
			const getStatusText = (status)=>{
				const statusMap = {0:'待审核',1:'已通过',2:'已拒绝'}
				return statusMap[status] || '未知状态'
			}
			//格式化时间
			const formatTime = (timestamp)=>{
				if (!timestamp) return '未知时间'
				const date = new Date(timestamp)
				return `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2,'0')}-${date.getDate().toString().padStart(2,'0')} ${date.getHours().toString().padStart(2,'0')}:${date.getMinutes().toString().padStart(2,'0')}`
			}
			//图片预览
			const previewImage = (urls,currentIndex)=>{
				uni.previewImage({
					urls:urls,
					current:urls[currentIndex]
				})
			}
			//页面加载时自动获取订单
			onMounted(()=>{
				// 先验证管理员权限，再获取订单列表
				if (checkAdminAuth()) {
					getOrderList()
				}
			})
			return{
				orderList,
				loading,
				activeFilter,
				statusFilters,
				filteredOrders,
				adminInfo,
				getOrderList,
				approveOrder,
				rejectOrder,
				changeFilter,
				getStatusText,
				formatTime,
				previewImage,
				adminLogout
			}
		}
	}
</script>

<style scoped>
	.admin-container {
	  padding: 20rpx;
	  background: #f5f5f5;
	  min-height: 100vh;
	}
	
	.header {
	  background: #fff;
	  padding: 30rpx;
	  border-radius: 12rpx;
	  margin-bottom: 20rpx;
	  box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.1);
	}
	
	.title {
	  font-size: 36rpx;
	  font-weight: bold;
	  color: #333;
	}
	
	.header-top {
	  display: flex;
	  justify-content: space-between;
	  align-items: center;
	  margin-bottom: 30rpx;
	}
	
	.admin-info {
	  display: flex;
	  align-items: center;
	  gap: 20rpx;
	}
	
	.admin-name {
	  font-size: 26rpx;
	  color: #666;
	  margin-right: 20rpx;
	}
	
	.logout-btn {
	  padding: 12rpx 24rpx;
	  background: #ff4444;
	  color: #fff;
	  border: none;
	  border-radius: 8rpx;
	  font-size: 24rpx;
	  cursor: pointer;
	  transition: all 0.3s ease;
	}
	
	.logout-btn:hover {
	  background: #cc3333;
	  transform: translateY(-1rpx);
	}
	
	.filter-bar {
	  display: flex;
	  justify-content: space-around;
	  flex-wrap: wrap;
	}
	
	.filter-item {
	  padding: 16rpx 32rpx;
	  border-radius: 40rpx;
	  background: #f0f0f0;
	  color: #666;
	  font-size: 26rpx;
	  margin: 5rpx;
	  cursor: pointer;
	  transition: all 0.3s ease;
	}
	
	.filter-item:hover {
	  background: #e0e0e0;
	}
	
	.filter-item.active {
	  background: #007dff;
	  color: #fff;
	}
	
	.filter-item.active:hover {
	  background: #0066cc;
	}
	
	.order-list {
	  margin-bottom: 40rpx;
	}
	
	.loading, .empty {
	  text-align: center;
	  padding: 100rpx 0;
	  color: #999;
	  font-size: 28rpx;
	}
	
	.order-item {
	  background: #fff;
	  padding: 30rpx;
	  border-radius: 12rpx;
	  margin-bottom: 20rpx;
	  box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.1);
	}
	
	.order-header {
	  display: flex;
	  justify-content: space-between;
	  align-items: center;
	  margin-bottom: 20rpx;
	  padding-bottom: 20rpx;
	  border-bottom: 1rpx solid #eee;
	}
	
	.order-id {
	  font-size: 28rpx;
	  color: #666;
	}
	
	.status-badge {
	  font-size: 24rpx;
	  padding: 8rpx 16rpx;
	  border-radius: 20rpx;
	}
	
	.status-0 { background: #fff4e5; color: #ff9500; }
	.status-1 { background: #e6f7e6; color: #00c853; }
	.status-2 { background: #ffecec; color: #ff4444; }
	
	.order-content {
	  margin-bottom: 20rpx;
	}
	
	.user-info, .create-time {
	  display: block;
	  font-size: 26rpx;
	  color: #666;
	  margin-bottom: 10rpx;
	}
	
	.order-images {
	  display: flex;
	  flex-wrap: wrap;
	  margin-bottom: 20rpx;
	}
	
	.thumb-image,
	.more-images {
	  margin-right: 10rpx;
	  margin-bottom: 10rpx;
	}
	
	.thumb-image {
	  width: 120rpx;
	  height: 120rpx;
	  border-radius: 8rpx;
	}
	
	.more-images {
	  width: 120rpx;
	  height: 120rpx;
	  background: #f0f0f0;
	  border-radius: 8rpx;
	  display: flex;
	  align-items: center;
	  justify-content: center;
	  color: #999;
	  font-size: 24rpx;
	}
	
	.order-address {
	  margin-bottom: 20rpx;
	  padding: 20rpx;
	  background: #f9f9f9;
	  border-radius: 8rpx;
	}
	
	.address-text {
	  font-size: 28rpx;
	  color: #333;
	}
	
	.order-actions {
	  display: flex;
	  justify-content: flex-end;
	  gap: 20rpx;
	  margin-top: 20rpx;
	  padding-top: 20rpx;
	  border-top: 1rpx solid #eee;
	}
	
	.btn {
	  padding: 16rpx 32rpx;
	  border-radius: 8rpx;
	  font-size: 26rpx;
	  border: none;
	  cursor: pointer;
	  transition: all 0.3s ease;
	}
	
	.approve {
	  background: #00c853;
	  color: #fff;
	}
	
	.approve:hover {
	  background: #00a94a;
	  transform: translateY(-1rpx);
	}
	
	.reject {
	  background: #ff4444;
	  color: #fff;
	}
	
	.reject:hover {
	  background: #cc3333;
	  transform: translateY(-1rpx);
	}
</style>