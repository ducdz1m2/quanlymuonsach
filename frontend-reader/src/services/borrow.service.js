import createApiClient from "./api.service";

class BorrowService {
  constructor(baseUrl = "/api/borrows") {
    this.api = createApiClient(baseUrl);
  }

  async getAll() {
    const res = await this.api.get("/");
    return res.data;
  }

  async getDetail(id) {
    const res = await this.api.get(`/${id}`);
    return res.data;
  }

  async create(data) {
    const today = new Date();
    const formatDate = (date) => date.toISOString().split("T")[0];

    // Nếu front-end truyền ngày trả thì dùng, nếu không thì mặc định +7 ngày
    let returnDate;
    if (data.ngayTra) {
      returnDate = new Date(data.ngayTra);
    } else {
      returnDate = new Date(today);
      returnDate.setDate(today.getDate() + 7);
    }

    const payload = {
      bookId: data.bookId,
      docGiaId: data.docGiaId || data.readerId || data._id,
      ngayMuon: formatDate(today),
      ngayTra: formatDate(returnDate),
      trangThai: "Chờ duyệt",
      quantity: data.quantity || 1, // nếu cần số lượng
    };

    console.log("📤 Gửi phiếu mượn:", payload);

    const res = await this.api.post("/", payload);
    return res.data;
  }

  async update(id, data) {
    const res = await this.api.put(`/${id}`, data);
    return res.data;
  }

  async getAllDetails() {
    const res = await this.api.get("/details");
    return res.data;
  }

  // 🆕 chỉ lấy phiếu mượn theo độc giả
  async getByReader(readerId) {
    const all = await this.getAllDetails();
    return all.filter((b) => b.docGiaInfo?._id === readerId);
  }
}

export default new BorrowService();
