function getConfiguration() {

    const issuer =
        process.env.CONNECTHUB_ISSUER ||
        "http://localhost:5000";

    return {
        issuer: issuer,

        authorization_endpoint:
            `${issuer}/auth/authorize`,

        token_endpoint:
            `${issuer}/auth/token`,

        jwks_uri:
            `${issuer}/.well-known/jwks.json`,

        response_types_supported: [
            "code"
        ],

        response_modes_supported: [
            "query"
        ],

        grant_types_supported: [
            "authorization_code"
        ],

        subject_types_supported: [
            "public"
        ],

        id_token_signing_alg_values_supported: [
            "RS256"
        ],

        scopes_supported: [
            "openid",
            "profile",
            "email"
        ],

        claims_supported: [
            "iss",
            "sub",
            "aud",
            "iat",
            "exp",
            "name",
            "email"
        ]
    };
}

module.exports = {
    getConfiguration
};