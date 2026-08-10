const { createRemoteJWKSet, jwtVerify } = require("jose");

async function validateIdToken(idToken, provider) {

    const JWKS = createRemoteJWKSet(
        new URL(provider.jwks_uri)
    );

    const { payload } = await jwtVerify(
        idToken,
        JWKS,
        {
            issuer: `https://login.microsoftonline.com/${provider.tenant_id}/v2.0`,
            audience: provider.client_id
        }
    );

    return payload;
}

module.exports = {
    validateIdToken
};