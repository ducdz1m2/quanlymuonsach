const { ObjectId } = require("mongodb");
const bcrypt = require("bcrypt");
class ReaderService {
  constructor(client) {
    this.Reader = client.db().collection("reader");
  }

  async extractReaderData(payload) {
    let maDG = payload.maDG;

    if (!maDG) {
      maDG = await this.generateMaDG();
    }

    const reader = {
      maDG,
      hoLot: payload.hoLot,
      ten: payload.ten,
      password: payload.password
        ? bcrypt.hashSync(payload.password, 10)
        : undefined,
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
    reader.createdAt = new Date();

    // 🔹 Chuẩn hóa dữ liệu
    if (reader.dienThoai) {
      reader.dienThoai = String(reader.dienThoai).trim();
    }

    console.log("📩 Dữ liệu nhận:", reader);

    // 🔹 Kiểm tra trùng chính xác
    if (reader.dienThoai && reader.dienThoai !== "") {
      const existing = await this.Reader.findOne({
        dienThoai: { $regex: `^${reader.dienThoai}$`, $options: "i" }, // so sánh chính xác, không phân biệt hoa thường
      });

      console.log("🔍 Kiểm tra trùng:", existing);

      if (existing) {
        throw new Error("duplicate_phone");
      }
    }

    const result = await this.Reader.insertOne(reader);
    console.log("✅ Inserted ID:", result.insertedId);
    return { _id: result.insertedId, ...reader };
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

  async login(dienThoai, password) {
    const reader = await this.Reader.findOne({ dienThoai });
    if (!reader) return null;

    const isValid = await bcrypt.compare(password, reader.password);
    if (!isValid) return null;
    delete reader.password;
    return reader;
  }
}

module.exports = ReaderService;
