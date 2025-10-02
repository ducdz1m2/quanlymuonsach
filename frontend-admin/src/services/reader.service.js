import createApiClient from "./api.service";

class ReaderService {
  constructor(baseUrl = "/api/readers") {
    this.api = createApiClient(baseUrl);
  }

  async getAll() {
    const res = await this.api.get("/");
    return res.data;
  }

  async create(data) {
    const res = await this.api.post("/", data);
    return res.data;
  }

  async deleteAll() {
    const res = await this.api.delete("/");
    return res.data;
  }

  async get(id) {
    const res = await this.api.get(`/${id}`);
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
  async getPayment(id) {
    const res = await this.api.get(`/${id}/payment`);
    return res.data;
  }
}

export default new ReaderService();
