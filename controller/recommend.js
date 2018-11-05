const pagingUtil = require('../utils/paging');
const RecommendAppsService = require('../services/recommendApps');
const AppUsageService = require('../services/appUsages');

const getRecommendApps = (req, res) => {
    if (!pagingUtil.isValidPageAndLimit(req.query.page, req.query.limit)) {
        res.sendStatus(400);
        return;
    }

    // result.appUsages

    AppUsageService.aggregateAppUsageByCategory(req.userId, req.params.categoryId)
        .then(userUsages => {
            return Promise.all([
                    RecommendAppsService.getSimilarUserRecommendApps(req.userId, req.query.page, req.query.limit),
                    RecommendAppsService.getFavoriteCategoryRecommendApps(userUsages.categoryUsages, req.userId),
                    RecommendAppsService.getFavoriteDeveloperRecommendApps(userUsages.developerUsages, req.userId)
                ]);
        })
        .then(recommendApps => {
            let result = [];

            recommendApps.forEach((recommendAppsByRecommendType) => {
                result = result.concat(recommendAppsByRecommendType);
            });

            res.json(result);
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({
                success: false,
                message: err.message
            });
        });
};

module.exports = {getRecommendApps};