const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");


router.get("/callback", authController.callback);
router.get("/me", authController.me);
router.get("/logout", authController.logout);
router.get("/logout/callback", authController.logoutCallback);

module.exports = router;