const jwt = require('jsonwebtoken');
const InvitationCodes = require('../models/invitationCodes');
const config = require('../config');
const UserService = require('../services/users');
const AppService = require('../services/apps');

const signUpUser = (req, res, next) => {
    UserService.getUser(req.userId)
        .then(user => {
            if (!user) {
                req.body.signUpTime = new Date();
            }

            return UserService.upsertUser(req.userId, req.body);
        })
        .then(() => next())
        .catch(err => sendError("signUpUser", req.userId, res, err, 500));
};

const upsertUser = (req, res, next) => {
    UserService.upsertUser(req.userId, req.body)
        .then(() => next())
        .catch(err => {
            sendError("upsertUser", req.userId, res, err, (err instanceof UserService.NickNameDuplicationError) ? 409 : 500);
        });
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

const verifyUserInfo = (req, res) => {
    if (Object.keys(req.query).length === 0) {
        sendError("verifyUserInfo", req.userId, res, { message: 'Empty Params'}, 422);
        return;
    }

    UserService.isDuplicatedNickName(req.userId, req.query.nickName)
        .then(isDuplicated => {
            if (!isDuplicated) {
                res.sendStatus(200);
            } else {
                sendError("verifyUserInfo", req.userId, res, { message: 'Duplicated NickName'}, 409);
            }
        })
        .catch(err => sendError("verifyUserInfo", req.userId, res, err, 500));
};

const sendError = (tag, userId, res, err, errCode) => {
    console.error(tag, "userId=", userId, "err=", err);
    res.status(errCode).json({
        success: false,
        message: err.message
    });
};

const getUser = (req, res, next) => {
    UserService.getUser(req.userId)
        .then(user => {
            req.user = user;
            next();
        })
        .catch(err => sendError("getUser", req.userId, res, err, 500));
};

const saveAppToWishList = (req, res) => {
    const userId = req.userId;
    const packageName = req.body.packageName;

    UserService.upsertWishList(userId, packageName)
        .then(() => AppService.upsertWishedBy(packageName, userId))
        .then(() => res.sendStatus(200))
        .catch(err => sendError('saveAppToWishList', req.userId, res, err, 500));
};

const removeAppFromWishList = (req, res) => {
    const userId = req.userId;
    const packageName = req.params.packageName;

    UserService.removeAppFromWishList(userId, packageName)
        .then(() => AppService.removeUserFromWishedBy(packageName, userId))
        .then(() => res.sendStatus(200))
        .catch(err => sendError('removeAppFromWishList', req.userId, res, err, 500));
};

const getWishList = (req, res) => {
    UserService.getWishList(req.userId)
        .then(packageNames => AppService.getAppsWithRepresentativeCategory(packageNames))
        .then(apps => res.json(
            apps.map(app => AppService.replaceWishedByToWishedByMe(app, req.userId))
        ))
        .catch(err => {
            console.error(err);
            res.status(500).json({
                success: false,
                message: err.message
            });
        });
};

module.exports = {
    signUpUser,
    upsertUser,
    generateToken,
    verifyInvitationCode,
    verifyUserInfo,
    getUser,
    saveAppToWishList,
    removeAppFromWishList,
    getWishList,
};