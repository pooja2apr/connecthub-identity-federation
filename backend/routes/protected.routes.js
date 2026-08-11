const express = require("express");
const router = express.Router();

const {
    requireAuthentication
} = require("../middleware/auth.middleware");

router.get("/dashboard", requireAuthentication, (req, res) => {

    res.json({
        message: "Welcome to ConnectHub",
        user: req.session.user
    });

});

module.exports = router;