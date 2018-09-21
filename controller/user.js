const jwt = require('jsonwebtoken');
const moment = require('moment');
const User = require('../models/user').User;
const UserConstants = require('../models/user').Constants;
const InvitationCodes = require('../models/invitationCodes');
const config = require('../config');

const signUpUser = (req, res, next) => {
    User.findOne({userId: req.userId}).then(user => {
        if (!user) {
            req.body.signUpTime = new Date();
        }

        User.findOneAndUpdate({userId: req.userId}, {$set: req.body}, {upsert: true})
            .exec()
            .then(() => next())
            .catch(err => sendError(res, err));
    });
};

const upsertUser = (req, res, next) => {
    User.findOneAndUpdate({userId: req.userId}, {$set: req.body}, {upsert: true})
        .exec()
        .then(() => next())
        .catch(err => sendError(res, err));
};

const generateToken = (req, res) => {
    jwt.sign(req.body, config.secret, {
        expiresIn: '1d',
        issuer: 'formakers.net',
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
                res.sendStatus(412);
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
        console.error(errorMessage);
        return new Promise((resolve, reject) => reject(errorMessage));
    }

    return User.find(findQuery);
};

module.exports = {signUpUser, upsertUser, generateToken, verifyInvitationCode, getSimilarUsers};