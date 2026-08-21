const fs = require("fs");
const path = require("path");
const { exportJWK, importSPKI } = require("jose");

const publicKeyPath = path.join(
    __dirname,
    "../keys/public.pem"
);

const publicKey = fs.readFileSync(
    publicKeyPath,
    "utf8"
);

async function getJWKS() {

    const key = await importSPKI(
        publicKey,
        "RS256"
    );

    const jwk = await exportJWK(key);

    jwk.kid = "connecthub-key-1";
    jwk.use = "sig";
    jwk.alg = "RS256";

    return {
        keys: [jwk]
    };
}

module.exports = {
    getJWKS
};