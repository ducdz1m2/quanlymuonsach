import createApiClient from "@/services/api.service";

class MessageService {
  constructor(baseUrl = "/api/messages") {
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

  async delete(id) {
    const res = await this.api.delete(`/${id}`);
    return res.data;
  }

  async getByRoom(room) {
    const res = await this.api.get(`/room/${room}`);
    return res.data;
  }
}

export default new MessageService();
