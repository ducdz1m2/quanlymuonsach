const ApiError = require("../api-error");
const BookService = require("../services/book.service");
const MongoDB = require("../utils/mongodb.util");

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
    let documents;
    try {
        const bookService = new BookService(MongoDB.client);
        const { tenSach } = req.query;
        if (tenSach) {
            documents = await bookService.findByName(tenSach);
        } else {
            documents = await bookService.find({});
        }
    } catch (error) {
        return next(new ApiError(500, "Đã xảy ra lỗi khi tìm kiếm sách."));
    }
    return res.send(documents);
};

exports.findOne = async (req, res, next) => {
    try {
        const bookService = new BookService(MongoDB.client);
        const document = await bookService.findById(req.params.id);
        if (!document) {
            return next(new ApiError(404, "Không tìm thấy sách."));
        }
        return res.send(document);
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
        if (!document) {
            return next(new ApiError(404, "Không tìm thấy sách."));
        }
        return res.send({ message: "Cập nhật sách thành công." });
    } catch (error) {
        return next(
            new ApiError(500, `Đã xảy ra lỗi khi cập nhật sách với id=${req.params.id}.`)
        );
    }
};

exports.delete = async (req, res, next) => {
    try {
        const bookService = new BookService(MongoDB.client);
        const document = await bookService.delete(req.params.id);

        if (!document) {
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
        return next(
            new ApiError(500, "Đã xảy ra lỗi khi xóa tất cả sách.")
        );
    }
};

