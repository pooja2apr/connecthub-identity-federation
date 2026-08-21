const axios = require("axios");
function getClientSecret(provider) {
    if (!provider.client_secret_key) {
        throw new Error(
            `Client secret key not configured for provider: ${provider.provider_name}`
        );
    }

    const clientSecret = process.env[provider.client_secret_key];

    if (!clientSecret) {
        throw new Error(
            `Client secret not found in environment variable: ${provider.client_secret_key}`
        );
    }

    return clientSecret;
}

async function exchangeCodeForTokens(code, provider) {

    const params = new URLSearchParams();
    const clientSecret = getClientSecret(provider);
    console.log(
        "Provider:",
        provider.provider_name,
        "Client ID:",
        provider.client_id,
        "Has secret:",
        !!clientSecret
    );
    params.append("client_id", provider.client_id);
    params.append("client_secret", clientSecret);
    params.append("code", code);
    params.append("redirect_uri", provider.redirect_uri);
    params.append("grant_type", "authorization_code");

    const response = await axios.post(
        provider.token_endpoint,
        params.toString(),
        {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        }
    );

    return response.data;
}

module.exports = {
    exchangeCodeForTokens
};