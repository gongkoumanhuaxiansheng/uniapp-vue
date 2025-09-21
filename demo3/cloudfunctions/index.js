const cloud = require('wx-server-sdk');
cloud.init({env: process.env.Env});

exports.main = async (event, context) => {
	const {phone, address, imageFileIDs} = event; // 接受前端传来的数据
	const db = cloud.database();
	try {
		// 将订单数据存入数据库,imageFileIDs是前端上传后得到的FileID数组
		const result = await db.collection('orders').add({
			data: {
				phone: phone,
				address: address,
				images: imageFileIDs,
				status: 0,
				createTime: db.serverDate(), // 使用服务器时间
			}
		});
		return {success: true, orderId: result._id};
	} catch (err) {
		console.error(err);
		return {success: false, error: err};
	}
};