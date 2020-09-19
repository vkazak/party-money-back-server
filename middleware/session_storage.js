const User = require('../models/user.model');

const EXPIRATION = 3600;

const openedSessions = new Map();
module.exports.openedSessions = openedSessions;
module.exports.isTokenValid = async (token) => {
    if (openedSessions.has(token))
        if (openedSessions.get(token).expiresAt >= Date.now()) {
            return true;
        } else {
            openedSessions.delete(token)
        }
    try {
        const tokenInfo = await getTokenInfo(token);
        const userInDb = await User.findOne({ externalId: tokenInfo.user_id });
        if (tokenInfo.expires_in > 0) {
            openedSessions.set(token, { userId: userInDb._id.toString(), expiresAt: (Date.now() + 1000 * tokenInfo.expires_in) })
            return true;
        } else {
            return false;
        }
    } catch (err) {
        console.log(err);
        return false;
    }
}

module.exports.getUserIdByToken = (token) => {
    const tokenInfo = openedSessions.get(token);
    return tokenInfo ? tokenInfo.userId : undefined;
}

const https = require('https');

async function getTokenInfo(token) {
    return new Promise(function (resolve, reject) {
        const options = {
            hostname: 'www.googleapis.com',
            path: `/oauth2/v1/tokeninfo?access_token=${token}`,
            method: 'GET'
        }
        const req = https.request(options, res => {
            var body = [];
            res.on('data', function(chunk) {
                body.push(chunk);
            });
            res.on('end', function() {
                try {
                    body = JSON.parse(Buffer.concat(body).toString());
                } catch(e) {
                    reject(e);
                }
                resolve(body);
            });
        });
        req.on('error', error => {
            reject(error);
        })
        req.end()
    })
}