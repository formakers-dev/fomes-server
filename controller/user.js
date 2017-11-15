const jwt = require('jsonwebtoken');
const User = require('../models/user');
const config = require('../config');

let upsertUser = (req, res, next) => {

    User.findOneAndUpdate({userId : req.body.userId}, { $set: req.body }, {upsert: true})
        .exec()
        .then(() => {
            next();
        })
        .catch((err) => {
            console.log('===upsertUser:Error' + err.message);
            res.status(500).json({
                success: false,
                message: err.message
            });
        });
};

let generateToken = (req, res) => {
    jwt.sign(req.body, config.secret, {
        expiresIn: '7d',
        issuer: 'appbee.com',
        subject: 'AppBeeAuth'
    }, (err, newToken) => {
        if(err) {
            console.log("====generateToken:Error" + err.message);
            res.status(403).json({
                success: false,
                message: err.message
            });
        } else {
            res.json(newToken);
        }
    });
};


module.exports = {upsertUser, generateToken};