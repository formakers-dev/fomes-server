const AppService = require('../services/apps');
const UserService = require('../services/users');
const AppUsageService = require('../services/appUsages');


const getSimilarUserAppUsageList = (req, res) => {
    UserService.getUser(req.userId)
        .then(user => AppUsageService.getSimilarUsers(user, parseInt(req.query.page), parseInt(req.query.limit)))
        .then(appUsages => Promise.resolve(appUsages.filter(i => i.developer && i.categoryId)))
        .then(appUsages => AppService.combineAppInfos(appUsages))
        .then(appUsagesWithAppInfo => res.json(appUsagesWithAppInfo))
        .catch(err => {
            console.error(err);
            res.status(500).json({
                success: false,
                message: err.message
            });
        });
};

module.exports = { getSimilarUserAppUsageList };