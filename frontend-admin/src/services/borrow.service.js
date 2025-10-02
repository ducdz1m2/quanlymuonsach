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
    const res = await this.api.post("/", data);
    return res.data;
  }

  async update(id, data) {
    const res = await this.api.put(`/${id}`, data);
    return res.data;
  }

  async delete(id) {
    const res = await this.api.delete(`/${id}`);
    return res.data;
  }
  async getAllDetails() {
    const res = await this.api.get("/details");
    return res.data;
  }
}

export default new BorrowService();
