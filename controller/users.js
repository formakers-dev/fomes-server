const jwt = require('jsonwebtoken');
const config = require('../config');
const UserService = require('../services/users');
const AppService = require('../services/apps');
const Boom = require('boom');

const signUpUser = (req, res, next) => {
    UserService.getUser(req.userId)
        .then(user => {
            if (!user) {
                req.body.signUpTime = new Date();
            }

            return UserService.upsertUser(req.userId, req.body);
        })
        .then(() => next())
        .catch(err => next(err));
};

const upsertUser = (req, res, next) => {
    UserService.upsertUser(req.userId, req.body)
        .then(() => next())
        .catch(err => {
            next((err instanceof UserService.NickNameDuplicationError)? Boom.conflict() : err);
        });
};

const generateToken = (req, res, next) => {
    jwt.sign(req.body, config.secret, {
        expiresIn: '1d',
        issuer: 'formakers.net',
        subject: 'FomesAuth'
    }, (err, newToken) => {
        if (err) {
            next(err);
        } else {
            res.json(newToken);
        }
    });
};

const verifyUserInfo = (req, res, next) => {
    if (Object.keys(req.query).length === 0) {
        next(Boom.badData('Empty Params'));
        return;
    }

    UserService.isDuplicatedNickName(req.userId, req.query.nickName)
        .then(isDuplicated => {
            if (!isDuplicated) {
                res.sendStatus(200);
            } else {
                throw Boom.conflict('Duplicated NickName');
            }
        })
        .catch(err => next(err));
};

const getUser = (req, res, next) => {
    UserService.getUser(req.userId)
        .then(user => {
            req.user = user;
            next();
        })
        .catch(err => next(err));
};

const saveAppToWishList = (req, res, next) => {
    const userId = req.userId;
    const packageName = req.body.packageName;

    UserService.upsertWishList(userId, packageName)
        .then(() => AppService.upsertWishedBy(packageName, userId))
        .then(() => res.sendStatus(200))
        .catch(err => next(err));
};

const removeAppFromWishList = (req, res, next) => {
    const userId = req.userId;
    const packageName = req.params.packageName;

    UserService.removeAppFromWishList(userId, packageName)
        .then(() => AppService.removeUserFromWishedBy(packageName, userId))
        .then(() => res.sendStatus(200))
        .catch(err => next(err));
};

const getWishList = (req, res, next) => {
    UserService.getWishList(req.userId)
        .then(packageNames => AppService.getAppsForPublic(packageNames, req.userId))
        .then(apps => res.json(apps))
        .catch(err => next(err));
};

module.exports = {
    signUpUser,
    upsertUser,
    generateToken,
    verifyUserInfo,
    getUser,
    saveAppToWishList,
    removeAppFromWishList,
    getWishList,
};