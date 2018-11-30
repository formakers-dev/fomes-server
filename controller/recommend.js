const PagingUtil = require('../utils/paging');
const RecommendAppsService = require('../services/recommendApps');
const AppUsageService = require('../services/appUsages');

const getRecommendApps = (req, res) => {
    const page = parseInt(req.query.page);
    const eachLimit = (req.query.eachLimit) ? parseInt(req.query.eachLimit) : 5;
    const userId = req.userId;

    if (!PagingUtil.isValidPageAndLimit(page, eachLimit)) {
        res.sendStatus(400);
        return;
    }

    AppUsageService.aggregateAppUsageByCategory(userId, req.params.categoryId)
        .then(userUsage => {
            const excludePackageNames = userUsage.appUsages.map(userAppUsage => userAppUsage.appInfos[0].packageName);

            return Promise.all([
                    RecommendAppsService.getSimilarUserRecommendApps(userId, excludePackageNames, page, eachLimit),
                    RecommendAppsService.getFavoriteCategoryRecommendApps(userUsage.categoryUsages, userId, excludePackageNames, page, eachLimit),
                    RecommendAppsService.getFavoriteDeveloperRecommendApps(userUsage.developerUsages, userId, excludePackageNames, page, eachLimit),
                    RecommendAppsService.getFavoriteAppRecommendApps(userUsage.appUsages, userId, excludePackageNames, page, eachLimit),
                ]);
        })
        .then(recommendApps => {
            let result = [];

            recommendApps.forEach((recommendAppsByRecommendType) => {
                result = result.concat(recommendAppsByRecommendType);
            });

            result = result.sort((a, b) => {
                if (a.rank === b.rank) {
                    return a.recommendType > b.recommendType ? -1 : 1;
                } else {
                    return a.rank < b.rank ? -1 : 1;
                }
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