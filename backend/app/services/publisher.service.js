const { ObjectId } = require("mongodb");

class PublisherService {
  constructor(client) {
    this.Publisher = client.db().collection("publisher");
  }

  async extractPublisherData(payload) {
    let maNXB = payload.maNXB;

    // Nếu không có mã NXB, tạo tự động
    if (!maNXB) {
      maNXB = await this.generateMaNXB();
    }

    const publisher = {
      maNXB,
      tenNXB: payload.tenNXB,
      diaChi: payload.diaChi,
      anh: payload.anh || "/images/default-publisher.png",
    };

    Object.keys(publisher).forEach(
      (key) => publisher[key] === undefined && delete publisher[key]
    );

    return publisher;
  }

  async generateMaNXB() {
    const publishers = await this.Publisher.find({
      maNXB: { $regex: /^NXB-\d{4}$/ },
    }).toArray();

    if (publishers.length === 0) return "NXB-0001";

    let maxNumber = 0;
    publishers.forEach((p) => {
      const parts = p.maNXB.split("-");
      const num = parseInt(parts[1], 10);
      if (!isNaN(num) && num > maxNumber) maxNumber = num;
    });

    const newNumber = maxNumber + 1;
    return `NXB-${newNumber.toString().padStart(4, "0")}`;
  }

  async create(payload) {
    const publisher = await this.extractPublisherData(payload);
    const result = await this.Publisher.findOneAndUpdate(
      { tenNXB: publisher.tenNXB }, // filter theo tên (tránh trùng)
      { $set: publisher },
      { returnDocument: "after", upsert: true }
    );
    return result.value;
  }

  async find(filter) {
    const cursor = await this.Publisher.find(filter);
    return await cursor.toArray();
  }

  async findById(id) {
    if (!ObjectId.isValid(id)) return null;
    return await this.Publisher.findOne({ _id: new ObjectId(id) });
  }

  async update(id, payload) {
    if (!ObjectId.isValid(id)) return null;
    const filter = { _id: new ObjectId(id) };
    const update = await this.extractPublisherData(payload);

    const result = await this.Publisher.findOneAndUpdate(
      filter,
      { $set: update },
      { returnDocument: "after" }
    );
    return result.value;
  }

  async delete(id) {
    if (!ObjectId.isValid(id)) return null;
    const result = await this.Publisher.findOneAndDelete({
      _id: new ObjectId(id),
    });
    return result.value;
  }

  async deleteAll() {
    const result = await this.Publisher.deleteMany({});
    return result.deletedCount;
  }
}

module.exports = PublisherService;
