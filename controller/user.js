const jwt = require('jsonwebtoken');
const moment = require('moment');
const User = require('../models/user').User;
const UserConstants = require('../models/user').Constants;
const InvitationCodes = require('../models/invitationCodes');
const config = require('../config');

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
        subject: 'AppBeeAuth'
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

// similarPoint : columns of User model (plz refer to User's Constants)
const getSimilarUsers = (userInfo, similarPoint) => {
    const findQuery = { '$and' : [] };

    if ((similarPoint & UserConstants.gender) === UserConstants.gender) {
        findQuery['$and'].push({ gender: userInfo.gender });
    }

    if ((similarPoint & UserConstants.age) === UserConstants.age) {
        const currentYear = moment().format('YYYY');
        const beforeDiff = (currentYear - userInfo.birthday) % 10;
        const afterDiff = 10 - beforeDiff;

        findQuery['$and'].push(
            { birthday: { $gte: userInfo.birthday - afterDiff + 1 } },
            { birthday: { $lte: userInfo.birthday + beforeDiff + 1 } }
            );
    }

    if ((similarPoint & UserConstants.job) === UserConstants.job) {
        findQuery['$and'].push({ job: userInfo.job });
    }

    if (findQuery['$and'].length <= 0) {
        const errorMessage = 'Please add similarPoint!';
        console.error("getSimilarUsers", "userId=", userId, "err=", errorMessage);
        return new Promise((resolve, reject) => reject(errorMessage));
    }

    return User.find(findQuery);
};

module.exports = {signUpUser, upsertUser, generateToken, verifyInvitationCode, getSimilarUsers};