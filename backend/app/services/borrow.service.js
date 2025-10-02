const { ObjectId } = require("mongodb");
const BookService = require("./book.service");

class BorrowService {
  constructor(client) {
    this.Borrow = client.db().collection("borrow");
    this.bookService = new BookService(client);
  }

  extractBorrowData(payload) {
    const borrow = {
      bookId: payload.bookId ? new ObjectId(payload.bookId) : undefined,
      docGiaId: payload.docGiaId ? new ObjectId(payload.docGiaId) : undefined,
      ngayMuon: payload.ngayMuon,
      ngayTra: payload.ngayTra,
      trangThai: payload.trangThai ?? "Chờ duyệt",
    };
    Object.keys(borrow).forEach(
      (key) => borrow[key] === undefined && delete borrow[key]
    );
    return borrow;
  }

  async create(payload) {
    const borrow = this.extractBorrowData(payload);

    // Nếu tạo phiếu đã mượn trực tiếp, kiểm tra số lượng
    if (borrow.trangThai === "Đang mượn") {
      const book = await this.bookService.findById(borrow.bookId);
      if (!book) throw new Error("Không tìm thấy sách");
      if (book.soQuyen <= 0) throw new Error("Sách đã hết");
      await this.bookService.update(book._id, { soQuyen: book.soQuyen - 1 });
    }

    // Tạo phiếu mượn
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

    const borrow = await this.findById(id);
    if (!borrow) return null;

    const update = this.extractBorrowData(payload);
    const book = await this.bookService.findById(borrow.bookId);
    if (!book) throw new Error("Không tìm thấy sách");

    const oldStatus = borrow.trangThai;
    const newStatus = update.trangThai;

    // Chờ duyệt -> Đang mượn: trừ 1
    if (oldStatus === "Chờ duyệt" && newStatus === "Đang mượn") {
      if (book.soQuyen <= 0)
        throw new Error("Sách đã hết, không thể duyệt mượn");
      await this.bookService.update(book._id, { soQuyen: book.soQuyen - 1 });
    }

    // Trả sách: Đang mượn -> Đã trả
    if (oldStatus === "Đang mượn" && newStatus === "Đã trả") {
      await this.bookService.update(book._id, {
        soQuyen: (book.soQuyen || 0) + 1,
      });
    }

    // Cập nhật phiếu
    const result = await this.Borrow.findOneAndUpdate(
      { _id: new ObjectId(id) },
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
      { $match: { _id: new ObjectId(id) } },
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
    return results[0] || null;
  }

  async findAllDetails() {
    const cursor = await this.Borrow.aggregate([
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

    return await cursor.toArray();
  }
}

module.exports = BorrowService;
