const db = require("../config/db");

async function findByApplicationAndDomain(applicationName, emailDomain) {

    const query = `
        SELECT

            a.application_name,

            fm.organization_name,

            fm.email_domain,

            ip.provider_name,

            ip.protocol,

            ip.client_id,

            ip.tenant_id,

            ip.authorization_endpoint,

            ip.token_endpoint,

            ip.jwks_uri,

            ip.redirect_uri,

            ip.scope

        FROM applications a

        INNER JOIN federation_mapping fm
            ON a.id = fm.application_id

        INNER JOIN identity_providers ip
            ON fm.identity_provider_id = ip.id

        WHERE

            a.application_name = ?

        AND

            fm.email_domain = ?
    `;

    const [rows] = await db.execute(query, [
        applicationName,
        emailDomain
    ]);

    return rows[0];
}

async function findByProviderName(providerName) {

    const query = `
        SELECT
            provider_name,
            protocol,
            client_id,
            tenant_id,
            authorization_endpoint,
            token_endpoint,
            jwks_uri,
            redirect_uri,
            scope,
            issuer
        FROM identity_providers
        WHERE provider_name = ?
    `;

    const [rows] = await db.execute(query, [
        providerName
    ]);

    return rows[0];
}

module.exports = {
    findByApplicationAndDomain,
    findByProviderName
};