import createApiClient from "@/services/api.service";

class PublisherService {
  constructor(baseUrl = "/api/publishers") {
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
    const res = await this.api.put(`${id}`, data);
    return res.data;
  }
  async delete(id) {
    const response = await this.api.delete(`/${id}`);
    return response.data;
  }
}

export default new PublisherService();
