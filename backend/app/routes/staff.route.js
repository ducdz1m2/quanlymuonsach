const express = require("express");
const staffs = require("../controllers/staff.controller");

const router = express.Router();
router.post("/login", staffs.login);
router
  .route("/")
  .post(staffs.create)
  .get(staffs.findAll)
  .delete(staffs.deleteAll);
router
  .route("/:id")
  .get(staffs.findOne)
  .put(staffs.update)
  .delete(staffs.delete);

module.exports = router;
