const UserService = require('../services/users');
const AppUsageService = require('../services/appUsages');
const AppService = require('../services/apps');

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
        .then(appUsages => convertToRecommendApps(recommendInfo, appUsages, userId))
        .catch(err => {
            console.error("getSimilarUserRecommendApps", "userId=", userId, "err=", err);
            return Promise.reject(err);
        });
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
        .then(appUsages => convertToRecommendApps(recommendInfo, appUsages, userId))
        .catch(err => {
            console.error("getFavoriteCategoryRecommendApps", "userId=", userId, "err=", err);
            return Promise.reject(err);
        });
};

const getFavoriteDeveloperRecommendApps = (developerUsages, userId) => {
    if (!developerUsages || developerUsages.length === 0) {
        return Promise.resolve([]);
    }

    const recommendInfo = {recommendType: RecommendType.favoriteDeveloper, criteria: []};
    const sortedDeveloperUsages = developerUsages.sort((a, b) => a.totalUsedTime > b.totalUsedTime ? -1 : 1);

    return Promise.resolve(sortedDeveloperUsages[0])
        .then(favoriteDeveloperUsage => {
            recommendInfo.criteria.push(favoriteDeveloperUsage.name);
            return AppUsageService.getDeveloperAppUsages(favoriteDeveloperUsage.id);
        })
        .then(appUsages => convertToRecommendApps(recommendInfo, appUsages, userId))
        .catch(err => {
            console.error("getFavoriteDeveloperRecommendApps", "userId=", userId, "err=", err);
            return Promise.reject(err);
        });
};

const convertToRecommendApps = (recommendInfo, appUsages, userId) => {
    return new Promise((resolve, reject) => {
        Promise.resolve(appUsages.filter(i => i.developer && i.categoryId))
            .then(appUsages => AppService.combineAppInfos(appUsages))
            .then(appUsagesWithAppInfo => resolve(
                appUsagesWithAppInfo.map(item => {
                    return {
                        recommendType: recommendInfo.recommendType,
                        criteria: recommendInfo.criteria,
                        app: replaceWishedByToWishedByMe(item, userId)
                    };
                })))
            .catch(err => {
                console.error("convertToRecommendApps", "userId=", userId, "recommendInfo=", recommendInfo, "err=", err);
                reject(err);
            });
    });
};

const replaceWishedByToWishedByMe = (item, userId) => {
    item.wishedByMe = !!(item.wishedBy && item.wishedBy.includes(userId));
    delete item.wishedBy;
    return item;
};

module.exports = {getSimilarUserRecommendApps, getFavoriteCategoryRecommendApps, getFavoriteDeveloperRecommendApps};