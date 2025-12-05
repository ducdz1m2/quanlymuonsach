import createApiClient from "./api.service";

class ReaderService {
  constructor(baseUrl = "/api/readers") {
    this.api = createApiClient(baseUrl);
  }
  async create(data) {
    const res = await this.api.post("/", data);
    return res;
  }
  async login(dienThoai, password) {
    const res = await this.api.post("/login", { dienThoai, password });

    localStorage.setItem("readerToken", res.data.token);
    localStorage.setItem("readerInfo", JSON.stringify(res.data.reader));
    return res.data;
  }
  logout() {
    localStorage.removeItem("readerToken");
    localStorage.removeItem("readerInfo");
  }
  async getAll() {
    const res = await this.api.get("/");
    return res.data;
  }

  async getProfile(id) {
    const res = await this.api.get(`/${id}`);
    return res.data;
  }

  async updateProfile(id, data) {
    const res = await this.api.put(`/${id}`, data);
    return res.data;
  }

  async getPayment(id) {
    const res = await this.api.get(`/${id}/payment`);
    return res.data;
  }
}

export default new ReaderService();
