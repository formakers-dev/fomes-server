const moment = require('moment');
const UsagesUtil = require('../utils/usages');
const PagingUtil = require('../utils/paging');
const { AppUsages } = require('../models/appUsages');

const ANALYSIS_DURATION = 7 * 24 * 60 * 60 * 1000;

const getTotalUsedTimeOverview = (userId, categoryId) => {
    return new Promise((resolve, reject) => {
        const currentDate = new Date();

        AppUsages.aggregate([
            {
                $match: {
                    categoryId: { $regex: new RegExp(categoryId) },
                    date: {$gte: new Date(currentDate.getTime() - ANALYSIS_DURATION)},
                }
            },
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

            const result = { ranks: [], totalUsedTime: 0 };

            result.ranks.push(mine, best, worst);
            result.ranks = result.ranks.filter(rank => rank).map(rank => {
                return {
                    userId: rank._id,
                    rank: sortedRanks.indexOf(rank) + 1,
                    content: rank.totalUsedTime,
                }
            });

            result.totalUserCount = sortedRanks.length;

            resolve(result);
        }).catch(err => {
            console.error("getTotalUsedTimeOverview", "userId=", userId, "err=", err);
            reject(err);
        })
    });
};

const aggregateAppUsageByCategory = (userIds, categoryId) => {
    return new Promise((resolve, reject) => {
        const currentDate = new Date();

        const filterQuery = {
            userId : { "$in": userIds },
            categoryId : new RegExp(categoryId),
            date: {$gt: new Date(currentDate.getTime() - ANALYSIS_DURATION)}
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

            result.categoryUsages = UsagesUtil.summary(UsagesUtil.convertToUsages(appUsages, {
                id: "categoryId",
                name: "categoryName",
            }, { isVerbose: false }));

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
    const currentDate = new Date();

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
                date: {$gte: new Date(currentDate.getTime() - ANALYSIS_DURATION)},
            }
        }, {
            $group: {
                _id: '$packageName',
                packageName: { $first: '$packageName' },
                totalUsedTime: { $sum: '$totalUsedTime' },
                developer: { $first: '$developer' },
                categoryId: { $first: '$categoryId' },
                categoryName: { $first: '$categoryName' },
                appName: { $first: '$appName' },
                iconUrl: { $first: '$iconUrl' },
            }
        }, {
            $project: {
                _id: false
            }
        }, {
            $sort: { totalUsedTime: -1 }
        }
    ];

    query = PagingUtil.appendPagingQuery(query, page, limit);

    return AppUsages.aggregate(query);
};

const getCategoryAppUsages = (categoryId, excludeUserId, excludePackageNames, page, limit) => {
    const currentDate = new Date();

    let query = [
        {
            $match: {
                categoryId: categoryId,
                userId: { $ne : excludeUserId },
                packageName: {$nin : excludePackageNames},
                date: {$gte: new Date(currentDate.getTime() - ANALYSIS_DURATION)},
            }
        }, {
            $group: {
                _id: '$packageName',
                packageName: { $first: '$packageName' },
                totalUsedTime: { $sum: '$totalUsedTime' },
                developer: { $first: '$developer' },
                categoryId: { $first: '$categoryId' },
                categoryName: { $first: '$categoryName' },
                appName: { $first: '$appName' },
                iconUrl: { $first: '$iconUrl' },
            }
        }, {
            $project: {
                _id: false
            }
        }, {
            $sort: { totalUsedTime: -1 }
        }
    ];

    query = PagingUtil.appendPagingQuery(query, page, limit);

    return AppUsages.aggregate(query);
};

const getDeveloperAppUsages = (developer, excludeUserId, excludePackageNames, page, limit) => {
    const currentDate = new Date();

    let query = [
        {
            $match: {
                developer: developer,
                userId: {$ne : excludeUserId},
                packageName: {$nin : excludePackageNames},
                date: {$gte: new Date(currentDate.getTime() - ANALYSIS_DURATION)},
            }
        }, {
            $group: {
                _id: '$packageName',
                packageName: { $first: '$packageName' },
                totalUsedTime: { $sum: '$totalUsedTime' },
                developer: { $first: '$developer' },
                categoryId: { $first: '$categoryId' },
                categoryName: { $first: '$categoryName' },
                appName: { $first: '$appName' },
                iconUrl: { $first: '$iconUrl' },
            }
        }, {
            $project: {
                _id: false
            }
        }, {
            $sort: { totalUsedTime: -1 }
        }
    ];

    query = PagingUtil.appendPagingQuery(query, page, limit);

    return AppUsages.aggregate(query);
};

const getUsersAppUsages = (userIds, favoritePackageName, excludeUserId, excludePackageNames, page, limit) => {
    const currentDate = new Date();
    const excludeUserIdIndex = userIds.indexOf(excludeUserId);
    excludePackageNames.push(favoritePackageName);

    if (excludeUserIdIndex > -1) {
        userIds.splice( userIds.indexOf(excludeUserId), 1 );
    }

    let query = [
        {
            $match: {
                packageName: {$nin : excludePackageNames},
                userId: {$in : userIds},
                date: {$gte: new Date(currentDate.getTime() - ANALYSIS_DURATION)},
            }
        }, {
            $group: {
                _id: '$packageName',
                packageName: { $first: '$packageName' },
                totalUsedTime: { $sum: '$totalUsedTime' },
                developer: { $first: '$developer' },
                categoryId: { $first: '$categoryId' },
                categoryName: { $first: '$categoryName' },
                appName: { $first: '$appName' },
                iconUrl: { $first: '$iconUrl' },
            }
        }, {
            $project: {
                _id: false
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

const upsertAppUsages = (user, appUsages) => {
    console.log('count of upserting app usages =', appUsages.length);

    const bulkOps = [];

    bulkOps.push({
        'deleteMany': {
            'filter': { 'userId': user.userId }
        }
    });

    const currentDate = new Date();

    appUsages.forEach(appUsage => {
        bulkOps.push({
            'insertOne': {
                'document': {
                    'date': appUsage.date ? appUsage.date : moment(currentDate).startOf('day').toDate(),
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
                    "updateTime": currentDate,
                    'appVersion': appUsage.appVersion,
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
    getTotalUsedTimeOverview,
    aggregateAppUsageByCategory,
    findAppUsageByCategory,
    upsertAppUsages,
    getSimilarUserAppUsages,
    getCategoryAppUsages,
    getDeveloperAppUsages,
    getUsersAppUsages,
    getUserIdsUsingApp,
};