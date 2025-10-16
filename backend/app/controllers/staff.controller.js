const ApiError = require("../api-error");
const StaffService = require("../services/staff.service");
const MongoDB = require("../utils/mongodb.util");
const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.JWT_SECRET || "library_secret";

//Đăng nhập nhân viên
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const staffService = new StaffService(MongoDB.client);

    const staff = await staffService.login(email, password);
    if (!staff) {
      return res
        .status(401)
        .json({ message: "Email hoặc mật khẩu không đúng." });
    }

    // Tạo JWT token
    const token = jwt.sign({ id: staff._id, role: "staff" }, SECRET_KEY, {
      expiresIn: "1d",
    });

    return res.json({
      message: "Đăng nhập thành công",
      staff,
      token,
    });
  } catch (error) {
    return next(new ApiError(500, "Đã xảy ra lỗi khi đăng nhập nhân viên."));
  }
};

//Tạo nhân viên mới
exports.create = async (req, res, next) => {
  if (!req.body?.hoTenNV) {
    return next(new ApiError(400, "Tên nhân viên không thể để trống."));
  }
  try {
    const staffService = new StaffService(MongoDB.client);
    const document = await staffService.create(req.body);
    return res.send(document);
  } catch (error) {
    return next(new ApiError(500, "Đã xảy ra lỗi khi tạo nhân viên."));
  }
};

//Lấy danh sách nhân viên
exports.findAll = async (_req, res, next) => {
  try {
    const staffService = new StaffService(MongoDB.client);
    const documents = await staffService.find({});
    return res.send(documents);
  } catch (error) {
    return next(
      new ApiError(500, "Đã xảy ra lỗi khi lấy danh sách nhân viên.")
    );
  }
};

//Tìm theo ID
exports.findOne = async (req, res, next) => {
  try {
    const staffService = new StaffService(MongoDB.client);
    const document = await staffService.findById(req.params.id);
    if (document === null) {
      return next(new ApiError(404, "Không tìm thấy nhân viên."));
    }
    return res.send(document);
  } catch (error) {
    return next(
      new ApiError(
        500,
        `Đã xảy ra lỗi khi tìm nhân viên với id=${req.params.id}.`
      )
    );
  }
};

//Cập nhật nhân viên
exports.update = async (req, res, next) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return next(new ApiError(400, "Dữ liệu cập nhật không được để trống."));
  }
  try {
    const staffService = new StaffService(MongoDB.client);
    const document = await staffService.update(req.params.id, req.body);
    if (document === null) {
      return next(new ApiError(404, "Không tìm thấy nhân viên."));
    }
    return res.send({ message: "Cập nhật nhân viên thành công." });
  } catch (error) {
    return next(
      new ApiError(
        500,
        `Đã xảy ra lỗi khi cập nhật nhân viên với id=${req.params.id}.`
      )
    );
  }
};

//Xóa 1 nhân viên
exports.delete = async (req, res, next) => {
  try {
    const staffService = new StaffService(MongoDB.client);
    const document = await staffService.delete(req.params.id);
    if (document === null) {
      return next(new ApiError(404, "Không tìm thấy nhân viên."));
    }
    return res.send({ message: "Xóa nhân viên thành công." });
  } catch (error) {
    return next(
      new ApiError(500, `Không thể xóa nhân viên với id=${req.params.id}.`)
    );
  }
};

//Xóa tất cả nhân viên
exports.deleteAll = async (_req, res, next) => {
  try {
    const staffService = new StaffService(MongoDB.client);
    const deletedCount = await staffService.deleteAll();
    return res.send({
      message: `${deletedCount} nhân viên đã được xóa thành công.`,
    });
  } catch (error) {
    return next(new ApiError(500, "Đã xảy ra lỗi khi xóa tất cả nhân viên."));
  }
};
