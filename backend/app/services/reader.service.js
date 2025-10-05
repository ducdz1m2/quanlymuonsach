const { ObjectId } = require("mongodb");

class ReaderService {
  constructor(client) {
    this.Reader = client.db().collection("reader");
  }

  async extractReaderData(payload) {
    let maDG = payload.maDG;

    // Nếu không có mã độc giả, tạo tự động
    if (!maDG) {
      maDG = await this.generateMaDG();
    }

    const reader = {
      maDG,
      hoLot: payload.hoLot,
      ten: payload.ten,
      ngaySinh: payload.ngaySinh,
      phai: payload.phai,
      diaChi: payload.diaChi,
      dienThoai: payload.dienThoai,
      anh: payload.anh || "/images/default-reader.png",
    };

    Object.keys(reader).forEach(
      (key) => reader[key] === undefined && delete reader[key]
    );

    return reader;
  }

  async generateMaDG() {
    const readers = await this.Reader.find({
      maDG: { $regex: /^DG-\d{4}$/ },
    }).toArray();

    if (readers.length === 0) return "DG-0001";

    let maxNumber = 0;
    readers.forEach((r) => {
      const parts = r.maDG.split("-");
      const num = parseInt(parts[1], 10);
      if (!isNaN(num) && num > maxNumber) maxNumber = num;
    });

    const newNumber = maxNumber + 1;
    return `DG-${newNumber.toString().padStart(4, "0")}`;
  }

  async create(payload) {
    const reader = await this.extractReaderData(payload);
    reader.createdAt = new Date(); // <--- thêm dòng này

    const result = await this.Reader.findOneAndUpdate(
      { hoLot: reader.hoLot, ten: reader.ten, ngaySinh: reader.ngaySinh },
      { $set: reader },
      { returnDocument: "after", upsert: true }
    );
    return result.value;
  }

  async find(filter) {
    const cursor = await this.Reader.find(filter);
    return await cursor.toArray();
  }

  async findById(id) {
    if (!ObjectId.isValid(id)) return null;
    return await this.Reader.findOne({ _id: new ObjectId(id) });
  }

  async update(id, payload) {
    if (!ObjectId.isValid(id)) return null;
    const filter = { _id: new ObjectId(id) };
    const update = await this.extractReaderData(payload);

    const result = await this.Reader.findOneAndUpdate(
      filter,
      { $set: update },
      { returnDocument: "after" }
    );
    return result.value;
  }

  async delete(id) {
    if (!ObjectId.isValid(id)) return null;
    const result = await this.Reader.findOneAndDelete({
      _id: new ObjectId(id),
    });
    return result.value;
  }

  async deleteAll() {
    const result = await this.Reader.deleteMany({});
    return result.deletedCount;
  }
}

module.exports = ReaderService;
