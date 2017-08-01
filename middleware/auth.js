const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const user = req.body;
    const token = req.headers['x-access-token'];
    const secret = req.app.get('jwt-secret');

    if(!token) {
        return res.status(403).json({
            success: false,
            message: 'Not authorized'
        });
    }

    // TODO: 로그인 했을 경우 각 provider에서 제공한 tokenId에서 id를 꺼내온다
    // id를 가지고 jwt를 생성하여 client에 보내줌
    const check = (user) => {
        if (!user) {
            reject(new Error("login failed"));
        } else {
            const p = new Promise(
                (resolve, reject) => {
                    jwt.verify(token, secret, (err, decoded) => {
                        if(err) {
                            reject(err);
                        } else {
                            resolve(decoded);
                        }
                    })
                }
            );
            return p;
        }
    };

    const onError = (errorMessage) => {
        res.status(403).json({
            success: false,
            message: errorMessage
        });
    };
    const onSuccess = (token) => {
        res.json(true);
    }

    check(user).then(onSuccess).catch(onError);
};

module.exports = authMiddleware;