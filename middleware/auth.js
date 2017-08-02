const jwt = require('jsonwebtoken');
const config = require('../config');

const authMiddleware = (req, res, next) => {
    // TODO: 로그인 했을 경우 각 provider에서 제공한 tokenId에서 id를 꺼내온다
    // id를 가지고 jwt를 생성하여 client에 보내줌
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
        console.log('===authMiddleware:onError');
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

module.exports = authMiddleware;
