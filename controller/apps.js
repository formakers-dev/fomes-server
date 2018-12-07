const AppService = require('../services/apps');
const ControllerUtil = require('../utils/controller');

const getApp = (req, res) => {
    AppService.getAppForPublic(req.params.packageName, req.userId)
        .then(app => res.json(app))
        .catch(err => {
            ControllerUtil.sendError("getApp", req.userId, res, err, (err instanceof AppService.NotFoundAppError) ? 412 : 500);
        });
};

module.exports = { getApp };