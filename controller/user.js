const jwt = require('jsonwebtoken');
const InvitationCodes = require('../models/invitationCodes');
const config = require('../config');
const User = require('../models/user').User;    // TODO : 언젠가 service로 이동해야 한다

//TODO : User이름 변경 -> Users

const signUpUser = (req, res, next) => {
    User.findOne({userId: req.userId})
        .then(user => {
            if (!user) {
                req.body.signUpTime = new Date();
            }

            upsertUser(req, res, next);
        })
        .catch(err => sendError("signUpUser", req.userId, res, err, 500));
};

const upsertUser = (req, res, next) => {
    const updateUser = (req, res, next) => {
        User.findOneAndUpdate({userId: req.userId}, {$set: req.body}, {upsert: true})
            .then(() => next())
            .catch(err => sendError("upsertUser", req.userId, res, err, 500));
    };

    if (req.body.nickName) {
        User.findOne({userId: {$ne: req.userId}, nickName: req.body.nickName})
            .then(user => {
                if (user) {
                    res.sendStatus(409);
                } else {
                    updateUser(req, res, next);
                }
            })
            .catch(err => sendError("upsertUser", req.userId, res, err, 500));
    } else {
        updateUser(req, res, next);
    }
};

const generateToken = (req, res) => {
    jwt.sign(req.body, config.secret, {
        expiresIn: '1d',
        issuer: 'formakers.net',
        subject: 'FomesAuth'
    }, (err, newToken) => {
        if (err) {
            sendError("generateToken", req.userId, res, err, 403)
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
                res.sendStatus(412);
            }
        })
        .catch(err => sendError("verifyInvitationCode", req.userId, res, err, 500));
};

const sendError = (tag, userId, res, err, errCode) => {
    console.error(tag, "userId=", userId, "err=", err);
    res.status(errCode).json({
        success: false,
        message: err.message
    });
};

const getUser = (req, res, next) => {
    User.findOne({userId: req.userId})
        .then(user => {
            req.user = user;
            next();
        })
        .catch(err => sendError("getUser", req.userId, res, err, 500));
};

module.exports = {signUpUser,
    upsertUser,
    generateToken,
    verifyInvitationCode,
    getUser
};