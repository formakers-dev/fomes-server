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
    if (req.body && req.body.userId) {
        delete req.body.userId;
    }

    UserService.upsertUser(req.userId, req.body)
        .then(() => next())
        .catch(err => {
            next((err instanceof UserService.NickNameDuplicationError)? Boom.conflict() : err);
        });
};

const updateActivatedDate = (req, res, next) => {
    UserService.upsertUser(req.userId, { activatedDate: new Date() })
        .then(() => res.sendStatus(200))
        .catch(err => next(err));
};

const updateNotificationToken = (req, res, next) => {
    UserService.upsertUser(req.userId, { registrationToken: req.body.registrationToken })
        .then(() => res.sendStatus(200))
        .catch(err => next(err));
};

const generateToken = (req, res, next) => {
    const tokenData = {
        provider : req.body.provider,
        providerId : req.body.providerId,
        userId : req.userId,
        email : req.body.email,
        name : req.body.name
    };

    const option = {
        issuer: 'formakers.net',
        subject: 'FomesAuth'
    };

    if (process.env.NODE_ENV === 'production') {
        option.expiresIn = '1d';
    } else {
        option.expiresIn = '5m';
    }

    jwt.sign(tokenData, config.secret, option, (err, newToken) => {
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
    updateActivatedDate,
    updateNotificationToken
};