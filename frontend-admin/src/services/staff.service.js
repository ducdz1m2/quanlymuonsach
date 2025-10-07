import createApiClient from "./api.service";

class StaffService {
  constructor(baseUrl = "/api/staffs") {
    this.api = createApiClient(baseUrl);
  }

  async login(email, password) {
    const res = await this.api.post("/login", { email, password });
    // Lưu token và thông tin nhân viên
    localStorage.setItem("staffToken", res.data.token);
    localStorage.setItem("staffInfo", JSON.stringify(res.data.staff));
    return res.data;
  }

  logout() {
    localStorage.removeItem("staffToken");
    localStorage.removeItem("staffInfo");
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
}

export default new StaffService();
