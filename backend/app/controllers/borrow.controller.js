const ApiError = require("../api-error");
const BorrowService = require("../services/borrow.service");
const MongoDB = require("../utils/mongodb.util");

exports.create = async (req, res, next) => {
  if (!req.body?.bookId || !req.body?.docGiaId) {
    return next(
      new ApiError(400, "Thông tin sách và độc giả không thể để trống.")
    );
  }
  try {
    const borrowService = new BorrowService(MongoDB.client);
    const document = await borrowService.create(req.body);
    return res.send(document);
  } catch (error) {
    return next(new ApiError(500, "Đã xảy ra lỗi khi tạo phiếu mượn sách."));
  }
};

exports.findAll = async (_req, res, next) => {
  try {
    const borrowService = new BorrowService(MongoDB.client);
    const documents = await borrowService.find({});
    return res.send(documents);
  } catch (error) {
    return next(
      new ApiError(500, "Đã xảy ra lỗi khi lấy danh sách phiếu mượn.")
    );
  }
};

exports.findOne = async (req, res, next) => {
  try {
    const borrowService = new BorrowService(MongoDB.client);
    const document = await borrowService.findById(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy phiếu mượn."));
    }
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

exports.update = async (req, res, next) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return next(new ApiError(400, "Dữ liệu cập nhật không được để trống."));
  }

  try {
    const borrowService = new BorrowService(MongoDB.client);
    const document = await borrowService.update(req.params.id, req.body);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy phiếu mượn."));
    }
    return res.send({ message: "Cập nhật phiếu mượn thành công." });
  } catch (error) {
    return next(
      new ApiError(
        500,
        `Đã xảy ra lỗi khi cập nhật phiếu mượn với id=${req.params.id}.`
      )
    );
  }
};

exports.delete = async (req, res, next) => {
  try {
    const borrowService = new BorrowService(MongoDB.client);
    const document = await borrowService.delete(req.params.id);

    if (!document) {
      return next(new ApiError(404, "Không tìm thấy phiếu mượn."));
    }

    return res.send({ message: "Xóa phiếu mượn thành công." });
  } catch (error) {
    return next(
      new ApiError(500, `Không thể xóa phiếu mượn với id=${req.params.id}.`)
    );
  }
};

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
exports.findAllDetail = async (_req, res, next) => {
  try {
    const borrowService = new BorrowService(MongoDB.client);
    const documents = await borrowService.findAllWithDetail();
    return res.send(documents);
  } catch (error) {
    return next(
      new ApiError(
        500,
        "Đã xảy ra lỗi khi lấy danh sách phiếu mượn (chi tiết)."
      )
    );
  }
};
