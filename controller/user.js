const jwt = require('jsonwebtoken');
const User = require('../models/user');
const config = require('../config');

let generateToken = (req, res) => {
    const generateToken = (user) => {
        return new Promise(
            (resolve, reject) => {
                jwt.sign(user, config.secret, {
                    expiresIn: '7d',
                    issuer: 'appbee.com',
                    subject: 'AppBeeAuth'
                }, (err, newToken) => {
                    if(err) {
                        reject(err);
                    } else {
                        resolve(newToken);
                    }
                });
            }
        );
    };

    generateToken(req.user)
        .then((token) => {
            console.log(token);
            res.json(token);
        })
        .catch((err) => {
            console.log("====generateToken:Error" + err.message);
            res.status(403).json({
                success: false,
                message: err.message
            });
        });
};


let upsertUser = (req, res, next) => {
    User.findOneAndUpdate({userId : req.user.userId}, { $set: req.user }, {upsert: true})
        .exec()
        .then(() => {
            next();
        })
        .catch((err) => {
            console.log('===upsertUser:Error' + err.message);
            res.status(403).json({
                success: false,
                message: err.message
            });
        });
};


module.exports = {upsertUser, generateToken};