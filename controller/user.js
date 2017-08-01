const CLIENT_ID = process.env['CLIENT_ID'];
const SECRET_KEY = process.env['SECRET_KEY'];
const redirectUrl = "http://appbeesvr.herokuapp.com/auth/google/callback";


const jwt = require('jsonwebtoken');
const User = require('../models/user');

let postUser = (req, res) => {
    const token = req.headers['x-access-token'];
    const secret = req.app.get('jwt-secret');

    const checkGoogleToken = () => {
        const p = new Promise(
            (resolve, reject) => {
                const GoogleAuth = require('google-auth-library');
                const auth = new GoogleAuth;
                const client = new auth.OAuth2(CLIENT_ID, SECRET_KEY, redirectUrl);
                client.verifyIdToken(
                    token,
                    CLIENT_ID,
                    function(err, login) {
                        if (err) {
                            reject(err)
                        }
                        let payload = login.getPayload();
                        //TODO: 무엇을 검증해야 할까?
                        let user = {};
                        console.log(payload)
                        user.userId = payload['email'];
                        user.name = payload['name'];
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
                )
            }
        );
        return p;
    }

    const checkUser = (user) => {
        const p = new Promise(
            (resolve, reject) => {
                User.findOne({userId: user.userId}, (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        if(!result) {
                            // 저장 & 토큰 발행
                            saveUser(user).then(createToken).then(onSuccess).catch(onError);
                        } else {
                            // 토큰 발행
                            createToken(user).then(onSuccess).then(onError);
                        }
                    }
                })
            }
        );

        return p;
    }

    const createToken = (user) => {
        const p = new Promise(
            (resolve, reject) => {
                jwt.sign(user, secret, {}, (err, newToken) => {
                    if(err) {
                        reject(err);
                    } else {
                        resolve(newToken);
                    }
                });
            }
        );
        return p;
    };

    const saveUser = (user) => {
        const p = new Promise(
            (resolve, reject) => {
                let newUser = new User(user);
                newUser.save((err) => {
                    if(err){
                        reject(err)
                    } else {
                        resolve(user)
                    }
                });
            }
        );
        return p;
    };

    const onError = (err) => {
        res.status(403).json({
            success: false,
            message: err.message
        });
    };

    const onSuccess = (token) => {
        res.json(tokn);
    };

    checkGoogleToken()
        .then(checkUser)
        .catch(onError);
};


module.exports = {postUser};