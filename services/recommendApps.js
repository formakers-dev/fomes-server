const UserService = require('../services/users');
const AppUsageService = require('../services/appUsages');

const RecommendType = {
    favoriteApp: 1,
    favoriteDeveloper: 2,
    favoriteCategory: 3,
    similarDemographic: 4,
};

const getSimilarUserRecommendApps = (user, excludePackageNames, page, limit) => {
    const recommendInfo = {recommendType: RecommendType.similarDemographic, criteria: []};
    recommendInfo.criteria.push(UserService.getAge(user.birthday) + "대");
    recommendInfo.criteria.push(user.gender === "male" ? "남성" : "여성");

    return AppUsageService.getSimilarUserAppUsages(user, excludePackageNames, page, limit)
        .then(similarUsersAppUsages => convertToRecommendApps(recommendInfo, similarUsersAppUsages, user))
        .catch(err => {
            console.error("getSimilarUserRecommendApps", "userId=", user.userId, "err=", err);
            return Promise.reject(err);
        });
};

const getFavoriteCategoryRecommendApps = (categoryUsages, user, excludePackageNames, page, limit) => {
    if (!categoryUsages || categoryUsages.length === 0) {
        return Promise.resolve([]);
    }

    const recommendInfo = {recommendType: RecommendType.favoriteCategory, criteria: []};
    const sortedCategoryUsages = categoryUsages.sort((a, b) => a.totalUsedTime > b.totalUsedTime ? -1 : 1);

    return Promise.resolve(sortedCategoryUsages[0])
        .then(favoriteCategoryUsage => {
            recommendInfo.criteria.push(favoriteCategoryUsage.name);
            return AppUsageService.getCategoryAppUsages(favoriteCategoryUsage.id, user.userId, excludePackageNames, page, limit);
        })
        .then(categoryAppUsages => convertToRecommendApps(recommendInfo, categoryAppUsages, user))
        .catch(err => {
            console.error("getFavoriteCategoryRecommendApps", "userId=", user.userId, "err=", err);
            return Promise.reject(err);
        });
};

const getFavoriteDeveloperRecommendApps = (developerUsages, user, excludePackageNames, page, limit) => {
    if (!developerUsages || developerUsages.length === 0) {
        return Promise.resolve([]);
    }

    const recommendInfo = {recommendType: RecommendType.favoriteDeveloper, criteria: []};
    const sortedDeveloperUsages = developerUsages.sort((a, b) => a.totalUsedTime > b.totalUsedTime ? -1 : 1);

    return Promise.resolve(sortedDeveloperUsages[0])
        .then(favoriteDeveloperUsage => {
            recommendInfo.criteria.push(favoriteDeveloperUsage.name);
            return AppUsageService.getDeveloperAppUsages(favoriteDeveloperUsage.id, user.userId, excludePackageNames, page, limit);
        })
        .then(developerAppUsages => convertToRecommendApps(recommendInfo, developerAppUsages, user))
        .catch(err => {
            console.error("getFavoriteDeveloperRecommendApps", "userId=", user.userId, "err=", err);
            return Promise.reject(err);
        });
};

const getFavoriteAppRecommendApps = (appUsages, user, excludePackageNames, page, limit) => {
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
        .then(userIds => AppUsageService.getUsersAppUsages(userIds, sortedAppUsages[0].id, user.userId, excludePackageNames, page, limit))
        .then(usersAppUsages => convertToRecommendApps(recommendInfo, usersAppUsages, user))
        .catch(err => {
            console.error("getFavoriteAppRecommendApps", "userId=", user.userId, "err=", err);
            return Promise.reject(err);
        });
};

const convertToRecommendApps = (recommendInfo, appUsages, user) => {
    let rank = 1;

    return Promise.resolve(appUsages.filter(i => i.developer && i.categoryId))
        .then(filteredAppUsages => Promise.resolve(
            filteredAppUsages.map(appUsage => {
                return {
                    recommendType: recommendInfo.recommendType,
                    criteria: recommendInfo.criteria,
                    rank: rank++,
                    app: setWishedByMeToAppUsage(appUsage, user.wishList)
                };
            })))
        .catch(err => {
            console.error("convertToRecommendApps", "userId=", user.userId, "recommendInfo=", recommendInfo, "err=", err);
            return Promise.reject(err);
        });
};

const setWishedByMeToAppUsage = (appUsage, wishList) => {
    appUsage.wishedByMe = !!(wishList && wishList.includes(appUsage.packageName));
    return appUsage;
};

module.exports = {
    getSimilarUserRecommendApps,
    getFavoriteCategoryRecommendApps,
    getFavoriteDeveloperRecommendApps,
    getFavoriteAppRecommendApps
};