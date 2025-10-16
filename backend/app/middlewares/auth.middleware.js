const jwt = require("jsonwebtoken");
const ApiError = require("../api-error");
require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET;

exports.generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
};
exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log("🧩 Header nhận được:", authHeader);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new ApiError(403, "Thiếu token truy cập!"));
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("✅ Token decode:", decoded);
    req.user = decoded;
    next();
  } catch (err) {
    console.log("❌ Token lỗi:", err.message);
    return next(new ApiError(403, "Token không hợp lệ hoặc đã hết hạn!"));
  }
};

exports.authorize = (roles = []) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, "Không có quyền truy cập!"));
    }
    next();
  };
};
