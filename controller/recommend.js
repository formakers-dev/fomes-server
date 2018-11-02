const AppService = require('../services/apps');
const UserService = require('../services/users');
const AppUsageService = require('../services/appUsages');

const RecommendType = {
    favoriteGame: 1,
    favoriteDeveloper: 2,
    favoriteCategory: 3,
    similarDemographic: 4,
};

const getSimilarUserRecommendApps = (userId, page, limit) => {
    const recommendInfo = {recommendType: RecommendType.similarDemographic, criteria: []};

    return UserService.getUser(userId)
        .then(user => {
            recommendInfo.criteria.push(UserService.getAge(user.birthday) + "대");
            recommendInfo.criteria.push(user.gender === "male" ? "남성" : "여성");
            return AppUsageService.getSimilarUsers(user, parseInt(page), parseInt(limit));
        })
        .then(appUsages => convertToRecommendApps(recommendInfo, appUsages, userId));
};

const getFavoriteCategoryRecommendApps = (categoryUsages, userId) => {
    if (!categoryUsages || categoryUsages.length === 0) {
        return Promise.resolve([]);
    }

    const recommendInfo = {recommendType: RecommendType.favoriteCategory, criteria: []};
    const sortedCategoryUsages = categoryUsages.sort((a, b) => a.totalUsedTime > b.totalUsedTime ? -1 : 1);

    return Promise.resolve(sortedCategoryUsages[0])
        .then(favoriteCategoryUsage => {
            recommendInfo.criteria.push(favoriteCategoryUsage.name);
            return AppUsageService.getCategoryAppUsages(favoriteCategoryUsage.id);
        })
        .then(appUsages => convertToRecommendApps(recommendInfo, appUsages, userId));
};

const getRecommendApps = (req, res) => {
    // TODO: let 없애기, reject 관련 처리 추가 필요
    let result = [];

    // result.appUsages
    // result.categoryUsages
    // result.developerUsages

    getSimilarUserRecommendApps(req.userId, req.query.page, req.query.limit)
        .then(similarUserRecommendApps => {
            result = result.concat(similarUserRecommendApps);
            return AppUsageService.aggregateAppUsageByCategory(req.userId, req.params.categoryId);
        })
        .then(userUsages => {
            return getFavoriteCategoryRecommendApps(userUsages.categoryUsages, req.userId)
        })
        .then(favoriteCategoryRecommendApps => {
            result = result.concat(favoriteCategoryRecommendApps);
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

const convertToRecommendApps = (recommendInfo, appUsages, userId) => {
    return Promise.resolve(appUsages.filter(i => i.developer && i.categoryId))
        .then(appUsages => AppService.combineAppInfos(appUsages))
        .then(appUsagesWithAppInfo => Promise.resolve(
            appUsagesWithAppInfo.map(item => {
                item.wishedByMe = !!(item.wishedBy && item.wishedBy.includes(userId));
                delete item.wishedBy;

                return {
                    recommendType: recommendInfo.recommendType,
                    criteria: recommendInfo.criteria,
                    app: item
                };
            })));
};

module.exports = {getRecommendApps};