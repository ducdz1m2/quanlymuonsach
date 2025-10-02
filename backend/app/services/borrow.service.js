const { ObjectId } = require("mongodb");
const BookService = require("./book.service");
const ApiError = require("../api-error");

class BorrowService {
  constructor(client) {
    this.Borrow = client.db().collection("borrow"); // collection đúng
    this.bookService = new BookService(client);
  }

  // Sinh mã mượn tự động
  async generateMaMuon() {
    const borrows = await this.Borrow.find({
      maMuon: { $regex: /^MUON-\d{4}$/ },
    }).toArray();

    if (borrows.length === 0) return "MUON-0001";

    let maxNumber = 0;
    borrows.forEach((b) => {
      const parts = b.maMuon.split("-");
      const num = parseInt(parts[1], 10);
      if (!isNaN(num) && num > maxNumber) maxNumber = num;
    });

    const newNumber = maxNumber + 1;
    return `MUON-${newNumber.toString().padStart(4, "0")}`;
  }

  // Chuẩn hóa dữ liệu phiếu mượn
  async extractBorrowData(payload) {
    let maMuon = payload.maMuon;
    if (!maMuon) maMuon = await this.generateMaMuon();

    const borrow = {
      maMuon,
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

  // Tạo phiếu mượn
  async create(data) {
    // 1. Chuẩn hóa dữ liệu phiếu mượn
    const borrowData = await this.extractBorrowData(data);

    // 2. Kiểm tra sách tồn tại & còn quyển
    const book = await this.bookService.findById(borrowData.bookId);
    if (!book) throw new ApiError(400, "Sách không tồn tại.");
    if (book.soQuyen <= 0)
      throw new ApiError(400, "Sách đã hết, không thể mượn.");

    // 3. Kiểm tra độc giả đang mượn < 3 quyển
    const activeBorrows = await this.Borrow.countDocuments({
      docGiaId: borrowData.docGiaId,
      trangThai: { $in: ["Chờ duyệt", "Đang mượn"] },
    });
    if (activeBorrows >= 3) {
      throw new ApiError(
        400,
        "Độc giả đang mượn quá 3 quyển, không thể mượn thêm."
      );
    }

    // 4. Giảm soQuyen của sách ngay khi tạo
    await this.bookService.update(book._id, { soQuyen: book.soQuyen - 1 });

    // 5. Tạo phiếu mượn
    const insertResult = await this.Borrow.insertOne({
      ...borrowData,
      trangThai: "Đang mượn", // hoặc "Chờ duyệt" nếu muốn duyệt sau
      createdAt: new Date(),
    });

    // 6. Trả về phiếu vừa tạo
    return await this.findById(insertResult.insertedId);
  }

  // Lấy danh sách phiếu mượn
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

    const update = await this.extractBorrowData(payload);
    const book = await this.bookService.findById(borrow.bookId);
    if (!book) throw new ApiError(400, "Không tìm thấy sách");

    const oldStatus = borrow.trangThai;
    const newStatus = update.trangThai;

    // Chờ duyệt -> Đang mượn
    if (oldStatus === "Chờ duyệt" && newStatus === "Đang mượn") {
      if (book.soQuyen <= 0)
        throw new ApiError(400, "Sách đã hết, không thể duyệt mượn");
      await this.bookService.update(book._id, { soQuyen: book.soQuyen - 1 });
    }

    // Trả sách: Đang mượn -> Đã trả
    if (oldStatus === "Đang mượn" && newStatus === "Đã trả") {
      await this.bookService.update(book._id, {
        soQuyen: (book.soQuyen || 0) + 1,
      });
    }

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

  // Lấy chi tiết phiếu mượn
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

  async countActiveBorrowsByReader(docGiaId) {
    if (!docGiaId) return 0;

    return await this.Borrow.countDocuments({
      docGiaId: new ObjectId(docGiaId),
      trangThai: "Đang mượn",
    });
  }
}

module.exports = BorrowService;
