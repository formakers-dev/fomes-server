const GoogleAuth = require('google-auth-library');

let googleTokenVerifier = (req, res, next) => {
    const googleIdToken = req.headers['x-id-token'];

    const verifyGoogleToken = () => {
        return new Promise(
            (resolve, reject) => {
                const CLIENT_ID = process.env['GG_CLIENT_ID'];
                const SECRET_KEY = process.env['GG_SECRET_KEY'];
                const auth = new GoogleAuth;
                const client = new auth.OAuth2(CLIENT_ID, SECRET_KEY);

                client.verifyIdToken(
                    googleIdToken,
                    CLIENT_ID,
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
                            /*
                               {  azp: '1011092046994-deh2fceumbfo9quv2qcsf0cp36nou6bj.apps.googleusercontent.com',
                                  aud: '1011092046994-qdvlddoem775qt59sm5b2sqfp3iq0etf.apps.googleusercontent.com',
                                  sub: '110897406327517511196',
                                  email: 'yenarue@gmail.com',
                                  email_verified: true,
                                  iss: 'https://accounts.google.com',
                                  iat: 1501539255,
                                  exp: 1501542855,
                                  name: '김예나',
                                  picture: 'https://lh5.googleusercontent.com/-F60UiYfCWWo/AAAAAAAAAAI/AAAAAAAAAAA/AMp5VUoa5-bAyIk_qWlnGVcG9SO-GucAXw/s96-c/photo.jpg',
                                  given_name: '예나',
                                  family_name: '김',
                                  locale: 'ko'
                                }
                            */
                            resolve(user);
                        }
                    }
                );
            }
        );
    };

    const onError = (err) => {
        console.log('===verifyGoogleToken:onError');
        res.status(403).json({
            success: false,
            message: err.message
        });
    };

    const onSuccess = (user) => {
        console.log('===verifyGoogleToken:onSuccess');
        req.user = user;
        next();
    };

    verifyGoogleToken()
        .then(onSuccess)
        .catch(onError);
};


module.exports = googleTokenVerifier;