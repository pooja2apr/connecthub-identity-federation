const crypto = require("crypto");

const ALGORITHM = "aes-256-gcm";

const KEY = Buffer.from(
    process.env.STATE_ENCRYPTION_KEY,
    "hex"
);

if (KEY.length !== 32) {
    throw new Error(
        "STATE_ENCRYPTION_KEY must be exactly 32 bytes."
    );
}

function encryptState(data) {

    const iv = crypto.randomBytes(12);

    const cipher = crypto.createCipheriv(
        ALGORITHM,
        KEY,
        iv
    );

    const plaintext = JSON.stringify(data);

    const encrypted = Buffer.concat([
        cipher.update(plaintext, "utf8"),
        cipher.final()
    ]);

    const authTag = cipher.getAuthTag();

    return [
        iv.toString("base64url"),
        authTag.toString("base64url"),
        encrypted.toString("base64url")
    ].join(".");
}


function decryptState(state) {

    const parts = state.split(".");

    if (parts.length !== 3) {
        throw new Error("Invalid state format.");
    }

    const iv = Buffer.from(parts[0], "base64url");
    const authTag = Buffer.from(parts[1], "base64url");
    const encrypted = Buffer.from(parts[2], "base64url");

    const decipher = crypto.createDecipheriv(
        ALGORITHM,
        KEY,
        iv
    );

    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
        decipher.update(encrypted),
        decipher.final()
    ]);

    return JSON.parse(
        decrypted.toString("utf8")
    );
}


module.exports = {
    encryptState,
    decryptState
};