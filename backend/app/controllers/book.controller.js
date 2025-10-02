const ApiError = require("../api-error");
const BookService = require("../services/book.service");
const MongoDB = require("../utils/mongodb.util");
const PublisherService = require("../services/publisher.service");
exports.create = async (req, res, next) => {
  if (!req.body?.tenSach) {
    return next(new ApiError(400, "Tên sách không thể để trống."));
  }
  try {
    const bookService = new BookService(MongoDB.client);
    const document = await bookService.create(req.body);
    return res.send(document);
  } catch (error) {
    return next(new ApiError(500, "Đã xảy ra lỗi khi tạo sách."));
  }
};
exports.findAll = async (req, res, next) => {
  try {
    const bookService = new BookService(MongoDB.client);
    const publisherService = new PublisherService(MongoDB.client);

    const { tenSach } = req.query;
    let books;

    if (tenSach) {
      books = await bookService.findByName(tenSach);
    } else {
      books = await bookService.find({});
    }

    // Lấy tất cả NXB để map
    const publishers = await publisherService.find({});

    const booksWithPublisher = books.map((book) => {
      const publisher = publishers.find(
        (p) => p._id.toString() === book.maNXB?.toString()
      );
      return {
        ...book,
        tenNXB: publisher ? publisher.tenNXB : "Không xác định",
      };
    });

    return res.send(booksWithPublisher);
  } catch (error) {
    return next(new ApiError(500, "Đã xảy ra lỗi khi tìm kiếm sách."));
  }
};

exports.findOne = async (req, res, next) => {
  try {
    const bookService = new BookService(MongoDB.client);
    const publisherService = new PublisherService(MongoDB.client);

    const book = await bookService.findById(req.params.id);
    if (!book) return next(new ApiError(404, "Không tìm thấy sách."));

    const publisher = await publisherService.findById(book.maNXB);

    const bookWithPublisher = {
      ...book,
      tenNXB: publisher ? publisher.tenNXB : "Không xác định",
    };

    return res.send(bookWithPublisher);
  } catch (error) {
    return next(
      new ApiError(500, `Đã xảy ra lỗi khi tìm sách với id=${req.params.id}.`)
    );
  }
};

exports.update = async (req, res, next) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return next(new ApiError(400, "Dữ liệu cập nhật không được để trống."));
  }

  try {
    const bookService = new BookService(MongoDB.client);
    const document = await bookService.update(req.params.id, req.body);
    if (document === null) {
      return next(new ApiError(404, "Không tìm thấy sách."));
    }
    return res.send({ message: "Cập nhật sách thành công." });
  } catch (error) {
    return next(
      new ApiError(
        500,
        `Đã xảy ra lỗi khi cập nhật sách với id=${req.params.id}.`
      )
    );
  }
};

exports.delete = async (req, res, next) => {
  try {
    const bookService = new BookService(MongoDB.client);
    const document = await bookService.delete(req.params.id);

    if (document === null) {
      return next(new ApiError(404, "Không tìm thấy sách."));
    }

    return res.send({ message: "Xóa sách thành công." });
  } catch (error) {
    return next(
      new ApiError(500, `Không thể xóa sách với id=${req.params.id}.`)
    );
  }
};

exports.deleteAll = async (_req, res, next) => {
  try {
    const bookService = new BookService(MongoDB.client);
    const deletedCount = await bookService.deleteAll();

    return res.send({
      message: `${deletedCount} sách đã được xóa thành công.`,
    });
  } catch (error) {
    return next(new ApiError(500, "Đã xảy ra lỗi khi xóa tất cả sách."));
  }
};
