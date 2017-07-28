const GoogleAuth = require('google-auth-library');
const CLIENT_ID = "1011092046994-qdvlddoem775qt59sm5b2sqfp3iq0etf.apps.googleusercontent.com";
let auth = new GoogleAuth;
// let client = new auth.OAuth2(CLIENT_ID, '', '');

const authMiddleware = (req, res, next) => {
    const token = req.headers['x-access-token'];

    if(!token) {
        return res.status(403).json({
            success: false,
            message: 'Not authorized'
        });
    }

    // create a promise that decodes the token
    const p = new Promise(
        (resolve, reject) => {
            if(token === "testToken") {
                resolve();
            } else {
                reject("Not authorized");
            }
            // client.verifyIdToken(
            //     token,
            //     CLIENT_ID,
            //     (err, login) => {
            //         if(err) {
            //             reject(err);
            //         } else {
            //             let payload = login.getPayload();
            //             let userId = payload['sub'];
            //             resolve(userId);
            //         }
            //     });
        }
    );

    const onError = (errorMessage) => {
        res.status(403).json({
            success: false,
            message: errorMessage
        });
    };

    // process the promise
    p.then(()=>{
        req.isAuthenticated = true;
        next();
    }).catch(onError)
};

module.exports = authMiddleware;