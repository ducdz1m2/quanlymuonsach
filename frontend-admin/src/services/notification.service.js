import createApiClient from "./api.service";

class NotificationService {
  constructor(baseUrl = "/api/notifications") {
    this.api = createApiClient(baseUrl);
  }

  // 📬 Gửi thông báo (admin gửi 1-1)
  async create(data) {
    const res = await this.api.post("/", data);
    return res.data;
  }

  // 🔔 Lấy thông báo của user (reader)
  async getByReceiver(receiver_id) {
    const res = await this.api.get(`/receiver/${receiver_id}`);
    return res.data;
  }

  // ✔️ Đánh dấu đã đọc
  async markAsRead(id) {
    const res = await this.api.patch(`/${id}/read`);
    return res.data;
  }

  // ❌ Xóa tất cả thông báo của 1 user (nếu backend có hỗ trợ)
  async deleteAll(receiver_id) {
    const res = await this.api.delete(`/receiver/${receiver_id}`);
    return res.data;
  }
}

export default new NotificationService();
