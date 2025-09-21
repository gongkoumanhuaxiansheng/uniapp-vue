"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  setup() {
    const userInfo = common_vendor.ref({
      username: "用户名",
      avatar: "/static/default-avatar.png"
    });
    const onAvatarError = () => {
      common_vendor.index.__f__("log", "at pages/my/my.vue:43", "头像加载失败");
    };
    const goToOrderCreate = () => {
      common_vendor.index.navigateTo({
        url: "/pages/order-create/order-create"
      });
    };
    const goToLogin = () => {
      common_vendor.index.navigateTo({
        url: "/pages/login/login"
      });
    };
    const logout = () => {
      common_vendor.index.showModal({
        title: "提示",
        content: "确定要退出登录吗？",
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.showToast({
              title: "已退出登录",
              icon: "success"
            });
            setTimeout(() => {
              common_vendor.index.navigateTo({
                url: "/pages/login/login"
              });
            }, 1500);
          }
        }
      });
    };
    return {
      userInfo,
      onAvatarError,
      goToOrderCreate,
      goToLogin,
      logout
    };
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_assets._imports_0$1,
    b: common_vendor.o((...args) => $setup.onAvatarError && $setup.onAvatarError(...args)),
    c: common_vendor.o((...args) => $setup.goToOrderCreate && $setup.goToOrderCreate(...args)),
    d: common_vendor.o((...args) => $setup.goToLogin && $setup.goToLogin(...args)),
    e: common_vendor.o((...args) => $setup.logout && $setup.logout(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-2f1ef635"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/my/my.js.map
