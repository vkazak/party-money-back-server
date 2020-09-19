const sessionStorage = require('./session_storage');

module.exports.sessions = sessionStorage;

function getTokenFromReq(req) {
    return req.headers.authorization.split(' ')[1]
}
module.exports.getTokenFromReq = getTokenFromReq;

async function isTokenOwnerOurUser(req, res) {
    try {
        const token = getTokenFromReq(req);
        if (await sessionStorage.isTokenValid(token)) {
            return true
        } else {
            throw 'Token is not valid'
        }
    } catch(err) {
        res.status(401).json({
            error: new Error(err)
        });
        return false;
    }
}

module.exports.validateUser = async (req, res, next) => {
    if (await isTokenOwnerOurUser(req, res)) {
        next();
    }
}

async function validateAndCompareUser(req, res, next, userId) {
    if (await isTokenOwnerOurUser(req, res)) {
        const token = getTokenFromReq(req);
        const idOfTokenOwner = sessionStorage.getUserIdByToken(token);
        if (idOfTokenOwner === userId) {
            next()
        } else {
            res.status(401).json({
                error: new Error('Access to operation denied')
            });
        }
    }
}

module.exports.validateUserIdAsGetParam = (req, res, next) => {
    validateAndCompareUser(req, res, next, req.params.userId);
}

module.exports.validateUserIdAsBodyParam = (req, res, next) => {
    validateAndCompareUser(req, res, next, req.body.userId);
}