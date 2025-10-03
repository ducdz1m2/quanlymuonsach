const { ObjectId } = require("mongodb");
const BookService = require("./book.service");
const ApiError = require("../api-error");

class BorrowService {
  constructor(client) {
    this.Borrow = client.db().collection("borrow");
    this.bookService = new BookService(client);
    this.PENALTY_PER_DAY = 1000; // VNĐ
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
    const maMuon = payload.maMuon || (await this.generateMaMuon());
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
    if (!data.bookId || !data.docGiaId)
      throw new ApiError(400, "Thông tin sách và độc giả không thể để trống.");

    // Cập nhật tất cả phiếu quá hạn trước khi tạo mới
    await this.markOverdueBorrows();

    const book = await this.bookService.findById(data.bookId);
    if (!book) throw new ApiError(400, "Sách không tồn tại.");

    // Lấy tất cả phiếu mượn của độc giả
    const activeBorrows = await this.Borrow.find({
      docGiaId: new ObjectId(data.docGiaId),
      trangThai: { $in: ["Chờ duyệt", "Đang mượn", "Quá hạn"] },
    }).toArray();

    const overdueBorrows = activeBorrows.filter(
      (b) => b.trangThai === "Quá hạn"
    );
    if (overdueBorrows.length > 0) {
      throw new ApiError(
        400,
        `Độc giả có ${overdueBorrows.length} phiếu mượn quá hạn, không thể mượn thêm.`
      );
    }

    if (activeBorrows.length >= 3) {
      throw new ApiError(
        400,
        "Độc giả đang mượn quá 3 quyển, không thể mượn thêm."
      );
    }

    // Nếu trạng thái là "Đang mượn", giảm số lượng sách
    if ((data.trangThai || "Chờ duyệt") === "Đang mượn") {
      if (book.soQuyen <= 0)
        throw new ApiError(400, "Sách đã hết, không thể duyệt mượn.");
      await this.bookService.update(book._id, { soQuyen: book.soQuyen - 1 });
    }

    const borrowData = await this.extractBorrowData(data);
    borrowData.penalty = 0;

    const insertResult = await this.Borrow.insertOne(borrowData);
    return await this.findById(insertResult.insertedId);
  }

  // Lấy danh sách phiếu mượn
  async find(filter) {
    return await this.Borrow.find(filter).toArray();
  }

  async findById(id) {
    if (!ObjectId.isValid(id)) return null;
    return await this.Borrow.findOne({ _id: new ObjectId(id) });
  }

  async update(id, payload) {
    if (!ObjectId.isValid(id)) return null;
    const borrow = await this.findById(id);
    if (!borrow) return null;

    const book = await this.bookService.findById(borrow.bookId);
    if (!book) throw new ApiError(400, "Không tìm thấy sách");

    const update = await this.extractBorrowData(payload);
    const oldStatus = borrow.trangThai;
    let newStatus = update.trangThai || oldStatus;
    let penalty = borrow.penalty || 0; // mặc định lấy penalty đã lưu

    // Chờ duyệt -> Đang mượn (giữ nguyên)
    if (oldStatus === "Chờ duyệt" && newStatus === "Đang mượn") {
      if (book.soQuyen <= 0)
        throw new ApiError(400, "Sách đã hết, không thể duyệt mượn");
      await this.bookService.update(book._id, { soQuyen: book.soQuyen - 1 });
    }

    // Bất kỳ trạng thái nào -> Đã trả: Tính penalty dựa trên ngày trả thực tế
    if (newStatus === "Đã trả") {
      await this.bookService.update(book._id, {
        soQuyen: (book.soQuyen || 0) + 1,
      });

      const today = new Date();
      const ngayTra = new Date(borrow.ngayTra); // hoặc update.ngayTra nếu có thay đổi

      // Tính penalty: số ngày từ hạn trả đến ngày trả thực tế
      if (today > ngayTra) {
        const overdueDays = Math.ceil(
          (today - ngayTra) / (1000 * 60 * 60 * 24)
        );
        penalty = overdueDays * this.PENALTY_PER_DAY;
      } else {
        penalty = 0;
      }

      // Lưu ngày trả thực tế
      update.ngayThucTeTra = today; // Thêm field này nếu chưa có trong schema
    }

    // Nếu chưa trả thì tính lại trạng thái (giữ nguyên phần này)
    if (newStatus !== "Đã trả" && update.ngayTra) {
      const today = new Date();
      const dueDate = new Date(update.ngayTra);
      if (today > dueDate) {
        const overdueDays = Math.ceil(
          (today - dueDate) / (1000 * 60 * 60 * 24)
        );
        penalty = overdueDays * this.PENALTY_PER_DAY;
        newStatus = "Quá hạn";
      } else {
        newStatus = "Đang mượn";
        penalty = 0;
      }
    }

    update.trangThai = newStatus;
    update.penalty = penalty;

    const result = await this.Borrow.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: update },
      { returnDocument: "after" }
    );

    return result.value;
  }

  // Tính phạt và trạng thái quá hạn
  calculatePenalty(borrow) {
    const today = new Date();
    const dueDate = new Date(borrow.ngayTra);
    let status = borrow.trangThai;
    let penalty = 0;

    // Nếu đã trả => tính phạt dựa vào ngày thực tế trả
    if (status === "Đã trả") {
      const returnDate = borrow.ngayThucTeTra
        ? new Date(borrow.ngayThucTeTra)
        : today; // Fallback nếu null
      if (returnDate > dueDate) {
        const overdueDays = Math.ceil(
          (returnDate - dueDate) / (1000 * 60 * 60 * 24)
        );
        penalty = overdueDays * this.PENALTY_PER_DAY;
      }
      return { penalty, status };
    }

    // Nếu chưa trả => tính phạt dựa vào hôm nay (giữ nguyên)
    if (today > dueDate) {
      const overdueDays = Math.ceil((today - dueDate) / (1000 * 60 * 60 * 24));
      penalty = overdueDays * this.PENALTY_PER_DAY;
      status = "Quá hạn";
    }

    return { penalty, status };
  }

  // Xóa phiếu mượn
  async delete(id) {
    const document = await this.findById(id);
    if (document === null) throw new ApiError(404, "Phiếu mượn không tồn tại.");

    if (document.trangThai == "Quá hạn") {
      throw new ApiError(
        400,
        "Không thể xóa phiếu quá hạn, hãy xử lý trước khi xóa."
      );
    }
    const result = await this.Borrow.findOneAndDelete({
      _id: new ObjectId(id),
    });
    return result;
  }

  async deleteAll() {
    const result = await this.Borrow.deleteMany({});
    return result.deletedCount;
  }

  // Lấy chi tiết phiếu mượn
  async findDetailById(id) {
    if (!ObjectId.isValid(id)) return null;

    await this.markOverdueBorrows(); // cập nhật quá hạn trước khi lấy

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
    if (!results[0]) return null;
    return results[0];
  }

  // Lấy danh sách chi tiết phiếu mượn
  async findAllDetails() {
    await this.markOverdueBorrows(); // cập nhật quá hạn trước khi lấy

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

  // Đếm phiếu mượn đang mượn của độc giả
  async countActiveBorrowsByReader(docGiaId) {
    if (!docGiaId) return 0;
    return await this.Borrow.countDocuments({
      docGiaId: new ObjectId(docGiaId),
      trangThai: "Đang mượn",
    });
  }

  // Cập nhật tất cả phiếu quá hạn
  async markOverdueBorrows() {
    const borrows = await this.Borrow.find({
      trangThai: { $in: ["Đang mượn", "Chờ duyệt"] },
    }).toArray();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const b of borrows) {
      const dueDate = new Date(b.ngayTra);
      dueDate.setHours(0, 0, 0, 0);

      if (today > dueDate) {
        const overdueDays = Math.ceil(
          (today - dueDate) / (1000 * 60 * 60 * 24)
        );
        const penalty = overdueDays * this.PENALTY_PER_DAY;

        await this.Borrow.updateOne(
          { _id: b._id },
          { $set: { trangThai: "Quá hạn", penalty } }
        );
      }
    }

    return borrows.length;
  }
}

module.exports = BorrowService;
