const federationService = require("../services/federation.service");

async function discover(req, res) {

    try {

        const { application, email } = req.body;

        if (!application || !email) {
            return res.status(400).json({
                message: "Application and email are required"
            });
        }

        const result =
            await federationService.buildAuthorizationUrl(
                application,
                email
            );

        if (!result) {
            return res.status(404).json({
                message: "Federation configuration not found."
            });
        }

        res.json(result);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Internal Server Error"
        });

    }

}

module.exports = {
    discover
};