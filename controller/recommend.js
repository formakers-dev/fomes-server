const PagingUtil = require('../utils/paging');
const RecommendAppsService = require('../services/recommendApps');
const AppUsageService = require('../services/appUsages');
const UserService = require('../services/users');

const getRecommendApps = (req, res) => {
    const page = parseInt(req.query.page);
    const eachLimit = (req.query.eachLimit) ? parseInt(req.query.eachLimit) : 5;
    let user;

    if (!PagingUtil.isValidPageAndLimit(page, eachLimit)) {
        res.sendStatus(412);
        return;
    }

    UserService.getUser(req.userId)
        .then(currentUser => {
            user = currentUser;
            return AppUsageService.aggregateAppUsageByCategory(user.userId, req.params.categoryId);
        })
        .then(userUsage => {
            const excludePackageNames = userUsage.appUsages.map(userAppUsage => userAppUsage.appInfos[0].packageName);

            return Promise.all([
                    RecommendAppsService.getSimilarUserRecommendApps(user, excludePackageNames, page, eachLimit),
                    RecommendAppsService.getFavoriteCategoryRecommendApps(userUsage.categoryUsages, user, excludePackageNames, page, eachLimit),
                    RecommendAppsService.getFavoriteDeveloperRecommendApps(userUsage.developerUsages, user, excludePackageNames, page, eachLimit),
                    RecommendAppsService.getFavoriteAppRecommendApps(userUsage.appUsages, user, excludePackageNames, page, eachLimit),
                ]);
        })
        .then(allRecommendAppsNestedArray => allRecommendAppsNestedArray.reduce((a, b) => a.concat(b)))
        .then(allRecommendApps => allRecommendApps.sort((a, b) => {
            if (a.rank === b.rank) {
                return a.recommendType > b.recommendType ? -1 : 1;
            } else {
                return a.rank < b.rank ? -1 : 1;
            }
        }))
        .then(sortedResult => res.json(sortedResult))
        .catch(err => {
            console.error(err);
            res.status(500).json({
                success: false,
                message: err.message
            });
        });
};

module.exports = {getRecommendApps};