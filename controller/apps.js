const AppService = require('../services/apps');
const ControllerUtil = require('../utils/controller');

const getApp = (req, res) => {
    AppService.getAppForPublic(req.params.packageName, req.userId)
        .then(app => res.json(app))
        .catch(err => {
            res.status((err instanceof AppService.NotFoundAppError) ? 412 : 500)
                .json(ControllerUtil.convertErrorToJson("getApp", req.userId, err));
        });
};

module.exports = { getApp };