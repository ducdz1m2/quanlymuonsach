const ApiError = require("../api-error");
const BorrowService = require("../services/borrow.service");
const MongoDB = require("../utils/mongodb.util");

// Tạo phiếu mượn
exports.create = async (req, res, next) => {
  if (!req.body?.bookId || !req.body?.docGiaId) {
    return next(
      new ApiError(400, "Thông tin sách và độc giả không thể để trống.")
    );
  }

  try {
    const borrowService = new BorrowService(MongoDB.client);
    await borrowService.markOverdueBorrows();

    const document = await borrowService.create(req.body);
    return res.send(document);
  } catch (error) {
    console.error(error);
    return next(
      error instanceof ApiError
        ? error
        : new ApiError(500, "Đã xảy ra lỗi khi tạo phiếu mượn sách.")
    );
  }
};

// Lấy danh sách phiếu mượn
exports.findAll = async (_req, res, next) => {
  try {
    const borrowService = new BorrowService(MongoDB.client);
    await borrowService.markOverdueBorrows();
    const documents = await borrowService.find({});
    return res.send(documents);
  } catch (error) {
    return next(
      new ApiError(500, "Đã xảy ra lỗi khi lấy danh sách phiếu mượn.")
    );
  }
};

// Lấy chi tiết phiếu mượn theo id
exports.findOne = async (req, res, next) => {
  try {
    const borrowService = new BorrowService(MongoDB.client);
    await borrowService.markOverdueBorrows();

    const document = await borrowService.findDetailById(req.params.id);

    if (document === null)
      return next(new ApiError(404, "Không tìm thấy phiếu mượn."));
    return res.send(document);
  } catch (error) {
    return next(
      new ApiError(
        500,
        `Đã xảy ra lỗi khi tìm phiếu mượn với id=${req.params.id}.`
      )
    );
  }
};

// Cập nhật phiếu mượn
exports.update = async (req, res, next) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return next(new ApiError(400, "Dữ liệu cập nhật không được để trống."));
  }

  try {
    const borrowService = new BorrowService(MongoDB.client);
    await borrowService.markOverdueBorrows();

    const document = await borrowService.update(req.params.id, req.body);
    if (document === null)
      return next(new ApiError(404, "Không tìm thấy phiếu mượn."));
    return res.send({
      message: "Cập nhật phiếu mượn thành công.",
      data: document,
    });
  } catch (error) {
    return next(
      new ApiError(
        500,
        `Đã xảy ra lỗi khi cập nhật phiếu mượn với id=${req.params.id}.`
      )
    );
  }
};

// Xóa phiếu mượn theo id
exports.delete = async (req, res, next) => {
  try {
    const borrowService = new BorrowService(MongoDB.client);
    const document = await borrowService.delete(req.params.id);

    if (document === null) {
      return next(new ApiError(404, "Không tìm thấy phiếu mượn."));
    }

    return res.send({ message: "Xóa phiếu mượn thành công." });
  } catch (error) {
    if (error instanceof ApiError) {
      return next(error); // giữ nguyên code & message từ service
    }
    return next(new ApiError(500, "Không thể xóa phiếu mượn"));
  }
};

// Xóa tất cả phiếu mượn
exports.deleteAll = async (_req, res, next) => {
  try {
    const borrowService = new BorrowService(MongoDB.client);
    const deletedCount = await borrowService.deleteAll();
    return res.send({
      message: `${deletedCount} phiếu mượn đã được xóa thành công.`,
    });
  } catch (error) {
    return next(new ApiError(500, "Đã xảy ra lỗi khi xóa tất cả phiếu mượn."));
  }
};

// Lấy chi tiết phiếu mượn
exports.findDetail = async (req, res, next) => {
  try {
    const borrowService = new BorrowService(MongoDB.client);
    await borrowService.markOverdueBorrows();

    const document = await borrowService.findDetailById(req.params.id);
    if (document === null)
      return next(new ApiError(404, "Không tìm thấy phiếu mượn."));
    return res.send(document);
  } catch (error) {
    return next(
      new ApiError(500, `Lỗi khi lấy chi tiết phiếu mượn id=${req.params.id}`)
    );
  }
};

// Lấy danh sách chi tiết phiếu mượn
exports.findAllDetails = async (_req, res, next) => {
  try {
    const borrowService = new BorrowService(MongoDB.client);
    await borrowService.markOverdueBorrows();

    const documents = await borrowService.findAllDetails();
    return res.send(documents);
  } catch (error) {
    return next(
      new ApiError(500, "Lỗi khi lấy danh sách phiếu mượn có chi tiết")
    );
  }
};
