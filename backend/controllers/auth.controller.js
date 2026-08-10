const tokenService = require("../services/token.service");
const idTokenService = require("../services/idToken.service");
const stateService = require("../services/state.service");
const federationModel = require("../models/federation.model");
async function callback(req, res) {

    try {

        const { code, state } = req.query;

        if (!code || !state) {
            return res.status(400).send(
                "Authorization code or state missing."
            );
        }

        // 1. Decrypt the state
        const stateData =
            stateService.decryptState(state);

        console.log("State data:", stateData);

        // 2. Get provider from database
        const provider =
            await federationModel.findByProviderName(
                stateData.provider
            );

        if (!provider) {
            return res.status(400).send(
                "Identity provider not found."
            );
        }

        // 3. Exchange authorization code for tokens
        const tokens =
            await tokenService.exchangeCodeForTokens(
                code,
                provider
            );

        console.log("Token response received.");

        const user =
    await idTokenService.validateIdToken(
        tokens.id_token,
        provider
    );

console.log("ID token validated successfully.");

console.log("User:", {
    name: user.name,
    email: user.email,
    oid: user.oid
});
res.json({
    message: "Authentication successful",
    user: {
        name: user.name,
        email: user.email
    }
});

        // TEMPORARY: testing only
        /*
        res.json({
            message: "Authorization code exchanged successfully",
            token_type: tokens.token_type,
            expires_in: tokens.expires_in,
            has_access_token: !!tokens.access_token,
            has_id_token: !!tokens.id_token
        });
*/
    } catch (error) {

        console.error(
            "Token exchange failed:",
            error.response?.data || error.message
        );

        res.status(500).send(
            "Authentication failed."
        );
    }
}

module.exports = {
    callback
};