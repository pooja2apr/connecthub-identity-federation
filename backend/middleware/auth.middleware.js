function requireAuthentication(req, res, next) {

    if (!req.session.user) {
        return res.status(401).json({
            authenticated: false,
            message: "Authentication required"
        });
    }

    next();
}

module.exports = {
    requireAuthentication
};