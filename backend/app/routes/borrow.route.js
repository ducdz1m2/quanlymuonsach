const express = require("express");
const borrows = require("../controllers/borrow.controller");

const router = express.Router();

router.get("/details", borrows.findAllDetails);

router.get("/detail/:id", borrows.findDetail);

router
  .route("/")
  .post(borrows.create)
  .get(borrows.findAll)
  .delete(borrows.deleteAll);

router
  .route("/:id")
  .get(borrows.findOne)
  .put(borrows.update)
  .delete(borrows.delete);

module.exports = router;
