const GoogleAuth = require('google-auth-library');
const jwt = require('jsonwebtoken');
const config = require('../config');

const appBeeTokenVerifier = (req, res, next) => {
    const check = (token) => {
        if (!token) {
            return new Promise((resolve, reject) => {
                reject(new Error("Has no token"));
            });
        } else {
            return new Promise(
                (resolve, reject) => {
                    jwt.verify(token, config.secret, (err, decoded) => {
                        if(!err) {
                            resolve(decoded);
                        } else if(err instanceof jwt.TokenExpiredError) {
                            err.errCode = 401;
                            reject(err);
                        } else {
                            err.errCode = 403;
                            reject(err);
                        }
                    })
                }
            );
        }
    };

    const onError = (userId, err) => {
        console.error('===appBeeTokenVerifier:onError', 'userId=', userId, 'err=', err);
        res.status(err.errCode).json({
            success: false,
            message: err.message
        });
    };
    const onSuccess = (decoded) => {
        req.userId = decoded.userId;
        next();
    };

    check(req.headers['x-access-token'])
        .then(onSuccess)
        .catch(err => onError(req.userId, err));
};


const googleTokenVerifier = (req, res, next) => {
    const verifyGoogleToken = (googleIdToken) => {
        return new Promise(
            (resolve, reject) => {
                const auth = new GoogleAuth;
                const client = new auth.OAuth2();

                client.verifyIdToken(
                    googleIdToken,
                    config.googleClientId,
                    function(err, login) {
                        if (err) {
                            reject(err);
                        } else {
                            const payload = login.getPayload();

                            const user = {};
                            user.provider = 'google';
                            user.providerId = payload['sub'];
                            user.userId = user.provider + user.providerId;
                            user.email = payload['email'];
                            user.name = payload['name'];

                            resolve(user);
                        }
                    }
                );
            }
        );
    };

    verifyGoogleToken(req.headers['x-id-token'])
        .then((user) => {
            req.body.provider = user.provider;
            req.body.providerId = user.providerId;
            req.body.userId = user.userId;
            req.body.email = user.email;
            req.body.name = user.name;
            req.userId = user.userId;
            next();
        })
        .catch((err) => {
            console.error('===verifyGoogleToken:onError', 'userId=', req.userId, 'err=', err);
            res.status(403).json({
                success: false,
                message: err.message
            });
        });
};

module.exports = {appBeeTokenVerifier, googleTokenVerifier};