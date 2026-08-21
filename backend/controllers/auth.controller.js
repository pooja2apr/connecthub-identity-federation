const tokenService = require("../services/token.service");
const idTokenService = require("../services/idToken.service");
const stateService = require("../services/state.service");
const federationModel = require("../models/federation.model");
const federationService = require("../services/federation.service");
const authorizationCodeService =
    require("../services/authorizationCode.service");
    const jwtService =
    require("../services/jwt.service");

async function authorize(req, res) {

    try {

        const {
            application,
            email,
            redirect_uri,
            state
        } = req.query;

        if (!application || !email || !redirect_uri) {
            return res.status(400).json({
                message: "application, email and redirect_uri are required"
            });
        }

        // 1. Find registered application
        const app =
            await federationModel.findApplicationByName(
                application
            );

        if (!app) {
            return res.status(404).json({
                message: "Application not found"
            });
        }

        // 2. Validate redirect URI
        if (app.redirect_uri !== redirect_uri) {

            return res.status(400).json({
                message: "Invalid redirect_uri"
            });
        }

        // 3. Find the enterprise IdP
        const result =
            await federationService.buildAuthorizationUrl(
                application,
                email,
                redirect_uri,
                state
            );

        if (!result) {
            return res.status(404).json({
                message: "Federation configuration not found."
            });
        }

        return res.redirect(result.redirectUrl);

    } catch (error) {

        console.error("Authorization error:", error);

        return res.status(500).json({
            message: "Authorization failed"
        });
    }
}
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

// Create authorization code for the client application
const authorizationCode =
    authorizationCodeService.createAuthorizationCode({

        application: stateData.application,

        redirectUri: stateData.redirectUri,

        clientState: stateData.clientState,

        user: {
            name: user.name,
            email: user.email,
            oid: user.oid
        },

        idToken: tokens.id_token,

        provider: provider.provider_name
    });

console.log(
    "Authorization code created:",
    authorizationCode
);

// Redirect user back to the application
const redirectUrl =
    `${stateData.redirectUri}` +
    `?code=${encodeURIComponent(authorizationCode)}` +
    `&state=${encodeURIComponent(stateData.clientState || "")}`;
    console.log("Redirecting application to:", redirectUrl);

return res.redirect(redirectUrl);
/*
req.session.idToken = tokens.id_token;
//console.log(tokens.id_token);
res.json({
    message: "Authentication successful",
    user: {
        name: user.name,
        email: user.email
    }
});
*/
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
async function token(req, res) {

    try {

        const {
            code,
            client_id,
            redirect_uri
        } = req.body;

        // 1. Validate required parameters
        if (!code || !client_id || !redirect_uri) {
            return res.status(400).json({
                error: "invalid_request",
                error_description:
                    "code, client_id and redirect_uri are required"
            });
        }

        console.log("Token request received");
        console.log("Client ID:", client_id);
        console.log("Redirect URI:", redirect_uri);

        // 2. Consume authorization code
        const authorizationData =
            authorizationCodeService.consumeAuthorizationCode(
                code
            );

        if (!authorizationData) {

            return res.status(400).json({
                error: "invalid_grant",
                error_description:
                    "Invalid, expired or already used authorization code"
            });
        }

        // 3. Validate client
        if (
            authorizationData.application !== client_id
        ) {

            return res.status(400).json({
                error: "invalid_grant",
                error_description:
                    "Client ID does not match authorization request"
            });
        }

        // 4. Validate redirect URI
        if (
            authorizationData.redirectUri !== redirect_uri
        ) {

            return res.status(400).json({
                error: "invalid_grant",
                error_description:
                    "Redirect URI does not match authorization request"
            });
        }

        console.log(
            "Authorization code validated successfully"
        );

        // Temporary response
        /*
        return res.json({
            message: "Authorization code exchanged successfully",
            user: authorizationData.user,
            provider: authorizationData.provider,
            hasIdToken: !!authorizationData.idToken
        });
        */
       // Create ConnectHub-issued ID token
const idToken =
    jwtService.createIdToken(
        authorizationData.user,
        client_id
    );

console.log(
    "ConnectHub ID token created."
);

return res.json({
    access_token: idToken,
    token_type: "Bearer",
    expires_in: 3600,
    id_token: idToken
});

    } catch (error) {

        console.error("Token error:", error);

        return res.status(500).json({
            error: "server_error",
            error_description:
                "Internal server error"
        });
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
    authorize,
    callback,
    token,
    me,
    logout,
    logoutCallback
};