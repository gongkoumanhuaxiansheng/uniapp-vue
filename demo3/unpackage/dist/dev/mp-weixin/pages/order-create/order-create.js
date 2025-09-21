"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  setup() {
    const imageList = common_vendor.ref([]);
    const address = common_vendor.ref("");
    const canSubmit = common_vendor.computed(() => {
      return imageList.value.length > 0 && address.value.trim().length > 0;
    });
    const chooseImage = () => {
      try {
        common_vendor.index.__f__("log", "at pages/order-create/order-create.vue:61", "开始选择图片，当前图片数量:", imageList.value.length);
        const maxCount = 4 - imageList.value.length;
        if (maxCount <= 0) {
          common_vendor.index.showToast({
            title: "最多只能上传4张图片",
            icon: "none"
          });
          return;
        }
        common_vendor.index.chooseImage({
          count: maxCount,
          //本次最多能选择图片数量
          sizeType: ["compressed"],
          //选择压缩图，节省存储空间和上传流量
          sourceType: ["album", "camera"],
          //允许从相册和相机两种图片来源选择
          success: (res) => {
            common_vendor.index.__f__("log", "at pages/order-create/order-create.vue:79", "图片选择成功:", res.tempFilePaths);
            imageList.value = [...imageList.value, ...res.tempFilePaths];
            common_vendor.index.showToast({
              title: `已添加${res.tempFilePaths.length}张图片`,
              icon: "success"
            });
          },
          fail: (err) => {
            common_vendor.index.__f__("error", "at pages/order-create/order-create.vue:91", "选择图片失败:", err);
            common_vendor.index.showToast({
              title: "选择图片失败,请重试",
              icon: "none"
            });
          }
        });
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/order-create/order-create.vue:99", "chooseImage function error:", error);
        common_vendor.index.showToast({
          title: "操作失败,请重试",
          icon: "none"
        });
      }
    };
    const deleteImage = (index) => {
      imageList.value.splice(index, 1);
    };
    const submitOrder = async () => {
      if (!canSubmit.value)
        return;
      common_vendor.index.__f__("log", "at pages/order-create/order-create.vue:113", "开始提交订单，图片数量:", imageList.value.length, "地址:", address.value);
      common_vendor.index.showLoading({ title: "上传图片并生成订单中..." });
      try {
        if (typeof common_vendor.wx$1 === "undefined") {
          throw new Error("微信小程序环境未准备就绪");
        }
        if (!common_vendor.wx$1.cloud) {
          throw new Error("云开发未初始化，请检查微信开发者工具设置");
        }
        try {
          const testDb = common_vendor.wx$1.cloud.database();
          if (!testDb) {
            throw new Error("云数据库未准备就绪");
          }
          common_vendor.index.__f__("log", "at pages/order-create/order-create.vue:134", "云开发状态验证成功");
        } catch (initError) {
          throw new Error("云开发尚未完成初始化，请稍后重试: " + initError.message);
        }
        common_vendor.index.__f__("log", "at pages/order-create/order-create.vue:139", "开始上传图片到云存储...");
        const uploadTasks = imageList.value.map((filePath, index) => {
          const cloudPath = `order_images/${Date.now()}_${index}.jpg`;
          common_vendor.index.__f__("log", "at pages/order-create/order-create.vue:144", `准备上传第${index + 1}张图片:`, filePath, "-> ", cloudPath);
          return common_vendor.wx$1.cloud.uploadFile({
            cloudPath,
            filePath
          });
        });
        const uploadResults = await Promise.all(uploadTasks);
        common_vendor.index.__f__("log", "at pages/order-create/order-create.vue:153", "所有图片上传完成:", uploadResults);
        const cloudFileIDs = uploadResults.map((res2) => res2.fileID);
        common_vendor.index.__f__("log", "at pages/order-create/order-create.vue:157", "图片上传成功,FileID列表:", cloudFileIDs);
        const db = common_vendor.wx$1.cloud.database();
        common_vendor.index.__f__("log", "at pages/order-create/order-create.vue:161", "准备保存订单到数据库...");
        try {
          await db.collection("orders").limit(1).get();
          common_vendor.index.__f__("log", "at pages/order-create/order-create.vue:167", "orders集合已存在");
        } catch (collectionError) {
          if (collectionError.errCode === -502005) {
            common_vendor.index.__f__("log", "at pages/order-create/order-create.vue:170", "orders集合不存在，尝试创建...");
            throw new Error("数据库集合不存在");
          } else {
            throw collectionError;
          }
        }
        const res = await db.collection("orders").add({
          data: {
            address: address.value,
            //用户地址
            images: cloudFileIDs,
            //云存储图片FileID数组
            status: 0,
            //订单状态(0待审核,1已通过,2已拒绝)
            createTime: /* @__PURE__ */ new Date()
            //订单创建时间
          }
        });
        common_vendor.index.hideLoading();
        common_vendor.index.__f__("log", "at pages/order-create/order-create.vue:189", "订单创建成功,数据库记录ID为:", res._id);
        common_vendor.index.showModal({
          title: "订单提交成功",
          content: "订单已提交，等待管理员审核\n\n您可以查看管理后台进行审核操作",
          confirmText: "查看后台",
          cancelText: "返回首页",
          success: (modalRes) => {
            if (modalRes.confirm) {
              common_vendor.index.__f__("log", "at pages/order-create/order-create.vue:200", "跳转到管理后台");
              common_vendor.index.navigateTo({
                url: "/pages/admin/order-list"
              });
            } else {
              const pages = getCurrentPages();
              if (pages.length > 1) {
                common_vendor.index.__f__("log", "at pages/order-create/order-create.vue:208", "返回上一页");
                common_vendor.index.navigateBack();
              } else {
                common_vendor.index.__f__("log", "at pages/order-create/order-create.vue:211", "跳转到首页");
                common_vendor.index.switchTab({
                  url: "/pages/index/index"
                });
              }
            }
          }
        });
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/order-create/order-create.vue:232", "提交订单失败:", err);
        common_vendor.index.hideLoading();
        let errorMessage = "订单提交失败,请重试";
        let showModal = false;
        let modalContent = "";
        if (err.errCode === -502005 || err.message && err.message.includes("数据库集合不存在")) {
          errorMessage = "数据库集合未创建";
          showModal = true;
          modalContent = "需要先创建“orders”数据库集合\n\n操作步骤：\n1. 在微信开发者工具中点击“云开发”\n2. 点击“数据库”\n3. 点击“+”创建集合\n4. 集合名称输入：orders";
        } else if (err.message && err.message.includes("网络")) {
          errorMessage = "网络连接失败,请检查网络后重试";
        } else if (err.message && err.message.includes("云存储")) {
          errorMessage = "图片上传失败,请重新选择图片";
        } else if (err.message && err.message.includes("数据库")) {
          errorMessage = "数据保存失败,请稍后重试";
        }
        if (showModal) {
          common_vendor.index.showModal({
            title: errorMessage,
            content: modalContent,
            showCancel: false,
            confirmText: "我知道了"
          });
        } else {
          common_vendor.index.showToast({
            title: errorMessage,
            icon: "none"
          });
        }
      }
    };
    return {
      imageList,
      address,
      canSubmit,
      chooseImage,
      deleteImage,
      submitOrder
    };
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.f($setup.imageList, (image, index, i0) => {
      return {
        a: image,
        b: common_vendor.o(($event) => $setup.deleteImage(index), "image-" + index),
        c: "image-" + index
      };
    }),
    b: $setup.imageList.length < 4
  }, $setup.imageList.length < 4 ? {
    c: common_vendor.o((...args) => $setup.chooseImage && $setup.chooseImage(...args))
  } : {}, {
    d: $setup.address,
    e: common_vendor.o(($event) => $setup.address = $event.detail.value),
    f: !$setup.canSubmit,
    g: common_vendor.o((...args) => $setup.submitOrder && $setup.submitOrder(...args))
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-85f29094"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/order-create/order-create.js.map
