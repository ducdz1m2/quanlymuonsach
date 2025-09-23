const express = require("express");
const publishers = require("../controllers/publisher.controller");

const router = express.Router();

router
  .route("/")
  .post(publishers.create)
  .get(publishers.findAll)
  .delete(publishers.deleteAll);
router
  .route("/:id")
  .get(publishers.findOne)
  .put(publishers.update)
  .delete(publishers.delete);

module.exports = router;
