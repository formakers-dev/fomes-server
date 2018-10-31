const AppService = require('../services/apps');
const UserService = require('../services/users');
const AppUsageService = require('../services/appUsages');

const getSimilarUserAppUsageList = (req, res) => {
    const criteria = [];

    UserService.getUser(req.userId)
        .then(user => {
            criteria.push(UserService.getAge(user.birthday) + "대");
            criteria.push(user.gender === "male" ? "남성" : "여성");
            return AppUsageService.getSimilarUsers(user, parseInt(req.query.page), parseInt(req.query.limit));
        })
        .then(appUsages => convertToRecommendApps(criteria, appUsages, req.userId))
        .then(convertedRecommendApps => {
            res.json(convertedRecommendApps);
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({
                success: false,
                message: err.message
            });
        });
};

const getFavoriteCategoryAppUsageList = (req, res) => {
    const criteria = [];

    AppUsageService.aggregateAppUsageByCategory(req.userId, req.params.categoryId)
        .then(userUsages => {
            const sortedCategoryUsages = userUsages.categoryUsages.sort((a, b) => a.totalUsedTime > b.totalUsedTime ? -1 : 1);
            return Promise.resolve(sortedCategoryUsages[0]);
        })
        .then(favoriteCategoryUsage => {
            criteria.push(favoriteCategoryUsage.name);

            return AppUsageService.getCategoryAppUsages(favoriteCategoryUsage.id);
        })
        .then(appUsages => convertToRecommendApps(criteria, appUsages, req.userId))
        .then(convertedRecommendApps => {
            res.json(convertedRecommendApps);
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({
                success: false,
                message: err.message
            });
        });
};

const convertToRecommendApps = (criteria, appUsages, userId) => {
    return Promise.resolve(appUsages.filter(i => i.developer && i.categoryId))
        .then(appUsages => AppService.combineAppInfos(appUsages))
        .then(appUsagesWithAppInfo => Promise.resolve(
            appUsagesWithAppInfo.map(item => {
                item.wishedByMe = !!(item.wishedBy && item.wishedBy.includes(userId));
                delete item.wishedBy;

                return {
                    criteria: criteria,
                    app: item
                };
            })));
};

module.exports = {getSimilarUserAppUsageList, getFavoriteCategoryAppUsageList};