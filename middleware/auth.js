const GoogleAuth = require('google-auth-library');
const jwt = require('jsonwebtoken');
const config = require('../config');

const appBeeTokenVerifier = (req, res, next) => {
    const check = (token) => {
        if (!token) {
            reject(new Error("Has no token"));
        } else {
            return new Promise(
                (resolve, reject) => {
                    jwt.verify(token, config.secret, (err, decoded) => {
                        if(!err) {
                            resolve(decoded);
                        } else if(err instanceof jwt.TokenExpiredError) {
                            err.errCode = config.UNAUTHORIZED;
                            reject(err);
                        } else {
                            err.errCode = config.FORBIDDEN;
                            reject(err);
                        }
                    })
                }
            );
        }
    };

    const onError = (err) => {
        console.log('===appBeeTokenVerifier:onError');
        res.status(err.errCode).json({
            success: false,
            message: err.message
        });
    };
    const onSuccess = (decoded) => {
        req.params.userId = decoded.userId;
        next();
    };

    check(req.headers['x-access-token'])
        .then(onSuccess)
        .catch(onError);
};


const googleTokenVerifier = (req, res, next) => {
    const verifyGoogleToken = (googleIdToken) => {
        return new Promise(
            (resolve, reject) => {
                const auth = new GoogleAuth;
                const client = new auth.OAuth2();

                client.verifyIdToken(
                    googleIdToken,
                    process.env['GG_CLIENT_ID'],
                    function(err, login) {
                        if (err) {
                            reject(err);
                        } else {
                            const payload = login.getPayload();
                            let user = {};
                            user.userId = payload['sub'];
                            user.email = payload['email'];
                            user.name = payload['name'];
                            user.provider = 'GG';

                            resolve(user);
                        }
                    }
                );
            }
        );
    };

    verifyGoogleToken(req.headers['x-id-token'])
        .then((user) => {
            req.user = user;
            next();
        })
        .catch((err) => {
            console.log('===verifyGoogleToken:onError');
            res.status(403).json({
                success: false,
                message: err.message
            });
        });
};


module.exports = {appBeeTokenVerifier, googleTokenVerifier};
