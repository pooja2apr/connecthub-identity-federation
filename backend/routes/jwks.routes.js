const express = require("express");

const router = express.Router();

const jwksService =
    require("../services/jwks.service");

router.get("/.well-known/jwks.json", async (req, res) => {

    try {

        const jwks =
            await jwksService.getJWKS();

        res.json(jwks);

    } catch (error) {

        console.error(
            "JWKS error:",
            error
        );

        res.status(500).json({
            message: "Unable to generate JWKS"
        });
    }
});

module.exports = router;