const { ObjectId } = require("mongodb");

class BookService {
  constructor(client) {
    this.Book = client.db().collection("book");
  }

  extractBookData(payload) {
    const book = {
      tenSach: payload.tenSach,
      tacGia: payload.tacGia,
      donGia: payload.donGia,
      theLoai: payload.theLoai,
      soQuyen: payload.soQuyen,
      namXuatBan: payload.namXuatBan,
      maNXB: payload.maNXB ? new ObjectId(payload.maNXB) : undefined,
      moTa: payload.moTa || "Chưa có mô tả",
      anhBia: payload.anhBia || "/images/default-book.png",
    };
    Object.keys(book).forEach(
      (key) => book[key] === undefined && delete book[key]
    );
    return book;
  }

  async create(payload) {
    const book = this.extractBookData(payload);
    const result = await this.Book.findOneAndUpdate(
      book, // filter
      { $set: book }, // update
      { returnDocument: "after", upsert: true } // options
    );
    return result.value;
  }

  async find(filter) {
    const cursor = await this.Book.find(filter);
    return await cursor.toArray();
  }

  async findByName(tenSach) {
    return await this.find({
      tenSach: { $regex: new RegExp(tenSach), $options: "i" },
    });
  }

  async findById(id) {
    if (!ObjectId.isValid(id)) return null;
    return await this.Book.findOne({ _id: new ObjectId(id) });
  }

  async update(id, payload) {
    if (!ObjectId.isValid(id)) return null;
    const filter = { _id: new ObjectId(id) };
    const update = this.extractBookData(payload);
    const result = await this.Book.findOneAndUpdate(
      filter,
      { $set: update },
      { returnDocument: "after" }
    );
    return result.value;
  }

  async delete(id) {
    if (!ObjectId.isValid(id)) return null;
    const result = await this.Book.findOneAndDelete({
      _id: new ObjectId(id),
    });
    return result.value;
  }

  async deleteAll() {
    const result = await this.Book.deleteMany({});
    return result.deletedCount;
  }
}

module.exports = BookService;
