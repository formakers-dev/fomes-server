const AppService = require('../services/apps');

const getApp = (req, res, next) => {
    AppService.getAppForPublic(req.params.packageName, req.userId)
        .then(app => res.json(app))
        .catch(err => {
            res.status((err instanceof AppService.NotFoundAppError) ? 412 : 500);
            next(err);
        });
};

module.exports = { getApp };