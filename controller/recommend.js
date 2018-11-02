const pagingUtil = require('../utils/paging');
const RecommendAppsService = require('../services/recommendApps');
const AppUsageService = require('../services/appUsages');

const getRecommendApps = (req, res) => {
    if (!pagingUtil.isValidPageAndLimit(req.query.page, req.query.limit)) {
        res.sendStatus(400);
        return;
    }

    // TODO: let 없애기, reject 관련 처리 추가 필요
    let result = [];
    let myAppUsages;

    // result.appUsages
    // result.categoryUsages
    // result.developerUsages

    RecommendAppsService.getSimilarUserRecommendApps(req.userId, req.query.page, req.query.limit)
        .then(similarUserRecommendApps => {
            result = result.concat(similarUserRecommendApps);
            //Just Only For Performance
            return AppUsageService.aggregateAppUsageByCategory(req.userId, req.params.categoryId);
        })
        .then(userUsages => {
            myAppUsages = userUsages;
            return RecommendAppsService.getFavoriteCategoryRecommendApps(myAppUsages.categoryUsages, req.userId)
        })
        .then(favoriteCategoryRecommendApps => {
            result = result.concat(favoriteCategoryRecommendApps);
            return RecommendAppsService.getFavoriteDeveloperRecommendApps(myAppUsages.developerUsages, req.userId)
        })
        .then(favoriteDeveloperRecommendApps => {
            result = result.concat(favoriteDeveloperRecommendApps);
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