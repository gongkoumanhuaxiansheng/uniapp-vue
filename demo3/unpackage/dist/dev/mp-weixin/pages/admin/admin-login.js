"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  setup() {
    const username = common_vendor.ref("");
    const password = common_vendor.ref("");
    const loading = common_vendor.ref(false);
    const adminAccounts = {
      "13277826627": "123456",
      // 管理员账号（admin的数字替代）
      "13800138002": "888888",
      // 管理员账号（manager的数字替代）
      "13800138003": "666666"
      // 管理员账号（root的数字替代）
    };
    const canLogin = common_vendor.computed(() => {
      return username.value.trim().length > 0 && password.value.trim().length > 0 && !loading.value;
    });
    const adminLogin = async () => {
      if (!canLogin.value)
        return;
      common_vendor.index.__f__("log", "at pages/admin/admin-login.vue:79", "管理员尝试登录:", username.value);
      loading.value = true;
      try {
        const inputUsername = username.value.trim();
        const inputPassword = password.value.trim();
        if (inputUsername.length !== 11) {
          throw new Error("管理员账号必须为11位数字");
        }
        if (!/^[0-9]+$/.test(inputUsername)) {
          throw new Error("管理员账号只能包含数字");
        }
        if (inputPassword.length !== 6) {
          throw new Error("密码必须为6位");
        }
        if (!/^[0-9]+$/.test(inputPassword)) {
          throw new Error("密码只能包含数字");
        }
        const correctPassword = adminAccounts[inputUsername];
        if (!correctPassword || correctPassword !== inputPassword) {
          throw new Error("管理员账号或密码错误");
        }
        await new Promise((resolve) => setTimeout(resolve, 1e3));
        const adminInfo = {
          username: inputUsername,
          loginTime: (/* @__PURE__ */ new Date()).getTime(),
          isAdmin: true
        };
        common_vendor.index.setStorageSync("adminInfo", adminInfo);
        common_vendor.index.setStorageSync("isAdminLoggedIn", true);
        common_vendor.index.__f__("log", "at pages/admin/admin-login.vue:123", "管理员登录成功:", adminInfo);
        common_vendor.index.showToast({
          title: "登录成功",
          icon: "success"
        });
        try {
          common_vendor.index.$emit("adminStatusChanged");
        } catch (e) {
        }
        setTimeout(() => {
          common_vendor.index.redirectTo({
            url: "/pages/admin/order-list"
          });
        }, 1500);
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/admin/admin-login.vue:145", "管理员登录失败:", error);
        common_vendor.index.showToast({
          title: error.message || "登录失败，请重试",
          icon: "none",
          duration: 3e3
        });
      } finally {
        loading.value = false;
      }
    };
    const checkLoginStatus = () => {
      try {
        const isLoggedIn = common_vendor.index.getStorageSync("isAdminLoggedIn");
        if (isLoggedIn) {
          common_vendor.index.__f__("log", "at pages/admin/admin-login.vue:161", "管理员已登录，跳转到订单管理");
          common_vendor.index.redirectTo({
            url: "/pages/admin/order-list"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("log", "at pages/admin/admin-login.vue:167", "检查登录状态失败:", error);
      }
    };
    checkLoginStatus();
    return {
      username,
      password,
      loading,
      canLogin,
      adminLogin
    };
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: $setup.username,
    b: common_vendor.o(($event) => $setup.username = $event.detail.value),
    c: $setup.password,
    d: common_vendor.o(($event) => $setup.password = $event.detail.value),
    e: common_vendor.t($setup.loading ? "登录中..." : "登录"),
    f: !$setup.canLogin,
    g: common_vendor.o((...args) => $setup.adminLogin && $setup.adminLogin(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-fc608340"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/admin/admin-login.js.map
