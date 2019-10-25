const jwt = require('jsonwebtoken');
const config = require('../config');
const UserService = require('../services/users');
const AppService = require('../services/apps');
const NotiService = require('../services/noti');
const Boom = require('boom');

const signUpUser = (req, res, next) => {
    UserService.getUser(req.userId)
        .then(user => {
            if (!user) {
                req.body.signUpTime = new Date();
            } else {
                res.sendStatus(409);
            }

            // 아예 그냥 insert만 하는 걸로 연결시켜버릴까?
            return UserService.upsertUser(req.userId, req.body)
        })
        .then(() => UserService.getUser(req.userId).lean())
        .then((user) => next(user))
        .catch(err => {
            next((err instanceof UserService.NickNameDuplicationError)? Boom.conflict() : err);
        });
};

const signInUser = (req, res, next) => {
    if (req.body && req.body.userId) {
        delete req.body.userId;
    }

    // 쓰지말고 그냥 get만 해야하려나... 아 근데 노티토큰이랑 디바이스 정보 등등 떄문에 쓰긴해야한다
    // 무조건 update로 진행되게 해야할 것 같다. upsert라 존재하지 않는 경우에 singup (insert) 처리가 되어버리네
    UserService.upsertUser(req.userId, req.body)
        .then(() => UserService.getUser(req.userId).lean())
        .then((user) => next(user))
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

const updateUser = (req, res, next) => {
    if (req.body && req.body.userId) {
        delete req.body.userId;
    }

    UserService.upsertUser(req.userId, req.body)
        .then(() => next())
        .catch(err => {
            next((err instanceof UserService.NickNameDuplicationError)? Boom.conflict() : err);
        });
};

const updateUserInfo = (req, res, next) => {
    const userInfo = { };

    if (req.body.nickName) userInfo.nickName = req.body.nickName;
    if (req.body.birthday) userInfo.birthday = req.body.birthday;
    if (req.body.gender) userInfo.gender = req.body.gender;
    if (req.body.job) userInfo.job = req.body.job;
    if (req.body.lifeApps) userInfo.lifeApps = req.body.lifeApps;

    UserService.upsertUser(req.userId, userInfo)
        .then(() => res.sendStatus(200))
        .catch(err => next(err));
};

const generateToken = (user, req, res, next) => {
    console.log('[', user.userId, '] generateToken');
    const tokenData = {
        provider : user.provider,
        providerId : user.providerId,
        userId : user.userId,
        email : user.email,
        name : user.name
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
            user.accessToken = newToken;
            res.json(user);
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

const sendNoti = (req, res, next) => {
    UserService.getUser(req.userId)
        .then(user => NotiService.send(req.body.notificationData, user.registrationToken))
        .then(() => res.sendStatus(200))
        .catch(err => next(err));
};

module.exports = {
    signUpUser,
    signInUser,
    generateToken,
    verifyUserInfo,
    getUser,
    saveAppToWishList,
    removeAppFromWishList,
    getWishList,
    updateActivatedDate,
    updateNotificationToken,
    updateUser,
    updateUserInfo,
    sendNoti
};