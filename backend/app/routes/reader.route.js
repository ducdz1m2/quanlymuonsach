const express = require("express");
const readers = require("../controllers/reader.controller");

const router = express.Router();

router.route("/login").post(readers.login);
router
  .route("/")
  .post(readers.create)
  .get(readers.findAll)
  .delete(readers.deleteAll);
router
  .route("/:id")
  .get(readers.findOne)
  .put(readers.update)
  .delete(readers.delete);
router.route("/:id/payment").get(readers.calculatePayment);

module.exports = router;
