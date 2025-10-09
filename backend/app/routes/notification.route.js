const express = require("express");
const notifications = require("../controllers/notification.controller");

const router = express.Router();

// Gửi thông báo
router.route("/").post(notifications.create);

// Lấy thông báo cho user cụ thể
router.route("/receiver/:receiver_id").get(notifications.findByReceiver);

// Đánh dấu là đã đọc
router.route("/:id/read").patch(notifications.markAsRead);

module.exports = router;
