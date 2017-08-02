const GoogleAuth = require('google-auth-library');

let googleTokenVerifier = (req, res, next) => {
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
                            let payload = login.getPayload();
                            //TODO: 무엇을 검증해야 할까?
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

module.exports = googleTokenVerifier;