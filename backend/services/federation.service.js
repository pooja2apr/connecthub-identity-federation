const crypto = require("crypto");
const stateService = require("./state.service");

const federationModel = require("../models/federation.model");

async function buildAuthorizationUrl(application, email) {

    const domain = email.split("@")[1];

    const provider = await federationModel.findByApplicationAndDomain(
        application,
        domain
    );

    if (!provider) {
        return null;
    }

    const stateData = {
    provider: provider.provider_name,
    createdAt: Date.now(),
    nonce: crypto.randomUUID()
};

const state = stateService.encryptState(stateData);
    const authorizationUrl =
        `${provider.authorization_endpoint}` +
        `?client_id=${provider.client_id}` +
        `&response_type=code` +
        `&redirect_uri=${encodeURIComponent(provider.redirect_uri)}` +
        `&response_mode=query` +
        `&scope=${encodeURIComponent(provider.scope)}` +
        `&state=${state}`;

    return {
        organization: provider.organization_name,
        redirectUrl: authorizationUrl,
        provider: provider.provider_name
    };
}

module.exports = {
    buildAuthorizationUrl
};