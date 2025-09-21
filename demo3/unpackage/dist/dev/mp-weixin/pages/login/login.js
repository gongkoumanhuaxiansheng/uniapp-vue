"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  setup() {
    const phone = common_vendor.ref("13800138001");
    const code = common_vendor.ref("");
    const countdown = common_vendor.ref(0);
    const timer = common_vendor.ref(null);
    const validPhone = common_vendor.computed(() => {
      return /^1[3-9]\d{9}$/.test(phone.value);
    });
    const canLogin = common_vendor.computed(() => {
      return validPhone.value && code.value.length === 6;
    });
    const getCode = () => {
      common_vendor.index.__f__("log", "at pages/login/login.vue:61", "点击获取验证码");
      if (!validPhone.value) {
        common_vendor.index.showToast({
          title: "请输入正确的手机号",
          icon: "none"
        });
        return;
      }
      common_vendor.index.showLoading({ title: "发送中..." });
      setTimeout(() => {
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: "验证码已发送",
          icon: "success"
        });
        startCountdown();
      }, 1e3);
    };
    const startCountdown = () => {
      countdown.value = 60;
      timer.value = setInterval(() => {
        countdown.value--;
        if (countdown.value <= 0) {
          clearInterval(timer.value);
          timer.value = null;
        }
      }, 1e3);
    };
    const login = () => {
      common_vendor.index.__f__("log", "at pages/login/login.vue:96", "点击登录");
      if (!canLogin.value)
        return;
      common_vendor.index.showLoading({ title: "登录中..." });
      setTimeout(() => {
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: "登陆成功",
          icon: "success"
        });
        common_vendor.index.switchTab({
          url: "/pages/order-create/order-create"
        });
      }, 1500);
    };
    return {
      phone,
      code,
      countdown,
      validPhone,
      canLogin,
      getCode,
      login
    };
  },
  // UniApp 页面生命周期
  onUnload() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: $setup.phone,
    b: common_vendor.o(($event) => $setup.phone = $event.detail.value),
    c: $setup.code,
    d: common_vendor.o(($event) => $setup.code = $event.detail.value),
    e: common_vendor.t($setup.countdown > 0 ? `${$setup.countdown}s后重试` : "获取验证码"),
    f: $setup.countdown > 0 || !$setup.validPhone,
    g: common_vendor.o((...args) => $setup.getCode && $setup.getCode(...args)),
    h: !$setup.canLogin,
    i: common_vendor.o((...args) => $setup.login && $setup.login(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-e4e4508d"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/login/login.js.map
