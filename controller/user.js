const jwt = require('jsonwebtoken');
const User = require('../models/user');
const config = require('../config');

const generateToken = (req, res) => {
    jwt.sign(req.user, config.secret, {
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

const upsertUser = (req, res, next) => {
    User.findOneAndUpdate({userId : req.user.userId}, { $set: req.user }, {upsert: true})
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


module.exports = {upsertUser, generateToken};