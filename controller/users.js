const jwt = require('jsonwebtoken');
const InvitationCodes = require('../models/invitationCodes');
const config = require('../config');
const ControllerUtil = require('../utils/controller');
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
        .catch(err => res.status(500)
            .json(ControllerUtil.convertErrorToJson("signUpUser", req.userId, err)));
};

const upsertUser = (req, res, next) => {
    UserService.upsertUser(req.userId, req.body)
        .then(() => next())
        .catch(err => {
            res.status((err instanceof UserService.NickNameDuplicationError) ? 409 : 500)
                .json(ControllerUtil.convertErrorToJson("upsertUser", req.userId, err));
        });
};

const generateToken = (req, res) => {
    jwt.sign(req.body, config.secret, {
        expiresIn: '1d',
        issuer: 'formakers.net',
        subject: 'FomesAuth'
    }, (err, newToken) => {
        if (err) {
            res.status(500)
                .json(ControllerUtil.convertErrorToJson("generateToken", req.userId, err));
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
        .catch(err => res.status(500)
            .json(ControllerUtil.convertErrorToJson("verifyInvitationCode", req.userId, err)));
};

const verifyUserInfo = (req, res) => {
    if (Object.keys(req.query).length === 0) {
        res.status(422).json(ControllerUtil.convertErrorToJson("verifyUserInfo", req.userId, {message: 'Empty Params'}));
        return;
    }

    UserService.isDuplicatedNickName(req.userId, req.query.nickName)
        .then(isDuplicated => {
            if (!isDuplicated) {
                res.sendStatus(200);
            } else {
                res.status(409)
                    .json(ControllerUtil.convertErrorToJson("verifyUserInfo", req.userId, {message: 'Duplicated NickName'}));
            }
        })
        .catch(err => res.status(500)
            .json(ControllerUtil.convertErrorToJson("verifyUserInfo", req.userId, err)));
};

const getUser = (req, res, next) => {
    UserService.getUser(req.userId)
        .then(user => {
            req.user = user;
            next();
        })
        .catch(err => res.status(500)
            .json(ControllerUtil.convertErrorToJson("getUser", req.userId, err)));
};

const saveAppToWishList = (req, res) => {
    const userId = req.userId;
    const packageName = req.body.packageName;

    UserService.upsertWishList(userId, packageName)
        .then(() => AppService.upsertWishedBy(packageName, userId))
        .then(() => res.sendStatus(200))
        .catch(err => res.status(500)
            .json(ControllerUtil.convertErrorToJson('saveAppToWishList', req.userId, err)));
};

const removeAppFromWishList = (req, res) => {
    const userId = req.userId;
    const packageName = req.params.packageName;

    UserService.removeAppFromWishList(userId, packageName)
        .then(() => AppService.removeUserFromWishedBy(packageName, userId))
        .then(() => res.sendStatus(200))
        .catch(err => res.status(500)
            .json(ControllerUtil.convertErrorToJson('removeAppFromWishList', req.userId, err)));
};

const getWishList = (req, res) => {
    UserService.getWishList(req.userId)
        .then(packageNames => AppService.getAppsForPublic(packageNames, req.userId))
        .then(apps => res.json(apps))
        .catch(err => res.status(500)
            .json(ControllerUtil.convertErrorToJson('getWishList', req.userId, err)));
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