const pagingUtil = require('../utils/paging');
const RecommendAppsService = require('../services/recommendApps');
const AppUsageService = require('../services/appUsages');

const getRecommendApps = (req, res) => {
    if (!pagingUtil.isValidPageAndLimit(req.query.page, req.query.limit)) {
        res.sendStatus(400);
        return;
    }

    AppUsageService.aggregateAppUsageByCategory(req.userId, req.params.categoryId)
        .then(userUsage => {
            const excludePackageNames = userUsage.appUsages.map(userAppUsage => userAppUsage.appInfos[0].packageName);

            return Promise.all([
                    RecommendAppsService.getSimilarUserRecommendApps(req.userId, excludePackageNames, req.query.page, req.query.limit),
                    RecommendAppsService.getFavoriteCategoryRecommendApps(userUsage.categoryUsages, excludePackageNames, req.userId),
                    RecommendAppsService.getFavoriteDeveloperRecommendApps(userUsage.developerUsages, excludePackageNames, req.userId),
                    RecommendAppsService.getFavoriteAppRecommendApps(userUsage.appUsages, excludePackageNames, req.userId),
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