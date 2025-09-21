"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const common_vendor = require("./common/vendor.js");
if (!Math) {
  "./pages/login/login.js";
  "./pages/index/index.js";
  "./pages/order-create/order-create.js";
  "./pages/my/my.js";
  "./pages/admin/admin-login.js";
  "./pages/admin/order-list.js";
}
const _sfc_main = {
  onLaunch: function() {
    common_vendor.index.__f__("log", "at App.vue:4", "App Launch - 应用启动");
    try {
      common_vendor.index.__f__("log", "at App.vue:9", "开始初始化微信云开发...");
      if (!common_vendor.wx$1.cloud) {
        common_vendor.index.__f__("error", "at App.vue:13", "wx.cloud不存在，请检查微信开发者工具设置");
        common_vendor.index.showToast({
          title: "请在微信开发者工具中打开",
          icon: "none",
          duration: 3e3
        });
        return;
      }
      const cloudEnv = "cloud1-3gb5zpxy7e8a2d12";
      if (!cloudEnv || cloudEnv === "your-cloud-env-id" || cloudEnv.length < 10) {
        common_vendor.index.__f__("error", "at App.vue:28", "无效的云环境ID:", cloudEnv);
        common_vendor.index.showModal({
          title: "配置错误",
          content: "请在App.vue中配置正确的云环境ID\n\n获取方式：微信开发者工具 → 云开发 → 设置",
          showCancel: false
        });
        return;
      }
      common_vendor.wx$1.cloud.init({
        env: cloudEnv,
        traceUser: true
      });
      common_vendor.index.__f__("log", "at App.vue:42", "wx.cloud初始化完成", {
        cloudEnv,
        wxCloud: common_vendor.wx$1.cloud
      });
      setTimeout(() => {
        try {
          const db = common_vendor.wx$1.cloud.database();
          common_vendor.index.__f__("log", "at App.vue:51", "云数据库连接验证成功:", db);
        } catch (dbError) {
          common_vendor.index.__f__("error", "at App.vue:53", "云数据库连接验证失败:", dbError);
        }
      }, 1e3);
    } catch (error) {
      common_vendor.index.__f__("error", "at App.vue:58", "云开发初始化失败:", error);
      let errorTitle = "云服务初始化失败";
      let errorContent = "请检查网络连接后重试";
      if (error.errCode === -501e3 || error.message.includes("env check invalid")) {
        errorTitle = "云环境配置错误";
        errorContent = "云环境ID无效或不存在\n\n请在微信开发者工具中：\n1. 点击“云开发”\n2. 创建或查看环境ID\n3. 替换App.vue中的云环境ID";
      } else if (error.message && error.message.includes("网络")) {
        errorContent = "网络连接失败，请检查网络后重试";
      } else if (error.message && error.message.includes("permission")) {
        errorContent = "权限不足，请检查云开发控制台设置";
      }
      common_vendor.index.showModal({
        title: errorTitle,
        content: errorContent,
        showCancel: false,
        confirmText: "我知道了"
      });
    }
  },
  onShow: function() {
    common_vendor.index.__f__("log", "at App.vue:88", "App Show - 应用显示");
  },
  onHide: function() {
    common_vendor.index.__f__("log", "at App.vue:91", "App Hide - 应用隐藏");
  }
};
function createApp() {
  const app = common_vendor.createSSRApp(_sfc_main);
  return {
    app
  };
}
createApp().app.mount("#app");
exports.createApp = createApp;
//# sourceMappingURL=../.sourcemap/mp-weixin/app.js.map
