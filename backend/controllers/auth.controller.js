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
req.session.user = {
    name: user.name,
    email: user.email,
    oid: user.oid
};
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
async function me(req, res) {

    if (!req.session.user) {
        return res.status(401).json({
            authenticated: false,
            message: "User is not authenticated"
        });
    }

    res.json({
        authenticated: true,
        user: req.session.user
    });
}


async function logout(req, res) {

    try {

        req.session.destroy((err) => {

            if (err) {
                console.error(
                    "Session destruction failed:",
                    err
                );

                return res.status(500).json({
                    message: "Logout failed"
                });
            }

            res.clearCookie("connect.sid");

            const tenantId = process.env.AZURE_TENANT_ID;

            const postLogoutRedirectUri =
                "http://localhost:5000/auth/logout/callback";

            const logoutUrl =
                `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/logout` +
                `?post_logout_redirect_uri=${encodeURIComponent(postLogoutRedirectUri)}`;

            return res.redirect(logoutUrl);
        });

    } catch (error) {

        console.error("Logout error:", error);

        return res.status(500).json({
            message: "Logout failed"
        });
    }
}
async function logoutCallback(req, res) {

    res.json({
        message: "Logout successful",
        authenticated: false
    });
}
module.exports = {
    callback,
    me,
    logout,
    logoutCallback
};