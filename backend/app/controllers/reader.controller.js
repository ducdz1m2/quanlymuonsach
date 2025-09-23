const ApiError = require("../api-error");
const ReaderService = require("../services/reader.service");
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
    const document = await readerService.findById(req.params.id);
    console.log(document);
    if (document === null) {
      return next(new ApiError(404, "Không tìm thấy độc giả."));
    }
    return res.send(document);
  } catch (error) {
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
