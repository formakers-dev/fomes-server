const jwt = require('jsonwebtoken');
const User = require('../models/user');
const InvitationCodes = require('../models/invitationCodes');
const config = require('../config');

const upsertUser = (req, res, next) => {
    const userId = (req.userId)? req.userId : req.body.userId;

    User.findOneAndUpdate({userId: userId}, {$set: req.body}, {upsert: true})
        .exec()
        .then(() => next())
        .catch(err => sendError(res, err));
};

const generateToken = (req, res) => {
    jwt.sign(req.body, config.secret, {
        expiresIn: '60d',
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

const verifyInvitationCode = (req, res) => {
    InvitationCodes.findOne({code: req.params.code})
        .exec()
        .then(code => {
            if (code) {
                res.sendStatus(200)
            } else {
                res.sendStatus(401);
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

module.exports = {upsertUser, generateToken, verifyInvitationCode};