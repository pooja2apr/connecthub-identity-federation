const { createRemoteJWKSet, jwtVerify } = require("jose");

async function validateIdToken(idToken, provider) {

    const JWKS = createRemoteJWKSet(
        new URL(provider.jwks_uri)
    );

    const { payload } = await jwtVerify(
        idToken,
        JWKS,
        {
            issuer: provider.issuer,
            audience: provider.client_id
        }
    );

    return payload;
}

module.exports = {
    validateIdToken
};