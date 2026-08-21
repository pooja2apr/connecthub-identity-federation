const crypto = require("crypto");

const authorizationCodes = new Map();

function createAuthorizationCode(data) {

    const code = crypto.randomBytes(32).toString("hex");

    const expiresAt = Date.now() + (60 * 1000); // 60 seconds

    authorizationCodes.set(code, {
        ...data,
        expiresAt
    });

    return code;
}

function consumeAuthorizationCode(code) {

    const data = authorizationCodes.get(code);

    if (!data) {
        return null;
    }

    // Remove immediately so the code can only be used once
    authorizationCodes.delete(code);

    if (Date.now() > data.expiresAt) {
        return null;
    }

    return data;
}

module.exports = {
    createAuthorizationCode,
    consumeAuthorizationCode
};