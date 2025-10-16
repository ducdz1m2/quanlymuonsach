const { ObjectId } = require("mongodb");
const ApiError = require("../api-error");
const ReaderService = require("../services/reader.service");
const BorrowService = require("../services/borrow.service");
const MongoDB = require("../utils/mongodb.util");
const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.JWT_SECRET || "library_secret";

exports.create = async (req, res, next) => {
  console.log("📨 Body gửi lên:", req.body);

  if (!req.body?.hoLot || !req.body?.ten) {
    return next(new ApiError(400, "Tên độc giả không thể để trống."));
  }

  try {
    const readerService = new ReaderService(MongoDB.client);
    const document = await readerService.create(req.body);

    console.log("🧾 Kết quả document:", document);

    return res.status(201).send({
      message: "Tạo độc giả thành công!",
      reader: document,
    });
  } catch (error) {
    console.error("❌ Lỗi tạo độc giả:", error.message);
    if (error.message === "duplicate_phone") {
      return next(new ApiError(400, "Số điện thoại này đã được đăng ký!"));
    }

    return next(new ApiError(500, "Đã xảy ra lỗi khi tạo độc giả."));
  }
};

exports.findAll = async (_req, res, next) => {
  try {
    const readerService = new ReaderService(MongoDB.client);
    const documents = await readerService.find({});
    return res.send(documents);
  } catch (error) {
    return next(new ApiError(500, "Đã xảy ra lỗi khi lấy danh sách độc giả."));
  }
};
exports.findOne = async (req, res, next) => {
  try {
    const readerService = new ReaderService(MongoDB.client);
    const borrowService = new BorrowService(MongoDB.client);

    // Tìm độc giả (giữ nguyên logic)
    const reader = await readerService.findById(req.params.id);
    if (!reader) {
      return next(new ApiError(404, "Không tìm thấy độc giả."));
    }

    // Lấy tất cả phiếu mượn của độc giả
    const borrows = await borrowService.find({
      docGiaId: new ObjectId(req.params.id),
    });

    // Nối thông tin sách cho từng phiếu mượn
    const detailedBorrows = (
      await Promise.all(
        borrows.map(async (b) => {
          const book = await borrowService.bookService.findById(b.bookId);
          if (!book) return null; // bỏ những phiếu mượn sách không tồn tại
          return {
            _id: b._id,
            trangThai: b.trangThai,
            ngayMuon: b.ngayMuon,
            ngayTra: b.ngayTra,
            book: {
              _id: book._id,
              tenSach: book.tenSach,
              tacGia: book.tacGia,
              donGia: book.donGia,
              theLoai: book.theLoai,
              soQuyen: book.soQuyen,
              namXuatBan: book.namXuatBan,
              maNXB: book.maNXB,
              moTa: book.moTa,
            },
          };
        })
      )
    ).filter(Boolean); // loại bỏ null

    // Trả về reader kèm danh sách phiếu mượn
    return res.send({
      ...reader,
      borrows: detailedBorrows,
    });
  } catch (error) {
    console.error(error);
    return next(
      new ApiError(
        500,
        `Đã xảy ra lỗi khi tìm độc giả với id=${req.params.id}.`
      )
    );
  }
};

exports.update = async (req, res, next) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return next(new ApiError(400, "Dữ liệu cập nhật không được để trống."));
  }

  try {
    const readerService = new ReaderService(MongoDB.client);
    const document = await readerService.update(req.params.id, req.body);
    if (document === null) {
      return next(new ApiError(404, "Không tìm thấy độc giả."));
    }
    return res.send({ message: "Cập nhật độc giả thành công." });
  } catch (error) {
    return next(
      new ApiError(
        500,
        `Đã xảy ra lỗi khi cập nhật độc giả với id=${req.params.id}.`
      )
    );
  }
};
exports.delete = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return next(new ApiError(400, "ID độc giả không hợp lệ."));
    }

    const readerService = new ReaderService(MongoDB.client);
    const borrowService = new BorrowService(MongoDB.client);

    // Tìm độc giả
    const reader = await readerService.findById(id);
    if (!reader) {
      return next(new ApiError(404, "Không tìm thấy độc giả."));
    }

    // Kiểm tra tất cả phiếu mượn chưa trả (Đang mượn, Quá hạn, Chờ duyệt)
    const activeBorrows = await borrowService.find({
      docGiaId: new ObjectId(id),
      trangThai: { $in: ["Đang mượn", "Quá hạn", "Chờ duyệt"] }, // Kiểm tra nhiều trạng thái
    });

    if (activeBorrows.length > 0) {
      return next(
        new ApiError(
          400,
          "Không thể xóa độc giả vì vẫn có phiếu mượn chưa trả."
        )
      );
    }

    // Nếu không có phiếu mượn chưa trả, xóa độc giả
    await readerService.delete(id);
    return res.send({ message: "Xóa độc giả thành công." });
  } catch (error) {
    console.error("Lỗi xóa độc giả:", error);
    return next(
      new ApiError(500, `Không thể xóa độc giả với id=${req.params.id}.`)
    );
  }
};

exports.deleteAll = async (_req, res, next) => {
  try {
    const readerService = new ReaderService(MongoDB.client);
    const deletedCount = await readerService.deleteAll();

    return res.send({
      message: `${deletedCount} độc giả đã được xóa thành công.`,
    });
  } catch (error) {
    return next(new ApiError(500, "Đã xảy ra lỗi khi xóa tất cả độc giả."));
  }
};

exports.calculatePayment = async (req, res, next) => {
  try {
    const borrowService = new BorrowService(MongoDB.client);
    const readerId = req.params.id;

    const borrows = await borrowService.find({
      docGiaId: new ObjectId(readerId),
    });
    const today = new Date();

    let totalCollected = 0;
    let totalPending = 0;
    let countedCollected = 0;
    let countedPending = 0;

    for (const b of borrows) {
      const book = await borrowService.bookService.findById(b.bookId);
      if (!book) continue;

      let penalty = 0;
      let status = b.trangThai;

      if (b.trangThai === "Đã trả") {
        // ✅ Giữ penalty từ DB, không tính lại
        penalty = b.penalty ?? 0;
        status = "Đã trả";
      } else {
        // Tính penalty tạm cho các trạng thái khác
        const { penalty: calcPenalty, status: calcStatus } =
          borrowService.calculatePenalty(b);
        penalty = calcPenalty;
        status = calcStatus;

        if (
          (b.trangThai === "Đang mượn" || b.trangThai === "Chờ duyệt") &&
          status === "Quá hạn"
        ) {
          await borrowService.Borrow.updateOne(
            { _id: b._id },
            { $set: { trangThai: status, penalty } }
          );
        }
      }

      // Tính tiền thuê sách
      const ngayMuon = new Date(b.ngayMuon);
      const ngayTra = new Date(b.ngayTra);
      const days = Math.max(
        Math.ceil(
          (Math.min(today, ngayTra) - ngayMuon) / (1000 * 60 * 60 * 24)
        ),
        1
      );
      const amount = days * (book.donGia || 0);

      // Cập nhật tổng
      if (status === "Đã trả") {
        totalCollected += amount + penalty;
        countedCollected++;
      } else {
        totalPending += amount + penalty;
        countedPending++;
      }

      b.trangThai = status;
      b.penalty = penalty;
    }

    return res.send({
      readerId,
      totalCollected,
      numberOfCollectedBorrows: countedCollected,
      totalPending,
      numberOfPendingBorrows: countedPending,
      borrows,
    });
  } catch (error) {
    console.error(error);
    return next(
      new ApiError(
        500,
        `Đã xảy ra lỗi khi tính tiền cho độc giả ${req.params.id}`
      )
    );
  }
};
exports.login = async (req, res, next) => {
  const { dienThoai, password } = req.body;
  const readerService = new ReaderService(MongoDB.client);

  try {
    const reader = await readerService.login(dienThoai, password);

    if (!reader) {
      return res
        .status(401)
        .json({ message: "Số điện thoại hoặc mật khẩu không đúng." });
    }

    const token = jwt.sign({ id: reader._id, role: "reader" }, SECRET_KEY, {
      expiresIn: "1d",
    });

    return res.json({
      message: "Đăng nhập thành công",
      reader,
      token,
    });
  } catch (error) {
    console.error(error);
    return next(new ApiError(500, "Đã xảy ra lỗi khi đăng nhập độc giả."));
  }
};
