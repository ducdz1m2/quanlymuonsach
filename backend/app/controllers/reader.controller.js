const { ObjectId } = require("mongodb");
const ApiError = require("../api-error");
const ReaderService = require("../services/reader.service");
const BorrowService = require("../services/borrow.service");
const MongoDB = require("../utils/mongodb.util");
exports.create = async (req, res, next) => {
  if (!req.body?.hoLot || !req.body?.ten) {
    return next(new ApiError(400, "Tên độc giả không thể để trống."));
  }
  try {
    const readerService = new ReaderService(MongoDB.client);
    const document = await readerService.create(req.body);
    return res.send(document);
  } catch (error) {
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
    const readerService = new ReaderService(MongoDB.client);
    const document = await readerService.delete(req.params.id);

    if (document === null) {
      return next(new ApiError(404, "Không tìm thấy độc giả."));
    }

    return res.send({ message: "Xóa độc giả thành công." });
  } catch (error) {
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

    // Lấy tất cả phiếu mượn của độc giả
    const borrows = await borrowService.find({
      docGiaId: new ObjectId(req.params.id),
    });

    let totalCollected = 0; // tiền đã thu (Đã trả)
    let totalPending = 0; // tiền ước tính (Đang mượn)
    let countedCollected = 0;
    let countedPending = 0;

    for (const b of borrows) {
      const book = await borrowService.bookService.findById(b.bookId);
      if (!book) continue; // bỏ phiếu mượn sách không tồn tại

      // Tính số ngày mượn
      const ngayMuon = new Date(b.ngayMuon);
      const ngayTra = new Date(b.ngayTra);
      const timeDiff = ngayTra - ngayMuon;
      const days = Math.max(Math.ceil(timeDiff / (1000 * 60 * 60 * 24)), 1);

      const amount = days * (book.donGia || 0);

      if (b.trangThai === "Đã trả") {
        totalCollected += amount;
        countedCollected += 1;
      } else if (b.trangThai === "Đang mượn") {
        totalPending += amount;
        countedPending += 1;
      }
      // Các trạng thái khác như "Chờ duyệt" bỏ qua
    }

    return res.send({
      readerId: req.params.id,
      totalCollected,
      numberOfCollectedBorrows: countedCollected,
      totalPending,
      numberOfPendingBorrows: countedPending,
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
