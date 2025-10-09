const { ObjectId } = require("mongodb");

class NotificationService {
  constructor(client) {
    this.Notification = client.db().collection("notifications");
  }

  // Chuẩn hóa dữ liệu
  extractNotificationData(payload) {
    const notification = {
      sender_id: payload.sender_id ? new ObjectId(payload.sender_id) : null,
      receiver_id: payload.receiver_id
        ? new ObjectId(payload.receiver_id)
        : null,
      title: payload.title || "Thông báo",
      message: payload.message,
      is_read: payload.is_read ?? false,
      created_at: payload.created_at || new Date(),
    };

    Object.keys(notification).forEach(
      (key) => notification[key] === undefined && delete notification[key]
    );

    return notification;
  }

  // Tạo thông báo mới
  async create(payload) {
    const doc = this.extractNotificationData(payload);
    const result = await this.Notification.insertOne(doc);
    return await this.Notification.findOne({ _id: result.insertedId });
  }

  // Lấy thông báo của 1 user
  async findByReceiver(receiver_id) {
    if (!ObjectId.isValid(receiver_id)) return [];
    const cursor = await this.Notification.find({
      receiver_id: new ObjectId(receiver_id),
    }).sort({ created_at: -1 });
    return await cursor.toArray();
  }

  // Đánh dấu đã đọc
  async markAsRead(id) {
    if (!ObjectId.isValid(id)) return null;
    const result = await this.Notification.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { is_read: true } },
      { returnDocument: "after" }
    );
    return result.value;
  }

  // Xóa tất cả thông báo của 1 user (tùy chọn)
  async deleteAllOfUser(receiver_id) {
    if (!ObjectId.isValid(receiver_id)) return 0;
    const result = await this.Notification.deleteMany({
      receiver_id: new ObjectId(receiver_id),
    });
    return result.deletedCount;
  }
}

module.exports = NotificationService;
