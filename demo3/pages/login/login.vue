<template>
  <view class="login-container">
    <!-- 当前页面标题 -->
    <text class="title">短信登陆</text>
    
    <!-- 手机号输入框 -->
    <input
      class="input"
      type="number"
      maxlength="11"
      v-model="phone"
      placeholder="请输入手机号"
    />
    
    <!-- 验证码输入行 -->
    <view class="code-row">
      <input
        class="input code-input"
        type="number"
        maxlength="6"
        v-model="code"
        placeholder="请输入验证码"
      />
      <button
        class="code-btn"
        :disabled="countdown > 0 || !validPhone"
        @click="getCode"
      >
        {{ countdown > 0 ? `${countdown}s后重试` : '获取验证码' }}
      </button>
    </view>
    
    <!-- 登录按钮 -->
    <button class="login-btn" :disabled="!canLogin" @click="login">登录/注册</button>
  </view>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  setup() {
    // 响应式数据
    const phone = ref('13800138001') // 默认填入规范的测试手机号
    const code = ref('') // 验证码
    const countdown = ref(0) // 倒计时秒数
    const timer = ref(null) // 定时器

    // 计算属性：验证手机号格式（简单校验）
    const validPhone = computed(() => {
      return /^1[3-9]\d{9}$/.test(phone.value)
    })

    // 计算属性：是否允许登录（手机号正确且验证码为6位）
    const canLogin = computed(() => {
      return validPhone.value && code.value.length === 6
    })

    // 发送验证码
    const getCode = () => {
      console.log('点击获取验证码') // 调试用
      if (!validPhone.value) {
        uni.showToast({
          title: '请输入正确的手机号',
          icon: 'none'
        })
        return
      }

      // TODO: 这里调用后端发送验证码的API
      uni.showLoading({ title: '发送中...' })
      setTimeout(() => {
        uni.hideLoading()
        uni.showToast({
          title: '验证码已发送',
          icon: 'success'
        })
        startCountdown() // 开始倒计时
      }, 1000)
    }

    // 开始倒计时
    const startCountdown = () => {
      countdown.value = 60 // 设置倒计时60秒
      timer.value = setInterval(() => {
        countdown.value--
        if (countdown.value <= 0) {
          clearInterval(timer.value)
          timer.value = null
        }
      }, 1000)
    }

    // 登录/注册
    const login = () => {
      console.log('点击登录') // 调试用
      if (!canLogin.value) return
      
      // TODO: 调用后端登录/注册接口
      uni.showLoading({ title: '登录中...' })
      setTimeout(() => {
        uni.hideLoading()
        uni.showToast({
          title: '登陆成功',
          icon: 'success'
        })
        // 登陆成功后的跳转逻辑，跳转到TabBar页面需要使用switchTab
        uni.switchTab({
          url: '/pages/order-create/order-create'
        })
      }, 1500)
    }

    // 组件卸载时清除定时器
    const cleanup = () => {
      if (timer.value) {
        clearInterval(timer.value)
        timer.value = null
      }
    }

    // 返回所有需要在模板中使用的变量和方法
    return {
      phone,
      code,
      countdown,
      validPhone,
      canLogin,
      getCode,
      login
    }
  },
  
  // UniApp 页面生命周期
  onUnload() {
    // 清理定时器
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  }
}
</script>

<style scoped>
.login-container {
  padding: 100rpx 40rpx;
  background: #fff;
  min-height: 100vh;
}

.title {
  display: block;
  text-align: center;
  font-size: 48rpx;
  font-weight: bold;
  margin-bottom: 80rpx;
  color: #333;
}

.input {
  width: 100%;
  height: 88rpx;
  margin-bottom: 32rpx;
  border: 1rpx solid #e5e5e5;
  border-radius: 12rpx;
  padding: 0 24rpx;
  font-size: 32rpx;
  background: #f8f8f8;
  padding:10rpx;
}

.code-row {
  display: flex;
  align-items: center;
  margin-bottom: 32rpx;
}

.code-input {
  flex: 1;
  margin-right: 16rpx;
  margin-bottom: 0;
}

.code-btn {
  width: 200rpx;
  height: 88rpx;
  background: #007dff;
  color: #fff;
  border: none;
  border-radius: 12rpx;
  font-size: 28rpx;
  text-align: center;
  line-height: 88rpx;
  }

.code-btn[disabled] {
  background: #b3d8ff;
  color: #fff;
  text-align: center;
}

.login-btn {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(90deg, #007dff 0%, #00c6ff 100%);
  color: #fff;
  border: none;
  border-radius: 12rpx;
  font-size: 32rpx;
  margin-top: 24rpx;
}

.login-btn[disabled] {
  background: #e5e5e5;
  color: #aaa;
}
.uni-input-input{
	
}
</style>