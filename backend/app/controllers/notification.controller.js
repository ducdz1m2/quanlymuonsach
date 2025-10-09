const ApiError = require("../api-error");
const NotificationService = require("../services/notification.service");
const MongoDB = require("../utils/mongodb.util");

// Tạo thông báo
exports.create = async (req, res, next) => {
  try {
    if (!req.body?.message || !req.body?.receiver_id) {
      return next(
        new ApiError(400, "Thiếu thông tin người nhận hoặc nội dung.")
      );
    }

    const notificationService = new NotificationService(MongoDB.client);
    const doc = await notificationService.create(req.body);
    return res.send(doc);
  } catch (error) {
    console.error(error);
    return next(new ApiError(500, "Lỗi khi tạo thông báo."));
  }
};

// Lấy thông báo theo người nhận
exports.findByReceiver = async (req, res, next) => {
  try {
    const { receiver_id } = req.params;
    const notificationService = new NotificationService(MongoDB.client);
    const list = await notificationService.findByReceiver(receiver_id);
    return res.send(list);
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi lấy danh sách thông báo."));
  }
};

// Đánh dấu đã đọc
exports.markAsRead = async (req, res, next) => {
  try {
    const notificationService = new NotificationService(MongoDB.client);
    const updated = await notificationService.markAsRead(req.params.id);
    if (!updated) return next(new ApiError(404, "Không tìm thấy thông báo."));
    return res.send(updated);
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi cập nhật trạng thái thông báo."));
  }
};
