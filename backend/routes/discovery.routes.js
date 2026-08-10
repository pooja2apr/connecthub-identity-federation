const express = require("express");

const router = express.Router();

const discoveryController = require("../controllers/discovery.controller");

router.post("/discover", discoveryController.discover);

module.exports = router;