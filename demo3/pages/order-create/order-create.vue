<template>
	<view class="order-create-container">
		<text class="title">创建订单</text>
		<!-- 图片上传区域 -->
		<view class="upload-section">
			<text class="section-title">上传照片(最多4张)</text>
			<view class="image-list">
				<view v-for="(image,index) in imageList"
				:key="'image-' + index"
				class="image-item"
				>
				<image :src="image" class="preview-image" mode="aspectFill"></image>
				<text class="delete-btn" @click="deleteImage(index)">x</text>
				</view>
				<view v-if="imageList.length<4"
				class="upload-btn"
				@click="chooseImage"
				>
				<text class="plus-icon">+</text>
					<text class="upload-text">添加图片</text>
				</view>
			</view>
		</view>
		<!-- 地址填写区域 -->
		<view class="address-section">
			<text class="section-title">收货地址</text>
			<textarea
			v-model="address"
			class="address-input"
			placeholder="请填写详细地址"
			maxlength="200"
			auto-height
			/>
		</view>
		<button class="submit-btn" :disabled="!canSubmit" @click="submitOrder">
			生成订单
		</button>
	</view>
</template>

<script>
	import {ref , computed} from 'vue'
	
	export default{
		setup() {
			//响应式数据:使用ref创建响应式引用，这是vue3Composition API的核心特性
			const imageList = ref([])//存储用户选择的图片临时路径数组
			const address = ref('')//存储用户输入的地址信息
			//计算属性:基于响应式数据自动计算是否满足提交条件[4]
			const canSubmit = computed(()=>{
				return imageList.value.length > 0 && address.value.trim().length > 0
			})
			// 选择图片函数:调用uni.chooseImage API让用户从相册或相机选择图片
			// 具体实现操作有:
			// 1.计算当前还能选择的图片数量(最多4张)
			// 2.调用uni.chooseImage打开设备相册或相机界面
			// 3.处理用户选择结果,将新图片添加到现有列表中
			// 4.处理可能出现的错误情况,给予用户提示
			const chooseImage=()=>{
				try {
					console.log('开始选择图片，当前图片数量:', imageList.value.length)
					//计算还能选择的图片数量(最大限制为4张)
					const maxCount = 4 - imageList.value.length
					
					if (maxCount <= 0) {
						uni.showToast({
							title:'最多只能上传4张图片',
							icon:'none'
						})
						return
					}
					
					//调用uni.chooseImage 选择图片
					uni.chooseImage({
						count:maxCount,//本次最多能选择图片数量
						sizeType:['compressed'],//选择压缩图，节省存储空间和上传流量
						sourceType:['album','camera'],//允许从相册和相机两种图片来源选择
						success: (res) => {
							console.log('图片选择成功:', res.tempFilePaths)
							//成功回调:将新选择的图片路径合并到现有列表中
							//使用展开运算符创建新数组，确保响应式更新
							imageList.value = [...imageList.value,...res.tempFilePaths]
							//显示成功提示
							uni.showToast({
								title:`已添加${res.tempFilePaths.length}张图片`,
								icon:'success'
							})
						},
						fail:(err)=>{  
							//失败回调,输出错误日志并提示用户
							console.error('选择图片失败:',err)
							uni.showToast({
								title:'选择图片失败,请重试',
								icon:'none'
							})
						}
					})
				} catch (error) {
					console.error('chooseImage function error:', error)
					uni.showToast({
						title:'操作失败,请重试',
						icon:'none'
					})
				}
			}
			//删除指定索引的图片
			const deleteImage = (index) => {
				imageList.value.splice(index,1)
			}
			//提交订单函数
			const submitOrder = async () => {
				if (!canSubmit.value) return;
				console.log('开始提交订单，图片数量:', imageList.value.length, '地址:', address.value)
				
				uni.showLoading({title:'上传图片并生成订单中...'})
				try {
					// #ifdef MP-WEIXIN
					// 确保在微信小程序环境中
					if (typeof wx === 'undefined') {
						throw new Error('微信小程序环境未准备就绪')
					}
					
					// 检查云开发是否已初始化
					if (!wx.cloud) {
						throw new Error('云开发未初始化，请检查微信开发者工具设置')
					}
					
					// 尝试获取数据库实例来验证初始化状态
					try {
						const testDb = wx.cloud.database()
						if (!testDb) {
							throw new Error('云数据库未准备就绪')
						}
						console.log('云开发状态验证成功')
					} catch (initError) {
						throw new Error('云开发尚未完成初始化，请稍后重试: ' + initError.message)
					}
					
					console.log('开始上传图片到云存储...')
					//上传图片到云存储
					const uploadTasks = imageList.value.map((filePath,index)=>{
						//为每张图片生成一个云端路径,使用时间戳避免重名
						const cloudPath = `order_images/${Date.now()}_${index}.jpg`;
						console.log(`准备上传第${index + 1}张图片:`, filePath, '-> ', cloudPath)
						return wx.cloud.uploadFile({
							cloudPath,
							filePath
						});
					});
					
					//等待所有图片上传完成
					const uploadResults = await Promise.all(uploadTasks);
					console.log('所有图片上传完成:', uploadResults)
					
					//从上传结果中提取出云文件ID(FileID)数据
					const cloudFileIDs = uploadResults.map(res => res.fileID);
					console.log('图片上传成功,FileID列表:',cloudFileIDs)
					
					//获取数据库引用
					const db = wx.cloud.database();
					console.log('准备保存订单到数据库...')
					
					// 检查orders集合是否存在，如果不存在则先创建
					try {
						// 尝试查询集合以验证存在性
						await db.collection('orders').limit(1).get()
						console.log('orders集合已存在')
					} catch (collectionError) {
						if (collectionError.errCode === -502005) {
							console.log('orders集合不存在，尝试创建...')
							// 在微信小程序中，无法通过代码创建集合，需要手动创建
							throw new Error('数据库集合不存在')
						} else {
							throw collectionError
						}
					}
					
					//将订单数据(包含图片FileID)存入云数据库
					const res = await db.collection('orders').add({
						data:{
							address:address.value,//用户地址
							images:cloudFileIDs,//云存储图片FileID数组
							status:0,//订单状态(0待审核,1已通过,2已拒绝)
							createTime:new Date(),//订单创建时间
						}
					});
					
					uni.hideLoading();
					console.log('订单创建成功,数据库记录ID为:',res._id);
					
					// 显示成功提示并询问用户后续操作
					uni.showModal({
						title: '订单提交成功',
						content: '订单已提交，等待管理员审核\n\n您可以查看管理后台进行审核操作',
						confirmText: '查看后台',
						cancelText: '返回首页',
						success: (modalRes) => {
							if (modalRes.confirm) {
								// 用户选择查看后台
								console.log('跳转到管理后台')
								uni.navigateTo({
									url: '/pages/admin/order-list'
								})
							} else {
								// 用户选择返回首页或取消
								const pages = getCurrentPages()
								if (pages.length > 1) {
									console.log('返回上一页')
									uni.navigateBack()
								} else {
									console.log('跳转到首页')
									uni.switchTab({
										url: '/pages/index/index'
									})
								}
							}
						}
					});
					// #endif
					
					// #ifndef MP-WEIXIN
					// 非微信小程序环境的处理
					uni.hideLoading();
					console.warn('当前平台不支持云开发功能')
					uni.showToast({
						title:'当前平台不支持此功能',
						icon:'none'
					});
					// #endif
					
				} catch(err) {
					console.error('提交订单失败:',err);
					uni.hideLoading();
					
					// 根据错误类型提供更具体的错误信息
					let errorMessage = '订单提交失败,请重试';
					let showModal = false;
					let modalContent = '';
					
					if (err.errCode === -502005 || err.message && err.message.includes('数据库集合不存在')) {
						errorMessage = '数据库集合未创建';
						showModal = true;
						modalContent = '需要先创建“orders”数据库集合\n\n操作步骤：\n1. 在微信开发者工具中点击“云开发”\n2. 点击“数据库”\n3. 点击“+”创建集合\n4. 集合名称输入：orders';
					} else if (err.message && err.message.includes('网络')) {
						errorMessage = '网络连接失败,请检查网络后重试';
					} else if (err.message && err.message.includes('云存储')) {
						errorMessage = '图片上传失败,请重新选择图片';
					} else if (err.message && err.message.includes('数据库')) {
						errorMessage = '数据保存失败,请稍后重试';
					}
					
					if (showModal) {
						uni.showModal({
							title: errorMessage,
							content: modalContent,
							showCancel: false,
							confirmText: '我知道了'
						});
					} else {
						uni.showToast({
							title: errorMessage,
							icon:'none'
						});
					}
				}
			};
			//返回所有需要在模板中使用的变量和函数
			return{
				imageList,
				address,
				canSubmit,
				chooseImage,
				deleteImage,
				submitOrder
			}
		}
	}
</script>

<style scoped>
	.order-create-container {
	  padding: 40rpx;
	  background: #fff;
	  min-height: 100vh;
	}
	
	.title {
	  display: block;
	  text-align: center;
	  font-size: 40rpx;
	  font-weight: bold;
	  margin-bottom: 40rpx;
	  color: #333;
	}
	
	.section-title {
	  display: block;
	  font-size: 32rpx;
	  font-weight: 600;
	  margin-bottom: 24rpx;
	  color: #333;
	}
	
	/* 图片上传区域 */
	.upload-section {
	  margin-bottom: 40rpx;
	}
	
	.image-list {
	  display: flex;
	  flex-wrap: wrap;
	}
	
	.image-item,
	.upload-btn {
	  margin-right: 20rpx;
	  margin-bottom: 20rpx;
	}
	
	.image-item {
	  position: relative;
	  width: 160rpx;
	  height: 160rpx;
	  border-radius: 12rpx;
	  overflow: hidden;
	  background: #f8f8f8;
	}
	
	.preview-image {
	  width: 100%;
	  height: 100%;
	}
	
	.delete-btn {
	  position: absolute;
	  top: 8rpx;
	  right: 8rpx;
	  width: 36rpx;
	  height: 36rpx;
	  background: rgba(0, 0, 0, 0.6);
	  color: #fff;
	  border-radius: 50%;
	  text-align: center;
	  line-height: 36rpx;
	  font-size: 24rpx;
	  cursor: pointer;
	}
	
	.delete-btn:hover {
	  background: rgba(255, 0, 0, 0.8);
	}
	
	.upload-btn {
	  width: 160rpx;
	  height: 160rpx;
	  border: 2rpx dashed #e5e5e5;
	  border-radius: 12rpx;
	  display: flex;
	  flex-direction: column;
	  align-items: center;
	  justify-content: center;
	  background: #f8f8f8;
	  cursor: pointer;
	}
	
	.upload-btn:hover {
	  border-color: #007dff;
	  background: #f0f8ff;
	}
	
	.plus-icon {
	  font-size: 48rpx;
	  color: #999;
	  margin-bottom: 8rpx;
	}
	
	.upload-text {
	  font-size: 24rpx;
	  color: #999;
	}
	
	/* 地址填写区域 */
	.address-section {
	  margin-bottom: 60rpx;
	}
	
	.address-input {
	  width: 100%;
	  min-height: 200rpx;
	  padding: 24rpx;
	  border: 1rpx solid #e5e5e5;
	  border-radius: 12rpx;
	  background: #f8f8f8;
	  font-size: 28rpx;
	  box-sizing: border-box;
	}
	
	/* 提交按钮 */
	.submit-btn {
	  width: 100%;
	  height: 88rpx;
	  background: linear-gradient(90deg, #007dff 0%, #00c6ff 100%);
	  color: #fff;
	  border: none;
	  border-radius: 12rpx;
	  font-size: 32rpx;
	  cursor: pointer;
	  transition: all 0.3s ease;
	}
	
	.submit-btn:hover:not([disabled]) {
	  background: linear-gradient(90deg, #0066cc 0%, #0099cc 100%);
	  transform: translateY(-2rpx);
	  box-shadow: 0 8rpx 16rpx rgba(0, 125, 255, 0.3);
	}
	
	.submit-btn[disabled] {
	  background: #e5e5e5;
	  color: #aaa;
	  cursor: not-allowed;
	}
</style>