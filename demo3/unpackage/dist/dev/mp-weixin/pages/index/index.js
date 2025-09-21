"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  setup() {
    const title = common_vendor.ref("欢迎使用uni-app");
    const isAdminLoggedIn = common_vendor.ref(false);
    const checkAdminStatus = () => {
      try {
        const adminLoginStatus = common_vendor.index.getStorageSync("isAdminLoggedIn");
        const adminInfo = common_vendor.index.getStorageSync("adminInfo");
        isAdminLoggedIn.value = adminLoginStatus && adminInfo;
        common_vendor.index.__f__("log", "at pages/index/index.vue:48", "管理员登录状态:", isAdminLoggedIn.value);
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:50", "检查管理员状态失败:", error);
        isAdminLoggedIn.value = false;
      }
    };
    common_vendor.onMounted(() => {
      common_vendor.index.__f__("log", "at pages/index/index.vue:57", "首页加载完成");
      checkAdminStatus();
    });
    const goToCreateOrder = () => {
      try {
        common_vendor.index.switchTab({
          url: "/pages/order-create/order-create"
        });
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:68", "跳转到创建订单页面失败:", error);
        common_vendor.index.showToast({
          title: "页面跳转失败",
          icon: "none"
        });
      }
    };
    const goToAdminLogin = () => {
      try {
        common_vendor.index.navigateTo({
          url: "/pages/admin/admin-login"
        });
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:83", "跳转到管理员登录失败:", error);
        common_vendor.index.showToast({
          title: "页面跳转失败",
          icon: "none"
        });
      }
    };
    const goToAdmin = () => {
      try {
        if (isAdminLoggedIn.value) {
          common_vendor.index.navigateTo({
            url: "/pages/admin/order-list"
          });
        } else {
          common_vendor.index.navigateTo({
            url: "/pages/admin/admin-login"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:105", "跳转到管理后台失败:", error);
        common_vendor.index.showToast({
          title: "页面跳转失败",
          icon: "none"
        });
      }
    };
    const adminLogout = () => {
      common_vendor.index.showModal({
        title: "确认退出",
        content: "确定要退出管理员账户吗？",
        success: (res) => {
          if (res.confirm) {
            try {
              common_vendor.index.removeStorageSync("isAdminLoggedIn");
              common_vendor.index.removeStorageSync("adminInfo");
              isAdminLoggedIn.value = false;
              common_vendor.index.showToast({
                title: "已退出管理员账户",
                icon: "success"
              });
            } catch (error) {
              common_vendor.index.__f__("error", "at pages/index/index.vue:129", "退出登录失败:", error);
              common_vendor.index.showToast({
                title: "退出失败，请重试",
                icon: "none"
              });
            }
          }
        }
      });
    };
    const onImageError = () => {
      common_vendor.index.__f__("log", "at pages/index/index.vue:142", "Logo图片加载失败");
      common_vendor.index.showToast({
        title: "图片加载失败",
        icon: "none",
        duration: 2e3
      });
    };
    return {
      title,
      isAdminLoggedIn,
      goToCreateOrder,
      goToAdminLogin,
      goToAdmin,
      adminLogout,
      onImageError
    };
  },
  // uni-app页面生命周期
  onShow() {
    this.checkAdminStatus && this.checkAdminStatus();
    common_vendor.index.__f__("log", "at pages/index/index.vue:165", "首页显示");
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_assets._imports_0,
    b: common_vendor.o((...args) => $setup.onImageError && $setup.onImageError(...args)),
    c: common_vendor.t($setup.title),
    d: common_vendor.o((...args) => $setup.goToCreateOrder && $setup.goToCreateOrder(...args)),
    e: !$setup.isAdminLoggedIn
  }, !$setup.isAdminLoggedIn ? {
    f: common_vendor.o((...args) => $setup.goToAdminLogin && $setup.goToAdminLogin(...args))
  } : {
    g: common_vendor.o((...args) => $setup.goToAdmin && $setup.goToAdmin(...args)),
    h: common_vendor.o((...args) => $setup.adminLogout && $setup.adminLogout(...args))
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/index/index.js.map
