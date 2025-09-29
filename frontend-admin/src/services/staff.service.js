import createApiClient from "./api.service";

class StaffServicce {
  constructor(baseUrl = "/api/staffs") {
    this.api = createApiClient(baseUrl);
  }
  async getAll() {
    const res = await this.api.get("/");
    return res.data;
  }
  async create(data) {
    return await this.api.post("/", data).data;
  }
  async deleteAll() {
    return await this.api.delete("/").data;
  }
  async get(id) {
    return await this.api.get(`/${id}`).data;
  }
  async update(id, data) {
    return await this.api.put(`${id}`, data).data;
  }
  async delete(id) {
    return await this.api.delete(`/${id}`).data;
  }
}

export default new StaffServicce();
