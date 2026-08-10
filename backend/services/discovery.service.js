const federationModel = require("../models/federation.model");

async function discoverIdentityProvider(application, email) {

    const domain = email.split("@")[1];

    return await federationModel.findByApplicationAndDomain(
        application,
        domain
    );
}

module.exports = {
    discoverIdentityProvider
};