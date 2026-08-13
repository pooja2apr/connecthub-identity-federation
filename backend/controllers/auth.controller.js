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
req.session.provider = provider.provider_name;
console.log(provider.provider_name);

req.session.idToken = tokens.id_token;
//console.log(tokens.id_token);
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
    console.log(
        "Session provider:",
        req.session.provider
    );

    console.log(
        "Has ID token:",
        !!req.session.idToken
    );

    console.log(
        "ID token length:",
        req.session.idToken
            ? req.session.idToken.length
            : 0
    );


    try {

        const providerName = req.session.provider;

        if (!providerName) {
            return res.status(400).json({
                message: "Identity provider not found in session"
            });
        }

        const provider =
            await federationModel.findByProviderName(providerName);

        if (!provider) {
            return res.status(404).json({
                message: "Identity provider configuration not found"
            });
        }

        const postLogoutRedirectUri =
            "http://localhost:5000/auth/logout/callback";

        let logoutUrl;

        if (provider.provider_name === "Microsoft Entra ID") {

            const tenantId = provider.tenant_id;

            logoutUrl =
                `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/logout` +
                `?post_logout_redirect_uri=${encodeURIComponent(
                    postLogoutRedirectUri
                )}`;

        } else if (provider.provider_name === "Keycloak") {

            logoutUrl =
                `${provider.issuer}/protocol/openid-connect/logout` +
                `?client_id=${encodeURIComponent(provider.client_id)}` +
                `&post_logout_redirect_uri=${encodeURIComponent(
                    postLogoutRedirectUri
                )}`;

        } else if (provider.provider_name === "Okta") {

    const idToken = req.session.idToken;

console.log("Logout provider:", provider.provider_name);
console.log("Has ID token:", !!idToken);
console.log(
    "ID token length:",
    idToken ? idToken.length : 0
);

    logoutUrl =
        `${provider.issuer}/v1/logout` +
        `?id_token_hint=${encodeURIComponent(idToken)}` +
        `&post_logout_redirect_uri=${encodeURIComponent(
            postLogoutRedirectUri
        )}`;
}
        else {

            return res.status(400).json({
                message: "Logout not supported for this provider"
            });
        }

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