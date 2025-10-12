const express = require("express");
const cors = require("cors");
const ApiError = require("./app/api-error");
const { verifyToken, authorize } = require("./app/middlewares/auth.middleware");

// Import routers
const bookRouter = require("./app/routes/book.route");
const borrowRouter = require("./app/routes/borrow.route");
const readerRouter = require("./app/routes/reader.route");
const publisherRouter = require("./app/routes/publisher.route");
const staffRouter = require("./app/routes/staff.route");
const messageRouter = require("./app/routes/message.route");

// Import controller riêng cho login staff
const staffController = require("./app/controllers/staff.controller");

const app = express();

// Middleware
app.use(
  cors({
    origin: ["http://localhost:3001", "http://localhost:3002"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"], // ✅ Cho phép gửi Authorization header
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// 🌐 Public routes (không cần token)
app.get("/", (req, res) => {
  res.json({ message: "Chào mừng đến với hệ thống mượn sách!" });
});

// Cho phép đăng nhập / đăng ký không cần token
app.post("/api/staffs/login", staffController.login);
app.post(
  "/api/readers/login",
  require("./app/controllers/reader.controller").login
);
app.post("/api/readers", require("./app/controllers/reader.controller").create);
app.use("/api/books", bookRouter);
// 🧱 Các route còn lại đều cần token
app.use(verifyToken);

// Sau đây là các route cần xác thực JWT

app.use("/api/borrows", borrowRouter);
app.use("/api/publishers", publisherRouter);
app.use("/api/messages", messageRouter);
app.use("/api/readers", readerRouter); // các route reader khác sau khi đăng nhập
app.use("/api/staffs", authorize(["staff"]), staffRouter); // chỉ staff được phép

// ❌ Error handling
app.use((req, res, next) => {
  return next(new ApiError(404, "Không tìm thấy tài nguyên!"));
});

app.use((err, req, res, next) => {
  return res.status(err.statusCode || 500).json({
    message: err.message || "Lỗi bên trong server!",
  });
});

module.exports = app;
