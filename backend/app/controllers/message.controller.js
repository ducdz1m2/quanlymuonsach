const ApiError = require("../api-error");
const MessageService = require("../services/message.service");
const MongoDB = require("../utils/mongodb.util");
const { ObjectId } = require("mongodb");

exports.create = async (req, res, next) => {
  try {
    if (!req.body?.text) {
      return next(new ApiError(400, "Tin nhắn không được để trống."));
    }

    const messageService = new MessageService(MongoDB.client);
    const document = await messageService.create(req.body);
    return res.send(document);
  } catch (error) {
    console.error("Lỗi khi tạo tin nhắn:", error);
    return next(new ApiError(500, "Đã xảy ra lỗi khi tạo tin nhắn."));
  }
};

exports.findAll = async (_req, res, next) => {
  try {
    const messageService = new MessageService(MongoDB.client);
    const documents = await messageService.find({});
    return res.send(documents);
  } catch (error) {
    return next(new ApiError(500, "Không thể lấy danh sách tin nhắn."));
  }
};

exports.findByRoom = async (req, res, next) => {
  try {
    const { room } = req.params;
    const messageService = new MessageService(MongoDB.client);
    const documents = await messageService.find({ room });
    return res.send(documents);
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi lấy tin nhắn theo phòng."));
  }
};

exports.delete = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return next(new ApiError(400, "ID tin nhắn không hợp lệ."));
    }

    const messageService = new MessageService(MongoDB.client);
    const document = await messageService.delete(id);

    if (!document) {
      return next(new ApiError(404, "Không tìm thấy tin nhắn."));
    }

    return res.send({ message: "Xóa tin nhắn thành công." });
  } catch (error) {
    console.error("Lỗi khi xóa tin nhắn:", error);
    return next(new ApiError(500, "Đã xảy ra lỗi khi xóa tin nhắn."));
  }
};

exports.deleteAll = async (_req, res, next) => {
  try {
    const messageService = new MessageService(MongoDB.client);
    const count = await messageService.deleteAll();
    return res.send({ message: `Đã xóa ${count} tin nhắn.` });
  } catch (error) {
    return next(new ApiError(500, "Đã xảy ra lỗi khi xóa tất cả tin nhắn."));
  }
};
