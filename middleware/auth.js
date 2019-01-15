const GoogleAuth = require('google-auth-library');
const jwt = require('jsonwebtoken');
const config = require('../config');
const UserService = require('../services/users');

const appBeeTokenVerifier = (req, res, next) => {
    const createErrorResponse = (userId, errCode, errMessage) => {
        return {
            userId: userId,
            errCode: errCode,
            errMessage: errMessage
        };
    };

    const check = (token) => {
        if (!token) {
            return new Promise((resolve, reject) => {
                reject(createErrorResponse(undefined, 403, "Has no token"));
            });
        } else {
            return new Promise(
                (resolve, reject) => {
                    jwt.verify(token, config.secret, (err, decoded) => {
                        if (!err) {
                            UserService.getUser(decoded.userId)
                                .then(user => {
                                    if (user) {
                                        resolve(decoded);
                                    } else {
                                        reject(createErrorResponse(decoded.userId, 403, 'The user does NOT exist'));
                                    }
                                }).catch(err => {
                                    console.error(err);
                                    reject(createErrorResponse(decoded.userId, 500, 'Internal Server Error'));
                                });
                        } else if (err instanceof jwt.TokenExpiredError) {
                            reject(createErrorResponse(undefined, 401, err.message));
                        } else {
                            reject(createErrorResponse(undefined, 403, err.message));
                        }
                    })
                }
            );
        }
    };

    const onError = (reason) => {
        console.error('===appBeeTokenVerifier:onError', 'userId=', reason.userId, 'err=', reason.errCode, ':', reason.errMessage);
        res.status(reason.errCode).json({
            success: false,
            message: reason.errMessage
        });
    };
    const onSuccess = (decoded) => {
        req.userId = decoded.userId;
        next();
    };

    check(req.headers['x-access-token'])
        .then(onSuccess)
        .catch((reason) => onError(reason));

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

const apiKeyVerifier = (req, res, next) => {
    const buffer = new Buffer(req.headers['x-access-token'], 'base64');
    const email = buffer.toString('ascii').trim();

    console.log(email);
    UserService.getUserId(email)
        .then(user => {
            console.log("user", user);
            req.userId = user.userId;
            next();
        });
};

module.exports = {appBeeTokenVerifier, googleTokenVerifier, apiKeyVerifier};