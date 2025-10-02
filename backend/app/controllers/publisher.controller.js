const ApiError = require("../api-error");
const PublisherService = require("../services/publisher.service");
const MongoDB = require("../utils/mongodb.util");
const BookService = require("../services/book.service"); // cần có
const { ObjectId } = require("mongodb");

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
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return next(new ApiError(400, "ID nhà xuất bản không hợp lệ."));
    }

    const publisherId = new ObjectId(id);
    const publisherService = new PublisherService(MongoDB.client);
    const bookService = new BookService(MongoDB.client);

    const publisher = await publisherService.findById(publisherId);
    if (!publisher) {
      return next(new ApiError(404, "Không tìm thấy nhà xuất bản."));
    }

    const books = await bookService.find({ maNXB: publisherId });
    if (books.length > 0) {
      return next(
        new ApiError(
          400,
          "Không thể xóa nhà xuất bản vì vẫn còn sách liên quan."
        )
      );
    }

    await publisherService.delete(publisherId);
    return res.send({ message: "Xóa nhà xuất bản thành công." });
  } catch (error) {
    console.error("Lỗi xóa NXB:", error);
    return next(new ApiError(500, "Đã xảy ra lỗi khi xóa nhà xuất bản."));
  }
};
exports.deleteAll = async (_req, res) => {
  try {
    const publisherService = new PublisherService(MongoDB.client);
    const bookService = new BookService(MongoDB.client);

    const allPublishers = await publisherService.find({});

    for (const publisher of allPublishers) {
      const books = await bookService.find({ maNXB: publisher._id });
      if (books.length > 0) continue; // Bỏ qua NXB còn sách
      await publisherService.delete(publisher._id); // Xóa NXB
    }

    return res.sendStatus(200); // Xong tất cả
  } catch (error) {
    console.error("Lỗi xóa tất cả NXB:", error);
    return res.sendStatus(200);
  }
};
