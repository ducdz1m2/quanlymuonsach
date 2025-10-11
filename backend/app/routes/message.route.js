const express = require("express");
const messages = require("../controllers/message.controller");

const router = express.Router();

router
  .route("/")
  .get(messages.findAll)
  .post(messages.create)
  .delete(messages.deleteAll);

router.route("/:id").delete(messages.delete);

router.route("/room/:room").get(messages.findByRoom);

module.exports = router;
