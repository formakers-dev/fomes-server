const UserService = require('../services/users');
const AppUsageService = require('../services/appUsages');
const AppService = require('../services/apps');

const RecommendType = {
    favoriteApp: 1,
    favoriteDeveloper: 2,
    favoriteCategory: 3,
    similarDemographic: 4,
};

const getSimilarUserRecommendApps = (userId, excludePackageNames, page, limit) => {
    const recommendInfo = {recommendType: RecommendType.similarDemographic, criteria: []};

    return UserService.getUser(userId)
        .then(user => {
            recommendInfo.criteria.push(UserService.getAge(user.birthday) + "대");
            recommendInfo.criteria.push(user.gender === "male" ? "남성" : "여성");
            return AppUsageService.getSimilarUserAppUsages(user, userId, excludePackageNames, page, limit);
        })
        .then(similarUsersAppUsages => convertToRecommendApps(recommendInfo, similarUsersAppUsages, userId))
        .catch(err => {
            console.error("getSimilarUserRecommendApps", "userId=", userId, "err=", err);
            return Promise.reject(err);
        });
};

const getFavoriteCategoryRecommendApps = (categoryUsages, userId, excludePackageNames, page, limit) => {
    if (!categoryUsages || categoryUsages.length === 0) {
        return Promise.resolve([]);
    }

    const recommendInfo = {recommendType: RecommendType.favoriteCategory, criteria: []};
    const sortedCategoryUsages = categoryUsages.sort((a, b) => a.totalUsedTime > b.totalUsedTime ? -1 : 1);

    return Promise.resolve(sortedCategoryUsages[0])
        .then(favoriteCategoryUsage => {
            recommendInfo.criteria.push(favoriteCategoryUsage.name);
            return AppUsageService.getCategoryAppUsages(favoriteCategoryUsage.id, userId, excludePackageNames, page, limit);
        })
        .then(categoryAppUsages => convertToRecommendApps(recommendInfo, categoryAppUsages, userId))
        .catch(err => {
            console.error("getFavoriteCategoryRecommendApps", "userId=", userId, "err=", err);
            return Promise.reject(err);
        });
};

const getFavoriteDeveloperRecommendApps = (developerUsages, userId, excludePackageNames, page, limit) => {
    if (!developerUsages || developerUsages.length === 0) {
        return Promise.resolve([]);
    }

    const recommendInfo = {recommendType: RecommendType.favoriteDeveloper, criteria: []};
    const sortedDeveloperUsages = developerUsages.sort((a, b) => a.totalUsedTime > b.totalUsedTime ? -1 : 1);

    return Promise.resolve(sortedDeveloperUsages[0])
        .then(favoriteDeveloperUsage => {
            recommendInfo.criteria.push(favoriteDeveloperUsage.name);
            return AppUsageService.getDeveloperAppUsages(favoriteDeveloperUsage.id, userId, excludePackageNames, page, limit);
        })
        .then(developerAppUsages => convertToRecommendApps(recommendInfo, developerAppUsages, userId))
        .catch(err => {
            console.error("getFavoriteDeveloperRecommendApps", "userId=", userId, "err=", err);
            return Promise.reject(err);
        });
};

const getFavoriteAppRecommendApps = (appUsages, userId, excludePackageNames, page, limit) => {
    if (!appUsages || appUsages.length === 0) {
        return Promise.resolve([]);
    }

    const recommendInfo = {recommendType: RecommendType.favoriteApp, criteria: []};
    const sortedAppUsages = appUsages.sort((a, b) => a.totalUsedTime > b.totalUsedTime ? -1 : 1);

    return Promise.resolve(sortedAppUsages[0])
        .then(favoriteAppUsage => {
            recommendInfo.criteria.push(favoriteAppUsage.name);
            return AppUsageService.getUserIdsUsingApp(favoriteAppUsage.id);
        })
        .then(userIds => AppUsageService.getUsersAppUsages(userIds, sortedAppUsages[0].id, userId, excludePackageNames, page, limit))
        .then(usersAppUsages => convertToRecommendApps(recommendInfo, usersAppUsages, userId));
};

const convertToRecommendApps = (recommendInfo, appUsages, userId) => {
    return new Promise((resolve, reject) => {
        let rank = 1;

        Promise.resolve(appUsages.filter(i => i.developer && i.categoryId))
            .then(appUsages => AppUsageService.combineAppInfos(appUsages))
            .then(appUsagesWithAppInfo => resolve(
                appUsagesWithAppInfo.map(item => {
                    return {
                        recommendType: recommendInfo.recommendType,
                        criteria: recommendInfo.criteria,
                        rank: rank++,
                        app: AppService.replaceWishedByToWishedByMe(item, userId)
                    };
                })))
            .catch(err => {
                console.error("convertToRecommendApps", "userId=", userId, "recommendInfo=", recommendInfo, "err=", err);
                reject(err);
            });
    });
};

module.exports = {
    getSimilarUserRecommendApps,
    getFavoriteCategoryRecommendApps,
    getFavoriteDeveloperRecommendApps,
    getFavoriteAppRecommendApps
};