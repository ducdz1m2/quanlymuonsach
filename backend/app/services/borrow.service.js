const { ObjectId } = require("mongodb");

class BorrowService {
  constructor(client) {
    this.Borrow = client.db().collection("borrow");
  }

  extractBorrowData(payload) {
    const borrow = {
      bookId: payload.bookId ? new ObjectId(payload.bookId) : undefined,
      docGiaId: payload.docGiaId ? new ObjectId(payload.docGiaId) : undefined,
      ngayMuon: payload.ngayMuon,
      ngayTra: payload.ngayTra,
      trangThai: payload.trangThai || "dang_muon",
      // mặc định khi tạo phiếu mượn sẽ là "đang mượn"
    };
    Object.keys(borrow).forEach(
      (key) => borrow[key] === undefined && delete borrow[key]
    );
    return borrow;
  }

  async create(payload) {
    const borrow = this.extractBorrowData(payload);
    const result = await this.Borrow.insertOne(borrow);
    return result.insertedId ? { _id: result.insertedId, ...borrow } : null;
  }

  async find(filter) {
    const cursor = await this.Borrow.find(filter);
    return await cursor.toArray();
  }

  async findById(id) {
    if (!ObjectId.isValid(id)) return null;
    return await this.Borrow.findOne({ _id: new ObjectId(id) });
  }

  async update(id, payload) {
    if (!ObjectId.isValid(id)) return null;
    const filter = { _id: new ObjectId(id) };
    const update = this.extractBorrowData(payload);
    const result = await this.Borrow.findOneAndUpdate(
      filter,
      { $set: update },
      { returnDocument: "after" }
    );
    return result.value;
  }

  async delete(id) {
    if (!ObjectId.isValid(id)) return null;
    const result = await this.Borrow.findOneAndDelete({
      _id: new ObjectId(id),
    });
    return result.value;
  }

  async deleteAll() {
    const result = await this.Borrow.deleteMany({});
    return result.deletedCount;
  }

  async findDetailById(id) {
    if (!ObjectId.isValid(id)) return null;

    const cursor = await this.Borrow.aggregate([
      {
        $match: { _id: new ObjectId(id) }, // chỉ lấy borrow theo id
      },
      {
        $lookup: {
          from: "book",
          localField: "bookId",
          foreignField: "_id",
          as: "bookInfo",
        },
      },
      {
        $lookup: {
          from: "reader",
          localField: "docGiaId",
          foreignField: "_id",
          as: "docGiaInfo",
        },
      },
      { $unwind: "$bookInfo" },
      { $unwind: "$docGiaInfo" },
    ]);

    const results = await cursor.toArray();
    return results[0] || null; // chỉ trả về 1 object
  }
}

module.exports = BorrowService;
