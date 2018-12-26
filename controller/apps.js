const AppService = require('../services/apps');
const Boom = require('boom');

const getApp = (req, res, next) => {
    AppService.getAppForPublic(req.params.packageName, req.userId)
        .then(app => res.json(app))
        .catch(err => {
            (err instanceof AppService.NotFoundAppError) ? next(Boom.preconditionFailed(err)) : next(err);
        });
};

module.exports = { getApp };