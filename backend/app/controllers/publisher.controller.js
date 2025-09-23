const ApiError = require("../api-error");
const PublisherService = require("../services/publisher.service");
const MongoDB = require("../utils/mongodb.util");

exports.create = async (req, res, next) => {
  if (!req.body?.tenNXB) {
    return next(new ApiError(400, "Tên nhà xuất bản không thể để trống."));
  }
  try {
    const publisherService = new PublisherService(MongoDB.client);
    const document = await publisherService.create(req.body);
    return res.send(document);
  } catch (error) {
    return next(new ApiError(500, "Đã xảy ra lỗi khi tạo nhà xuất bản."));
  }
};

exports.findAll = async (_req, res, next) => {
  try {
    const publisherService = new PublisherService(MongoDB.client);
    const documents = await publisherService.find({});
    return res.send(documents);
  } catch (error) {
    return next(
      new ApiError(500, "Đã xảy ra lỗi khi lấy danh sách nhà xuất bản.")
    );
  }
};

exports.findOne = async (req, res, next) => {
  try {
    const publisherService = new PublisherService(MongoDB.client);
    const document = await publisherService.findById(req.params.id);
    if (document === null) {
      return next(new ApiError(404, "Không tìm thấy nhà xuất bản."));
    }
    return res.send(document);
  } catch (error) {
    return next(
      new ApiError(
        500,
        `Đã xảy ra lỗi khi tìm nhà xuất bản với id=${req.params.id}.`
      )
    );
  }
};

exports.update = async (req, res, next) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return next(new ApiError(400, "Dữ liệu cập nhật không được để trống."));
  }

  try {
    const publisherService = new PublisherService(MongoDB.client);
    const document = await publisherService.update(req.params.id, req.body);
    if (document === null) {
      return next(new ApiError(404, "Không tìm thấy nhà xuất bản."));
    }
    return res.send({ message: "Cập nhật nhà xuất bản thành công." });
  } catch (error) {
    return next(
      new ApiError(
        500,
        `Đã xảy ra lỗi khi cập nhật nhà xuất bản với id=${req.params.id}.`
      )
    );
  }
};

exports.delete = async (req, res, next) => {
  try {
    const publisherService = new PublisherService(MongoDB.client);
    const document = await publisherService.delete(req.params.id);

    if (document === null) {
      return next(new ApiError(404, "Không tìm thấy nhà xuất bản."));
    }

    return res.send({ message: "Xóa nhà xuất bản thành công." });
  } catch (error) {
    return next(
      new ApiError(500, `Không thể xóa nhà xuất bản với id=${req.params.id}.`)
    );
  }
};

exports.deleteAll = async (_req, res, next) => {
  try {
    const publisherService = new PublisherService(MongoDB.client);
    const deletedCount = await publisherService.deleteAll();

    return res.send({
      message: `${deletedCount} nhà xuất bản đã được xóa thành công.`,
    });
  } catch (error) {
    return next(
      new ApiError(500, "Đã xảy ra lỗi khi xóa tất cả nhà xuất bản.")
    );
  }
};
