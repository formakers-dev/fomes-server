const AppService = require('../services/apps');
const UserService = require('../services/users');
const Boom = require('boom');

const getApp = (req, res, next) => {
    UserService.getWishList(req.userId)
        .then(wishList => AppService.getAppForPublic(req.params.packageName, wishList))
        .then(app => res.json(app))
        .catch(err => {
            (err instanceof AppService.NotFoundAppError) ? next(Boom.preconditionFailed(err)) : next(err);
        });
};

module.exports = { getApp };
