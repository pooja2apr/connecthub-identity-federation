const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");

const privateKeyPath = path.join(
    __dirname,
    "../keys/private.pem"
);

const publicKeyPath = path.join(
    __dirname,
    "../keys/public.pem"
);

const privateKey = fs.readFileSync(
    privateKeyPath,
    "utf8"
);

const publicKey = fs.readFileSync(
    publicKeyPath,
    "utf8"
);

function createIdToken(user, clientId) {

    const now = Math.floor(Date.now() / 1000);

    const payload = {
        iss: "http://localhost:5000",
        sub: user.email,
        aud: clientId,

        name: user.name,
        email: user.email,

        iat: now,
        exp: now + 3600
    };

    return jwt.sign(
        payload,
        privateKey,
        {
            algorithm: "RS256",
            keyid: "connecthub-key-1"
        }
    );
}

function getPrivateKey() {
    return privateKey;
}

function getPublicKey() {
    return publicKey;
}

module.exports = {
    createIdToken,
    getPrivateKey,
    getPublicKey
};