const express = require("express");
const router = express.Router();
const UserController = require("./user.controller");

router.post("/signup", UserController.register);
router.post("/signin", UserController.login);
router.post("/forgot-password", UserController.forgotPass);
router.post("/reset-password/:token", UserController.resetPass);

module.exports = router;
