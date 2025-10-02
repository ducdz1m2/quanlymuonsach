const express = require("express");
const borrows = require("../controllers/borrow.controller");

const router = express.Router();

// ✅ Lấy danh sách có join bookInfo & docGiaInfo
router.get("/details", borrows.findAllDetails);

// ✅ Lấy chi tiết 1 phiếu mượn theo id (có join)
router.get("/detail/:id", borrows.findDetail);

// CRUD cơ bản
router
  .route("/")
  .post(borrows.create) // Tạo mới phiếu mượn
  .get(borrows.findAll) // Lấy danh sách (chỉ id thô, không join)
  .delete(borrows.deleteAll); // Xóa toàn bộ phiếu mượn

router
  .route("/:id")
  .get(borrows.findOne) // Lấy 1 phiếu mượn (id thô)
  .put(borrows.update) // Cập nhật phiếu mượn
  .delete(borrows.delete); // Xóa phiếu mượn theo id

module.exports = router;
