const jwt = require('jsonwebtoken');
const User = require('../models/user');
const RegistraionCodes = require('../models/registrationCodes');
const config = require('../config');

const upsertUser = (req, res, next) => {
    User.findOneAndUpdate({userId: req.body.userId}, {$set: req.body}, {upsert: true})
        .exec()
        .then(() => next())
        .catch(err => sendError(res, err));
};

const generateToken = (req, res) => {
    jwt.sign(req.body, config.secret, {
        expiresIn: '7d',
        issuer: 'appbee.com',
        subject: 'AppBeeAuth'
    }, (err, newToken) => {
        if (err) {
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

const verifyRegistrationCode = (req, res) => {
    RegistraionCodes.findOne({code: req.params.code})
        .exec()
        .then(registrationCode => {
            if (registrationCode) {
                res.json(true);
            } else {
                res.json(false);
            }
        })
        .catch(err => sendError(res, err));
};

const sendError = (res, err) => {
    console.log(err.message);
    res.status(500).json({
        success: false,
        message: err.message
    });
};


module.exports = {upsertUser, generateToken, verifyRegistrationCode};