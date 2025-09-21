"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  setup() {
    const orderList = common_vendor.ref([]);
    const loading = common_vendor.ref(false);
    const activeFilter = common_vendor.ref("all");
    const adminInfo = common_vendor.ref(null);
    const checkAdminAuth = () => {
      try {
        const isLoggedIn = common_vendor.index.getStorageSync("isAdminLoggedIn");
        const storedAdminInfo = common_vendor.index.getStorageSync("adminInfo");
        common_vendor.index.__f__("log", "at pages/admin/order-list.vue:99", "检查管理员权限:", { isLoggedIn, storedAdminInfo });
        if (!isLoggedIn || !storedAdminInfo) {
          common_vendor.index.__f__("log", "at pages/admin/order-list.vue:102", "未登录或登录信息无效，跳转到登录页");
          common_vendor.index.showModal({
            title: "权限验证",
            content: "您需要管理员权限才能访问此页面",
            showCancel: false,
            confirmText: "去登录",
            success: () => {
              common_vendor.index.redirectTo({
                url: "/pages/admin/admin-login"
              });
            }
          });
          return false;
        }
        const loginTime = storedAdminInfo.loginTime;
        const currentTime = (/* @__PURE__ */ new Date()).getTime();
        const expireTime = 24 * 60 * 60 * 1e3;
        if (currentTime - loginTime > expireTime) {
          common_vendor.index.__f__("log", "at pages/admin/order-list.vue:123", "登录已过期，清除登录状态");
          common_vendor.index.removeStorageSync("isAdminLoggedIn");
          common_vendor.index.removeStorageSync("adminInfo");
          common_vendor.index.showModal({
            title: "登录过期",
            content: "登录已过期，请重新登录",
            showCancel: false,
            confirmText: "重新登录",
            success: () => {
              common_vendor.index.redirectTo({
                url: "/pages/admin/admin-login"
              });
            }
          });
          return false;
        }
        adminInfo.value = storedAdminInfo;
        common_vendor.index.__f__("log", "at pages/admin/order-list.vue:141", "管理员权限验证通过:", adminInfo.value);
        return true;
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/admin/order-list.vue:145", "权限验证失败:", error);
        common_vendor.index.redirectTo({
          url: "/pages/admin/admin-login"
        });
        return false;
      }
    };
    const adminLogout = () => {
      common_vendor.index.showModal({
        title: "确认退出",
        content: "确定要退出管理员登录吗？",
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.__f__("log", "at pages/admin/order-list.vue:160", "管理员退出登录");
            common_vendor.index.removeStorageSync("isAdminLoggedIn");
            common_vendor.index.removeStorageSync("adminInfo");
            common_vendor.index.showToast({
              title: "已退出登录",
              icon: "success"
            });
            setTimeout(() => {
              common_vendor.index.redirectTo({
                url: "/pages/admin/admin-login"
              });
            }, 1500);
          }
        }
      });
    };
    const statusFilters = common_vendor.ref([
      { value: "all", label: "全部" },
      { value: "0", label: "待审核" },
      { value: "1", label: "已通过" },
      { value: "2", label: "已拒绝" }
    ]);
    const filteredOrders = common_vendor.computed(() => {
      if (activeFilter.value === "all") {
        return orderList.value;
      }
      return orderList.value.filter((order) => order.status.toString() === activeFilter.value);
    });
    const getOrderList = async () => {
      loading.value = true;
      common_vendor.index.__f__("log", "at pages/admin/order-list.vue:193", "开始从云数据库获取订单列表...");
      try {
        const db = common_vendor.wx$1.cloud.database();
        const res = await db.collection("orders").orderBy("createTime", "desc").get();
        common_vendor.index.__f__("log", "at pages/admin/order-list.vue:199", "从云数据库获取订单成功:", res.data);
        orderList.value = res.data;
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/admin/order-list.vue:202", "获取订单列表失败:", err);
        common_vendor.index.showToast({
          title: "获取数据失败",
          icon: "none"
        });
      } finally {
        loading.value = false;
      }
    };
    const approveOrder = async (orderId) => {
      await updateOrderStatus(orderId, 1, "通过");
    };
    const rejectOrder = async (orderId) => {
      await updateOrderStatus(orderId, 2, "拒绝");
    };
    const updateOrderStatus = async (orderId, newStatus, actionName) => {
      try {
        common_vendor.index.__f__("log", "at pages/admin/order-list.vue:222", `开始${actionName}订单:`, orderId);
        common_vendor.index.showLoading({ title: "操作中..." });
        const db = common_vendor.wx$1.cloud.database();
        await db.collection("orders").doc(orderId).update({
          data: {
            status: newStatus,
            reviewTime: /* @__PURE__ */ new Date()
            //记录审核时间
          }
        });
        common_vendor.index.hideLoading();
        common_vendor.index.__f__("log", "at pages/admin/order-list.vue:247", `${actionName}订单成功:`, orderId);
        common_vendor.index.showToast({
          title: `${actionName}成功`,
          icon: "success"
        });
        await getOrderList();
      } catch (err) {
        common_vendor.index.hideLoading();
        common_vendor.index.__f__("error", "at pages/admin/order-list.vue:257", "更新订单状态失败:", err);
        let errorTitle = `${actionName}失败`;
        let errorContent = "请稍后重试";
        let showModal = false;
        if (err.errCode === -502003 || err.message && err.message.includes("permission denied")) {
          errorTitle = "权限不足";
          errorContent = "管理员操作需要数据库写权限\n\n解决方案：\n1. 在微信开发者工具中点击“云开发”\n2. 点击“数据库”\n3. 选择“orders”集合\n4. 点击“权限设置”\n5. 设置为：所有用户可读，所有用户可写";
          showModal = true;
        } else if (err.message && err.message.includes("网络")) {
          errorContent = "网络连接失败，请检查网络后重试";
        } else if (err.errCode === -502005) {
          errorContent = "数据库集合不存在，请检查orders集合是否已创建";
        }
        if (showModal) {
          common_vendor.index.showModal({
            title: errorTitle,
            content: errorContent,
            showCancel: false,
            confirmText: "我知道了"
          });
        } else {
          common_vendor.index.showToast({
            title: `${actionName}失败，${errorContent}`,
            icon: "none"
          });
        }
      }
    };
    const changeFilter = (filterValue) => {
      activeFilter.value = filterValue;
    };
    const getStatusText = (status) => {
      const statusMap = { 0: "待审核", 1: "已通过", 2: "已拒绝" };
      return statusMap[status] || "未知状态";
    };
    const formatTime = (timestamp) => {
      if (!timestamp)
        return "未知时间";
      const date = new Date(timestamp);
      return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")} ${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
    };
    const previewImage = (urls, currentIndex) => {
      common_vendor.index.previewImage({
        urls,
        current: urls[currentIndex]
      });
    };
    common_vendor.onMounted(() => {
      if (checkAdminAuth()) {
        getOrderList();
      }
    });
    return {
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
    };
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $setup.adminInfo
  }, $setup.adminInfo ? {
    b: common_vendor.t($setup.adminInfo.username),
    c: common_vendor.o((...args) => $setup.adminLogout && $setup.adminLogout(...args))
  } : {}, {
    d: common_vendor.f($setup.statusFilters, (status, k0, i0) => {
      return {
        a: common_vendor.t(status.label),
        b: status.value,
        c: common_vendor.n($setup.activeFilter === status.value ? "active" : ""),
        d: common_vendor.o(($event) => $setup.changeFilter(status.value), status.value)
      };
    }),
    e: $setup.loading
  }, $setup.loading ? {} : $setup.filteredOrders.length === 0 ? {} : {
    g: common_vendor.f($setup.filteredOrders, (order, k0, i0) => {
      return common_vendor.e({
        a: common_vendor.t(order._id),
        b: common_vendor.t($setup.getStatusText(order.status)),
        c: common_vendor.n(`status-${order.status}`),
        d: common_vendor.t(order.phone),
        e: common_vendor.t($setup.formatTime(order.createTime)),
        f: order.images && order.images.length > 0
      }, order.images && order.images.length > 0 ? common_vendor.e({
        g: common_vendor.f(order.images.slice(0, 3), (img, index, i1) => {
          return {
            a: index,
            b: img,
            c: common_vendor.o(($event) => $setup.previewImage(order.images, index), index)
          };
        }),
        h: order.images.length > 3
      }, order.images.length > 3 ? {
        i: common_vendor.t(order.images.length - 3)
      } : {}) : {}, {
        j: common_vendor.t(order.address),
        k: order.status === 0
      }, order.status === 0 ? {
        l: common_vendor.o(($event) => $setup.approveOrder(order._id), order._id),
        m: common_vendor.o(($event) => $setup.rejectOrder(order._id), order._id)
      } : {}, {
        n: order._id
      });
    })
  }, {
    f: $setup.filteredOrders.length === 0
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-87421435"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/admin/order-list.js.map
