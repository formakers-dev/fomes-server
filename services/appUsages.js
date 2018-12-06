const moment = require('moment');
const UsagesUtil = require('../utils/usages');
const PagingUtil = require('../utils/paging');
const { AppUsages } = require('../models/appUsages');

const getTotalUsedTimeRankList = (userId, categoryId) => {
    return new Promise((resolve, reject) => {
        AppUsages.aggregate([
            {$match: {categoryId: { $regex: new RegExp(categoryId) }}},
            {
                $group: {
                    _id: '$userId', totalUsedTime: {$sum: '$totalUsedTime'},
                }
            }
        ])
        .then(ranks => {
            const sortedRanks = ranks.sort((a, b) => a.totalUsedTime > b.totalUsedTime ? -1 : 1);
            const mine = sortedRanks.filter(rank => rank._id === userId)[0];
            const best = sortedRanks[0];
            const worst = sortedRanks[sortedRanks.length - 1];

            const result = [];
            result.push(mine, best, worst);

            resolve(result.filter(rank => rank).map(rank => {
                return {
                    userId: rank._id,
                    rank: sortedRanks.indexOf(rank) + 1,
                    content: rank.totalUsedTime
                }
            }));
        }).catch(err => {
            console.error("getTotalUsedTimeRankList", "userId=", userId, "err=", err);
            reject(err);
        })
    });
};

const createQueryConditionForArray = (values) => {
    return (values instanceof Array) ? {"$in": values} : values;
};

const aggregateAppUsageByCategory = (userIds, categoryId) => {
    return new Promise((resolve, reject) => {
        const filterQuery = {
            userId : createQueryConditionForArray(userIds),
            categoryId : new RegExp(categoryId)
        };

        AppUsages.aggregate([
            { $match: filterQuery },
            {
                $group: {
                    _id: '$packageName',
                    totalUsedTime: { $sum: '$totalUsedTime' },
                    packageName : { $first: '$packageName' },
                    appName: { $first: '$appName' },
                    categoryId : { $first: '$categoryId' },
                    categoryName: { $first: '$categoryName' },
                    developer: { $first: '$developer' },
                    iconUrl: { $first: '$iconUrl' }
                }
            }
        ]).then(appUsages => {
            const result = {};

            // appUsages
            appUsages = appUsages.map(appUsage => {
                return {
                    id: appUsage.packageName,
                    name: appUsage.appName,
                    totalUsedTime: appUsage.totalUsedTime,
                    appInfos: [{
                        packageName: appUsage.packageName,
                        totalUsedTime : appUsage.totalUsedTime,
                        appName: appUsage.appName,
                        categoryId: appUsage.categoryId,
                        categoryName: appUsage.categoryName,
                        developer: appUsage.developer,
                        iconUrl: appUsage.iconUrl,
                    }]
                }
            });

            result.appUsages = appUsages;

            // categoryUsages
            result.categoryUsages = UsagesUtil.summary(UsagesUtil.convertToUsages(appUsages, {
                id: "categoryId",
                name: "categoryName",
            }, { isVerbose: false }));

            // developerUsages
            result.developerUsages = UsagesUtil.summary(UsagesUtil.convertToUsages(appUsages, {
                id: "developer",
                name: "developer",
            }, { isVerbose: true }));

            resolve(result);
        }).catch(err => {
            console.error("aggregateAppUsageByCategory", "userIds.length=", userIds.length, "cetegoryId=", categoryId, "err=", err);
            reject(err);
        })
    });
};

/** Start for Recommend Features **/
const getSimilarUserAppUsages = (user, excludePackageNames, page, limit) => {
    const currentYear = moment().format('YYYY');
    const beforeDiff = (currentYear - user.birthday) % 10;
    const afterDiff = 10 - beforeDiff;
    const excludeUserId = user.userId;

    let query = [
        {
            $match: {
                userId: {$ne : excludeUserId},
                packageName: {$nin : excludePackageNames},
                gender: user.gender,
                birthday: {
                    $gte: user.birthday - afterDiff + 1,
                    $lte: user.birthday + beforeDiff + 1
                },
            }
        }, {
            $group: {
                _id: '$packageName',
                totalUsedTime: { $sum: '$totalUsedTime' },
                developer: { $first: '$developer' },
                categoryId: { $first: '$categoryId' },
                categoryName: { $first: '$categoryName' },
                appName: { $first: '$appName' },
                iconUrl: { $first: '$iconUrl' },
            }
        }, {
            $project: {
                packageName: '$_id',
                totalUsedTime: true,
                developer: true,
                categoryId: true,
                categoryName: true,
                appName: true,
                iconUrl: true,
            }
        }, {
            $sort: { totalUsedTime: -1 }
        }
    ];

    query = PagingUtil.appendPagingQuery(query, page, limit);

    return AppUsages.aggregate(query);
};

const getCategoryAppUsages = (categoryId, excludeUserId, excludePackageNames, page, limit) => {
    let query = [
        {
            $match: {
                categoryId: categoryId,
                userId: { $ne : excludeUserId },
                packageName: {$nin : excludePackageNames}
            }
        }, {
            $group: {
                _id: '$packageName',
                totalUsedTime: { $sum: '$totalUsedTime' },
                developer: { $first: '$developer' },
                categoryId: { $first: '$categoryId' },
                categoryName: { $first: '$categoryName' },
                appName: { $first: '$appName' },
                iconUrl: { $first: '$iconUrl' },
            }
        }, {
            $project: {
                packageName: '$_id',
                totalUsedTime: true,
                developer: true,
                categoryId: true,
                categoryName: true,
                appName: true,
                iconUrl: true,
            }
        }, {
            $sort: { totalUsedTime: -1 }
        }
    ];

    query = PagingUtil.appendPagingQuery(query, page, limit);

    return AppUsages.aggregate(query);
};

const getDeveloperAppUsages = (developer, excludeUserId, excludePackageNames, page, limit) => {
    let query = [
        {
            $match: {
                developer: developer,
                userId: {$ne : excludeUserId},
                packageName: {$nin : excludePackageNames}
            }
        }, {
            $group: {
                _id: '$packageName',
                totalUsedTime: { $sum: '$totalUsedTime' },
                developer: { $first: '$developer' },
                categoryId: { $first: '$categoryId' },
                categoryName: { $first: '$categoryName' },
                appName: { $first: '$appName' },
                iconUrl: { $first: '$iconUrl' },
            }
        }, {
            $project: {
                packageName: '$_id',
                totalUsedTime: true,
                developer: true,
                categoryId: true,
                categoryName: true,
                appName: true,
                iconUrl: true,
            }
        }, {
            $sort: { totalUsedTime: -1 }
        }
    ];

    query = PagingUtil.appendPagingQuery(query, page, limit);

    return AppUsages.aggregate(query);
};

const getUsersAppUsages = (userIds, favoritePackageName, excludeUserId, excludePackageNames, page, limit) => {
    const excludeUserIdIndex = userIds.indexOf(excludeUserId);
    excludePackageNames.push(favoritePackageName);

    if (excludeUserIdIndex > -1) {
        userIds.splice( userIds.indexOf(excludeUserId), 1 );
    }

    let query = [
        {
            $match: {
                packageName: {$nin : excludePackageNames},
                userId: {$in : userIds}
            }
        }, {
            $group: {
                _id: '$packageName',
                totalUsedTime: { $sum: '$totalUsedTime' },
                developer: { $first: '$developer' },
                categoryId: { $first: '$categoryId' },
                categoryName: { $first: '$categoryName' },
                appName: { $first: '$appName' },
                iconUrl: { $first: '$iconUrl' },
            }
        }, {
            $project: {
                packageName: '$_id',
                totalUsedTime: true,
                developer: true,
                categoryId: true,
                categoryName: true,
                appName: true,
                iconUrl: true,
            }
        }, {
            $sort: { totalUsedTime: -1 }
        }
    ];

    query = PagingUtil.appendPagingQuery(query, page, limit);

    return AppUsages.aggregate(query);
};

/** start of using by populate **/
const findAppUsages = (userId) => {
    const filterQuery = {};

    if (userId) {
        filterQuery.userId = userId;
    }

    return AppUsages.find(filterQuery)
        .populate('appInfo')
        .lean()
        .then(appUsages => {
            const result = appUsages.filter(appUsage => appUsage.appInfo)
                .map(appUsage => {
                    appUsage.appInfos = [ appUsage.appInfo ];
                    delete appUsage.appInfo;

                    return appUsage;
                });
            return Promise.resolve(result);
        })
        .catch(err => Promise.reject(err));
};

const findAppUsageByCategory = (userId, categoryId, options) => {
    return findAppUsages(userId).then(appUsages => {
        appUsages = UsagesUtil.convertToUsages(
            appUsages,
            { id: "packageName", name: "appName" },
            { isVerbose: true, isFold: options.isFold }
         );

        if (categoryId) {
            appUsages = appUsages.filter(appusage => appusage.appInfos.length > 0
                && new RegExp(`${categoryId}.*`).test(appusage.appInfos[0].categoryId1));
        }

        return Promise.resolve(appUsages);
    }).catch(err => {
        console.error("findAppUsageByCategory", "userId=", userId, "err=", err);
        return Promise.reject(err);
    });
};

/** end of using by populate **/

const refreshAppUsages = (user, appInfos, appUsages) => {
    const bulkOps = [];

    bulkOps.push({
        'deleteMany': {
            'filter': { 'userId': user.userId }
        }
    });

    const appUsagesWithAppInfo = UsagesUtil.concatAppInfoFields(appUsages, appInfos);

    appUsagesWithAppInfo.forEach(appUsage => {
        bulkOps.push({
            'insertOne': {
                'document': {
                    'userId': user.userId,
                    'birthday': user.birthday,
                    'job': user.job,
                    'gender': user.gender,
                    'packageName': appUsage.packageName,
                    'appName': appUsage.appName,
                    'developer': appUsage.developer,
                    'categoryId': appUsage.categoryId1,
                    'categoryName': appUsage.categoryName1,
                    'iconUrl': appUsage.iconUrl,
                    "totalUsedTime": appUsage.totalUsedTime,
                    "updateTime": new Date()
                }
            }
        });
    });

    return AppUsages.bulkWrite(bulkOps);
};

const getUserIdsUsingApp = (packageName) => {
  return AppUsages.aggregate([
            {$match: {packageName : packageName}},
            {$group: {_id: '$userId'}}
        ])
        .then(userIds => Promise.resolve(userIds.map(userId => userId._id)))
        .catch(err => Promise.reject(err));
};

module.exports = {
    getTotalUsedTimeRankList,
    aggregateAppUsageByCategory,
    findAppUsageByCategory,
    refreshAppUsages,
    getSimilarUserAppUsages,
    getCategoryAppUsages,
    getDeveloperAppUsages,
    getUsersAppUsages,
    getUserIdsUsingApp,
};