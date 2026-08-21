const express = require("express");

const router = express.Router();

const discoveryService =
    require("../services/oidcDiscovery.service");

router.get(
    "/.well-known/openid-configuration",
    (req, res) => {

        const configuration =
            discoveryService.getConfiguration();

        res.json(configuration);
    }
);

module.exports = router;