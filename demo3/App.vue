<script>
export default {
	onLaunch: function() {
		console.log('App Launch - 应用启动')
		
		// #ifdef MP-WEIXIN
		// 微信小程序云开发初始化
		try {
			console.log('开始初始化微信云开发...')
			
			// 检查wx.cloud是否存在
			if (!wx.cloud) {
				console.error('wx.cloud不存在，请检查微信开发者工具设置')
				uni.showToast({
					title: '请在微信开发者工具中打开',
					icon: 'none',
					duration: 3000
				})
				return
			}
			
			// 配置云环境ID（请替换为你的实际云环境ID）
			// 可以在微信开发者工具 → 云开发 → 设置 中查看环境ID
			// 格式通常为：cloud1-xxxxxxxxxxxxxxxx
			const cloudEnv = 'your-cloud-env-id' // 请替换为你的实际云环境ID
			
			// 验证云环境ID格式
			if (!cloudEnv || cloudEnv === 'your-cloud-env-id' || cloudEnv.length < 10) {
				console.error('无效的云环境ID:', cloudEnv)
				uni.showModal({
					title: '配置错误',
					content: '请在App.vue中配置正确的云环境ID\n\n获取方式：微信开发者工具 → 云开发 → 设置',
					showCancel: false
				})
				return
			}
			
			wx.cloud.init({
				env: cloudEnv,
				traceUser: true
			})
			
			console.log('wx.cloud初始化完成', {
				cloudEnv: cloudEnv,
				wxCloud: wx.cloud
			})
			
			// 验证初始化是否成功
			setTimeout(() => {
				try {
					const db = wx.cloud.database()
					console.log('云数据库连接验证成功:', db)
				} catch (dbError) {
					console.error('云数据库连接验证失败:', dbError)
				}
			}, 1000)
			
		} catch (error) {
			console.error('云开发初始化失败:', error)
			
			// 根据错误类型提供具体的错误信息
			let errorTitle = '云服务初始化失败'
			let errorContent = '请检查网络连接后重试'
			
			if (error.errCode === -501000 || error.message.includes('env check invalid')) {
				errorTitle = '云环境配置错误'
				errorContent = '云环境ID无效或不存在\n\n请在微信开发者工具中：\n1. 点击“云开发”\n2. 创建或查看环境ID\n3. 替换App.vue中的云环境ID'
			} else if (error.message && error.message.includes('网络')) {
				errorContent = '网络连接失败，请检查网络后重试'
			} else if (error.message && error.message.includes('permission')) {
				errorContent = '权限不足，请检查云开发控制台设置'
			}
			
			// 显示用户友好的错误提示
			uni.showModal({
				title: errorTitle,
				content: errorContent,
				showCancel: false,
				confirmText: '我知道了'
			})
		}
		// #endif
		
		// #ifndef MP-WEIXIN
		console.log('当前平台不支持云开发')
		// #endif
	},
	onShow: function() {
		console.log('App Show - 应用显示')
	},
	onHide: function() {
		console.log('App Hide - 应用隐藏')
	}
}
</script>

<style>
	/*每个页面公共css */
</style>
