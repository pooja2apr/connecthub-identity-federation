const axios = require("axios");

async function exchangeCodeForTokens(code, provider) {

    const params = new URLSearchParams();

    params.append("client_id", provider.client_id);
    params.append("client_secret", process.env.AZURE_CLIENT_SECRET);
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